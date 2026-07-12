"""
Generates sitemap.xml for electricemporium.in by pulling live products from Supabase.
Reads the Supabase key from the SUPABASE_ANON_KEY env var (set as a GitHub Secret
in Actions, or export it yourself when running locally).

Local run:
    export SUPABASE_ANON_KEY="sb_publishable_..."
    pip install requests --break-system-packages
    python generate_sitemap.py
"""

import os
import requests
from datetime import datetime, timezone

SUPABASE_URL = "https://dnmzzckeuctnkqbphwdg.supabase.co"
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]

BASE_URL = "https://electricemporium.in"

STATIC_PAGES = [
    ("/", "1.0", "weekly"),
    ("/products.html", "0.9", "weekly"),
    ("/about.html", "0.6", "monthly"),
]


def fetch_products():
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/products",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        },
        params={
            "select": "id,created_at",
            "in_stock": "eq.true",
            "order": "id.asc",
        },
    )
    resp.raise_for_status()
    return resp.json()


def build_sitemap(products):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    urls = []
    for path, priority, changefreq in STATIC_PAGES:
        urls.append(f"""  <url>
    <loc>{BASE_URL}{path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

    for p in products:
        lastmod = p.get("created_at", today)[:10]
        urls.append(f"""  <url>
    <loc>{BASE_URL}/product-detail.html?id={p['id']}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>""")

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>
"""


if __name__ == "__main__":
    products = fetch_products()
    sitemap = build_sitemap(products)
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(sitemap)
    print(f"sitemap.xml written with {len(products)} products + {len(STATIC_PAGES)} static pages")
