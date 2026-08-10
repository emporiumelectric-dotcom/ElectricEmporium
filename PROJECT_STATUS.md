# Project Status — Electric Emporium

Generated 2026-08-10. Every statement below is sourced from this repository or
from the GitHub Actions run history for it. Where a fact could not be sourced,
that is stated explicitly rather than filled in.

## Source note: two requested inputs do not exist

This report was requested against `BACKLOG.md` and `DEPLOYMENT.md`. **Neither
file exists.** They are absent from the working tree, absent from
`git ls-files`, and absent from all of history on every branch — no `.md` file
has ever been tracked in this repository:

```
git log --all --diff-filter=ADR -- '*BACKLOG*' '*DEPLOYMENT*' '*.md'   # no results
```

Consequently the "what's open" and "what's blocked" sections below could not be
populated from their intended source. See those sections for what was and was
not recoverable.

## Current live commit

| | |
|---|---|
| Live commit | `7d7464a02285c97cd8853a6cdc50ead72a000b97` |
| Subject | `chore: auto-update sitemap.xml` |
| Authored | 2026-08-10 04:44:02 +0000 by `sitemap-bot` |
| Branch | `main` |
| Domain | `electricemporium.in` (from `CNAME`) |

`main@7d7464a` is confirmed deployed, not merely committed:
`pages-build-deployment` run **#118** completed with conclusion `success` at
2026-08-10T04:44:04Z against `head_sha 7d7464a`. Local `main` and
`origin/main` are both at this commit, and the working tree is clean.

## What shipped

The last 20 commits on `main` span **2026-07-17 → 2026-08-10** and break down as
12 by Yash Katariya, 4 by emporiumelectric-dotcom, and 4 automated `sitemap-bot`
commits.

### Product listing and detail fixes

| Commit | Change |
|---|---|
| `1471c8e` | Fix broken photo-placeholder icon on products listing page |
| `6a2d640` | Fix inconsistent price display on products listing page |
| `6942c7d` | Show "Call for Price" fallback when a product has no price set |
| `b6e41d6` | Fix broken product links pointing to non-existent `products/<id>.html` |

### Search

| Commit | Change |
|---|---|
| `37c214b` | Fix homepage search showing all products instead of filtering by category |
| `0f555ed` | Fix remaining search category mismatches (ACs, Switches) |
| `361554f` | Fix remaining stale category refs and search gaps for Sujata/Nortek |
| `ac22084` | Implement search suggestions with typeahead feature |

### Mobile and layout

| Commit | Change |
|---|---|
| `6d92fe6` | Fix hero/search layout instability on mobile Safari via `dvh` units |
| `ed5d57f` | Skip building the 3D globe on phones/tablets |
| `403006c` | Shrink brand carousel edge fade on mobile |
| `5785572` | Redesign homepage categories with solution-first framing |

### SEO and tooling

| Commit | Change |
|---|---|
| `0b08ec5` | Enhance SEO with updated title and meta tags |
| `02bd622` | Create `generate_product_pages.py` |
| `f6680ff` | Remove unused `admin-upload.html` |
| `d40e5cf` | Update print statement from 'Hello' to 'Goodbye' |

### Automated

`7d7464a`, `d6ab314`, `cafc63a`, `e771e4b` — `chore: auto-update sitemap.xml`,
committed by `sitemap-bot` on 2026-08-10, 08-03, 07-27 and 07-20.

## Deployment

`DEPLOYMENT.md` does not exist. The following is sourced from `CNAME`,
`.github/workflows/update-sitemap.yml`, and Actions run history — it is not a
substitute for the missing document, and it does not cover anything not
recorded in those places.

**Hosting.** GitHub Pages, custom domain `electricemporium.in` per `CNAME`.
Deployment is the built-in `pages-build-deployment` workflow
(`dynamic/pages/pages-build-deployment`), active since 2026-06-08, triggered on
push to `main`. 118 runs to date; the three most recent (`7d7464a`, `d6ab314`,
`1471c8e`) all concluded `success`. There is no custom deploy workflow in
`.github/workflows/`.

**Sitemap automation.** `.github/workflows/update-sitemap.yml` runs
`generate_sitemap.py` on cron `0 3 * * 1` (Mondays 03:00 UTC) plus manual
`workflow_dispatch`. It commits `sitemap.xml` as `sitemap-bot` only when the
file changed, and pushes to `main` — which is what triggers the Pages deploy.
All 6 runs to date concluded `success`, most recently run #6 on
2026-08-10T04:43:52Z.

**Data source.** `generate_sitemap.py` reads products from Supabase at
`https://dnmzzckeuctnkqbphwdg.supabase.co`, filtered to `in_stock=eq.true`,
authenticating with the `SUPABASE_ANON_KEY` env var supplied from repository
secrets. It emits three static URLs (`/`, `/products.html`, `/about.html`) plus
one `product-detail.html?id=<id>` URL per in-stock product.

## What's open

**No source in the repository records open work.**

- `BACKLOG.md` does not exist and never has (see source note above).
- Open GitHub issues: **0**.
- Open pull requests: **0**.
- Working tree clean; `main` and `origin/main` are in sync.

No list of open items is given here because producing one would require
inferring intent from commit messages, which this report does not do.

## What each open item is blocked on

**Not determinable.** Blocker status was to come from `BACKLOG.md`, which does
not exist. No blocker, priority, owner, or target-date information is recorded
anywhere else in the repository — not in issues, pull requests, workflow
definitions, or code comments. This section cannot be completed from repository
facts and is deliberately left unpopulated.

## Verifiable loose ends

These are file-level facts observed directly in the tree. They are recorded
because they are checkable, **not** because any backlog, issue, or commit
designates them as open work — no such designation exists in the repo, and no
status, priority, or blocker is implied by their presence here.

**`generate_product_pages.py` is not wired into anything and its output is not
in the repo.**

- The script was added in `02bd622` and writes one file per in-stock product to
  `products/<id>.html`.
- `products/` contains no tracked files and has never appeared in history on
  any branch.
- No workflow in `.github/workflows/` invokes it; `update-sitemap.yml` runs only
  `generate_sitemap.py`.
- Separately, `b6e41d6` is titled "Fix broken product links pointing to
  non-existent `products/<id>.html`".

**Two prerequisites named in that script's own docstring are unmet.**

- It states it "Requires one small change to `product-detail.html` (see
  `patches.txt`)" so the JS falls back to a baked-in product ID. `patches.txt`
  does not exist in the repo.
- That change is the `PREFILLED_ID` variable the script injects.
  `product-detail.html` contains **0** occurrences of `PREFILLED_ID`.
- The script hard-fails if its anchor string is missing. That anchor,
  `<title>Product - Electric Emporium</title>`, is currently present in
  `product-detail.html` (1 occurrence), so the script would run rather than
  exit early.

**Duplicate and mixed-format brand assets are tracked.**

- `logo_mistubishi.png` and `logo_mitsubishi.png` are both tracked and are
  byte-identical (md5 `0c662d2b36f73701ebc0cd422800d446`, 56810 bytes each).
  The first spelling is a typo.
- Two brands are tracked in both formats: `logo_surya.jpg` / `logo_surya.png`
  and `logo_vguard.jpg` / `logo_vguard.png`.
- `logo_legrand.jpg` is the only brand logo tracked solely as JPG. Of the 17
  tracked `logo_*` files, 14 are PNG and 3 are JPG.
