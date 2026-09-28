"use client";

import { useEffect } from "react";

/**
 * Sets <body class> for the current page and restores it on unmount. The root
 * layout hardcodes the events clone's body classes; cloned pages with different
 * body classes (e.g. the food menu) use this to match the original page.
 */
export default function BodyClass({ className }: { className: string }) {
  useEffect(() => {
    const previous = document.body.className;
    document.body.className = className;
    return () => {
      document.body.className = previous;
    };
  }, [className]);
  return null;
}
