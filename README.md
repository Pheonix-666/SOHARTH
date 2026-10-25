# SOHARTH — Celestial Luxury Streetwear

> **Engineered 240+ GSM Bio-Washed Combed Cotton Oversized T-Shirts & Cultural Graphic Streetwear.**

SOHARTH is a direct-to-consumer (D2C) luxury streetwear e-commerce platform built with Next.js 16 (App Router), React 19, Supabase, and Cloudinary. Designed around a celestial minimalist dark-mode aesthetic with zero-latency catalog browsing, dynamic filters, live size chart recommendations, and an admin inventory management command center.

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) & [React 19](https://react.dev/) |
| **Styling** | Custom Celestial Design Token System + [Tailwind CSS](https://tailwindcss.com/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Storage) |
| **Media & CDN** | [Cloudinary](https://cloudinary.com/) (Product & review photo uploads) |
| **Analytics** | [@vercel/analytics](https://vercel.com/analytics) |
| **Typography** | Manrope, Libre Caslon Text, Orbitron, Google Material Symbols |

---

## ✨ Features

- **Instant 0ms Catalog Rendering**: Pre-seeded initial data paired with background Supabase synchronization eliminates blank skeleton waiting screens.
- **Dynamic Search & Filtering**: Modal search with real-time keyword indexing and category/fit/style/price pills on `/products`.
- **Interactive Size Chart Modal**: Dual measurement system (Inches & CM), fit recommendations, and garment silhouette guide.
- **Customer Reviews with Photos**: Verified client feedback with star ratings and Cloudinary image upload.
- **Integrated Shopping Bag**: Local & authenticated cart synchronization, discount code engine (`SOHARTH10`), and multi-step checkout.
- **Comprehensive Policy Pages**: Complete e-commerce compliance pages:
  - `/shipping-policy` — Domestic transit times, tracking links, and COD dispatch terms.
  - `/returns-exchange` — 7-day hassle-free doorstep exchange policy.
  - `/contact` — Direct WhatsApp concierge & email desk.
  - `/terms` & `/privacy-policy` — E-commerce legal protections.
- **Admin Command Center (`/admin`)**:
  - Catalog management: add, edit, delete products, color variants, and MRP.
  - Order fulfillment tracking and status updating.
  - Review moderation desk.
- **Performance Optimized**:
  - AVIF and WebP next-gen image compression.
  - Edge caching headers (`stale-while-revalidate`) on API endpoints.
  - DNS preconnections for Google Fonts, Supabase, and Cloudinary.

---

## 🛠️ Step-by-Step Setup Guide

Follow these instructions to set up, configure, and run SOHARTH locally from scratch.

### 1. Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `npm` (v10+), `pnpm`, or `yarn`
- **Git**: Installed and configured
- **Supabase Account**: Free account on [supabase.com](https://supabase.com)
- **Cloudinary Account**: Free account on [cloudinary.com](https://cloudinary.com)

---

### 2. Clone the Repository

Open your terminal and clone the repository:

```bash
git clone https://github.com/Pheonix-666/SOHARTH.git
cd SOHARTH
```

---

### 3. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

---

### 4. Supabase Database Setup

SOHARTH uses Supabase as its primary PostgreSQL database.

1. **Create a Supabase Project**:
   - Log in to [Supabase](https://supabase.com/dashboard) and click **"New Project"**.
   - Choose an organization, enter a project name (e.g., `soharth-store`), set a database password, and choose your preferred region.

2. **Execute Database Schema**:
   - In your Supabase project dashboard, navigate to the **SQL Editor** (left sidebar icon `>_`).
   - Click **"New query"**.
   - Open [`supabase-schema.sql`](./supabase-schema.sql) in this repository, copy its entire contents, paste it into the SQL editor, and click **Run**.
   - This creates the 5 core tables:
     - `products` (Catalog items, MRP, color variants, images)
     - `categories` (Dynamic category register)
     - `orders` (Customer orders, payment & dispatch statuses)
     - `reviews` (Client feedback and ratings)
     - `carts` (User cart persistence)

3. **Retrieve Supabase API Credentials**:
   - In Supabase, go to **Project Settings** (gear icon) > **API**.
   - Copy the following values:
     - **Project URL** (e.g. `https://xxxx.supabase.co`)
     - **Project API Keys**: `anon` / `public`
     - **Project API Keys**: `service_role` (Secret)

---

### 5. Cloudinary Media Setup

Cloudinary is used for uploading and hosting product photos and customer review snapshots.

1. Log in to your [Cloudinary Console](https://console.cloudinary.com/).
2. On the Dashboard / Product Environment Details, locate and copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

### 6. Configure Environment Variables

1. Copy the example environment template to create your local `.env.local`:

```bash
cp .env.example .env.local
```

*(On Windows PowerShell, use: `Copy-Item .env.example .env.local`)*

2. Open `.env.local` in your editor and fill in your actual credentials:

```env
# ── Supabase Configuration ──
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# ── Cloudinary Configuration ──
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# ── Admin Dashboard Authentication ──
ADMIN_USER="admin"
ADMIN_PASS="YourSecureAdminPassword123!"
ADMIN_SESSION_SECRET="generate-a-long-random-string-for-session-signing"

# ── UPI Payment Gateway (Google Pay, PhonePe, Paytm) ──
NEXT_PUBLIC_UPI_ID="payments@soharth"
NEXT_PUBLIC_UPI_NAME="SOHARTH ATELIER"
```

#### Environment Variables Reference

| Variable | Description | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project API URL | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client operations | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key for administrative API actions | Server Only |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account identifier | Server Only |
| `CLOUDINARY_API_KEY` | Cloudinary access key | Server Only |
| `CLOUDINARY_API_SECRET` | Cloudinary secret access key | Server Only |
| `ADMIN_USER` | Admin username for `/login` | Server Only |
| `ADMIN_PASS` | Admin password for `/login` | Server Only |
| `ADMIN_SESSION_SECRET` | Secret token string used to sign admin session cookies | Server Only |
| `NEXT_PUBLIC_UPI_ID` | Your personal or business UPI ID (e.g. `yourname@okaxis`, `yourname@ybl`) | Client & Server |
| `NEXT_PUBLIC_UPI_NAME` | Display name shown on customer's Google Pay / PhonePe app | Client & Server |

---

### 7. Run the Development Server

Start the Next.js local development server with Turbopack:

```bash
npm run dev
```

The application will be live at:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Product Catalog**: [http://localhost:3000/products](http://localhost:3000/products)
- **Admin Login**: [http://localhost:3000/login](http://localhost:3000/login)

Log into the Admin command center using the credentials configured in `ADMIN_USER` and `ADMIN_PASS`.

---

### 8. Production Build & Verification

Before deploying, test TypeScript compilation and generate the production bundle:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Automated Test Suite (Real-time APIs, UPI Orders & Admin Verification)
npm test

# 3. Production build
npm run build

# 4. Start local production server
npm start
```

---

### 9. Deploying to Production (Vercel)

The easiest and recommended way to deploy SOHARTH is using the [Vercel Platform](https://vercel.com):

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `SOHARTH` repository.
4. In the **Environment Variables** section, add all variables defined in your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_USER`
   - `ADMIN_PASS`
   - `ADMIN_SESSION_SECRET`
5. Click **"Deploy"**. Vercel will build and launch your storefront globally with edge caching.

---

## 📁 Project Structure

```
SOHARTH/
├── public/                 # Static assets, brand logos, product banners
├── src/
│   ├── app/
│   │   ├── about/          # Brand story and fabric atelier details
│   │   ├── admin/          # Admin dashboard (protected)
│   │   ├── api/            # Route handlers (products, orders, reviews, cart, upload)
│   │   ├── cart/           # Shopping bag & checkout flow
│   │   ├── contact/        # Customer service & WhatsApp concierge
│   │   ├── login/          # Client & admin login
│   │   ├── privacy-policy/ # Legal privacy disclosure
│   │   ├── products/       # Complete product catalog with filters
│   │   ├── returns-exchange/ # 7-day exchange desk
│   │   ├── shipping-policy/# Delivery timelines & courier partners
│   │   ├── terms/          # Terms of service
│   │   ├── globals.css     # Celestial design token system & animations
│   │   ├── layout.tsx      # Root layout, fonts, and context providers
│   │   └── page.tsx        # Homepage (Hero showcase, bestsellers, trust strip, UGC)
│   ├── components/         # Reusable UI components
│   │   ├── Footer.tsx      # Global footer with brand policies & newsletter
│   │   ├── MobileBottomNav.tsx # Mobile sticky app navigation bar
│   │   ├── Navbar.tsx      # Desktop/mobile navigation & search trigger
│   │   ├── SearchModal.tsx # Instant catalog search overlay
│   │   ├── SizeChartModal.tsx # Interactive size guide
│   │   ├── SoharthLogo.tsx # Brand logo renderer
│   │   └── Toast.tsx       # Notification toast
│   ├── context/
│   │   ├── CartContext.tsx # Shopping cart state & Supabase sync
│   │   └── ToastContext.tsx# Global toast notifications
│   └── lib/
│       ├── cloudinary.ts   # Cloudinary SDK client
│       ├── data.ts         # Fallback product catalog
│       ├── pricing.ts      # Price calculations & discount logic
│       ├── supabase.ts     # Supabase admin client
│       ├── supabase-browser.ts # Supabase client-side browser client
│       └── supabase-server.ts  # Supabase server-side route client
├── next.config.ts          # Image optimization, caching & compression config
├── package.json            # Project dependencies & scripts
├── supabase-schema.sql     # Supabase database schema & table definitions
└── tsconfig.json           # TypeScript configuration
```

---

## ❓ Frequently Asked Questions & Troubleshooting

<details>
<summary><strong>1. Supabase returns "relation products does not exist" or "schema cache error"</strong></summary>

Ensure you ran the [`supabase-schema.sql`](./supabase-schema.sql) file in the Supabase SQL Editor. If you recently modified table columns, run:
```sql
NOTIFY pgrst, 'reload schema';
```
in your Supabase SQL Editor to reload PostgREST schema cache immediately.
</details>

<details>
<summary><strong>2. Images from external domains fail to load</strong></summary>

Next.js requires external image hostnames to be whitelisted in [`next.config.ts`](./next.config.ts). SOHARTH comes pre-configured for Unsplash, Cloudinary (`res.cloudinary.com`), and Supabase Storage (`*.supabase.co`). If using a different image provider, add it to `images.remotePatterns`.
</details>

<details>
<summary><strong>3. Admin login redirects back to /login with 401</strong></summary>

Check that `ADMIN_USER`, `ADMIN_PASS`, and `ADMIN_SESSION_SECRET` are set in `.env.local` without trailing spaces, and restart the dev server (`npm run dev`).
</details>

---

## 🔒 Security & Best Practices

- Environment files (`.env`, `.env*.local`) are strictly excluded by [`.gitignore`](./.gitignore).
- Service Role keys are restricted to server-side route handlers under `src/app/api/`.
- Admin endpoints require authenticated session cookies.

---

## 📄 License

Private & Proprietary © SOHARTH Atelier. All rights reserved.
