import re, html as htmllib, json, sys

src = open("src/chrome/food-menu.html", encoding="utf-8").read()
# Main à la carte "Menu" tab only.
panel = re.search(r'<div class="menu_1084805 food-menu-grid".*?(?=<div class="menu_1084806)', src, re.S).group(0)

def clean(s):
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = htmllib.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

def slugify(s):
    s = htmllib.unescape(s).lower().replace("’", "").replace("'", "")
    s = re.sub(r'\([^)]*\)', '', s)          # drop "(V, GF)" etc.
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return re.sub(r'-+', '-', s)

def tags_for(name, cat, desc):
    t = f"{name} {cat} {desc}".lower()
    tags = []
    def add(cond, tag):
        if cond and tag not in tags: tags.append(tag)
    add('chicken' in t or 'wing' in t, 'chicken')
    add('rib' in t or 'pork' in t or 'bacon' in t or 'chop' in t, 'pork')
    add('beef' in t or 'burger' in t or 'angus' in t, 'beef')
    add(any(w in t for w in ['catfish','whiting','salmon','fish','shrimp','seafood']), 'seafood')
    add('salad' in t or 'veg' in t or '(v' in t or 'greens' in t, 'vegetarian')
    add('spicy' in t or 'hot ' in t, 'spicy')
    add('fried' in t, 'fried')
    add('grill' in t or 'bbq' in t or 'bar-b-que' in t or 'baked' in t or 'oven' in t, 'grilled')
    add(any(w in t for w in ['cake','cobbler','pudding','pie','waffle','dessert','sweet']), 'sweet')
    return tags

items = []
seen = set()
parts = re.split(r'<h2>(.*?)</h2>', panel, flags=re.S)
for i in range(1, len(parts), 2):
    cat = clean(parts[i]); content = parts[i+1]
    for holder in re.findall(r'<div class="food-item-holder".*?(?=<div class="food-item-holder"|$)', content, re.S):
        nm = re.search(r'<div class="food-item-title">\s*<h3>(.*?)</h3>', holder, re.S)
        if not nm: continue
        name = clean(nm.group(1))
        if not name or name.lower() in seen: continue
        pr = re.search(r'<div class="food-price">(.*?)</div>', holder, re.S)
        de = re.search(r'<div class="food-item-description">(.*?)</div>', holder, re.S)
        img = re.search(r'<img[^>]*\ssrc="(//[^"]+)"', holder)
        price_txt = clean(pr.group(1)) if pr else ""
        num = re.search(r'(\d+)', price_txt)
        price = int(num.group(1)) if num else 0
        price_note = price_txt if price_txt and price_txt != f"${price}" else None
        desc = clean(de.group(1)) if de else ""
        image = ("https:" + re.sub(r'/(small|medium|full)$','', img.group(1)) + "/medium") if img else None
        seen.add(name.lower())
        items.append({
            "name": name, "description": desc, "price": price,
            "priceNote": price_note, "category": cat,
            "tags": tags_for(name, cat, desc), "slug": slugify(name),
            "image": image,
        })

# de-dupe slugs
slugs = {}
for it in items:
    s = it["slug"]; slugs[s] = slugs.get(s, 0) + 1
    if slugs[s] > 1: it["slug"] = f"{s}-{slugs[s]}"

def ts(it):
    lines = [f'    name: {json.dumps(it["name"])},',
             f'    description: {json.dumps(it["description"])},',
             f'    price: {it["price"]},']
    if it["priceNote"]: lines.append(f'    priceNote: {json.dumps(it["priceNote"])},')
    lines.append(f'    category: {json.dumps(it["category"])},')
    lines.append(f'    tags: {json.dumps(it["tags"])},')
    lines.append(f'    slug: {json.dumps(it["slug"])},')
    if it["image"]: lines.append(f'    image: {json.dumps(it["image"])},')
    return "  {\n" + "\n".join(lines) + "\n  }"

out = '''/**
 * Sylvia's full à la carte food menu, auto-generated from the cloned /food-menu page
 * (scripts/regenerate: scratchpad/gen-menu-data.py). Every item mirrors the live site
 * — name, price, description, category, and the real menu photo where one exists.
 * Plain data (no server-only imports) — safe on client + server.
 */

export type MenuItem = {
  name: string;
  description: string;
  /** Base price in USD; 0 when the price isn't a single number (see priceNote). */
  price: number;
  priceNote?: string;
  category: string;
  tags: string[];
  /** Stable id for the /menu deep-link (?item=slug) and card keys. */
  slug: string;
  /** Real menu photo (Sylvia's CDN), or undefined when the live menu has none. */
  image?: string;
};

export const MENU: MenuItem[] = [
''' + ",\n".join(ts(it) for it in items) + "\n];\n"

open("src/lib/menu-data.ts", "w", encoding="utf-8").write(out)
withimg = sum(1 for it in items if it["image"])
print(f"generated {len(items)} items, {withimg} with photos")
print("no photo:", [it["name"] for it in items if not it["image"]])
print("categories:", sorted({it["category"] for it in items}))
