"use client";

import { useEffect } from "react";
import { MENU } from "@/lib/menu";

/** Normalize a dish name for fuzzy matching (curly quotes, punctuation, case). */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * When the concierge links to /menu?item=<slug>, scroll the matching dish on the
 * cloned menu into view and highlight it. Matches by word overlap against the
 * live menu's <h3> titles, so it tolerates the small naming differences between
 * our menu data and the original page.
 */
export default function MenuDeepLink() {
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("item");
    if (!slug) return;
    const item = MENU.find((m) => m.slug === slug);
    if (!item) return;
    const targetWords = new Set(norm(item.name).split(" ").filter(Boolean));
    if (targetWords.size === 0) return;

    // Best visible dish title matching the linked item, or null if not ready yet.
    const findHolder = (): HTMLElement | null => {
      let best: { el: HTMLElement; score: number } | null = null;
      for (const title of document.querySelectorAll<HTMLElement>(".food-item-title")) {
        if (title.offsetParent === null) continue; // skip items in hidden menu tabs
        const words = norm(title.textContent || "").split(" ").filter(Boolean);
        const score = words.reduce((n, w) => (targetWords.has(w) ? n + 1 : n), 0);
        if (!best || score > best.score) best = { el: title, score };
      }
      const enough =
        best && best.score >= Math.min(2, targetWords.size) && best.score / targetWords.size >= 0.5;
      if (!best || !enough) return null;
      return (best.el.closest(".food-item-holder") as HTMLElement | null) ?? best.el;
    };

    let cancelled = false;
    const timers: number[] = [];

    // Poll until the cloned menu is laid out, then jump (instant, not smooth — a
    // smooth scroll gets cancelled by the browser's post-load scroll reset). Re-jump
    // a few times because lazy menu photos reflow the page height afterward.
    let attempts = 0;
    const poll = () => {
      if (cancelled) return;
      const holder = findHolder();
      if (holder) {
        holder.classList.add("mp-target");
        const jump = () => holder.scrollIntoView({ block: "center" });
        jump();
        for (const ms of [150, 500, 1100, 2000]) {
          timers.push(window.setTimeout(() => !cancelled && jump(), ms));
        }
        return;
      }
      if (attempts++ < 25) timers.push(window.setTimeout(poll, 100));
    };
    poll();

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return null;
}
