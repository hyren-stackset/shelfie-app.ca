# Deploying shelfie-app.ca (GitHub Pages, same account as stackset.io)

GitHub Pages allows **one custom domain per repository**, so shelfie-app.ca lives in its own repo under the same `hyren-stackset` account and points at the same GitHub Pages servers as stackset.io. Same cost ($0), same workflow.

The site is 100% static: hand-written CSS, vendored GSAP / ScrollTrigger / Lenis / SplitType, self-hosted fonts. **No build step.**

## 1 · Create the repo and push

On github.com, signed in as `hyren-stackset`: New repository → name `shelfie-app.ca` → Public → Create (no README).

From the folder containing this file:

```bash
git init
git add -A
git commit -m "Shelfie marketing site"
git branch -M main
git remote add origin git@github.com:hyren-stackset/shelfie-app.ca.git
git push -u origin main
```

## 2 · Turn on Pages

Repo → **Settings → Pages**: Source "Deploy from a branch", branch `main`, folder `/ (root)`, Save.
The `CNAME` file sets the custom domain to `shelfie-app.ca`; if the box is empty, type it and Save.

Optional but recommended: **Verify domain** (Settings → Pages → Add a domain) and add the `_github-pages-challenge-hyren-stackset` TXT record it shows you at Porkbun.

## 3 · DNS at Porkbun (shelfie-app.ca currently has no records)

| Type | Host | Answer | TTL |
|---|---|---|---|
| A | *(blank)* | 185.199.108.153 | 600 |
| A | *(blank)* | 185.199.109.153 | 600 |
| A | *(blank)* | 185.199.110.153 | 600 |
| A | *(blank)* | 185.199.111.153 | 600 |
| CNAME | `www` | `hyren-stackset.github.io` | 600 |

If Porkbun shows parking records (`ALIAS @ → pixie.porkbun.com`, `CNAME * → pixie.porkbun.com`), delete those first; they conflict.

## 4 · HTTPS

Back in Settings → Pages, wait for the DNS check to pass (minutes to an hour), then tick **Enforce HTTPS**.

## Updating

Edit → commit → push. Pages redeploys in about a minute.

## What's in the box

```
index.html                 showcase home (hero, tour, collections story, INCI demo, socials, themes, security, investors, beta)
features/index.html        full feature tour
security/index.html        security & privacy, user controls, disclosure
about/index.html           story, founders, roadmap, principles
support/index.html         help centre: getting started, FAQ, contact form (mailto), data deletion, known issues
privacy/index.html         privacy policy (PIPEDA-oriented)
terms/index.html           terms of service
404.html  robots.txt  sitemap.xml  humans.txt  .well-known/security.txt
CNAME  .nojekyll  favicon.svg
assets/css/main.css        all styles
assets/js/main.js          motion, tour, scrollytelling, INCI demo, theme switcher, forms
assets/vendor/             pinned animation libraries
assets/fonts/              Nunito (app brand font), Fraunces (display), Inter
assets/og.png  assets/apple-touch-icon.png
```

## Things this unblocks in the Shelfie Masterplan

- Privacy policy + terms URLs for App Store Connect, Google Play, Google OAuth consent screen (publish it out of Testing), and external TestFlight review:
  `https://shelfie-app.ca/privacy/` and `https://shelfie-app.ca/terms/`
- Support URL for the store listings: `https://shelfie-app.ca/support/`
- Marketing URL: `https://shelfie-app.ca`

## Email addresses referenced

`support@`, `beta@`, `hello@`, `press@shelfie-app.ca`, plus `privacy@`, `security@`, `partners@`, `founders@`, `legal@stackset.io`. Add shelfie-app.ca to MXroute (or forward at Porkbun) and alias them to a real inbox.
