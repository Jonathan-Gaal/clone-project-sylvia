import { describe, it, expect } from "vitest";
import { searchMenu, MENU } from "./menu";

describe("searchMenu", () => {
  it("finds chicken dishes", () => {
    const results = searchMenu("chicken");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.tags.includes("chicken") || /chicken/i.test(r.name))).toBe(true);
    expect(results.map((r) => r.name)).toContain("Sylvia's Down Home Fried Chicken");
  });

  it("resolves 'steak' to the closest real beef item (there is no steak)", () => {
    // No dish is literally a steak; the synonym maps steak → beef/burger so the
    // agent can answer honestly and suggest the Angus burger.
    const noSteak = MENU.some((m) => /steak/i.test(m.name));
    expect(noSteak).toBe(false);

    const results = searchMenu("steak");
    expect(results.map((r) => r.name)).toContain("Sylvia's Sassy Angus Beef Burger");
  });

  it("returns [] for something truly off-menu so the agent can say we don't serve it", () => {
    expect(searchMenu("sushi")).toEqual([]);
    expect(searchMenu("tacos")).toEqual([]);
  });

  it("returns the full menu for a blank query", () => {
    expect(searchMenu()).toEqual(MENU);
    expect(searchMenu("   ")).toEqual(MENU);
  });

  it("matches by category and by tag", () => {
    expect(searchMenu("seafood").length).toBeGreaterThan(0);
    expect(searchMenu("vegetarian").length).toBeGreaterThan(0);
  });
});
