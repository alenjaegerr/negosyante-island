# Negosyante Island ALPHA 0.1.0

A Next.js + Prisma starter for **Negosyante Island**, a social + internet culture analytics platform with B2C users, verified B2B businesses, and admin moderation.

## Version Information

**Current Version:** ALPHA 0.1.0 (Prototype)

This is the prototype baseline before the BETA UI rework.

**Related Branches:**
- `alpha-0.1.0` - Prototype phase baseline (this branch)
- `beta-1.0-build-1` - Current MVP

## Version Flow

Negosyante Island now follows a simple release path so changes stay reviewable and reversible:

1. **ALPHA 0.1.0** lives on the `alpha-0.1.0` branch as the prototype baseline.
2. **BETA 1.0 Build 1** is developed on the `beta-1.0-build-1` branch and reviewed through a pull request.
3. Approved BETA changes are merged into `main` as the tracked release line.
4. Future builds should continue from the current BETA branch or a new build branch, not from an ad hoc direct edit on `main`.

## Project Structure

This repository is part of the **Negosyante Island** project, which includes:
- **alpha-0.1.0** - Original prototype/ALPHA version
- **beta-1.0-build-1** - Current MVP with reworked UI

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

> ⚠️ Demo credentials are for local development/testing only. Do not use seeded users or passwords in production.

- `admin@negosyante.test` (admin)
- `user@negosyante.test` (normal user)
- `biz@negosyante.test` (verified business)
- `pending@negosyante.test` (business pending verification)
