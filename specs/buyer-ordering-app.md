# ABJ Buyer Ordering Platform — spec v1
_Drafted 23 Sep 2026. For Japanese buyers — general concept inspired by Moco
Food Services' ordering app, not their design or data._

---

## Relationship to the existing CRM

**Two different systems, kept separate:**
- **Existing CRM** (crm.aussiebridgejapan.com) — Australian *brand* leads and
  pipeline (Good Drinks, the target list). Keep as-is; this spec doesn't
  touch it.
- **This app** — Japanese *buyer* side: catalog, ordering, accounts,
  inventory. A different audience, later in the relationship (after a brand
  is signed and product exists to sell).

They may eventually share a single login/dashboard for Logan's own
visibility, but the underlying data is distinct — a brand lead and a buyer
customer are not the same record.

## Build sequencing — don't build against data that doesn't exist yet

**Phase 1 (build this first):** catalog, product storytelling, the
customer/rep account model, manual inventory entry. Usable the moment the
first brand is signed — buyers can browse and reps can start building
relationships before a single container has landed.

**Phase 2 (build once there's real stock):** live inventory synced to actual
Nagoya warehouse movements, real fulfillment status, reorder automation.
Building this before there's stock to sync means maintaining plumbing with
nothing flowing through it.

---

## Core data model

| Entity | Key fields |
|---|---|
| **Brand** | name, story/description, logo, category |
| **Product** | belongs to a Brand; SKU, name, story/description, unit size, price (JPY), photo, active/inactive |
| **Customer** | Japanese buyer account — business name, type (bar / restaurant / retailer / hospitality group), delivery + billing address, contact person, language, assigned rep |
| **Rep** | ABJ/distributor sales person; has a list of Customer accounts they can act on behalf of |
| **Inventory** | per Product — quantity on hand at Nagoya (manual in v1, synced in v2), low-stock flag |
| **Order** | belongs to a Customer; placed by the Customer or by a Rep on their behalf; line items (Product + qty + price), status (placed → confirmed → packed → shipped → delivered), dates |

---

## Screens

### Customer-facing (Japanese buyer)
1. Login
2. Catalog — browse by brand or category; each product shows photo, story, price, stock status
3. Product detail — full story, specs, price, add to order
4. Cart / place order
5. Order history — past orders, status, reorder

### Rep-facing (ABJ / distributor sales)
1. Login
2. **Account switcher** — the feature you specifically wanted: pick which customer to act as, see the full assigned list
3. Place an order on behalf of a chosen customer (same catalog/cart flow)
4. Customer account view — order history, contact details, notes
5. *(later)* A dashboard of who hasn't ordered in a while — this overlaps with the "follow-up chasing" job from earlier; worth returning to once there's a real customer base to chase

### Admin (Logan / Mike / distributor)
1. Manage brands, products, descriptions
2. Manage inventory (manual entry, v1)
3. Manage rep and customer accounts
4. View all orders

---

## What v1 (lean) needs to actually ship
- Catalog + product storytelling — useful on its own, even before ordering works, as buyer-facing marketing material
- Customer + rep account structure with account-switching
- Manual inventory entry
- Basic order placement + status

**Skip for v1:** payment processing, live inventory sync, automated
reordering, anything beyond basic EN/JP.

---

## Base44 fit

Base44 is a no-code builder with its own data model and auth — this kind of
CRUD + catalog + accounts app is close to what it's built for. I can help
build the screens and data model directly in the editor with you — either
you drive it and I direct, or I drive it in the browser tool while you
watch and steer. I don't have a background/automatic way into Base44.

---

## Open questions
1. Login/workspace — reuse the old ABJ Base44 workspace, or start fresh?
2. Roughly how many Japanese buyer accounts at launch — a handful or dozens?
   Affects how much manual admin is fine for v1.
3. Priority — build this alongside the outbound work over the next month or
   two, or does it wait until a brand is actually signed?
