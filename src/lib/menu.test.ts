import { describe, it, expect } from "vitest";
import { searchMenu, findCitedMenuItems, MENU } from "./menu";

describe("MENU data (cloned from the live site)", () => {
  it("has a full menu with unique slugs", () => {
    expect(MENU.length).toBeGreaterThan(30);
    expect(new Set(MENU.map((m) => m.slug)).size).toBe(MENU.length);
  });

  it("has no steak (the whole reason the concierge suggests alternatives)", () => {
    expect(MENU.some((m) => /steak/i.test(m.name))).toBe(false);
  });
});

describe("searchMenu", () => {
  it("finds chicken dishes", () => {
    const results = searchMenu("chicken");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => /fried chicken/i.test(r.name))).toBe(true);
  });

  it("resolves 'steak' to the Angus beef burger via synonyms", () => {
    const results = searchMenu("steak");
    expect(results.some((r) => /angus beef burger/i.test(r.name))).toBe(true);
  });

  it("returns [] for something truly off-menu", () => {
    expect(searchMenu("sushi")).toEqual([]);
    expect(searchMenu("tacos")).toEqual([]);
  });

  it("returns the full menu for a blank query", () => {
    expect(searchMenu()).toEqual(MENU);
    expect(searchMenu("   ")).toEqual(MENU);
  });
});

describe("findCitedMenuItems", () => {
  it("finds dishes named in assistant text (apostrophe-insensitive)", () => {
    const text = "We have Sylvia's Down Home Fried Chicken ($25) and Bar-B-Que Ribs ($29).";
    const cited = findCitedMenuItems(text).map((i) => i.name.toLowerCase());
    expect(cited.some((n) => n.includes("down home fried chicken"))).toBe(true);
    expect(cited.some((n) => n.includes("bar-b-que ribs"))).toBe(true);
  });

  it("returns nothing when no dish is named", () => {
    expect(findCitedMenuItems("Our hours are 11am to 10pm.")).toEqual([]);
  });
});
