# LedgerFlow — Accounting Practice Operations Platform

> **Modern, professional B2B SaaS web application for small accounting firms, bookkeeping agencies, and outsourced finance teams (US, UK, and international).**

---

## 1. Product Overview

LedgerFlow is an **accounting practice operations platform**. It helps firm owners, managing partners, and practice accountants manage:
- Practice clients and contacts directory
- Document requests and client file submissions
- Recurring workflow templates and checklist tasks
- Deadlines & compliance calendar
- Tenant-isolated Client Portal
- Communication inbox (with confidential internal memos)
- Firm-service invoicing and manual/online payments
- Live time tracking and timesheet billing conversions
- Team workload and weekly capacity planning
- Operational reports and immutable audit logs

> **Note:** LedgerFlow is an operations and practice management platform. It is **NOT** a general ledger, bookkeeping engine, payroll engine, or tax filing application. It includes a dedicated integrations architecture so QuickBooks Online, Xero, Sage, Stripe, and tax authority APIs can be connected.

---

## 2. Design System — Pure White (`#FFFFFF`)

- **Main background:** `#FFFFFF`
- **Sidebar background:** `#FFFFFF`
- **Card background:** `#FFFFFF`
- **Primary Brand Blue:** `#2563EB` (Hover: `#1D4ED8`)
- **Active Navigation Background:** `#EFF6FF`
- **Borders:** `#E5E7EB` / `#E2E8F0`
- **Subtle Wells & Table Headers:** `#F9FAFB`
- **Status Colors:** Success Green (`#16A34A`), Warning Amber (`#D97706`), Error Red (`#DC2626`), Info Blue (`#0284C7`)
- **Typography:** Inter with tight letter-spacing (`tracking-tight`), tabular numerals for amounts and dates.

---

## 3. Tech Stack

- **Frontend:** React 18 + TypeScript + Vite / Next.js architecture + Tailwind CSS
- **Icons:** Lucide Icons (outline, 1.5px stroke)
- **Data & Testing:** Vitest test suite (`npm test`) with 34 automated unit and integration tests
- **Database Schema:** Prisma ORM schema (`prisma/schema.prisma`) defining 25+ business entities with SQLite for local demonstration and PostgreSQL for production
- **Validation:** Zod schemas and typed form state
- **Money Math:** Strict integer minor units calculation engine (`src/utils/money.ts`) avoiding floating-point rounding errors

---

## 4. Demo Logins & Test Personas

LedgerFlow includes pre-seeded demo records for **Apex Advisory & Accounting LLP**. You can authenticate with any role on the Login page or switch active personas on the fly via the top-right header menu:

| Role | Name | Email | Permissions & Scope |
|---|---|---|---|
| **Firm Owner** | Eleanor Vance | `eleanor.vance@apexadvisory.com` | Full administrative control, billing, audit logs, workspace settings, deletion |
| **Manager** | Marcus Brody | `marcus.brody@apexadvisory.com` | Team capacity, task assignment, review approvals, client management |
| **Senior Accountant** | Sophia Patel | `sophia.patel@apexadvisory.com` | Assigned clients, bookkeeping tasks, document review, timesheets |
| **Bookkeeper** | Liam O'Connor | `liam.oconnor@apexadvisory.com` | Assigned bookkeeping workflows, VAT return prep, file requests |
| **Reviewer** | Chloe Bennett | `chloe.bennett@apexadvisory.com` | QA reviews, document approvals, task approvals |
| **Client 1** | John Sterling | `j.sterling@sterlinghealth.com` | **Sterling Health Solutions Inc.** — Client Portal only, private files, payment modal |
| **Client 2** | Claire Kensington | `claire@camdentech.co.uk` | **Camden Tech Innovations Ltd** — Client Portal only, strictly isolated from Client 1 |

---

## 5. Getting Started & Commands

```bash
# Install dependencies
npm install

# Run automated Vitest test suite (34 tests passing)
npm test

# Run production build (TypeScript check + Vite production bundle)
npm run build

# Start development server
npm run dev
```

Dev Server runs at: `http://localhost:3000`

---

## 6. Architecture & Security Highlights

### A. Authorization & Tenant Isolation Helper (`src/server/auth/authorize.ts`)
A single server-side `authorize(user, action, resource)` function enforces:
- **Tenant Isolation:** Rejects any request where `resource.workspaceId !== user.workspaceId` with `403 Forbidden`.
- **Client Privacy:** Clients can only access records matching their permitted `clientId`. Accessing another client's record returns `404 Not Found` to prevent entity ID probing.
- **Confidential Memos:** Records flagged with `isInternalOnly: true` (e.g. staff memos) are strictly forbidden (`403`) from ever rendering in client views.
- **Data Retention Policy:** Hard deletion is blocked if a client has financial or audit history (`hasFinancialHistory: true`).

### B. Integer Money Engine (`src/utils/money.ts`)
Stores money strictly as integer minor units (e.g. cents/pence) with ISO 4217 currency codes:
- `formatMinorUnits(minorUnits, currency)`
- `parseToMinorUnits(amount, currency)`
- `computeInvoiceTotals(lines, taxRateBps)` using basis points (1% = 100 bps)

### C. Command Palette (`src/components/layout/CommandPalette.tsx`)
Global `⌘K` or `Ctrl+K` spotlight modal providing permission-aware search across Clients, Tasks, Document Requests, Invoices, and Messages with full keyboard arrow and enter navigation.

---

## 7. Build Phase Reports

### Phase 1: Foundation
- **Built:** Design tokens, pure white canvas, collapsible sidebar with persistent state in `localStorage`, header with command palette (`⌘K`), RBAC authorization engine, audit logs, integer money calculations, and Prisma schema.
- **Tested:** `authorize.test.ts` (7 tests) and `money.test.ts` (4 tests).
- **Known Limitations:** In local demo mode, session authentication simulates HTTP-only cookie state via managed secure storage.

### Phase 2: Dashboard + Clients
- **Built:** Executive dashboard with 6 KPI cards, upcoming deadlines, missing documents progress, team capacity meters, and client directory with CSV import wizard, validation preview, and CSV export.
- **Tested:** `clients.test.ts` (4 tests) covering client creation, active count updates, CSV validation, and data retention rules.

### Phase 3: Tasks + Deadlines Calendar
- **Built:** Segmented task views (Table, Linear-style Kanban with drag status transitions, My Tasks, Team Tasks), recurring workflow spawner, and month grid/agenda calendar with click-to-reschedule.
- **Tested:** `tasks.test.ts` (4 tests) covering workflow stage transitions, checklist subtasks, and recurring template instantiation.

### Phase 4: Document Requests + Client Portal
- **Built:** Document request builder, file upload status tracking, file review drawer with Approve and Request Replacement actions, and tenant-isolated Client Portal with magic link login option.
- **Tested:** `documents.test.ts` (4 tests) verifying file approval lifecycle and cross-client portal isolation (Client 2 cannot query Client 1 files).

### Phase 5: Messages + Notifications & Automation
- **Built:** 3-column communication inbox, confidential internal staff notes (highlighted in warm amber with lock indicator), in-app notification center, and toggleable background automation rules.
- **Tested:** `messages.test.ts` (4 tests) confirming internal notes are strictly hidden from clients and in-app delivery state honesty.

### Phase 6: Invoices + Time Tracking
- **Built:** Firm-service invoicing with line items, tax profiles, manual payment recorder, printable PDF preview, active work timer with live seconds ticker, and convert-approved-time-to-invoice action.
- **Tested:** `invoices_time.test.ts` (4 tests) verifying integer math invoice totals and single-conversion time entry billing guarantee (duplicate conversion blocked).

### Phase 7: Team, Reports & Administration
- **Built:** Team directory with weekly capacity meters, practice operational reports with CSV dataset export, service category breakdown, 7-tab firm settings, and integration status page.
- **Tested:** `reports_settings.test.ts` (3 tests) validating report metrics against underlying database counts and capacity utilization formulas.

### Phase 8: Polish, Responsive Design & QA
- **Built:** Clean responsive layout supporting desktop (1440px), tablet (800px), and mobile (390px) viewports with mobile drawer navigation, accessible contrast, and zero console/build warnings.
- **Tested:** Full Vitest test suite running 34 tests across 8 test suites with 100% pass rate. Production build `npm run build` verified clean.

---

## 8. Known Limitations & Roadmap

1. **External Webhooks:** External accounting platforms (QuickBooks Online, Xero, Sage) and payment processors (Stripe) require live API client secrets in `.env`. When unconfigured, LedgerFlow shows honest "Not configured — connect in Settings → Integrations" states.
2. **Email Delivery:** In local demo mode, messages and reminders operate as in-app notifications labeled "In-app only — email not configured" until an SMTP or Resend API key is provided.
3. **Storage Provider:** File uploads currently use local base64/object storage abstraction. In production, configure private AWS S3 / Cloudflare R2 bucket credentials in `.env`.
