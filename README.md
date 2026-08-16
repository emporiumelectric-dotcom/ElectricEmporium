# ElectricEmporium

Public website for Electric Emporium, Balaghat — **https://electricemporium.in**.
Static HTML on GitHub Pages, with the product catalogue read live from Supabase
in the browser.

Repo: `emporiumelectric-dotcom/ElectricEmporium`

## Pages

| File | Role |
|---|---|
| [`index.html`](index.html) | Homepage. Static marketing content — hero, CSS/DOM 3D globe, category cards, brand carousel, contact. No product fetch; category cards link out to `products.html?category=…` |
| [`products.html`](products.html) | Catalogue listing. Fetches products from Supabase, filters by `?category=` |
| [`product-detail.html`](product-detail.html) | Single product. Fetches product + images + stock. Variant switching, WhatsApp enquiry |
| [`2products.html`](2products.html) | Second catalogue variant, also Supabase-backed. Both are tracked; check which one is linked before editing |
| [`about.html`](about.html) | Static about page |
| [`electric_emporium_v4.html`](electric_emporium_v4.html) | Older full-site version, tracked but not linked from navigation |
| `google0cd5ba9994b42635.html` | Google Search Console verification |
| `robots.txt`, `sitemap.xml`, `CNAME` | Site plumbing |

The globe and torch-bloom effects are disabled under 900px (`index.html:157`)
and under `prefers-reduced-motion` (`index.html:374`) — deliberate, mobile
performance.

Analytics: GA4 `G-V14YKCWGSH`, inline in every page head.

## Untracked working files

These sit in the directory but are **not in git** — design experiments, safe to
ignore or delete:

```text
index-redesign-sample.html
index-redesign-sample - Copy.html
landing-trial.html
motion-landing-sample.html
```

## Data

Supabase project `dnmzzckeuctnkqbphwdg`, read directly from the browser via
PostgREST. Tables used: `products`, `product_images`. The anon key is embedded
in the catalogue pages — it is a publishable client credential, and the site is
read-only.

Same Supabase project as [AccountPortal](../AccountPortal) and
[AdminPanel](../AdminPanel). AdminPanel is what writes the product rows this
site reads.

## Build scripts

Both are Python, both need `requests` and read the key from the environment:

```bash
export SUPABASE_ANON_KEY="sb_publishable_..."
pip install requests
```

### `generate_sitemap.py` — live

Pulls in-stock products and writes `sitemap.xml`: three static pages plus one
`product-detail.html?id=<id>` entry per product.

Runs in CI — [`.github/workflows/update-sitemap.yml`](.github/workflows/update-sitemap.yml)
fires every Monday 03:00 UTC (~08:30 IST) and on manual dispatch, then commits
`sitemap.xml` as `sitemap-bot` if it changed. Key comes from the
`SUPABASE_ANON_KEY` repository secret.

### `generate_product_pages.py` — written, not wired up

Intended to pre-render `products/<id>.html` — one crawlable file per product,
with real `<title>`, meta description, canonical, Open Graph, Twitter Card and
Product JSON-LD spliced into a copy of `product-detail.html`, so search engines
and WhatsApp/Facebook link previews see content before JS runs.

**It has never been run against this repo.** `products/` has no commits and does
not exist on disk, and no workflow invokes the script. Two things must be
settled before it is:

1. Its docstring says `product-detail.html` needs a patch so the JS falls back to
   a baked-in `PREFILLED_ID` when there is no `?id=` in the URL. It references a
   `patches.txt` that is not in the repo.
2. It emits `/products/<id>.html` while `generate_sitemap.py` emits
   `/product-detail.html?id=<id>`. Turning the pre-render on means the sitemap
   has to point at the new URLs, and the old ones need canonicals or redirects.

The script also guards itself: it aborts if
`<title>Product - Electric Emporium</title>` is no longer present in the
template.

## Deployment

GitHub Pages from `main`. Pushing publishes — there is no build gate and no
deploy workflow. Custom domain via `CNAME` (`electricemporium.in`).

## Local development

No build step:

```bash
python -m http.server 8000
```

Catalogue pages hit production Supabase directly from the browser, so products
load normally on localhost.
