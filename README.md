# System Maker Core India — Custom 2D PC Configurator & Compatibility Engine

A modern, responsive, 2D PC building web application tailored specifically for Indian PC builders, gamers, students, and professionals. Inspired by the general concept of BuildCores, **System Maker Core India** is an original implementation designed with dark charcoal aesthetics, restrained magenta accents, integer Indian Rupee (INR) arithmetic, an uncompromising deterministic hardware compatibility engine, and production-ready server-side retailer price integration.

---

## 🌟 Key Highlights & Features

1. **Interactive 2D PC Configurator (`/builder`)**
   - 11 hardware component categories: CPU, Motherboard, RAM, GPU, Storage, PSU, Cabinet, CPU Cooler, Monitor, Keyboard, and Mouse.
   - Distinct classification between essential core components and optional peripherals.
   - Component picker drawer with live search, brand filters, price sorting, and instant conflict warnings.
   - Selected component cards featuring key specification badges, Indian retailer reference links, and remove/replace actions.
   - Real-time status badge with an expandable diagnostic drawer categorizing critical errors, advisories, and confirmed hardware matches.

2. **Deterministic Hardware Compatibility Engine (`src/engine/compatibility.ts`)**
   - Pure, fully unit-tested validation function.
   - **Socket Architecture:** Checks CPU socket vs Motherboard socket (e.g. AMD AM4, AM5, Intel LGA1700).
   - **Memory Generation:** Enforces DDR4 vs DDR5 RAM matching, module count vs available DIMM slots, and maximum memory capacities.
   - **Display Output:** Checks whether a dedicated GPU is required when the chosen CPU lacks integrated graphics.
   - **Cooling Clearance & Sockets:** Checks CPU cooler height against cabinet clearances and cooler bracket socket support.
   - **Form Factor Compliance:** Ensures ATX, Micro-ATX, and Mini-ITX motherboards fit into the selected chassis.
   - **Power Delivery & Headroom:** Computes base, CPU, and GPU power draw with a 30% safety headroom for transient load spikes.
   - **Truth-in-Data:** Unverified or missing specs explicitly trigger an "Unknown" state rather than a false positive pass.

3. **Production-Ready Server-Side Retailer Price Integration (`src/lib/retailers/`)**
   - **Amazon India Creators / PA-API 5.0 Adapter:** Fully compliant server-side integration utilizing pure Node.js AWS Signature Version 4 (HMAC-SHA256) request signing, 1 request/second throttling, and in-memory TTL caching.
   - **Flipkart Affiliate API Adapter:** Server-side token authentication (`Fk-Affiliate-Id`, `Fk-Affiliate-Token`) querying official affiliate search feeds.
   - **Zero Secret Exposure:** Credentials reside exclusively in server-side environment variables and are never bundled into client JavaScript.
   - **Anti-False-Equivalency Matching Engine (`src/lib/retailers/matcher.ts`):** Evaluates exact ASIN / Flipkart IDs, Manufacturer Part Numbers (MPN), and negative token guards (e.g. rejects "Ti" vs non-Ti, DDR4 vs DDR5, laptop/accessory titles). Compares prices only between verified equivalent hardware products.
   - **Graceful Unconfigured Fallback:** When API credentials are not supplied, the app clearly communicates "Not Configured", retaining local catalog pricing and authenticated direct search links without breaking any configurator workflow.
   - **Seamless Offer Integration:** Builders can inspect live multi-retailer offers and select an offer to update component pricing in the build while keeping compatibility, power estimation, and budget arithmetic completely intact.

4. **Transparent Gaming FPS Benchmark Telemetry (`/builder`)**
   - Strict adherence to verifiable benchmark test results (e.g. Hardware Unboxed, Gamers Nexus, TechPowerUp) with exact CPU + GPU pairs, games, resolutions (1080p, 1440p, 4K), and quality presets.
   - When no verified test record exists for a configuration, strictly displays:  
     `"FPS estimate unavailable — verified benchmark data is not available for this configuration."`
   - Zero synthetic or fabricated framerate claims.

5. **Transparent Indian Rupee (INR) Price Engine (`src/engine/pricing.ts`)**
   - Live core subtotal, peripheral subtotal, and grand total formatted with Indian numbering conventions (`₹35,499`, `₹1,25,000`).
   - Budget headroom indicator displaying remaining balance or budget overrun.
   - Option to include/exclude monitor and peripherals in the target budget.
   - Toggleable 18% GST estimate and flat shipping allowance.

6. **Guided Budget & Use-Case Recommendations (`/` & `src/engine/recommendations.ts`)**
   - 6 budget presets: Under ₹20,000, ₹20,000–₹35,000, ₹35,000–₹50,000, ₹50,000–₹75,000, ₹75,000–₹1,00,000, and Above ₹1,00,000.
   - 5 use-case profiles: Study & Office, Programming, Graphic Design & Video, Gaming, and Workstation.
   - Transparent rationale, trade-offs, and highlights with a one-click "Customize in Builder" action.

7. **Searchable Component Catalog (`/components`)**
   - 50+ realistic components with verified specifications, manufacturer part numbers, warranty details, and multi-retailer price checks.
   - Category filtering, brand filtering, price sorting, and detailed specification modals with live retailer offers.
   - Direct "Add to Build" and "Compare" actions.

8. **Side-by-Side Component Comparison (`/compare`)**
   - Select 2 or 3 components within any category.
   - Detailed specification matrix highlighting differences, INR price deltas, and honest trade-offs.

9. **Save, Load, Export & URL-Encoded Sharing (`/saved-builds`)**
   - LocalStorage persistence: active configuration automatically survives page reloads.
   - Save configurations with custom names, rename, duplicate, and delete.
   - Export builds as formatted JSON files and import JSON configurations with schema validation.
   - Share configurations via URL parameters with validation against the local catalog.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 3.4 (Charcoal palette & restrained magenta accents)
- **Icons:** Lucide React
- **Persistence:** LocalStorage with clean Repository abstraction layer
- **Testing Framework:** Vitest 2.1 (45 automated unit, integration & mocked API tests)
- **Cryptography:** Standard Node.js `crypto` for AWS SigV4 authentication

---

## 📁 Project Structure

```
System_core_India/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Header, Footer, and dark theme
│   │   ├── globals.css             # Tailwind base and custom scrollbar styling
│   │   ├── page.tsx                # Home page with hero, budget selector, & featured builds
│   │   ├── builder/
│   │   │   └── page.tsx            # Main interactive 2D PC configurator with retailer selection
│   │   ├── components/
│   │   │   └── page.tsx            # Searchable component catalog with live offer inspector
│   │   ├── compare/
│   │   │   └── page.tsx            # Side-by-side component comparison
│   │   ├── saved-builds/
│   │   │   └── page.tsx            # Saved configurations, JSON import/export
│   │   ├── about/
│   │   │   └── page.tsx            # Data methodology, transparency, and compatibility rules
│   │   └── api/
│   │       └── retailers/
│   │           ├── pricing/
│   │           │   └── route.ts    # GET /api/retailers/pricing?componentId={id}
│   │           ├── status/
│   │           │   └── route.ts    # GET /api/retailers/status
│   │           └── search/
│   │               └── route.ts    # GET /api/retailers/search?query={q}
│   ├── components/
│   │   ├── common/
│   │   │   ├── ComponentIcon.tsx   # SVG icons for all 11 component categories
│   │   │   └── InrPrice.tsx        # Indian Rupee formatting component
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Brand header with saved builds badge & mobile menu
│   │   │   └── Footer.tsx          # Retailer directory and transparency notice
│   │   ├── ui/
│   │   │   ├── Badge.tsx           # Status, severity, and tag badges
│   │   │   ├── Button.tsx          # Primary magenta, secondary, and outline buttons
│   │   │   ├── Card.tsx            # Charcoal surface containers
│   │   │   └── Modal.tsx           # Accessible modal dialog
│   │   └── builder/
│   │       ├── CategorySlot.tsx    # Individual category slot with offer drawer toggle
│   │       ├── ComponentPickerModal.tsx # Filterable selector with live retailer comparisons
│   │       ├── RetailerPriceComparison.tsx # Multi-retailer offer cards, stock badges, & "Use Price"
│   │       ├── CompatibilityBanner.tsx  # Dynamic compatibility status banner
│   │       ├── PowerEstimator.tsx       # Power draw meter & transient spike notice
│   │       ├── PriceSummary.tsx         # Sticky pricing, budget, and tax controls
│   │       ├── ShareModal.tsx           # URL share generator & copy button
│   │       └── FpsEstimator.tsx         # Verified benchmark display & fallback notice
│   ├── data/
│   │   ├── catalog.ts              # 50+ components with verified MPNs, ASINs, & Flipkart IDs
│   │   ├── benchmarks.ts           # Curated lab benchmark records with sources
│   │   └── retailerAdapters.ts     # Indian retailer metadata & direct search URL generators
│   ├── engine/
│   │   ├── compatibility.ts        # Pure function hardware compatibility engine
│   │   ├── pricing.ts              # INR arithmetic, GST calculation, & budget delta
│   │   ├── recommendations.ts      # Budget-based recommendation rule engine
│   │   └── shareCodec.ts           # URL config encoder/decoder with validation
│   ├── lib/
│   │   └── retailers/
│   │       ├── types.ts            # Normalized offer schema, match criteria & interfaces
│   │       ├── sigv4.ts            # Pure Node.js AWS Signature Version 4 implementation
│   │       ├── matcher.ts          # Anti-false-equivalency matcher (MPN, ASIN, token guards)
│   │       ├── amazonAdapter.ts    # Server-side Amazon PA-API 5.0 adapter with throttling & cache
│   │       ├── flipkartAdapter.ts  # Server-side Flipkart Affiliate adapter with TTL cache
│   │       └── retailerService.ts  # Aggregator coordinating live adapters & local fallbacks
│   ├── storage/
│   │   ├── localStorage.ts         # Client persistence & build hydration
│   │   └── repository.ts           # Clean data-access layer abstraction
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces for components, builds, & retailer offers
│   └── tests/
│       ├── compatibility.test.ts   # 10 tests for socket, RAM, PSU, & clearance rules
│       ├── pricing.test.ts         # 4 tests for INR formatting & tax arithmetic
│       ├── recommendations.test.ts # 4 tests for presets and budget ceilings
│       ├── shareCodec.test.ts      # 3 tests for share encoder & JSON validator
│       ├── userJourneys.test.ts    # 6 end-to-end integration tests
│       └── retailerAdapters.test.ts # 18 tests for SigV4, model matching, API errors, & caching
├── .env.local.example              # Documented template for retailer environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.mjs
└── vitest.config.ts
```

---

## 🔑 Retailer API Configuration & Setup

### Environment Variables

System Maker Core India uses server-side environment variables to connect to official retailer affiliate APIs. Credentials are **never** shared with the client browser or bundled in frontend assets.

Create a `.env.local` file in the root directory (based on `.env.local.example`):

```bash
# ------------------------------------------------------------------------------
# 1. Amazon Associates / Creators API (Product Advertising API 5.0 - India)
# ------------------------------------------------------------------------------
# Register at: https://affiliate-program.amazon.in/assoc_credentials/home
# Host: webservices.amazon.in | Region: eu-west-1
AMAZON_ACCESS_KEY=your_amazon_paapi_access_key_here
AMAZON_SECRET_KEY=your_amazon_paapi_secret_key_here
AMAZON_ASSOCIATE_TAG=your_store_tag-21

# ------------------------------------------------------------------------------
# 2. Flipkart Affiliate API
# ------------------------------------------------------------------------------
# Register at: https://affiliate.flipkart.com/api-docs
FLIPKART_AFFILIATE_ID=your_flipkart_affiliate_id_here
FLIPKART_AFFILIATE_TOKEN=your_flipkart_affiliate_token_here
```

### Unconfigured Fallback Behavior

If any or all credentials are not provided:
- The server endpoints report `"connectionStatus": "not_configured"`.
- The UI displays an honest advisory: *"Live API not configured — showing verified catalog reference price"*.
- Retailer buttons provide direct affiliate-tagged search links to Amazon, Flipkart, MDComputers, Vedant Computers, and PrimeABGB.
- The app **never** fabricates prices, never scrapes unofficial web pages, and never claims an API is connected without authenticated confirmation.

### Caching Policy & Affiliate Compliance

- **Amazon PA-API Compliance:** Amazon's Product Advertising API Operating Agreement permits caching pricing data for up to 24 hours. The application enforces an in-memory TTL of 1 hour (3600s) with explicit `cachedUntil` timestamps.
- **Request Throttling:** Amazon PA-API limits default requests to 1 request per second (1 TPS). The adapter enforces an internal request queue with a 1,100ms minimum inter-request interval.
- **Affiliate Disclosures:** The application includes the required Amazon Affiliate disclosure:
  > *"As an Amazon Associate, System Maker Core India earns from qualifying purchases. Product prices and availability are accurate as of the date/time indicated and are subject to change."*
- **Equivalent Hardware Matching:** Comparison between retailer offers is strictly permitted only when components share verified model numbers (MPN) or verified platform codes (ASIN/Flipkart ID). Variations like Ti / Non-Ti, DDR4 / DDR5, or laptop brackets are blocked by token filters.

---

## 🚀 Running the Project Locally

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (v24 tested)
- **npm:** v9.0.0 or higher

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build and Run Production Server
```bash
npm run build
npm run start
```

---

## 🧪 Running Tests & Quality Verification

Run the full automated test suite:
```bash
npm run test
```

Run TypeScript strict type checking:
```bash
npm run typecheck
```

### Actual Test Results (45/45 Passed)
```
 ✓ src/tests/compatibility.test.ts (10 tests)
 ✓ src/tests/userJourneys.test.ts (6 tests)
 ✓ src/tests/retailerAdapters.test.ts (18 tests)
 ✓ src/tests/shareCodec.test.ts (3 tests)
 ✓ src/tests/pricing.test.ts (4 tests)
 ✓ src/tests/recommendations.test.ts (4 tests)

 Test Files  6 passed (6)
      Tests  45 passed (45)
```

The 18 tests in `src/tests/retailerAdapters.test.ts` verify:
1. **AWS SigV4 Signing:** Correct HMAC-SHA256 signature, headers (`host`, `x-amz-date`, `x-amz-target`), and date formatting.
2. **Deterministic Matching:** Exact ASIN matches, exact Manufacturer Part Number (MPN) matches, and normalized title matching.
3. **Anti-False-Equivalency Rejection:**
   - Rejects "RTX 4060 Ti" when searching for "RTX 4060".
   - Rejects "DDR5" memory when searching for "DDR4".
   - Rejects brackets, cables, cooling pads, and accessories matching keyword fragments.
   - Rejects offers violating the price sanity threshold (0.3x - 2.5x base price).
4. **Mocked Amazon API Responses:**
   - Unconfigured status reporting.
   - Successful `GetItems` response parsing with live price and stock status.
   - Out-of-stock items flagged with `inStock: false`.
   - Missing price data gracefully handled.
   - HTTP 401/403 authentication failures caught and mapped to user-safe error messages.
   - HTTP 429 rate limit errors handled gracefully.
   - In-memory cache hit verification preventing redundant network requests.
5. **Mocked Flipkart API Responses:**
   - Unconfigured status reporting.
   - Successful affiliate search feed response parsing.
   - HTTP 401 Unauthorized handling.
6. **Retailer Aggregator Service:**
   - Multi-retailer concurrent offer collection.
   - Verification that live pricing updates preserve builder compatibility and budget arithmetic.

---

## 📋 Manual Verification Checklist

Use this checklist to manually verify the retailer price integration across different operating conditions:

### A. Without Live Retailer Credentials (Default Out-of-the-Box Mode)
- [ ] Visit `http://localhost:3000/api/retailers/status` in the browser or via `curl`.
  - Expect: JSON returning `isConfigured: false`, `connectionStatus: "not_configured"`, and `missingEnvVars` array.
- [ ] Open the Builder (`/builder`) and click **"Select"** on any category (e.g. CPU or GPU).
  - Expect: The component card displays the catalog price and an expandable **"Compare Retailer Offers"** toggle.
- [ ] Expand **"Compare Retailer Offers"**.
  - Expect: An honest notice is displayed: *"Live API not configured — showing verified catalog reference price"*. Direct retailer search buttons for Amazon, Flipkart, MDComputers, Vedant Computers, and PrimeABGB open clean, affiliate-ready searches in a new tab.
- [ ] Select a component into the build.
  - Expect: Compatibility checks calculate instantly, the power estimator updates, and the price summary reflects the catalog price with no errors.
- [ ] Open the Component Catalog (`/components`) and click any component to open the specification modal.
  - Expect: The **"Retailer Availability & Offers"** section displays the reference pricing with honest status badges.

### B. With Active Retailer Credentials (`.env.local` Populated)
- [ ] Populate `.env.local` with valid `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, and `AMAZON_ASSOCIATE_TAG`.
- [ ] Restart the server (`npm run dev` or `npm run start`).
- [ ] Visit `http://localhost:3000/api/retailers/status`.
  - Expect: `amazon_in` reports `"connectionStatus": "connected"` and `"isConfigured": true`.
- [ ] In `/builder`, open the CPU picker for **AMD Ryzen 5 5600** (ASIN `B09VCHR1VH`, MPN `100-100000926BOX`).
  - Expect: The card shows a pulsing loading skeleton, followed by the live Amazon India offer with exact INR pricing, stock availability, and a *"Live (PA-API 5.0)"* badge.
- [ ] Click **"Use Price"** on the Amazon offer.
  - Expect: The component slot adopts the Amazon offer price, the live total price immediately recalculates, and compatibility checks remain intact.
- [ ] Check the rate-limit behavior by opening multiple components in quick succession.
  - Expect: The 1.1s throttle prevents 429 errors from Amazon's servers.
- [ ] Reload the page or re-select the same component within 1 hour.
  - Expect: The response is served instantly from the in-memory cache without incurring additional API calls.
- [ ] Trigger an intentional failure (e.g. set an invalid `AMAZON_SECRET_KEY`).
  - Expect: The server logs a sanitized authentication error, and the UI displays a clean advisory with fallback to direct search links without crashing.

---

## ⚖️ Known Limitations & Next Steps

1. **Approved Retailer Feeds:** Amazon India requires an approved Associates account with Product Advertising API access (requires 3 qualified sales within 180 days). Flipkart Affiliate program periodically limits new API token registrations.
2. **Specialized Indian Retailers:** Indian hardware specialty stores (MDComputers, Vedant Computers, PrimeABGB, EliteHubs) do not currently provide public authenticated REST APIs. The application routes users via structured search links with brand and model query parameters.
3. **Database Integration:** The repository pattern (`IComponentRepository`, `IBuildRepository`) in `src/storage/repository.ts` allows swapping LocalStorage with PostgreSQL, Prisma, or Supabase for multi-device sync and persistent user profiles.

# sysmaker
