# Restaurant AI — Production-Ready SaaS Chatbot Platform

A fully-featured, AI-powered restaurant assistant built with Next.js 15, OpenAI GPT-4o, RAG architecture, Google APIs, and more.

---

## Architecture Overview

```
restaurant-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/          → Login, Register, Forgot Password
│   │   ├── (chat)/          → Full-screen AI Chat Interface
│   │   ├── (dashboard)/     → Admin Dashboard (protected)
│   │   └── api/             → All API routes (backend)
│   ├── components/
│   │   ├── chat/            → Chat UI components
│   │   └── dashboard/       → Admin UI components
│   ├── lib/
│   │   ├── ai/              → RAG, embeddings, prompts, tools
│   │   ├── google/          → Drive + Sheets integrations
│   │   ├── email/           → Resend + HTML templates
│   │   ├── auth/            → JWT utilities
│   │   └── db/              → Prisma client
│   ├── store/               → Zustand (chat + auth state)
│   ├── types/               → Full TypeScript types
│   └── middleware.ts        → JWT auth + rate limiting
├── prisma/
│   └── schema.prisma        → Full DB schema (11 models)
└── .env.example             → All environment variables
```

---

## Quick Start (Local Development)

### 1. Clone and Install

```bash
cd restaurant-saas
npm install
```

### 2. Set Environment Variables

```bash
cp .env.example .env.local
# Fill in all values (see below)
```

### 3. Set Up Database

```bash
# Push schema to your database
npm run db:push

# Or run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Environment Variables Guide

### Required — Core

```env
DATABASE_URL=postgresql://...      # Neon/Supabase connection string
JWT_SECRET=your-secret-32chars     # Min 32 characters, random string
OPENAI_API_KEY=sk-...              # From platform.openai.com
```

### Required — Vector DB (Pinecone)

```env
PINECONE_API_KEY=...               # From app.pinecone.io
PINECONE_INDEX=restaurant-knowledge # Create index with 1536 dims
PINECONE_ENVIRONMENT=us-east-1
```

### Required — Redis (Upstash)

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
# Get from console.upstash.com — free tier works
```

### Required — Google APIs

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
```

### Required — Email (Resend)

```env
RESEND_API_KEY=re_...              # From resend.com
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=you@yourdomain.com
```

---

## How to Set Up OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API Key → copy to `OPENAI_API_KEY`
3. The app uses:
   - `gpt-4o` for chat (configurable via `OPENAI_MODEL`)
   - `text-embedding-3-small` for RAG (configurable via `OPENAI_EMBEDDING_MODEL`)

---

## How to Set Up PostgreSQL (Neon)

1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run db:push` to apply the schema
4. The schema creates 11 tables automatically

**Supabase alternative:**
1. Go to [supabase.com](https://supabase.com) → New project
2. Settings → Database → Connection string (use "URI" mode)
3. Add `?pgbouncer=true&connection_limit=1` for pooling

---

## How to Connect Google Drive

### Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Google Drive API
   - Google Docs API
   - Google Sheets API

### Step 2: Create OAuth Credentials

1. APIs & Services → Credentials → Create Credentials → OAuth Client ID
2. Application type: Web application
3. Authorized redirect URIs: `http://localhost:3000/api/google/callback`
4. Copy `Client ID` → `GOOGLE_CLIENT_ID`
5. Copy `Client Secret` → `GOOGLE_CLIENT_SECRET`

### Step 3: Connect in Dashboard

1. Sign in → go to **Knowledge Base** page
2. Click **Connect Google Drive**
3. Authorize the Google account
4. Enter your Google Drive folder IDs
5. Click **Sync Now**

### Finding Folder IDs

Open a folder in Google Drive → URL will be:
`https://drive.google.com/drive/folders/`**`THIS_IS_YOUR_FOLDER_ID`**

---

## How to Connect Google Sheets (Lead Storage)

Leads are automatically saved to Google Sheets when captured.

### Setup

1. Create a Google Sheet
2. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`
3. Add to `.env.local`: `GOOGLE_SHEETS_SPREADSHEET_ID=your_id`
4. The system creates "Leads" and "Reservations" tabs automatically

---

## How to Set Up Vector Embeddings (Pinecone)

1. Go to [app.pinecone.io](https://app.pinecone.io) → Create index
2. Settings:
   - **Name**: `restaurant-knowledge`
   - **Dimensions**: `1536` (for text-embedding-3-small)
   - **Metric**: `cosine`
3. Copy API key to `PINECONE_API_KEY`
4. Copy environment to `PINECONE_ENVIRONMENT`
5. Sync documents → embeddings are generated automatically

---

## How to Deploy on Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/restaurant-saas.git
git push -u origin main
```

### Step 2: Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Or connect via [vercel.com/new](https://vercel.com/new) → Import GitHub repo

### Step 3: Set Environment Variables in Vercel

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add ALL variables from `.env.example`
3. Update:
   - `NEXT_PUBLIC_APP_URL` → your Vercel URL
   - `GOOGLE_REDIRECT_URI` → `https://your-domain.vercel.app/api/google/callback`
   - `NEXTAUTH_URL` → your Vercel URL

### Step 4: Run DB Migration on Production

```bash
# Connect to production DB and run migrations
DATABASE_URL=your_prod_url npm run db:migrate
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account + restaurant |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Streaming AI chat |

### Admin (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads |
| PATCH | `/api/leads?id=` | Update lead status |
| GET | `/api/reservations` | List reservations |
| PATCH | `/api/reservations?id=` | Update reservation |
| GET | `/api/google/drive` | Drive actions |
| POST | `/api/google/drive?action=sync` | Sync documents |
| GET | `/api/admin/analytics` | Analytics data |
| GET/PUT | `/api/admin/settings` | Restaurant settings |
| GET | `/api/admin/conversations` | All conversations |
| GET | `/api/emails` | Email logs |

---

## AI Tool Calling

The AI assistant supports these built-in tools:

| Tool | Description |
|------|-------------|
| `createReservation` | Creates reservation + sends confirmation email |
| `captureLead` | Saves lead to DB + Google Sheets |
| `escalateToHuman` | Flags conversation + alerts admin |
| `checkAvailability` | Checks table availability |
| `getMenuRecommendations` | Returns AI dish recommendations |

---

## Security Features

- JWT authentication (httpOnly cookies)
- Rate limiting via Upstash Redis
- Input validation with Zod on all endpoints
- CSRF protection via SameSite cookies
- Secure headers via middleware
- Role-based access (SUPER_ADMIN, ADMIN, OWNER, USER)
- SQL injection protection via Prisma ORM
- XSS protection via React's built-in escaping

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand (persist) |
| AI Chat | Vercel AI SDK + OpenAI GPT-4o |
| RAG | LangChain + Pinecone |
| Database | PostgreSQL (Neon/Supabase) + Prisma |
| Cache | Upstash Redis |
| Email | Resend |
| Auth | JWT (jose) |
| Google | Drive API + Sheets API |

---

## Support

For issues, open a GitHub issue or email: support@restaurantai.com
