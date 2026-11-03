"""
Generates sitemap.xml for electricemporium.in: static pages, one URL per
category, and one per pre-rendered product page (products/<id>.html).

Run after generate_product_pages.py so the sitemap only lists pages that exist.
Reads the Supabase key from SUPABASE_ANON_KEY (a GitHub secret in Actions).

Local run:
    export SUPABASE_ANON_KEY="sb_publishable_..."
    pip install requests
    python generate_sitemap.py
"""

import os
from datetime import datetime, timezone
from xml.sax.saxutils import escape

import requests

SUPABASE_URL = "https://dnmzzckeuctnkqbphwdg.supabase.co"
BASE_URL = "https://electricemporium.in"
PRODUCT_DIR = "products"
PAGE_SIZE = 1000

STATIC_PAGES = [
    ("/", "1.0", "weekly"),
    ("/products.html", "0.9", "weekly"),
    ("/about.html", "0.6", "monthly"),
]
# Category ids from data.js; each has its own canonical URL (set in app.js).
CATEGORIES = ["fans", "lighting", "switches", "appliances", "ac", "geysers", "outdoor", "wires", "protection"]


def fetch_products():
    key = os.environ["SUPABASE_ANON_KEY"]
    out = []
    while True:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/products",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
            params={"select": "id,created_at", "order": "id.asc", "limit": PAGE_SIZE, "offset": len(out)},
            timeout=30,
        )
        resp.raise_for_status()
        rows = resp.json()
        out.extend(rows)
        if len(rows) < PAGE_SIZE:
            return out


def entry(loc, lastmod, changefreq, priority):
    # Static and category pages carry no lastmod, so the file (and the daily
    # commit) only changes when the product list does.
    stamp = f"\n    <lastmod>{lastmod}</lastmod>" if lastmod else ""
    return f"""  <url>
    <loc>{escape(loc)}</loc>{stamp}
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>"""


def build_sitemap(products):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = [entry(f"{BASE_URL}{path}", None, freq, prio) for path, prio, freq in STATIC_PAGES]
    urls += [entry(f"{BASE_URL}/products.html?category={c}", None, "weekly", "0.8") for c in CATEGORIES]
    for p in products:
        # Only list pages that were actually generated.
        if os.path.exists(os.path.join(PRODUCT_DIR, f"{p['id']}.html")):
            lastmod = (p.get("created_at") or today)[:10]
            urls.append(entry(f"{BASE_URL}/{PRODUCT_DIR}/{p['id']}.html", lastmod, "monthly", "0.7"))
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>
"""


if __name__ == "__main__":
    products = fetch_products()
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(build_sitemap(products))
    print(f"sitemap.xml written: {len(STATIC_PAGES)} static, {len(CATEGORIES)} categories, products from {len(products)} rows")
