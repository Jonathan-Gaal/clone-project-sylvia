/**
 * Concierge menu helpers over the full à la carte menu cloned from the live site
 * (see menu-data.ts, auto-generated). Powers the `search_menu` tool and the chat
 * widget's dish thumbnail cards.
 *
 * Plain data (no server-only imports) — safe on client + server.
 *
 * Note: Sylvia's serves no steak. A search for "steak" resolves (via SYNONYMS) to
 * the closest real beef items so the agent can answer honestly and suggest them.
 */
import { MENU, type MenuItem } from "./menu-data";

export { MENU };
export type { MenuItem };

/**
 * Local dish photos for the handful of real menu items the live site has no photo
 * for. Keyed by slug. A few items still have no image anywhere (Caesar salad, the
 * Angus burger, plain waffle, some desserts) — those simply don't get a card.
 */
const LOCAL_FALLBACK: Record<string, string> = {
  "spicy-fish-fritters": "/packages/dishes/catfish-fingers.jpg",
  "sylvias-smothered-chicken": "/packages/dishes/smothered-chicken.jpg",
  "grandma-julias-cornmeal-fried-whiting": "/packages/dishes/baked-whiting.jpg",
  "sylvias-chicken-sandwich": "/packages/dishes/fried-chicken.jpg",
  "waffle-with-carolina-style-smothered-chicken": "/packages/dishes/smothered-chicken.jpg",
  "waffle-with-chicken-wings": "/packages/dishes/fried-chicken.jpg",
  "candied-yams": "/packages/dishes/candied-yams.jpg",
  "sassy-rice": "/packages/dishes/sassy-rice.jpg",
  "peach-cobbler-waffle": "/packages/dishes/peach-cobbler.jpg",
  "banana-pudding": "/packages/dish-banana-pudding.jpg",
  // Plain waffle reuses the real waffle photo from the live menu.
  "waffle": "https://static.spotapps.co/spots/35/ad8233d2d448c7a06e576613715180/medium",
};

// Branded placeholder for the few dishes with no photo anywhere on Sylvia's menu
// (the Angus burger, Caesar salad, coconut-pineapple cake, ice cream). The card
// still shows the dish's real name + price, so every card has a pic + link.
const PLACEHOLDER = "/packages/dish-placeholder.svg";
for (const item of MENU) {
  if (!item.image) item.image = LOCAL_FALLBACK[item.slug] ?? PLACEHOLDER;
}

/** Link to a specific dish on the cloned menu page (MenuDeepLink scrolls to it). */
export function menuHref(item: MenuItem): string {
  return `/menu?item=${item.slug}`;
}

/**
 * Query synonyms → tags/keywords. Lets the agent's search resolve everyday words
 * to what's actually on the menu. "steak" deliberately maps to "beef" so a steak
 * request surfaces the Angus burger (the honest closest match).
 */
const SYNONYMS: Record<string, string[]> = {
  steak: ["beef", "burger"],
  beef: ["beef", "burger"],
  burger: ["beef", "burger"],
  fish: ["fish", "seafood", "catfish", "whiting", "salmon"],
  seafood: ["seafood", "fish", "catfish", "whiting", "salmon"],
  vegetarian: ["vegetarian"],
  veggie: ["vegetarian"],
  vegan: ["vegetarian"],
  spicy: ["spicy"],
  dessert: ["sweet", "dessert"],
  sweet: ["sweet"],
};

function expandTerms(query: string): string[] {
  const words = query.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const terms = new Set<string>(words);
  for (const w of words) {
    for (const syn of SYNONYMS[w] ?? []) terms.add(syn);
  }
  return [...terms];
}

function haystack(item: MenuItem): string {
  return `${item.name} ${item.description} ${item.category} ${item.tags.join(" ")}`.toLowerCase();
}

/**
 * Menu items matching `query` (name, description, category, or tags). Returns [] on
 * no match — the agent then says the item isn't offered and suggests alternatives.
 * An empty/blank query returns the full menu.
 */
export function searchMenu(query?: string): MenuItem[] {
  const q = query?.trim();
  if (!q) return MENU;
  const terms = expandTerms(q);
  if (terms.length === 0) return MENU;
  return MENU.filter((item) => {
    const hay = haystack(item);
    return terms.some((t) => hay.includes(t));
  });
}

// Leading phrases the agent tends to drop when naming a dish, so we match both
// "Sylvia's Down Home Fried Chicken" and "Down Home Fried Chicken".
const STRIP_PREFIXES = [
  "sylvia's ",
  "grandma julia's ",
  "tasty carolina style ",
  "grilled atlantic bar-b-que ",
  "soulful ",
];

function matchStrings(item: MenuItem): string[] {
  const n = item.name.toLowerCase().replace(/[’‘]/g, "'");
  const out = new Set<string>([n]);
  for (const p of STRIP_PREFIXES) if (n.startsWith(p)) out.add(n.slice(p.length));
  return [...out];
}

/**
 * Specific dishes named in a block of assistant text, in the order they appear.
 * Used by the chat widget to render thumbnail cards. Catch-all categories (sides,
 * desserts headings) aren't separate items here, so matching is dish-level.
 */
export function findCitedMenuItems(text: string, limit = 8): MenuItem[] {
  const hay = text.toLowerCase().replace(/[’‘]/g, "'");
  const hits: { item: MenuItem; idx: number }[] = [];
  for (const item of MENU) {
    let best = -1;
    for (const s of matchStrings(item)) {
      const i = hay.indexOf(s);
      if (i !== -1 && (best === -1 || i < best)) best = i;
    }
    if (best !== -1) hits.push({ item, idx: best });
  }
  hits.sort((a, b) => a.idx - b.idx);
  return hits.map((h) => h.item).slice(0, limit);
}
