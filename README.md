# DeXM Management

Website: **https://www.dexm-m.com**

Operating partner for PE sponsors, owners and management teams of manufacturing companies: stabilize cash, rebuild EBITDA, and restore and create enterprise value.

## Site pages

| Page | URL |
|---|---|
| Home | https://www.dexm-m.com |
| Solutions | https://www.dexm-m.com/solutions |
| DeXM OS | https://www.dexm-m.com/dexm-os |
| About | https://www.dexm-m.com/about |
| Tools | https://www.dexm-m.com/tools |
| Growth Constraint Diagnostic | https://www.dexm-m.com/bottleneck-diagnostic |
| P&L Statement | https://www.dexm-m.com/pl |
| 13-Week Cash Forecast | https://www.dexm-m.com/cash-forecast |
| EBITDA Bridge | https://www.dexm-m.com/ebitda-bridge |
| Hidden Factory | https://www.dexm-m.com/hidden-factory |
| SKU Analysis | https://www.dexm-m.com/sku-analysis |

## Repository layout

- `dexm-m.com/` — the static website (HTML, `css/`, `js/`, `img/`). Deployed by Vercel from `main`; `vercel.json` at the repo root sets it as the output directory with clean URLs.
- `crm/` — DeXM CRM (Next.js app, deployed separately).

## Deploying

Every merge to `main` deploys the site to production on Vercel (project `dexm-m`), serving `www.dexm-m.com`. `dexm-m.com` redirects to `www`.
