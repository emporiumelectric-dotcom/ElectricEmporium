"""
Pre-renders a static, crawlable HTML page for every in-stock product so that
search engines and link-preview bots (WhatsApp, Facebook, Twitter) see a real
title, description, image and Product schema instead of an empty JS shell.
 
Writes one file per product to products/<id>.html. Each file is a full copy
of product-detail.html with a product-specific <head> block (title, meta
description, canonical, Open Graph, Twitter Card, and Product JSON-LD)
spliced in where the old static <title> tag used to be. The page body and
script are left untouched, so all existing interactivity (variant switching,
live stock, WhatsApp enquiry) keeps working exactly as before — the page
just also has real content before JS ever runs.
 
Requires one small change to product-detail.html (see patches.txt) so the
JS falls back to a baked-in product ID when there's no ?id= in the URL.
 
Run this from the repo root, alongside generate_sitemap.py.
 
Local run:
    export SUPABASE_ANON_KEY="sb_publishable_..."
    pip install requests --break-system-packages
    python generate_product_pages.py
"""
 
import os
import re
import json
import html
import requests
 
SUPABASE_URL = "https://dnmzzckeuctnkqbphwdg.supabase.co"
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
BASE_URL = "https://electricemporium.in"
 
TEMPLATE_PATH = "product-detail.html"
OUTPUT_DIR = "products"
TITLE_TAG = "<title>Product - Electric Emporium</title>"
 
 
def sb_headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    }
 
 
def fetch_products():
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/products",
        headers=sb_headers(),
        params={"select": "*", "in_stock": "eq.true", "order": "id.asc"},
    )
    resp.raise_for_status()
    return resp.json()
 
 
def fetch_primary_image(product_id, fallback_url):
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/product_images",
        headers=sb_headers(),
        params={
            "product_id": f"eq.{product_id}",
            "select": "image_url",
            "order": "sort_order.asc",
            "limit": 1,
        },
    )
    resp.raise_for_status()
    rows = resp.json()
    return rows[0]["image_url"] if rows else fallback_url
 
 
def build_head(product, image_url, url):
    name = product.get("Name") or "Product"
    brand = product.get("Brand") or ""
    spec = (product.get("Spec") or "").replace("\n", " ").strip()
    price = product.get("Price") or ""
 
    title = f"{name} by {brand} | Electric Emporium Balaghat" if brand else f"{name} | Electric Emporium Balaghat"
    desc_bits = [b for b in [brand, spec, "Available at Electric Emporium, Balaghat."] if b]
    description = " — ".join(desc_bits)[:160] or f"{name} — available at Electric Emporium, Balaghat."
 
    price_num = re.sub(r"[^0-9.]", "", str(price)) or "0"
 
    schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "image": [image_url] if image_url else [],
        "description": description,
        "sku": str(product.get("id")),
        "brand": {"@type": "Brand", "name": brand},
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "INR",
            "price": price_num,
            "availability": "https://schema.org/InStock" if product.get("in_stock") else "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {"@type": "Organization", "name": "Electric Emporium"},
        },
    }
 
    t = html.escape(title, quote=True)
    d = html.escape(description, quote=True)
    img = html.escape(image_url or "", quote=True)
 
    return f"""<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="product">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta property="og:site_name" content="Electric Emporium">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{img}">
<script type="application/ld+json">{json.dumps(schema)}</script>
<script>var PREFILLED_ID="{product.get('id')}";</script>"""
 
 
def main():
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()
 
    if TITLE_TAG not in template:
        raise SystemExit(
            f"Could not find '{TITLE_TAG}' in {TEMPLATE_PATH} — "
            "the template's <title> line has changed, update TITLE_TAG above to match."
        )
 
    os.makedirs(OUTPUT_DIR, exist_ok=True)
 
    products = fetch_products()
    for p in products:
        pid = p["id"]
        url = f"{BASE_URL}/{OUTPUT_DIR}/{pid}.html"
        image_url = fetch_primary_image(pid, p.get("Photo_url"))
        head_block = build_head(p, image_url, url)
 
        page = template.replace(TITLE_TAG, head_block)
        out_path = os.path.join(OUTPUT_DIR, f"{pid}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(page)
 
    print(f"Generated {len(products)} static product pages in {OUTPUT_DIR}/")
 
 
if __name__ == "__main__":
    main()
