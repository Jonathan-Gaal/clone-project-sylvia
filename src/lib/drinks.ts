/**
 * Sylvia's drink menu, transcribed from sylviasrestaurant.com/drink-menu. Powers
 * the concierge's `search_drinks` tool. Plain data — safe on client + server.
 *
 * Individual cocktail/wine prices aren't published per-item on the site, so items
 * carry a category-level `priceNote` where a specific price isn't known.
 */

export type DrinkCategory =
  | "Happy Hour"
  | "Cocktails"
  | "Beer"
  | "Wine & Bubbles"
  | "Zero-Proof";

export type DrinkItem = {
  name: string;
  description: string;
  category: DrinkCategory;
  /** Price in USD when a single price is published; otherwise see `priceNote`. */
  price?: number;
  priceNote?: string;
};

/** Happy hour runs Mon–Fri, 3–7 PM. */
export const HAPPY_HOUR = "Monday–Friday, 3–7 PM";

export const DRINKS: DrinkItem[] = [
  // Happy Hour
  {
    name: "Happy Hour Wine (by the glass)",
    description: "Riesling, Sauvignon Blanc, Chianti, Pinot Noir, Prosecco, Moscato.",
    category: "Happy Hour",
    price: 8,
  },
  {
    name: "Happy Hour Wine (by the bottle)",
    description: "Chardonnay, Cabernet, Prosecco, Rosé Prosecco.",
    category: "Happy Hour",
    price: 30,
  },
  {
    name: "Happy Hour Beer",
    description: "Budweiser, Bud Light, Corona.",
    category: "Happy Hour",
    price: 5,
  },
  {
    name: "Happy Hour Cocktails",
    description: "Harlem Blues, Margarita, Mo' Money, Whiskey Margarita, well drinks.",
    category: "Happy Hour",
    price: 10,
  },

  // Cocktails
  {
    name: "On the Rocks Cocktails",
    description:
      "South Carolina Rum Punch, Harlem Blues, Margarita Special, Long Island Iced Tea, and more.",
    category: "Cocktails",
    priceNote: "Market price",
  },
  {
    name: "Straight Up Cocktails",
    description: "Mo' Money, The 1944, Love Harlem, Coconut Lime Drop, Espresso Martini.",
    category: "Cocktails",
    priceNote: "Market price",
  },
  {
    name: "Bubbly Cocktails",
    description: "The Lenox, Bellini, Hugo Spritz, South Carolina Spritz, Mo' Money Spritz.",
    category: "Cocktails",
    priceNote: "Market price",
  },

  // Beer
  {
    name: "Beer Selection",
    description:
      "Harlem's Own Sugar Hill Golden Ale, Stella Artois, Corona, Heineken, Budweiser.",
    category: "Beer",
    priceNote: "Market price",
  },

  // Wine & Bubbles
  {
    name: "White Wines",
    description: "A rotating selection of whites by the glass and bottle.",
    category: "Wine & Bubbles",
    priceNote: "Market price",
  },
  {
    name: "Red Wines",
    description: "A rotating selection of reds by the glass and bottle.",
    category: "Wine & Bubbles",
    priceNote: "Market price",
  },
  {
    name: "Prosecco & Champagne",
    description: "Two Proseccos and two Champagnes for celebrating.",
    category: "Wine & Bubbles",
    priceNote: "Market price",
  },

  // Zero-Proof
  {
    name: "Grandma Julia's Fruit Punch",
    description: "Sylvia's house fruit punch — a Harlem favorite.",
    category: "Zero-Proof",
    priceNote: "Market price",
  },
  {
    name: "Sylvia's Nojito",
    description: "A zero-proof take on the mojito.",
    category: "Zero-Proof",
    priceNote: "Market price",
  },
  {
    name: "Iced Teas & Lemonades",
    description: "Uptown iced tea, lemonades, and soft drinks.",
    category: "Zero-Proof",
    priceNote: "Market price",
  },
];

function haystack(d: DrinkItem): string {
  return `${d.name} ${d.description} ${d.category}`.toLowerCase();
}

/**
 * Drinks matching `query` (name, description, or category). Blank query returns
 * everything. Matches any whitespace-separated word.
 */
export function searchDrinks(query?: string): DrinkItem[] {
  const q = query?.trim().toLowerCase();
  if (!q) return DRINKS;
  const words = q.split(/[^a-z0-9']+/).filter(Boolean);
  if (words.length === 0) return DRINKS;
  return DRINKS.filter((d) => {
    const hay = haystack(d);
    return words.some((w) => hay.includes(w));
  });
}
