# Base44 starting prompt — buyer ordering app
_Paste this as your first prompt in Base44 ("Build an app"). Copy everything
in the box below as one message._

---

Build a B2B ordering web app called "Aussie Bridge Japan Buyer Portal" for
Japanese wholesale buyers (bars, restaurants, hospitality groups, retailers)
to browse and order Australian food & beverage products.

**Core data:**
- Brands: name, description/story, logo, category
- Products: belong to a Brand; name, SKU, description/story (a short
  narrative about the product, not just specs), unit size, price in JPY,
  photo, active/inactive status, and a manually-editable stock quantity with
  a low-stock indicator
- Customers: Japanese buyer accounts — business name, type (bar /
  restaurant / retailer / hospitality group), delivery address, billing
  address, contact person, phone, email, preferred language (Japanese or
  English), assigned sales rep
- Reps: sales team members; each has a list of assigned Customer accounts
- Orders: belong to a Customer; placed either by the Customer or by a Rep
  acting on their behalf; line items (product, quantity, price at order
  time); status (placed, confirmed, packed, shipped, delivered); order date,
  requested delivery date

**User roles and flows:**
1. **Buyer/Customer login** — browse the catalog by brand or category, view
   full product story, description, price and stock status on a product
   page, add to cart, submit an order, view their own order history with
   status and a reorder button.
2. **Rep login** — see all customers assigned to them and switch between
   customer accounts; while acting as a customer, place an order on their
   behalf through the same catalog/cart flow; view a customer's order
   history, contact info and notes.
3. **Admin login (me)** — manage brands and products (including
   descriptions and stock quantity), manage rep and customer accounts, view
   all orders platform-wide.

**Design:** clean, premium, trustworthy — this represents Australian brands
to Japanese business buyers, so it should feel professional, not
consumer-casual. Support English and Japanese labels where practical.

**Scope for this first version — leave these out for now:** no payment
processing (orders are placed and fulfilled outside the app), no automatic
inventory syncing (stock is entered manually by admin), no auto-translation
beyond basic EN/JP labels.

---

## After it generates
Iterate by chatting with it in plain language — "make the product page show
the story more prominently," "add a low-stock badge," etc. Don't try to get
everything right in one prompt; the FAQ itself says to build in phases,
which matches our plan anyway.

## If you want me to drive it
I can open Base44 in the browser tool and build/iterate with you watching
and steering, instead of you doing the prompting yourself. Just say so.
