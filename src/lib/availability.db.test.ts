import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { query, endPool, hasDb } from "./db";
import {
  checkAvailability,
  createTableReservation,
  slotsForDate,
  weekdayOf,
} from "./availability";

const TEST_EMAIL = "vitest-availability@example.com";

/** A Friday ~2 weeks out (late-close day, definitely open and in the future). */
function futureFriday(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DATE = futureFriday();

function book(partySize: number, time: string) {
  return createTableReservation({
    guestName: "Vitest Guest",
    email: TEST_EMAIL,
    phone: null,
    partySize,
    reservationDate: DATE,
    reservationTime: time,
    notes: "availability integration test",
  });
}

// Requires local Postgres (seeded via `npm run db:migrate`).
describe.runIf(hasDb)("table availability + booking (integration)", () => {
  beforeAll(() => {
    // Small, deterministic capacity for the assertions below.
    process.env.RESTAURANT_SEATS = "10";
    expect(weekdayOf(DATE)).toBe(5);
    expect(slotsForDate(DATE)).toContain("19:00");
  });

  // Isolate on the synthetic test date so leftover rows can't skew capacity.
  beforeEach(async () => {
    await query("DELETE FROM reservations WHERE reservation_date = $1", [DATE]);
  });

  afterAll(async () => {
    await query("DELETE FROM reservations WHERE email = $1", [TEST_EMAIL]);
    await endPool();
  });

  it("books a table and writes a standalone row (event_id NULL, status booked)", async () => {
    const result = await book(4, "19:00");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const rows = await query<{
      event_id: string | null;
      status: string;
      reservation_time: string;
      party_size: number;
      payment_status: string;
    }>(
      "SELECT event_id, status, reservation_time, party_size, payment_status FROM reservations WHERE id = $1",
      [result.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].event_id).toBeNull();
    expect(rows[0].status).toBe("booked");
    expect(rows[0].party_size).toBe(4);
    expect(rows[0].reservation_time.slice(0, 5)).toBe("19:00");
    expect(rows[0].payment_status).toBe("not_required");
  });

  it("books around an existing reservation (overlapping slot loses seats, distant slot is free)", async () => {
    await book(8, "19:00"); // 8 of 10 seats taken for the 19:00 turn

    // 19:30 overlaps the 19:00 turn → only 2 seats left, party of 4 won't fit.
    const overlapping = await checkAvailability(DATE, "19:30", 4);
    expect(overlapping.available).toBe(false);
    expect(overlapping.reason).toBe("full");
    expect(overlapping.seatsRemaining).toBe(2);
    // ...but a slot >90 min away is wide open, and offered as an alternative.
    expect(overlapping.alternatives).toContain("21:00");

    const distant = await checkAvailability(DATE, "21:00", 4);
    expect(distant.available).toBe(true);
  });

  it("never overbooks a slot beyond capacity", async () => {
    await book(8, "19:00"); // 2 seats remain
    const tooBig = await book(4, "19:00");
    expect(tooBig.ok).toBe(false);
    if (tooBig.ok) return;
    expect(tooBig.reason).toBe("full");
    expect(tooBig.seatsRemaining).toBe(2);

    // A party that exactly fits the remaining seats still succeeds.
    const fits = await book(2, "19:00");
    expect(fits.ok).toBe(true);
  });

  it("refuses to book outside opening hours", async () => {
    const late = await book(2, "23:00"); // past last seating
    expect(late.ok).toBe(false);
    if (late.ok) return;
    expect(late.reason).toBe("closed");
  });
});
