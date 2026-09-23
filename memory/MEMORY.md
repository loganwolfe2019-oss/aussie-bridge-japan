# Aussie Bridge Japan — Memory Index

Read this file at the start of every session. It is the index only — one line
per fact file. Full detail lives in memory/*.md.

## Rules for this index (read these first)

- ONE FACT, ONE FILE. One line in this index per file. Never index a new fact
  against an existing file — a dedupe pass reads that as a duplicate and
  deletes one of them.
- ADDING A MEMORY = add the file, then add ONE line here. NEVER rewrite or
  regenerate this whole index.
- SIZE LIMIT: keep this index small, measured in BYTES not lines. On the
  setup this system is modelled on, the index silently stopped loading past
  about 24,000 bytes — no error, no warning, the rules at the bottom just
  quietly stopped applying while everything still looked fine. Keep this well
  under that, and move least-used lines to memory/archive-index.md as it
  grows.
- A FACT THAT MOVES CANNOT BE STORED. Landed costs, FX rates, stock levels,
  prices that change, who's currently owed what — never write these down
  here. Look them up live every time. A stored number is a number that will
  be wrong later, stated confidently.
- MEMORIES ARE FACTS, NOT ESSAYS. Three sentences each, maximum.

## Index

### The business
- [What ABJ is](business-what-abj-is.md) — brand representation for Australian brands entering/distributing in Japan; moving to vertically integrated model (Sept 2026)
- [Stage now](stage-now.md) — Sept 2026: early, testing via outbound; one meeting (Good Drinks); no brands signed, no revenue
- [Good Drinks meeting](good-drinks-meeting.md) — stalled on full-container-load first order vs distributor caution; export sign-off is owner/founder
- [Good Drinks re-approach](good-drinks-reapproach.md) — staged increasing-volume plan (small first shipment → scale on a written schedule); chosen over a multi-brand container (no other brands yet)
- [Differentiator](differentiator.md) — own committed Japan distribution network that wants Australian brands, plus Logan's background and partner connections
- [Distributor connection is confidential](distributor-family-confidential.md) — Japan distributor is family and its owner is joining ABJ (Sept 2026); family link never mentioned in brand-facing or public copy
- [Product range](product-range.md) — wide range of Australian consumer categories, not alcohol-only; alcohol is just where early examples sit
- [Pricing model](pricing-model-draft.md) — public model (Sept 2026): sales commission + warehousing & representation, brand-by-brand terms; no percentages stored
- [Cost to deliver](cost-to-deliver.md) — rough ~A$10k/brand, mostly Logan's time; cash costs not yet estimated

### The customer
- [Who signs](who-signs.md) — smaller-to-mid Australian brands; meet the sales GM, but owner/founder says yes on export
- [Buying trigger](buying-trigger.md) — no internal trigger; ABJ creates the interest; 100% outbound now
- [Where to reach brands](where-to-reach-brands.md) — LinkedIn, ABJ's own marketing, Logan's industry networking
- [Why choose ABJ](why-choose-abj.md) — distribution network that wants AU brands + speed to market + represents brand as an extension of itself

### Voice and non-negotiables
- [Voice](voice.md) — brand: professional, trustworthy, well-connected (like Moco); internal: blunt, casual, fact-tight
- [Never do](never-do.md) — no promised outcomes, no unbacked claims, no naming brands without permission, no revealing the distributor connection
- [Customer service rules](customer-service-rules.md) — follow up ASAP; Claude drafts, Logan proofreads before send; when wrong, polite, never client's fault

### The operation
- [Team and roles](team-and-roles.md) — Logan + Mike Kelly (AU relationships; owns Cork & Barrel) + Japan distributor's owner joining ABJ (Sept 2026) — brand mgmt + warehousing + distribution under one banner
- [Tools stack](tools-stack.md) — GitHub Pages site, custom Cloudflare Worker + D1 CRM at crm.aussiebridgejapan.com, Outlook email; payments/accounting/socials not set up
- [Time sinks](time-sinks.md) — chasing brands, CRM tidy-up, marketing; automate CRM tidy-up and follow-up chasing first
- [Tried, didn't work](tried-didnt-work.md) — FB/Instagram marketing (patchy consistency); Good Drinks stall

### Money and risk
- [Budget and runway](budget-runway.md) — near-zero cash; bootstrap on AI + organic; fund setup from first clients' marketing funds (flagged risk)
- [Day-job constraint](day-job-constraint.md) — Logan is a BDM at Moco Food Services; Moco must not find out; top risk; limits public visibility
- [Key risks](key-risks.md) — (1) day job finding out, (2) Mike under-contributing due to Cork & Barrel
- [Six-month goal](six-month-goal.md) — by ~March 2027: one full container load shipped to Japan + 5 brands signed

### Right now
- [Near-term focus](near-term-focus.md) — sign first brands + build a working path into Japan; stuck on back end and first client
- [Japan trip Feb 2027](japan-trip-feb-2027.md) — Logan in Japan 2 weeks, February 2027; plan backwards from it

### Founder and setup
- [Founder profile](founder-profile.md) — Logan: new to git and export mechanics; Windows, no Python/Node; strength is sales/relationships
- [Site and domain status](site-and-domain-status.md) — site on GitHub Pages; domain aussiebridgejapan.com registrar transfer IONOS→Cloudflare still pending; verify live
