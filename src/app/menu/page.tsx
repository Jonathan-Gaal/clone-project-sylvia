import type { Metadata } from "next";
import { FOOD_MENU_HTML } from "@/lib/menu-clone";
import BodyClass from "@/components/BodyClass";
import MenuDeepLink from "@/components/MenuDeepLink";

export const metadata: Metadata = {
  title: "Food Menu · Sylvia's Restaurant",
  description: "Sylvia's soul food menu — chicken, ribs, seafood, waffles, and more.",
};

/**
 * Exact clone of sylviasrestaurant.com/food-menu (markup + vendored CSS), served
 * at /menu so the concierge can deep-link to a dish via /menu?item=<slug>.
 * BodyClass restores the original page's body class; MenuDeepLink scrolls/highlights
 * the linked dish.
 */
export default function MenuPage() {
  return (
    <>
      <BodyClass className="drink-menu" />
      <style dangerouslySetInnerHTML={{ __html: HIGHLIGHT_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: FOOD_MENU_HTML }} />
      <MenuDeepLink />
    </>
  );
}

// The live menu relies on JS (tab switching + isotope masonry) that we strip for a
// static clone. These overrides show the default "Menu" tab and lay its items out in
// static columns, plus the deep-link highlight/scroll offset.
const HIGHLIGHT_CSS = `
/* Reveal the default "Menu" panel (others keep their inline display:none). */
#food_menu_v2 .menu_1084805 { display: block !important; }
#food_menu_v2 .food-menu-grid-sizer { display: none !important; }
/* Undo isotope absolute positioning so items flow normally. */
#food_menu_v2 .food-menu-grid-item,
#food_menu_v2 .food-menu-grid-item--width2 {
  position: static !important; float: none !important; left: auto !important; top: auto !important;
  width: 100% !important; margin: 0 0 20px !important; break-inside: avoid;
}
@media (min-width: 900px) {
  #food_menu_v2 .menu_1084805.food-menu-grid { column-count: 2; column-gap: 32px; }
}

.food-item-holder { scroll-margin-top: 100px; transition: box-shadow .3s ease, background-color .3s ease; border-radius: 8px; }
.food-item-holder.mp-target { box-shadow: 0 0 0 3px rgba(200,163,78,.8); background-color: rgba(200,163,78,.12); }
@media (prefers-reduced-motion: reduce) { .food-item-holder { transition: none; } }
`;
