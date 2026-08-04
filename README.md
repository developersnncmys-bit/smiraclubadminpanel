# Smira Club — Travel Agency Admin Panel

A client-ready admin panel for a travel agency, modelled on the 3Sigma CRM layout
(sidebar rail → KPI row → tabbed "Business Reports" → record tables) but rebuilt
around travel workflows: enquiries, packages, bookings, departures, visas and
supplier coordination.

## Run it

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # production bundle in dist/
```

## Stack

Vite · React 18 · React Router 6 · Tailwind CSS 3 · Recharts · lucide-react

## Screens

| Route | What it shows |
| --- | --- |
| `/` | KPIs, conversion ratios, tabbed trend reports, departures, sources, tasks, activity |
| `/enquiries` | Pipeline strip by status + searchable/filterable enquiry table with call/WhatsApp/quote actions |
| `/bookings` | Booking value, per-booking collection progress bars, status filters |
| `/packages` | Card grid of sellable itineraries with price, nights, rating, seats left |
| `/customers` | Repeat travellers, trips and lifetime value by tier |
| `/tasks` | Today / Upcoming / Overdue / Done buckets with owner, type and priority |
| `/quotations` | Proposals with validity and Draft → Accepted status |
| `/invoices` | Billed vs collected vs outstanding, per-invoice balances |
| `/payments` | Receipts and refunds by payment mode |
| `/suppliers` | DMCs, hotels, transport and visa partners with ratings |
| `/campaigns` | WhatsApp / Instagram / Email / Ads performance and cost per lead |
| `/team` | Revenue by consultant, conversion leaderboard, member cards |
| `/reports` | Booked vs collected over 6 months, funnel, sources, top destinations |
| `/settings` | Agency profile, notifications, integrations, plan, security |

## Everything is interactive

There are no dead buttons. All actions write to a real client-side store
(`src/store/AppStore.jsx`) and persist to `localStorage`, so a demo survives a
refresh. "Reset demo data" (Settings, or the sidebar user menu) restores the
seed dataset.

- **Create / edit / delete** on every collection via a schema-driven modal
- **Bulk actions** — select rows, then assign, change status or delete
- **Row menus** (⋯) — edit, duplicate, convert, pause/resume, mark done
- **Cross-record flows** — enquiry → quotation → booking → invoice → payment,
  each step updating the linked records
- **Export** — every table's Export button downloads the filtered rows as CSV;
  quotations, invoices and receipts download as text documents
- **Real links** — call, WhatsApp and email row actions open `tel:`, `wa.me`
  and `mailto:`
- **Global search** (⌘K / Ctrl+K) across enquiries, bookings and customers
- **Team-member picker** in the top bar scopes the dashboard, enquiries,
  bookings, tasks and quotations
- **Toasts** confirm every mutation; delete always goes through a confirm dialog

## Structure

```
src/
  store/
    AppStore.jsx  Context store: all collections + create/update/remove/
                  duplicate/recordPayment, toasts, localStorage persistence
  components/
    layout/     Sidebar (collapsible + mobile drawer), Topbar, Layout
    ui/         Badge, Card, StatCard, Sparkline, Avatar, PageHeader,
                DataTable, Modal, FormModal, ConfirmDialog, RowMenu, Toaster
    dashboard/  TrendReports, SourceDonut, TopDestinations,
                UpcomingDepartures, TaskSnapshot, ActivityFeed
  data/
    nav.js        Sidebar routes
    mockData.js   Seed records, formatters (inr / shortInr)
  lib/
    csv.js        CSV + text file downloads
  pages/        One file per route
```

`DataTable` is the shared list surface — pass `columns`, `rows`, `searchKeys`,
`filters` and `bulkActions` and every record page gets identical search,
filtering, selection, export and pagination behaviour. `FormModal` is
schema-driven: each page declares a `fields` array and gets add + edit for free.

## Wiring it to a backend

`AppStore.jsx` is the only place that owns data. Replace its `useState` seed
with fetches and point `create` / `update` / `remove` at your API — every screen
keeps working unchanged.

Design tokens (brand teal, ocean, coral, ink scale, shadows) live in
`tailwind.config.js`; change the `brand` ramp to re-skin the whole panel.
