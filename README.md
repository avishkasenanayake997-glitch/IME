# Nexus Smart Business Solutions

A complete SME business management platform for Sri Lankan MSMEs (IT4050 – Innovation Management and Entrepreneurship project): public marketing website + role-based business application (POS, inventory, customers, employees, sales, reports, Nexus Insight Assistant, multi-branch, notifications, settings).

> **Demo status:** runs entirely in the browser with realistic mock data persisted in `localStorage`. There is **no backend, no real payment processing, no real cloud backup and no AI model connected.**

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview
```

Requires Node.js 18+. Optional: copy `.env.example` to `.env`.

## Demo logins

| Role | Email | Password | Access |
|---|---|---|---|
| Super Admin | admin@nexus.lk | Admin@123 | Everything |
| Business Owner | owner@nexus.lk | Owner@123 | All business operations, reports, branches, settings |
| Manager | manager@nexus.lk | Manager@123 | POS, sales, inventory, customers, reports, insights (own branch) |
| Cashier | cashier@nexus.lk | Cashier@123 | POS, sales, customers (own branch) |
| Staff | staff@nexus.lk | Staff@123 | Dashboard, inventory (view + stock adjustments), notifications |

The login page has click-to-fill buttons. Other seeded accounts (e.g. `pradeep@nexus.lk`) include an **Inactive** one that cannot sign in.
Permissions live in `src/utils/permissions.js`; navigation, routes and action buttons all respect them. Managers/Cashiers/Staff only see data for their own branch; Owners/Super Admins can switch branch from the top bar.

## What's included

- **Public site** (`/`, `/about`, `/features`, `/pricing`, `/contact`, `/login`): hero, features, sectors, why Nexus, how it works, pricing (Starter POS LKR 5,000 · Business Management LKR 7,500 · Professional LKR 12,000), services, testimonials (marked demo), FAQ, demo-subscription request form (stored locally, no payment).
- **Dashboard**: 8 KPIs, date filters (Today / 7 / 30 days / This month / Custom), sales, monthly revenue and category charts, top sellers, low-stock alerts, recent transactions and activity.
- **POS & Billing**: search, categories, barcode entry, cart, discounts (% or LKR), tax, cash/card (demo), change, new customer, printable receipt. Completing a sale saves the transaction, reduces stock, logs movements, updates customer history/dashboard and raises notifications. Overselling is blocked.
- **Inventory**: CRUD, SKU/barcode, cost/price, min level, supplier, stock adjustments, movement history, status badges, search/sort/filter/pagination.
- **Customers** (with detail page + purchase history), **Employees** (roles, status, permission matrix), **Sales** (details, invoice print, partial/full returns restoring stock, demo refunds, CSV).
- **Reports**: daily/weekly/monthly/annual, product, inventory, customer, employee, profit — all computed from stored transactions; CSV export and print.
- **Nexus Insight Assistant**: *rule-based* low-stock, slow-mover, trend, reorder, top-seller, daily and monthly insights plus a chat with suggested questions. It is clearly labelled as calculated, not AI.
- **Branches**, **Notifications**, **Settings** (business, currency/tax, receipt, preferences, notifications, security, cloud & backup *simulation*, data export, reset demo data).

## Architecture

```
src/
  components/{common,layout,forms,charts}   reusable UI
  pages/<module>/                           route pages
  context/AppContext.jsx                    auth, branch filter, toasts
  services/                                 store.js (localStorage), *Service.js business logic, api.js (Axios)
  utils/                                    formatting, analytics, permissions
  data/                                     seed data, pricing plans
  routes/AppRoutes.jsx                      lazy routes + role guards
```

- `services/store.js` is the single persistence layer; each collection (products, sales, …) maps to a future PostgreSQL table.
- Business rules (stock decrements, returns, validation) live in the service files, not in components, so they can move behind a Node/Express API. `services/api.js` already exposes an Axios client driven by `VITE_API_BASE_URL`.
- Future AI: implement the `ask(question, ctx)` contract in `services/insightService.js` and register the provider.

## Notes & limitations

- Demo passwords are stored in plain text in `localStorage`; a real backend must hash them and enforce permissions server-side.
- Data is per-browser. Settings → Cloud & backup → *Reset demo data* restores the original dataset.
- Seed data is generated relative to the first launch date, so charts always cover recent days.
- The business-plan document was not available when this was built; identity, pricing, target sectors and services follow the project brief. Adjust copy in `src/data/plans.js` if the plan differs.
