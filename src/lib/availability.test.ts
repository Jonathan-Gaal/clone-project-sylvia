import { describe, it, expect } from "vitest";
import {
  toMinutes,
  toHHMM,
  weekdayOf,
  slotsForDate,
  isOpenSlot,
  seatsBookedAt,
  TURN_MINUTES,
} from "./availability";

// Fixed reference dates (local time): 2026-10-02 is a Friday, 2026-10-05 a Monday.
const FRIDAY = "2026-10-02";
const MONDAY = "2026-10-05";

describe("time helpers", () => {
  it("parses and formats HH:MM", () => {
    expect(toMinutes("19:30")).toBe(19 * 60 + 30);
    expect(toMinutes("07:05:00")).toBe(7 * 60 + 5);
    expect(toHHMM(19 * 60 + 30)).toBe("19:30");
    expect(toHHMM(9 * 60)).toBe("09:00");
  });

  it("rejects malformed times", () => {
    expect(toMinutes("nope")).toBeNull();
    expect(toMinutes("25:00")).toBeNull();
    expect(toMinutes("12:75")).toBeNull();
  });

  it("resolves weekday from an ISO date", () => {
    expect(weekdayOf(FRIDAY)).toBe(5);
    expect(weekdayOf(MONDAY)).toBe(1);
    expect(weekdayOf("bad")).toBeNull();
  });
});

describe("slotsForDate", () => {
  it("runs 11:00 to 21:00 on a late-close day (Fri, closes 22:00)", () => {
    const slots = slotsForDate(FRIDAY);
    expect(slots[0]).toBe("11:00");
    expect(slots[slots.length - 1]).toBe("21:00"); // last seating = close(22:00) - 60
    expect(slots).toContain("19:00");
  });

  it("stops earlier on an early-close day (Mon, closes 20:00)", () => {
    const slots = slotsForDate(MONDAY);
    expect(slots[0]).toBe("11:00");
    expect(slots[slots.length - 1]).toBe("19:00"); // close(20:00) - 60
    expect(slots).not.toContain("21:00");
  });

  it("marks in-hours and out-of-hours slots", () => {
    expect(isOpenSlot(FRIDAY, "19:00")).toBe(true);
    expect(isOpenSlot(MONDAY, "21:00")).toBe(false); // past Monday's last seating
    expect(isOpenSlot(FRIDAY, "10:30")).toBe(false); // before open
  });
});

describe("seatsBookedAt (booking around existing reservations)", () => {
  const t = (hhmm: string) => toMinutes(hhmm)!;

  it("counts a booking whose turn overlaps the target time", () => {
    const rows = [{ minutes: t("19:00"), partySize: 4 }];
    // 19:30 is within 90 min of 19:00 → overlaps.
    expect(seatsBookedAt(rows, t("19:30"))).toBe(4);
  });

  it("ignores a booking outside the turn window", () => {
    const rows = [{ minutes: t("19:00"), partySize: 4 }];
    // 21:00 is 120 min later (> TURN 90) → no overlap.
    expect(seatsBookedAt(rows, t("21:00"))).toBe(0);
  });

  it("sums multiple overlapping bookings", () => {
    const rows = [
      { minutes: t("18:30"), partySize: 2 },
      { minutes: t("19:00"), partySize: 6 },
      { minutes: t("21:30"), partySize: 8 }, // too far from 19:00
    ];
    expect(seatsBookedAt(rows, t("19:00"))).toBe(8); // 2 + 6, not the 21:30 party
  });

  it("treats exactly TURN_MINUTES apart as non-overlapping (boundary)", () => {
    const rows = [{ minutes: t("19:00"), partySize: 5 }];
    expect(seatsBookedAt(rows, 19 * 60 + TURN_MINUTES)).toBe(0);
  });
});
