# ElectricEmporium

Public website for Electric Emporium, Balaghat — **https://electricemporium.in**.
Static HTML on GitHub Pages, with the product catalogue read live from Supabase
in the browser.

Repo: `emporiumelectric-dotcom/ElectricEmporium`

## Pages

| File | Role |
|---|---|
| [`index.html`](index.html) | V3 showroom: scroll-driven aerial fly-in, category hotspots, mobile overview, brand carousel and live featured products |
| [`products.html`](products.html) | Catalogue listing. Filters by `?category=`; each category sets its own canonical, title and description |
| `products/<id>.html` | **Generated.** One crawlable page per catalogue product (see below). This is the canonical product URL |
| [`product-detail.html`](product-detail.html) | Template for the generated pages, and the dynamic fallback (`?id=`) for display/reference items and brand-new products |
| [`about.html`](about.html) | Store story, newspaper archive and shop photo galleries |
| [`404.html`](404.html) | GitHub Pages 404. Forwards `/products/<id>.html` that has not been built yet to `product-detail.html?id=<id>`, and the retired `2products.html` / `electric_emporium_v4.html` to their replacements |
| `google0cd5ba9994b42635.html` | Google Search Console verification |
| `robots.txt`, `sitemap.xml`, `CNAME`, `og-image.jpg` | Site plumbing. `og-image.jpg` (1200×630) is the default share image |

The fly-in follows scroll position only. Reduced-motion users see the showroom
directly and download no frames.

Fly-in frames live in `media/flight-v3/`: `d/` holds 160 frames at 1440×900
(~10.6 MB), `m/` holds 80 portrait 750×1000 centre crops for phones (~3.4 MB).
The engine in `setupShowroom()` (app.js):

- picks `m/` when the stage is 3:4 or narrower, otherwise `d/`;
- fetches a coarse pass (every 16th frame) on load, and the rest coarse-to-fine
  once the visitor first scrolls, with frames at the scroll position jumping
  the queue. Save-Data / 2G stops at every 4th frame;
- keeps frames compressed and decodes only the 8 nearest the scroll target
  into `ImageBitmap`s off the main thread, so drawing never decodes;
- eases toward the scroll target and crossfades between the nearest decoded
  frames while gaps are still loading;
- never backs the canvas with more pixels than the frame provides.

Analytics: GA4 `G-V14YKCWGSH`, configured in `analytics.js`. WhatsApp and call
clicks are sent as `whatsapp_click` / `call_click` with `item_name` and
`item_id` from the product card or product page they came from.

Old site assets (`shop*.png`, `logo_*`, `cert_*`, the old catalogue pages) were
removed from `main`; they remain in history and in `rollback/pre-showroom-20260930`.

## Data

Supabase project `dnmzzckeuctnkqbphwdg`, read from the browser via PostgREST
with the public key in `data.js`. Tables: `products`, `product_images`,
`product_variants`. No writes. AdminPanel is what writes the product rows.

`catalogue.js` fetches only what each page shows:

| Page | Request |
|---|---|
| Home | the featured product IDs only |
| About | nothing |
| Catalogue | full list, listing columns only (no `Spec`) |
| Product | that product with `Spec`, its images and variants, and four related products |
| Any page, on first search | full list (memoised) |

It asks for named columns and falls back to `select=*` if PostgREST returns 400,
so a renamed column degrades rather than breaks. The "availability temporarily
unavailable" notice only appears on catalogue and product pages; a generated
product page keeps its pre-rendered content when the API is down.

## Build scripts

Python, need `requests`, read the key from the environment:

```bash
export SUPABASE_ANON_KEY="sb_publishable_..."
pip install requests
```

### `generate_product_pages.py`

Writes `products/<id>.html` for every product (in stock or not) from
`product-detail.html`: product title, description, canonical, Open Graph,
Twitter Card, Product + BreadcrumbList JSON-LD (an `Offer` only when there is a
real price), `<base href="/">`, `window.PREFILLED_ID`, and static product markup
in `<main data-prerendered>` that app.js then upgrades. Pages for deleted
products are removed. It refuses to run if the API returns no products.

### `generate_sitemap.py`

Static pages, the nine category URLs, and one `/products/<id>.html` per
generated page. Only product entries carry `lastmod`, so the file changes only
when products do.

### CI

[`.github/workflows/update-sitemap.yml`](.github/workflows/update-sitemap.yml)
runs both scripts daily (21:17 UTC), on manual dispatch, and on pushes to `main`
that touch the template or scripts, then commits `products/` and `sitemap.xml`
as `sitemap-bot` if anything changed. Key comes from the `SUPABASE_ANON_KEY`
repository secret.

### `stamp_assets.py`

Sets every `?v=` on local CSS/JS references to the file's content hash. Run it
after editing any stylesheet or script; `--check` exits 1 if a page is stale.

Gallery images in `media/thumbs/` are smaller copies used in the About page
grids; the lightbox loads the full image from `media/`.

## Deployment

GitHub Pages from `main`. Pushing publishes — there is no build gate and no
deploy workflow. Custom domain via `CNAME` (`electricemporium.in`).

V3 release: `release.json`. Styles and scripts use content-versioned URLs.
The previous main site is preserved in `rollback/pre-showroom-20260930`.
Original preview directories are maintained separately from this repository.

## Local development

No build step:

```bash
python -m http.server 8000
```

Catalogue pages hit production Supabase directly from the browser, so products
load normally on localhost.
