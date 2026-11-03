"""
Pre-renders one crawlable page per catalogue product: products/<id>.html.

Search engines and link-preview bots (WhatsApp, Facebook, X) do not run the
site's JavaScript, so product-detail.html?id=<id> shows them a generic page.
Each generated file is a copy of product-detail.html with:

  * a product-specific <head>: title, description, canonical, Open Graph,
    Twitter Card and Product JSON-LD;
  * <base href="/"> so the template's relative asset and link URLs keep
    resolving from the site root;
  * window.PREFILLED_ID, which catalogue.js uses instead of ?id=;
  * static product markup inside <main data-prerendered>, which app.js
    replaces with the live view (or keeps if the catalogue API is down).

Pages that no longer match a product are deleted. A product added after the
last run is still reachable: 404.html forwards /products/<id>.html to
product-detail.html?id=<id> until the next build.

Run from the repo root (CI runs it daily, before generate_sitemap.py):
    export SUPABASE_ANON_KEY="sb_publishable_..."
    pip install requests
    python generate_product_pages.py
"""

import glob
import html
import json
import os
import re

import requests

SUPABASE_URL = "https://dnmzzckeuctnkqbphwdg.supabase.co"
BASE_URL = "https://electricemporium.in"
TEMPLATE_PATH = "product-detail.html"
OUTPUT_DIR = "products"
FALLBACK_IMAGE = f"{BASE_URL}/og-image.jpg"
WHATSAPP = "https://wa.me/919425831035?text="
PAGE_SIZE = 1000

# Same mapping as catalogue.js, so breadcrumbs agree with the live page.
CATEGORY_ALIASES = {
    "fans": ("fans", "Fans"), "lights and leds": ("lighting", "Lighting"),
    "lighting": ("lighting", "Lighting"), "switches": ("switches", "Switches"),
    "appliances": ("appliances", "Appliances"), "acs and freezers": ("ac", "Air Conditioning"),
    "acs": ("ac", "Air Conditioning"), "air conditioning": ("ac", "Air Conditioning"),
    "geysers": ("geysers", "Water Heaters"), "water heaters": ("geysers", "Water Heaters"),
    "outdoor lighting": ("outdoor", "Outdoor Lighting"), "wires and cables": ("wires", "Wires & Cables"),
    "wires": ("wires", "Wires & Cables"), "circuit protection": ("protection", "Circuit Protection"),
}


def headers():
    key = os.environ["SUPABASE_ANON_KEY"]
    return {"apikey": key, "Authorization": f"Bearer {key}"}


def fetch_all(table, params):
    """Page through a PostgREST table."""
    out = []
    while True:
        page = {**params, "limit": PAGE_SIZE, "offset": len(out)}
        resp = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=headers(), params=page, timeout=30)
        resp.raise_for_status()
        rows = resp.json()
        out.extend(rows)
        if len(rows) < PAGE_SIZE:
            return out


def fetch_products():
    return fetch_all("products", {"select": "*", "order": "id.asc"})


def fetch_primary_images():
    """First image (lowest sort_order) per product, in one paged query."""
    first = {}
    for row in fetch_all("product_images", {"select": "product_id,image_url,sort_order", "order": "product_id.asc,sort_order.asc"}):
        first.setdefault(str(row["product_id"]), row.get("image_url"))
    return first


def parse_price(value):
    s = re.sub(r"^(?:rs\.?|inr|₹)\s*", "", str(value or "").strip(), flags=re.I).replace(",", "")
    return float(s) if re.fullmatch(r"\d+(?:\.\d+)?", s) and float(s) > 0 else None


def http_url(value):
    return value if isinstance(value, str) and re.match(r"https?://", value) else None


def summary(spec):
    """First descriptive line of the Spec field (structured or legacy plain text)."""
    for line in str(spec or "").splitlines():
        line = line.strip()
        if line and not re.fullmatch(r"(Description|Features|Technical specifications)", line, re.I):
            return line.lstrip("• ").strip()
    return ""


def clip(text, limit):
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


def esc(value):
    return html.escape(str(value), quote=True)


def json_ld(data):
    # Escape "<" so no value can close the <script> element.
    return json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")


def build(template, product, image_url):
    pid = str(product["id"])
    name = (product.get("Name") or "Product").strip()
    brand = (product.get("Brand") or "").strip()
    price = parse_price(product.get("Price"))
    in_stock = product.get("in_stock") is True
    category_id, category_name = CATEGORY_ALIASES.get(str(product.get("Category") or "").strip().lower(), ("appliances", "Appliances"))
    url = f"{BASE_URL}/{OUTPUT_DIR}/{pid}.html"
    image = http_url(image_url) or http_url(product.get("Photo_url"))
    full_name = f"{brand} {name}" if brand and not name.lower().startswith(brand.lower()) else name

    title = f"{full_name} | Electric Emporium Balaghat"
    lead = summary(product.get("Spec")).rstrip(" .")
    description = clip(" ".join(filter(None, [
        f"{full_name}{' – ' + lead if lead else ''}.",
        f"₹{price:,.0f}." if price else "",
        "Available at Electric Emporium, Gujri Chowk, Balaghat. Enquire on WhatsApp.",
    ])), 160)

    schema = {
        "@context": "https://schema.org", "@type": "Product", "name": name, "sku": pid,
        "url": url, "description": lead or description,
        "image": [image] if image else [FALLBACK_IMAGE],
        "category": category_name,
    }
    if brand:
        schema["brand"] = {"@type": "Brand", "name": brand}
    if price:  # Google rejects offers without a real price
        schema["offers"] = {
            "@type": "Offer", "url": url, "priceCurrency": "INR", "price": f"{price:.2f}",
            "availability": f"https://schema.org/{'InStock' if in_stock else 'OutOfStock'}",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {"@type": "Store", "name": "Electric Emporium"},
        }
    breadcrumbs = {
        "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Products", "item": f"{BASE_URL}/products.html"},
            {"@type": "ListItem", "position": 3, "name": category_name, "item": f"{BASE_URL}/products.html?category={category_id}"},
            {"@type": "ListItem", "position": 4, "name": name},
        ],
    }

    t, d, img = esc(title), esc(description), esc(image or FALLBACK_IMAGE)
    head = f"""<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="product"><meta property="og:site_name" content="Electric Emporium">
<meta property="og:title" content="{t}"><meta property="og:description" content="{d}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{img}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}"><meta name="twitter:image" content="{img}">
<script type="application/ld+json">{json_ld(schema)}</script>
<script type="application/ld+json">{json_ld(breadcrumbs)}</script>
<script>window.PREFILLED_ID={json.dumps(pid)};</script>
</head>"""

    enquiry = WHATSAPP + requests.utils.quote(f"Hello Electric Emporium, I am interested in {brand} {name}. Please share the current price and availability.", safe="")
    paragraphs = "".join(f"<p>{esc(line)}</p>" for line in str(product.get("Spec") or "").splitlines()[:12] if line.strip())
    main = f"""<main id="main" class="section product-main" data-prerendered><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="products.html">Products</a><span>/</span><a href="products.html?category={category_id}">{esc(category_name)}</a></nav><article class="product-detail"><div class="detail-photo">{f'<img src="{esc(image)}" alt="{esc(full_name)}">' if image else '<span class="missing-image">Product image coming soon</span>'}</div><div class="detail-info"><p class="eyebrow">{esc(brand.upper())}</p><h1>{esc(name)}</h1><p class="detail-price">{f'₹{price:,.0f}' if price else 'Price on enquiry'}</p><p class="availability">{'In stock. Contact us to confirm your preferred model and delivery.' if in_stock else 'Currently out of stock. Ask about the next availability.'}</p><a class="button primary" href="{esc(enquiry)}" target="_blank" rel="noopener">Enquire on WhatsApp</a><a class="button secondary" href="tel:+919425831035">Call the store</a></div></article>{f'<div class="product-details"><section><h2>Description</h2>{paragraphs}</section></div>' if paragraphs else ''}</main>"""

    page = template
    page = page.replace('<meta charset="utf-8">', '<meta charset="utf-8"><base href="/">', 1)
    # Drop the template's generic head tags; the product block replaces them.
    page = re.sub(r"<title>.*?</title>", "", page, count=1, flags=re.S)
    page = re.sub(r'<meta name="description"[^>]*>|<link rel="canonical"[^>]*>|<meta property="og:[^>]*>|<meta name="twitter:[^>]*>', "", page)
    page = page.replace("</head>", head, 1)
    page = page.replace('href="#main"', f'href="{OUTPUT_DIR}/{pid}.html#main"', 1)  # <base> would send it to /#main
    page = re.sub(r'<main id="main"[^>]*></main>', lambda _: main, page, count=1)
    return page


def check_template(template):
    for marker in ('<meta charset="utf-8">', "</head>", 'href="#main"'):
        if marker not in template:
            raise SystemExit(f"{TEMPLATE_PATH} no longer contains {marker!r}; update generate_product_pages.py.")
    if not re.search(r'<main id="main"[^>]*></main>', template):
        raise SystemExit(f"{TEMPLATE_PATH} must keep an empty <main id=\"main\">; update generate_product_pages.py.")


def main():
    with open(TEMPLATE_PATH, encoding="utf-8") as f:
        template = f.read()
    check_template(template)

    products = fetch_products()
    if not products:  # never wipe products/ because the API returned nothing
        raise SystemExit("Supabase returned no products; leaving existing pages untouched.")
    images = fetch_primary_images()
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    written = set()
    for product in products:
        path = os.path.join(OUTPUT_DIR, f"{product['id']}.html")
        page = build(template, product, images.get(str(product["id"])))
        with open(path, "w", encoding="utf-8") as f:
            f.write(page)
        written.add(os.path.normpath(path))

    stale = [p for p in glob.glob(os.path.join(OUTPUT_DIR, "*.html")) if os.path.normpath(p) not in written]
    for path in stale:
        os.remove(path)
    print(f"Generated {len(written)} product pages in {OUTPUT_DIR}/, removed {len(stale)} stale.")


if __name__ == "__main__":
    main()
