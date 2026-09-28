import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The live sylviasrestaurant.com/food-menu page, cloned verbatim (see
 * src/chrome/food-menu.html): inline styles + body markup with scripts stripped
 * and lazy-loaded images promoted to real src/srcset. Rendered as-is by /menu so
 * the concierge's dish links land on an exact clone of the real menu.
 */
export const FOOD_MENU_HTML = readFileSync(
  path.join(process.cwd(), "src/chrome/food-menu.html"),
  "utf8",
);
