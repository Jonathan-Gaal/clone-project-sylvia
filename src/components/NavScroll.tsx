"use client";

import { useEffect } from "react";

/**
 * The original site toggles a `nav-scroll` class on #navbar via its own JS
 * (shrinks the logo, gives the header an opaque background) — we don't load
 * that bundle, so without this the header stays transparent and the page
 * scrolls visibly behind the fixed nav.
 */
export default function NavScroll() {
  useEffect(() => {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle("nav-scroll", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
