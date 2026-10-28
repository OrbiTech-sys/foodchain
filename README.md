# Food Chain — online ordering POC

A responsive, POS-style ordering site for **Food Chain**, a single-branch pizza and fast-food restaurant on Rifle Range Road, New Iqbal Park, Lahore. Customers browse the menu, build a cart, and walk through a pickup or delivery checkout.

> **This is a proof of concept.** There is no database, authentication, payment gateway, POS integration or order backend. Checkout ends in a clearly labelled **demo confirmation**; nothing is sent to the restaurant.

Built with Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4 and Lucide icons. React state plus `localStorage` hold the cart.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run lint       # ESLint
npx tsc --noEmit   # type check
npm run build      # production build
```

### Environment variables

None are required. These two are optional and only exist to test the delivery radius before the real pin is in `config/branch.ts` (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BRANCH_LAT` / `NEXT_PUBLIC_BRANCH_LNG` | Branch pin override for local testing. Never commit guessed values. |
| `NEXT_PUBLIC_DELIVERY_RADIUS_KM` | Delivery radius override (default `5`). |

No map provider, payment or API keys are used.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Hero, delivery-or-pickup selector, menu sections, “Where to start”, signature pizzas, deals and family combos, facts, branch details |
| `/menu` | Sticky category chips (filter), name search, product cards, details dialog with required/optional options, loading, no-results and empty states |
| `/deals` | All 16 printed deals, split into meal deals and family/group combos |
| `/cart` | Full cart: quantities, edit customizations, remove with Undo, totals. The same cart also opens as a drawer from the header and a sticky bar on phones |
| `/checkout` | Details → Review → demo confirmation. Delivery or pickup fields, Pakistan phone validation, 5 km check |
| `/about` | Plain-fact summary of the restaurant (placeholder copy in `config/content.ts`) |
| `/contact` | Branch, hours, click-to-call numbers, WhatsApp link, directions, and the standalone “Can we deliver to you?” checker |

## Structure

```
app/                     routes only (thin server components)
components/ui/           Button, Dialog (native <dialog>), Toast, EmptyState, QuantityStepper, FoodImage, Logo…
components/layout/       SiteHeader (dismissible delivery notice above a sticky bar), MobileNavigation, SiteFooter, WhatsAppButton…
features/
  cart/                  store (localStorage), useCart, CartDrawer, CartItemRow, CartSummary, StickyCartBar
  catalogue/             context that hands the catalogue to client-side pricing
  checkout/              CheckoutExperience, TextField, CheckoutSummary
  deals/                 DealCard, DealsGrid
  home/                  Hero, OrderTypePanel, CategoryTiles, WhySection
  item/                  one shared product/deal details dialog (add and edit)
  menu/                  MenuExplorer, CategoryNavigation, ProductCard, ProductGrid
  order/                 order-type + location store, OrderTypeSelector, DeliveryEligibilityChecker
  branch/                BranchInformation, BusinessHours
config/                  site.ts (business details + switches), branch.ts (pin + radius), navigation.ts, content.ts
data/
  mock/                  categories.ts, products.ts, deals.ts  ← sample data lives here only
  repository.ts          the only module the UI reads data through
lib/                     types.ts, pricing.ts, geo.ts, format.ts, validation.ts, persisted-store.ts
tokens.css               every colour, font, easing and spacing token
```

Components never import `data/mock/*`. They read through `data/repository.ts`, so mock data can be replaced without touching the UI.

## Mock data — and how to replace it

Everything in `data/mock/` is **sample data transcribed from the printed “New Menu 2026”**: category names, prices, deal contents, pizza ingredient lists, sizes, extra-topping and drink prices.

Things that are interpretations, not facts, are marked `ASSUMPTION` in `data/mock/products.ts`:

- The print lists three single-pizza price rows (Chicken / Special Chicken / Non-Chicken) but not which flavour belongs to which row. The assignment in the file is a guess.
- The eleven sandwiches share one price, so they are one product with a required flavour choice.
- Shawarma styles are one product with a required filling choice and price differences.
- The complimentary drink header is assumed to apply to the Margherita/Veggie two-pizza row too.

**Photos**
- `public/images/hd/*` are **HD placeholder photographs** (Pexels, free for commercial use, no attribution required) chosen to match each item’s name: burgers, sandwich, shawarma, platter, paratha, extras. **They are not Food Chain’s own food.**
- The 16 deal images and the two combo shots (`deal-XX.webp`, `chicken-burger-coke.webp`, `zinger-burger-pizza.webp`) are **collages with one tile per item in the deal**, with quantities and bottle sizes printed on the tiles (for example “×4 with fries”, “1.5 L”). The Coke tile is a glass bottle; the menu’s bottles are plastic. Replace these with real combo photography when available.
- `public/images/sample/pizza-*.jpg` are placeholder stock photos (Unsplash) for pizza flavours.
- `public/images/menu/*` are the original crops of the printed menu you supplied. Only the hero cut-out and the Pizza category tile still use them; the rest are kept as authentic reference and are no longer shown.
- Each product records its image `source` (`menu-scan` or `sample`) so owner-approved photography can replace samples one by one.

Pexels photo IDs used: 15029502, 1431305, 15076692, 13658573, 38836537, 2983101, 6416559, 28897047, 18177335, 19786227, 7593445, 4109273, 4397815, 12737919, 5446516, 11860560, 6183640, 6004145, 3622479 (`https://www.pexels.com/photo/<id>/`).
- The logo mark is hand-built SVG (`components/ui/logo.tsx`); swap in the official logo file.

**Moving to PostgreSQL + Drizzle later:** re-implement the functions in `data/repository.ts` (same names and return types) against the database, and price the cart on the server. Drizzle is intentionally not installed.

## Business rules and switches (`config/`)

| Setting | Where | Current value |
| --- | --- | --- |
| Delivery radius | `config/branch.ts` | 5 km, straight line |
| Branch latitude/longitude | `config/branch.ts` | **`null` — TODO(owner)**, not guessed |
| Verified Google Maps URL | `config/branch.ts` | `null`; directions fall back to a search for the printed address |
| Delivery fee | `config/site.ts` | `0` (“Takeaway & free delivery” on the print). `null` hides the line |
| Discount | `config/site.ts` | `null` (none exist) |
| Cash on delivery | `config/site.ts` | `false` (not on the print). Checkout is labelled a preview |
| Hours | `config/site.ts` | 12:00 pm – 5:00 am as printed; `verified: false` shows “to be confirmed” |
| Phone numbers | `config/site.ts` | the six numbers on the print |
| WhatsApp button | `config/site.ts` | shows only when `whatsappNumber` is a valid Pakistan mobile; set `null` to remove |

Not invented anywhere: ratings, reviews, testimonials, countdowns, discounts, original prices, savings, validity dates, “best seller” labels, founding story.

### 5 km delivery eligibility

`lib/geo.ts` (`checkDeliveryEligibility`) returns one of three results, and the UI handles each:

- **eligible** — distance ≤ radius (Haversine, R = 6371.0088 km).
- **ineligible** — beyond the radius. Delivery checkout is disabled and pickup is recommended with a one-click switch.
- **unknown** — no customer location, or the branch pin is not configured. Delivery is **not** assumed eligible; the customer must tick a manual-confirmation box saying the restaurant will check the address.

The customer supplies a location by **sharing their device location** or **pasting a pin** (`31.5204, 74.3587`, or a full Google Maps URL). Nothing is geocoded, and no address is described as “verified”. The radius is described everywhere as a straight-line distance, not road distance. A map picker is not included because no map provider is configured; `DeliveryEligibilityChecker` is the place to add one.

## Design

Hallmark design system: custom tuned theme, *late-night charcoal, tomato, flame gold*. Warm cream paper with charcoal bands, tomato for actions, gold in small doses. Bricolage Grotesque for display, Geist for text. Catalogue structure with a photographic hero and a sticky header under a dismissible delivery notice. All design tokens are in `tokens.css`; contrast was checked against WCAG AA.

Accessibility: skip link, native `<dialog>` for every dialog/drawer (focus trap and restore, Escape), radios/checkboxes are native, validation messages are tied to fields with `aria-describedby`, silent successes are announced through a live region, focus rings are always visible, motion respects `prefers-reduced-motion`, no horizontal scroll from 320 px up.

## Known limitations

Needs a backend before this can take real orders:

- **Order submission, notifications and a kitchen/POS feed** — checkout only shows a demo confirmation.
- **Server-side pricing and validation** — prices are recomputed in the browser from the catalogue.
- **Payments** — none; no card details are collected.
- **Real address verification** — geocoding and an actual road-distance or zone check, plus a map picker.
- **Menu management** — an admin or database for products, availability, deals and hours.
- **Accounts, order history, rider tracking.**

Other notes: the cart lives in this browser’s `localStorage`, photos from the menu scan are low resolution, and `config/content.ts` holds placeholder About copy awaiting owner-approved text.

## TODO(owner)

1. Verify the branch pin and set it in `config/branch.ts`; add the verified Google Maps link.
2. Confirm the pizza price-row assignments, hours (and days), delivery fee and payment options.
3. Provide photography and the official logo.
4. Provide approved About copy.
