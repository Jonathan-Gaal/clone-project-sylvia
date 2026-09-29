"use client";

import { useEffect } from "react";

/**
 * The original site toggles a `nav-scroll` class on #navbar via its own JS
 * (shrinks the logo, gives the header an opaque background) — we don't load
 * that bundle, so without this the header stays transparent and the page
 * scrolls visibly behind the fixed nav.
 *
 * Also publishes the nav's real rendered bottom edge as --nav-bottom so
 * other fixed-position chrome (e.g. the chat widget's backdrop) can anchor
 * to it instead of a height guess — the nav's height changes with scroll
 * *and* with viewport size (there's a separate mobile nav layout), so a
 * fixed pixel value drifts out of sync with it. A ResizeObserver on the nav
 * itself (rather than a window "resize" listener) catches every cause of
 * that — window resize, orientation change, the desktop/mobile nav swap —
 * not just scroll.
 */
export default function NavScroll() {
  useEffect(() => {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    const updateNavBottom = () => {
      document.documentElement.style.setProperty(
        "--nav-bottom",
        `${nav.getBoundingClientRect().bottom}px`,
      );
    };
    const onScroll = () => {
      nav.classList.toggle("nav-scroll", window.scrollY > 10);
      updateNavBottom();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(updateNavBottom);
    resizeObserver.observe(nav);

    return () => {
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return null;
}
