# Negosyante Island

A Next.js + Prisma starter for **Negosyante Island**, a social + internet culture analytics platform with B2C users, verified B2B businesses, and admin moderation.

## Features

- Email/password authentication with JWT cookie sessions
- Role-based access control:
  - `user`
  - `business_pending`
  - `business_verified`
  - `admin`
- Social feed with post creation + like/comment/share/view counters
- Trending Q page and Negosyante Insight indicators
- Business verification workflow:
  - submit BIR TIN or Mayor's Permit + business name
  - admin approves/rejects request
  - approved users become `business_verified`
- Separate dashboards:
  - User feed
  - Business pending verification page
  - Verified business analytics dashboard
  - Admin verification panel
- PostgreSQL Prisma schema + seed data for demo users and trends

## Tech Stack

- Frontend/Backend: Next.js App Router + Route Handlers
- Styling: Tailwind CSS
- Database: PostgreSQL via Prisma ORM
- Auth: JWT + HttpOnly cookie
- Uploads: saved to `data/uploads` and served through an authenticated API route

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/negosyante_island"
JWT_SECRET="replace-with-a-strong-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Seed demo data:

```bash
npm run prisma:seed
```

5. Start dev server:

```bash
npm run dev
```

## Demo Accounts (seed)

Password for all: `password123`

- `admin@negosyante.test` (admin)
- `user@negosyante.test` (normal user)
- `biz@negosyante.test` (verified business)
- `pending@negosyante.test` (business pending verification)
