/**
 * Sylvia's daily specials, transcribed from sylviasrestaurant.com/specials. Powers
 * the concierge's `get_specials` tool. Plain data — safe on client + server.
 *
 * `days` uses JS getDay() numbering: 0 = Sunday … 6 = Saturday.
 */

export type Special = {
  name: string;
  description: string;
  /** Price in USD. */
  price: number;
  /** Days the special runs (0 = Sun … 6 = Sat). */
  days: number[];
  /** Human-readable availability window, e.g. "Mon–Fri, 12–4 PM". */
  when: string;
};

const MON_TO_FRI = [1, 2, 3, 4, 5];
const FRI_TO_SUN = [5, 6, 0];

export const SPECIALS: Special[] = [
  {
    name: "$17 Lunch Special",
    description:
      "Fried or smothered chicken leg, chicken livers, pork chop, or fried whiting with one side. Premium sides (collard greens or mac & cheese) add $2.",
    price: 17,
    days: MON_TO_FRI,
    when: "Mon–Fri, 12–4 PM",
  },
  {
    name: "Braised Oxtails",
    description:
      "Slow-braised oxtails with a mixed greens salad and choice of steamed rice, sassy rice, or rice & peas.",
    price: 45,
    days: [3], // Wednesday
    when: "Wednesday, 11 AM–10 PM",
  },
  {
    name: "Stewed Turkey Wings",
    description: "Stewed turkey wings with homemade cornbread dressing and one side.",
    price: 27,
    days: [4], // Thursday
    when: "Thursday, 11 AM–10 PM",
  },
  {
    name: "Petite Marinated Grilled Lamb Chops",
    description: "Grilled lamb chops with chimichurri over mixed greens.",
    price: 30,
    days: FRI_TO_SUN,
    when: "Fri–Sun",
  },
  {
    name: "Grilled BBQ Short Ribs",
    description:
      "Grilled BBQ short ribs with mixed greens and choice of garlic mashed potatoes, french fries, or steamed rice.",
    price: 45,
    days: FRI_TO_SUN,
    when: "Fri–Sun",
  },
  {
    name: "Southern-Style Chitterlings with Hog Maws",
    description: "A soul-food classic, served Southern style.",
    price: 30,
    days: FRI_TO_SUN,
    when: "Fri–Sun",
  },
];

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** Parse a day argument ("wednesday", "wed", "3") to a 0–6 index, or null. */
function parseDay(day: string): number | null {
  const d = day.trim().toLowerCase();
  const asNum = Number(d);
  if (Number.isInteger(asNum) && asNum >= 0 && asNum <= 6) return asNum;
  const idx = DAY_NAMES.findIndex((name) => name.startsWith(d.slice(0, 3)));
  return idx === -1 ? null : idx;
}

/**
 * Specials for a given day. Pass a day name/number, "today", or nothing for all.
 * Unknown day strings return the full list so the agent still has something useful.
 */
export function getSpecials(day?: string): Special[] {
  if (!day || day.trim() === "") return SPECIALS;
  const idx = day.trim().toLowerCase() === "today" ? new Date().getDay() : parseDay(day);
  if (idx === null) return SPECIALS;
  return SPECIALS.filter((s) => s.days.includes(idx));
}
