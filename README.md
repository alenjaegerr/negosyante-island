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
  - `admin`
- Social feed with post creation + like/comment/share/view counters
- Trending Q page and Negosyante Insight indicators
- PostgreSQL Prisma schema + seed data for demo users and trends

- For serverless-friendly Prisma connections, consider Prisma Data Proxy or use Neon/Supabase which handle connections.
- Styling: Tailwind CSS
Prisma Data Proxy (recommended for Netlify)
-----------------------------------------
For serverless deployments (Netlify) we recommend using the Prisma Data Proxy to avoid connection limits. To enable:

1. Create a Prisma Data Proxy in Prisma Cloud and copy the `PRISMA_DATA_PROXY_URL`.
2. Add `PRISMA_DATA_PROXY_URL` to your Netlify environment variables and GitHub Secrets.
3. The CI workflow and runtime will prefer the Data Proxy when `PRISMA_DATA_PROXY_URL` is present.

If you prefer to stay within Supabase only, use the Supabase Session Pooler connection string as `DATABASE_URL` instead.
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
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="business.negosyanteisland@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="Negosyante Island <business.negosyanteisland@gmail.com>"
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

## Deployment

This project is Netlify-ready with the following settings already configured:

- Build command: `npm run build`
- Publish directory: `.next`
- Next.js plugin: `@netlify/plugin-nextjs`

For production, make sure these environment variables are set:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Recommended production changes for Netlify
- Use a managed Postgres (Supabase, Neon, RDS) and set `DATABASE_URL` in Netlify.
- Do not run `prisma migrate dev` on Netlify; instead add a CI job to run `npx prisma migrate deploy`.
- Use a transactional email provider (SendGrid/Mailgun/Postmark) and set `SENDGRID_API_KEY` / `SENDGRID_FROM` in Netlify.
- For serverless-friendly Prisma connections, consider Prisma Data Proxy or use Neon/Supabase which handle connections.

CI (GitHub Actions)
We include a sample workflow at `.github/workflows/prisma-migrate.yml` that runs migrations and builds on `main` — add `DATABASE_URL` and `NEXT_PUBLIC_APP_URL` as GitHub Secrets.

If you use Gmail, create a Google App Password for `business.negosyanteisland@gmail.com` and use it for `SMTP_PASS`. Regular account passwords will not work for SMTP.

The app will refuse to start in production without a `JWT_SECRET`, and Prisma needs a valid `DATABASE_URL`.

## Auto-start in VS Code Remote SSH

If you want the database and website to start automatically when you open the folder over Remote SSH, use the included VS Code task:

```bash
npm run dev:all
```

That task is wired in `.vscode/tasks.json` with `runOn: folderOpen`, so VS Code launches it as soon as the remote workspace opens.

## Demo Accounts (seed)

Password for all: `password123`

> ⚠️ Demo credentials are for local development/testing only. Do not use seeded users or passwords in production.

- `admin@negosyante.test` (admin)
- `user@negosyante.test` (normal user)
- `biz@negosyante.test` (verified business)
- `pending@negosyante.test` (business pending verification)
