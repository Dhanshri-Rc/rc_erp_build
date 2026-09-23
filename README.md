# RC ERP — Complete MERN Role-Based ERP

A full-stack MERN implementation recreated from the supplied RC ERP reference screens. The project includes one secure login and three protected workspaces: **Admin**, **Sales/Marketing**, and **Finance/Accounting**.

## What is implemented

- Reference-style login screen, dashboard shell, sidebar, cards, tables, forms, gradients, badges and responsive behavior.
- One login endpoint with automatic redirect by role:
  - Admin → `/admin/dashboard`
  - Sales → `/sales/dashboard`
  - Finance → `/finance/dashboard`
- Backend and frontend role protection. Typing another role's URL does not grant access.
- Admin-only creation of Sales/Marketing and Finance/Accounting users.
- Admin Users List with search, role/status filters, pagination, View/Edit/Delete actions, enable/disable and password reset.
- Admin-only vendor creation, vendor list and Vendors-by-Employee views. Sales receives only assigned active vendors in service-form dropdowns.
- Admin journal form/list with Journal Title, ISSN No. and Web URL.
- Admin article form/list with linked journal, Article Title, ISSN No., Web URL and configurable total positions.
- Admin Authorship Position Setup form for changing a selected article's 1–N position range.
- Sales-only Client form/list with B-B and B-C business types.
- Authorship Sale workflow with exact position selection, per-position author/department/college details, booked-position visibility and atomic duplicate-booking protection.
- Direct Paper Publication workflow with a manual Issue/Volume field and conditional payment section: hidden for zero advance, full INR transaction details for INR advances, and screenshot-only proof for USD advances.
- Lead Generation workflow plus recent lead table and follow-up tracking.
- Consistent responsive View/Edit/Delete actions for users, vendors, journals, articles, clients, leads, authorship sales and publication services. Dependency checks protect booked, linked and financially verified records.
- Fully interactive navigation: dashboard/logo links, notifications, mobile menu, profile menus, help and logout controls.
- Finance Dashboard and Payment Verification queue.
- Finance verification/rejection creates audit events; verification generates a numbered receipt.
- Header notifications are backed by MongoDB.
- Admin, Sales and Finance dashboard metrics are calculated by backend APIs.
- CSV export endpoints for users, vendors, sales and payments.
- File upload validation for JPG/PNG/PDF, maximum 5 MB.
- Responsive layout for custom widths from mobile to large desktop; mobile sidebar becomes an off-canvas drawer.
- Framer Motion hover/page interactions with reduced-motion support.

## Stack

### Frontend
- React + Vite
- React Router
- Axios
- Framer Motion
- Lucide React
- Recharts
- Responsive custom CSS design system

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT in secure httpOnly cookie
- bcrypt password hashing
- Helmet, CORS and rate limiting
- Multer uploads

## Folder structure

```text
RC-ERP/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── admin/
│       │   ├── sales/
│       │   ├── finance/
│       │   └── common/
│       └── services/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── seed/
│       └── utils/
└── reference-ui/
```

## Requirements

- Node.js 18+
- MongoDB running locally, or an Atlas connection string

## Quick start

### 1. Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env`, then set your MongoDB connection, JWT secret and admin seed credentials.

Seed demo data:

```bash
npm run seed
```

Run the API:

```bash
npm run dev
```

API runs on `http://localhost:5000`.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Demo accounts after `npm run seed`

| Role | Username / Email | Password |
|---|---|---|
| Admin | `admin` or `admin@rcerp.local` | `Admin@123` |
| Sales | `marketing.user` or `sales@rcerp.local` | `Sales@123` |
| Finance | `accounting.user` or `finance@rcerp.local` | `Finance@123` |

These credentials are for local development only. Change all production credentials and the JWT secret.

## Important role rules

### Admin
Admin can create Sales and Finance users, manage users, create and view vendors, assign vendors to Sales users, manage journals/articles/authorship positions, inspect employee vendor assignments, verify payments, view receipts and system-level data.

### Sales / Marketing
Sales can create and view their own B-B/B-C clients, select assigned admin-created vendors, book available authorship positions, create publication services and manage leads. Sales cannot create, list, edit or export vendors. The backend enforces all role and ownership rules.

### Finance / Accounting
Finance can review payments, verify or reject them, work with receipts and see finance dashboards. Finance cannot create users or access Admin/Sales routes.

## Main APIs

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET/POST /api/users                 (Admin only)
GET/PUT/DELETE /api/users/:id       (Admin only; safe-delete rules apply)
PATCH    /api/users/:id/status      (Admin only)
POST     /api/users/:id/reset-password

GET/POST /api/vendors                 (Admin only)
GET/PUT/DELETE /api/vendors/:id       (Admin only; safe-delete rules apply)
GET      /api/vendors/options         (Admin/Sales dropdown)
GET/POST /api/clients                 (Sales only)
GET/PUT/DELETE /api/clients/:id       (Sales owner only)
GET      /api/catalog/journals
GET      /api/catalog/articles
GET      /api/catalog/issues
POST     /api/catalog/journals        (Admin only)
PUT/DELETE /api/catalog/journals/:id  (Admin only; linked journals cannot be deleted)
POST     /api/catalog/articles        (Admin only)
PUT/DELETE /api/catalog/articles/:id  (Admin only; booked articles cannot be deleted)
PATCH    /api/catalog/articles/:id/positions

GET/POST /api/sales/authorship
GET/PUT/DELETE /api/sales/authorship/:id
GET/POST /api/sales/publications
GET/PUT/DELETE /api/sales/publications/:id
GET/POST /api/leads
GET/PUT/DELETE /api/leads/:id

GET   /api/payments
PATCH /api/payments/:id/verify
PATCH /api/payments/:id/reject
GET   /api/payments/receipts

GET /api/dashboard/admin
GET /api/dashboard/sales
GET /api/dashboard/finance

GET   /api/notifications
PATCH /api/notifications/read-all
```

## End-to-end example

1. Admin logs in and creates a Sales user.
2. That user can immediately log in and is redirected to the Sales Dashboard.
3. Admin creates a Vendor and assigns it to the Sales user.
4. Admin creates journals, articles and each article's total author position range.
5. Sales creates B-B/B-C clients and can select the assigned Vendor in service forms.
6. Sales books one or more available author positions. Booked positions immediately show the author and affiliation and cannot be booked again.
7. Sales creates a Direct Publication; an advance above zero creates a Finance verification record.
8. Finance verifies the payment, and RC ERP creates a receipt and audit activity.
9. Dashboard data updates from MongoDB aggregation endpoints.

## Reference UI

The original uploaded screenshots used to recreate the interface are included in `reference-ui/` for side-by-side comparison.

## Production notes

Before deployment:

- Copy `.env.example` to `.env` locally; never commit or distribute `.env` files.
- Use a strong unique `JWT_SECRET` containing at least 32 random characters.
- Use a production MongoDB URI.
- Both standalone MongoDB and MongoDB Atlas/replica-set deployments are supported. Critical writes use atomic reservations plus compensating rollback.
- Set `NODE_ENV=production`.
- Set `FRONTEND_URL` to the deployed frontend domain.
- Set `TRUST_PROXY=true` when the API is behind one trusted reverse proxy such as Render.
- Use `COOKIE_SAME_SITE=none` only when frontend and API are on different sites; HTTPS is mandatory.
- Store uploads in durable object storage if deploying to ephemeral infrastructure.
- Serve frontend and backend over HTTPS so secure cookies are enabled.
- Remove or rotate all demo credentials.
- Run `npm run check` and `npm audit --omit=dev` in the backend and `npm run build` plus `npm audit` in the frontend before release.

### Database commands

- `npm run seed` only creates the first administrator and never deletes existing data.
- `npm run seed:demo` is development-only and intentionally destructive. It is blocked unless `ALLOW_DEMO_RESET=I_UNDERSTAND_THIS_DELETES_ALL_DATA` is explicitly set.
- Never run `seed:demo` from a deployment command or against a production database.

See `PRODUCTION_CHECKLIST.md` before deploying.

