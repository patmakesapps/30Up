# 30Up Commerce — Build Status & Go-Live Checklist

DTC storefront + fulfillment admin built into the existing Vue + Firebase app.
This doc is the single reference for what exists, how it's wired, and what must
happen before taking real money.

Project: `up-3fcd5` · Region: `us-central1` · Payments: Stripe Embedded Checkout

---

## Architecture invariants (do not break these)

1. **The Stripe webhook is the source of truth for orders.** Orders are created
   only in `functions/src/webhook.ts`, never from the browser or the success
   redirect. `firestore.rules` forbids all client writes to `orders`.
2. **Prices are looked up server-side** from Firestore when creating a Checkout
   Session (`createCheckoutSession`). The client never sends prices.
3. **Money is integer cents everywhere** (field names end in `Cents`).
4. **Admin is a custom claim, not an email.** Every Cloud Function write and
   every Firestore/Storage rule checks `request.auth.token.admin == true`.
   Hiding UI is not access control. Admin accounts are granted the claim with
   the local `setAdmin.mjs` utility.

---

## Stack / where things live

- **Frontend:** Vue 3 (`<script setup>`), Vite, Tailwind. Views in `src/views`,
  admin views in `src/views/admin`, shared state as module-singleton composables
  (`src/composables`), typed callable wrappers in `src/services`.
- **Backend:** Cloud Functions (TypeScript) in `functions/src`, Firestore,
  Firebase Auth, Cloud Storage.
- **Data model types:** `src/types/models.ts` (single source of truth).

### Firestore collections

- `products/{id}` — `name, description, priceCents, sku, inventoryCount,
  active, images[], subscriptionEnabled, stripePriceId, createdAt, updatedAt`
- `orders/{id}` — doc id **is the Stripe session id** (idempotency key).
  `stripeSessionId, stripePaymentIntentId, customerEmail, customerName,
  shippingAddress{...}, amountTotalCents, currency, status, trackingNumber,
  notes[], items[](snapshot), createdAt, updatedAt`.
  Status: `paid → processing → shipped → delivered`, plus `cancelled`, `refunded`.
- `adminLogs/{id}` — append-only audit trail: `adminUid, action, targetId,
  detail, at`.

### Deployed Cloud Functions (all `us-central1`)

| Function | Type | Secrets | Purpose |
|---|---|---|---|
| `createProduct` / `updateProduct` / `setProductActive` | callable | — | Admin product writes; re-check admin + write `adminLogs`. |
| `createCheckoutSession` | callable | `STRIPE_SECRET_KEY` | Server-authoritative pricing, stock check, creates Embedded Checkout session. No order write. |
| `sessionStatus` | callable | `STRIPE_SECRET_KEY` | Read-only status for the return page. |
| `stripeWebhook` | onRequest | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | **Source of truth for orders.** Not yet deployed (see below). |

---

## What's built

### Phase 1 — Data model + security rules ✅ deployed
Firestore rules (products public-read-active-only + admin write; orders
admin-read + no client write; adminLogs admin-read + no client write), shared TS
models, composite indexes.

### Phase 2 — Admin auth + shell ✅ live
`isAdmin` claim in `useAuth` (resolved before `authReady`), `/admin` route guard,
`AdminLayout` with Products/Orders nav. `setAdmin.mjs` grants the claim.

### Phase 3 — Product management ✅ deployed
`createProduct` / `updateProduct` / `setProductActive` callables (admin re-check +
`adminLogs`). Admin Products screen: real-time list, create/edit, activate/deactivate.
**Photo upload:** drag-drop/picker → Cloud Storage (`storage.rules`: public read,
admin-claim-only writes, 5 MB + image-type cap), thumbnails, remove, set-primary.

### Phase 4 — Storefront + embedded checkout ✅ deployed
`createCheckoutSession` (authoritative pricing, stock checks, stamps `productId`
into line-item metadata) + `sessionStatus`. Split-screen checkout mounting Stripe
Embedded Checkout (plain-JS mount). `/shop` with qty steppers, editable cart with
empty state, `/checkout/return` confirmation. `automatic_tax` behind
`AUTOMATIC_TAX_ENABLED` flag.

### Phase 5 — Webhook + order creation + inventory ✅ built · ⏳ not deployed
`stripeWebhook` (onRequest): verifies signature against `req.rawBody`; on
`checkout.session.completed` creates the authoritative order (`status: 'paid'`)
and decrements inventory **atomically + idempotently** (order doc id = session id,
transaction no-ops if it already exists); `charge.refunded` → `status: 'refunded'`.
**Test locally with the Stripe CLI before deploying** (see below).

---

## Secrets & config (where each value lives — never commit values)

| Value | Local | Production | Notes |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `functions/.secret.local` | Secret Manager | Server only. |
| `STRIPE_WEBHOOK_SECRET` | `functions/.secret.local` | Secret Manager | **Local = Stripe CLI's whsec; Prod = dashboard endpoint's whsec. They differ.** Prod currently holds a placeholder — replace at go-live. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | root `.env` | build env | Safe client-side. |
| `AUTOMATIC_TAX_ENABLED` | `functions/.env` (committed) | `functions/.env` | Non-secret flag. Currently `false`. |
| Firebase web config | root `.env` | build env | Not secret. |

Gitignored (never committed): `functions/.secret.local`, root `.env`,
`setAdmin.mjs`, `setAdmin.key.json`, `stripe_secrets.txt` (deleted).

---

## Local end-to-end webhook testing

```bash
# Terminal A — functions emulator (loads functions/.secret.local)
firebase emulators:start --only functions

# Terminal B — forward Stripe events to the local webhook
stripe listen --forward-to http://localhost:5001/up-3fcd5/us-central1/stripeWebhook
# copy the printed whsec_... into functions/.secret.local as STRIPE_WEBHOOK_SECRET,
# then restart Terminal A.

# Trigger: real flow via `npm run dev` + 4242 card, OR:
stripe trigger checkout.session.completed
```
Verify: `orders` doc appears with id = session id, `status: 'paid'`, inventory
decremented; redelivering the event is an idempotent no-op.

> Note: with only the functions emulator running, the Admin SDK writes to
> **production** Firestore. Add `,firestore` to isolate.

---

## GO-LIVE CHECKLIST (do NOT do these now)

### Payments / webhook
- [ ] Deploy the webhook: `firebase deploy --only functions:stripeWebhook`.
- [ ] Stripe Dashboard → Developers → Webhooks → **Add endpoint** →
      `https://us-central1-up-3fcd5.cloudfunctions.net/stripeWebhook` → select
      `checkout.session.completed` + `charge.refunded`.
- [ ] Put that endpoint's signing secret into Secret Manager (overwrites the
      placeholder): `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`, then
      redeploy `stripeWebhook` to bind the new version.
- [ ] Switch Stripe keys from **test** to **live**: set live `STRIPE_SECRET_KEY`
      in Secret Manager and live `VITE_STRIPE_PUBLISHABLE_KEY` in the build env;
      redeploy functions + rebuild frontend.
- [ ] Register the **live** webhook endpoint separately (live-mode secret differs
      from test-mode).

### Tax
- [ ] Decide on Stripe Tax. If collecting: enable Stripe Tax, set origin/business
      address, preset product tax code, and add real registrations; then flip
      `AUTOMATIC_TAX_ENABLED=true` in `functions/.env` and redeploy. (Requires a
      real business entity + tax registration.)

### Access / admin
- [ ] Grant the admin claim to the real accounts on the live project:
      `node setAdmin.mjs patmakesapps@gmail.com tabtroutman24@gmail.com`.
- [ ] Confirm a non-admin cannot reach `/admin` or call admin callables.

### Hosting / build
- [ ] `npm run build` + `firebase deploy --only hosting` (and `firestore:rules`,
      `storage`, `functions`).
- [ ] Verify `VITE_STRIPE_PUBLISHABLE_KEY` is present in the production build env.

### Housekeeping
- [ ] Upgrade functions runtime Node 20 → 22 (Node 20 decommission 2026-10-30).
- [ ] Set Artifact Registry cleanup policy: `firebase functions:artifacts:setpolicy`.
- [ ] Real product data entered via `/admin` (no seed scripts).

---

## Remaining phases (post-Phase 5)

- **Phase 6 — Orders table + detail + operations:** real-time orders table
  (sort/filter), detail drawer, callables `updateOrderStatus` / `addOrderNote` /
  `setTracking` (admin re-check + `adminLogs`). `AdminOrdersView` is a placeholder.
- **Phase 7 — Transactional emails:** order confirmation + shipped emails
  (Resend or SendGrid), minimal templates.
- **Phase 8 — Refunds:** `refundOrder` callable (Stripe refund API); let the
  `charge.refunded` webhook flip the status (single source of truth).
