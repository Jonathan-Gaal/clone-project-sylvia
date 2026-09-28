/**
 * Sylvia's à la carte food menu, transcribed from sylviasrestaurant.com/food-menu.
 * Powers the concierge's `search_menu` tool AND the /menu page: the agent answers
 * menu questions only from this data, and the chat widget turns any dish it names
 * into a thumbnail card linking to /menu#<slug>.
 *
 * Plain data (no server-only imports) — safe on client + server.
 *
 * Note: Sylvia's serves no steak. A search for "steak" resolves (via SYNONYMS) to
 * the closest real beef items so the agent can answer honestly and suggest them.
 */

export type MenuCategory =
  | "Appetizers"
  | "Chicken"
  | "Pork"
  | "Seafood"
  | "Salads"
  | "Sandwiches & Burgers"
  | "Waffles"
  | "Combinations"
  | "Sides"
  | "Desserts";

export type MenuTag =
  | "chicken"
  | "pork"
  | "beef"
  | "seafood"
  | "fish"
  | "vegetarian"
  | "spicy"
  | "fried"
  | "grilled"
  | "sweet";

export type MenuItem = {
  name: string;
  description: string;
  /** Base price in USD. 0 when the item is range-only (see `priceNote`). */
  price: number;
  /** Extra pricing detail, e.g. "$32 for two" or a range like "$7–$11". */
  priceNote?: string;
  category: MenuCategory;
  tags: MenuTag[];
  /** Stable id used for the /menu anchor (#slug) and card keys. */
  slug: string;
  /** Public thumbnail path under /public, or undefined when we have no photo. */
  image?: string;
  /** Extra phrases the agent might use for this dish (for citation matching). */
  aliases?: string[];
};

const DISH = (name: string) => `/packages/dishes/${name}.jpg`;

export const MENU: MenuItem[] = [
  // Appetizers
  {
    name: "Fried Chicken Wings",
    description: "Sylvia's seasoned, golden-fried wings.",
    price: 16,
    category: "Appetizers",
    tags: ["chicken", "fried"],
    slug: "fried-chicken-wings",
    image: DISH("fried-chicken"),
  },
  {
    name: "Catfish Fingers",
    description: "With house-made tartar sauce.",
    price: 19,
    category: "Appetizers",
    tags: ["seafood", "fish", "fried"],
    slug: "catfish-fingers",
    image: DISH("catfish-fingers"),
  },
  {
    name: "Spicy Fish Fritters",
    description: "With house-made tartar sauce.",
    price: 16,
    category: "Appetizers",
    tags: ["seafood", "fish", "fried", "spicy"],
    slug: "spicy-fish-fritters",
  },
  {
    name: "Chicken Livers",
    description: "Sautéed with onions & peppers.",
    price: 13,
    category: "Appetizers",
    tags: ["chicken"],
    slug: "chicken-livers",
    image: DISH("chicken-livers"),
  },

  // Chicken Selections — served with two sides and cornbread
  {
    name: "Sylvia's Down Home Fried Chicken",
    description: "The Harlem classic — served with two sides and cornbread.",
    price: 25,
    category: "Chicken",
    tags: ["chicken", "fried"],
    slug: "down-home-fried-chicken",
    image: DISH("fried-chicken"),
    aliases: ["down home fried chicken", "fried chicken"],
  },
  {
    name: "Sylvia's Smothered Chicken",
    description: "Slow-cooked in Sylvia's brown gravy; served with two sides and cornbread.",
    price: 25,
    category: "Chicken",
    tags: ["chicken"],
    slug: "smothered-chicken",
    image: DISH("smothered-chicken"),
    aliases: ["smothered chicken"],
  },
  {
    name: "Oven Baked Half Chicken",
    description: "Roasted half chicken; served with two sides and cornbread.",
    price: 26,
    category: "Chicken",
    tags: ["chicken", "grilled"],
    slug: "oven-baked-half-chicken",
    image: DISH("bbq-chicken"),
  },

  // Pork Selections
  {
    name: "Bar-B-Que Ribs",
    description: "World-famous ribs with Sylvia's original sassy sauce.",
    price: 29,
    category: "Pork",
    tags: ["pork", "grilled"],
    slug: "bbq-ribs",
    image: DISH("bbq-ribs"),
    aliases: ["bbq ribs", "barbecue ribs"],
  },
  {
    name: "Pork Chops",
    description: "Golden fried, grilled, or smothered.",
    price: 25,
    priceNote: "$32 for two",
    category: "Pork",
    tags: ["pork", "fried", "grilled"],
    slug: "pork-chops",
    image: DISH("pork-chop"),
  },

  // Seafood Selections
  {
    name: "Tasty Carolina Style Catfish",
    description: "Fried or grilled.",
    price: 30,
    category: "Seafood",
    tags: ["seafood", "fish", "fried", "grilled"],
    slug: "carolina-catfish",
    image: DISH("baked-catfish"),
    aliases: ["carolina catfish", "catfish"],
  },
  {
    name: "Grandma Julia's Cornmeal Fried Whiting",
    description: "Cornmeal-crusted whiting, fried golden.",
    price: 25,
    category: "Seafood",
    tags: ["seafood", "fish", "fried"],
    slug: "fried-whiting",
    image: DISH("baked-whiting"),
    aliases: ["cornmeal fried whiting", "fried whiting", "whiting"],
  },
  {
    name: "Grilled Atlantic Bar-B-Que Salmon",
    description: "Grilled salmon with a BBQ glaze.",
    price: 32,
    category: "Seafood",
    tags: ["seafood", "fish", "grilled"],
    slug: "bbq-salmon",
    aliases: ["bbq salmon", "barbecue salmon", "salmon"],
  },

  // Salads & More
  {
    name: "Soulful Caesar Salad",
    description: "Classic Caesar, Sylvia's way.",
    price: 15,
    category: "Salads",
    tags: ["vegetarian"],
    slug: "caesar-salad",
    aliases: ["caesar salad"],
  },
  {
    name: "Watermelon Salad",
    description: "Fresh watermelon salad.",
    price: 16,
    category: "Salads",
    tags: ["vegetarian"],
    slug: "watermelon-salad",
  },
  {
    name: "Veggie Platter",
    description: "A plate of Sylvia's signature sides.",
    price: 28,
    category: "Salads",
    tags: ["vegetarian"],
    slug: "veggie-platter",
    image: DISH("string-beans"),
  },

  // Sandwiches & Burgers
  {
    name: "Sylvia's Chicken Sandwich",
    description: "Crispy chicken sandwich.",
    price: 20,
    category: "Sandwiches & Burgers",
    tags: ["chicken", "fried"],
    slug: "chicken-sandwich",
    image: DISH("fried-chicken"),
    aliases: ["chicken sandwich"],
  },
  {
    name: "Sylvia's Sassy Angus Beef Burger",
    description: "Angus beef burger — the closest thing on the menu to a steak.",
    price: 23,
    category: "Sandwiches & Burgers",
    tags: ["beef", "grilled"],
    slug: "angus-burger",
    aliases: ["angus beef burger", "beef burger", "angus burger"],
  },

  // Waffles
  {
    name: "Waffle",
    description: "Golden Belgian-style waffle.",
    price: 14,
    category: "Waffles",
    tags: ["vegetarian", "sweet"],
    slug: "waffle",
  },
  {
    name: "Waffle with Harlem Style Fried Chicken",
    description: "Waffle topped with fried chicken.",
    price: 24,
    category: "Waffles",
    tags: ["chicken", "fried", "sweet"],
    slug: "waffle-fried-chicken",
    image: DISH("fried-chicken"),
    aliases: ["chicken and waffles", "chicken & waffles"],
  },
  {
    name: "Waffle with Carolina Style Smothered Chicken",
    description: "Waffle with smothered chicken and gravy.",
    price: 24,
    category: "Waffles",
    tags: ["chicken", "sweet"],
    slug: "waffle-smothered-chicken",
    image: DISH("smothered-chicken"),
  },
  {
    name: "Waffle with Chicken Wings",
    description: "Waffle served with fried chicken wings.",
    price: 24,
    category: "Waffles",
    tags: ["chicken", "fried", "sweet"],
    slug: "waffle-chicken-wings",
    image: DISH("fried-chicken"),
  },

  // Combinations
  {
    name: "Ribs & Fried/Smothered Chicken",
    description: "BBQ ribs paired with your choice of fried or smothered chicken.",
    price: 35,
    category: "Combinations",
    tags: ["pork", "chicken", "grilled", "fried"],
    slug: "ribs-and-chicken",
    image: DISH("bbq-ribs"),
    aliases: ["ribs and chicken", "ribs & chicken"],
  },

  // Sides (range-priced, catch-all)
  {
    name: "Sides",
    description:
      "Collard greens, three-cheese baked mac & cheese, candied yams, grits, potato salad, string beans, black-eyed peas, and more.",
    price: 0,
    priceNote: "$7–$11",
    category: "Sides",
    tags: ["vegetarian"],
    slug: "sides",
    image: DISH("mac-cheese"),
  },

  // Desserts (range-priced, catch-all)
  {
    name: "Desserts",
    description:
      "Banana pudding, peach cobbler, and a rotating selection of house-made cakes.",
    price: 0,
    priceNote: "$7–$12",
    category: "Desserts",
    tags: ["vegetarian", "sweet"],
    slug: "desserts",
    image: DISH("peach-cobbler"),
  },
];

/** Order categories appear in on the /menu page. */
export const MENU_CATEGORY_ORDER: MenuCategory[] = [
  "Appetizers",
  "Chicken",
  "Pork",
  "Seafood",
  "Salads",
  "Sandwiches & Burgers",
  "Waffles",
  "Combinations",
  "Sides",
  "Desserts",
];

/** Link to a specific dish on the full menu page. */
export function menuHref(item: MenuItem): string {
  return `/menu#${item.slug}`;
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
  dessert: ["sweet"],
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

/** All items in one category (exact match). */
export function menuByCategory(category: MenuCategory): MenuItem[] {
  return MENU.filter((m) => m.category === category);
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
  const n = item.name.toLowerCase();
  const out = new Set<string>([n]);
  for (const p of STRIP_PREFIXES) if (n.startsWith(p)) out.add(n.slice(p.length));
  for (const a of item.aliases ?? []) out.add(a.toLowerCase());
  return [...out];
}

/**
 * Specific dishes named in a block of assistant text, in the order they appear.
 * Used by the chat widget to render thumbnail cards. The "Sides"/"Desserts"
 * catch-alls are excluded — their names are too generic to match reliably.
 */
export function findCitedMenuItems(text: string, limit = 6): MenuItem[] {
  const hay = text.toLowerCase();
  const hits: { item: MenuItem; idx: number }[] = [];
  for (const item of MENU) {
    if (item.category === "Sides" || item.category === "Desserts") continue;
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
