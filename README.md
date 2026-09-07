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
- Admin Users List with search, role/status filters, pagination, enable/disable and password reset.
- Admin Vendors and Vendors-by-Employee views.
- Sales vendor creation and owned-vendor listing.
- Authorship Sale workflow with journal/article selection, available POS protection, pricing and payment proof upload.
- Direct Paper Publication workflow with vendor, journal/issue, pricing, payment and manuscript details.
- Lead Generation workflow plus recent lead table and follow-up tracking.
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

The ZIP includes a local-development `.env`. To use MongoDB Atlas, replace `MONGODB_URI` in `backend/.env`.

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
Admin can create Sales and Finance users, manage users, view all vendors, inspect employee vendor assignments, verify payments, view receipts and system-level data.

### Sales / Marketing
Sales can manage only their own/assigned vendors, authorship sales, publication services and leads. The backend enforces ownership; frontend filtering is not used as a security boundary.

### Finance / Accounting
Finance can review payments, verify or reject them, work with receipts and see finance dashboards. Finance cannot create users or access Admin/Sales routes.

## Main APIs

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET/POST /api/users                 (Admin only)
PATCH    /api/users/:id/status      (Admin only)
POST     /api/users/:id/reset-password

GET/POST /api/vendors
GET      /api/catalog/journals
GET      /api/catalog/articles
GET      /api/catalog/issues

GET/POST /api/sales/authorship
GET/POST /api/sales/publications
GET/POST /api/leads

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
3. Sales creates a Vendor. The backend automatically assigns the vendor to that Sales user.
4. Admin can see the vendor under Vendors by Employee.
5. Sales creates an Authorship Sale or Direct Publication with an advance payment.
6. A Payment record is created and Finance receives a notification.
7. Finance verifies the payment.
8. RC ERP creates a receipt and audit activity and notifies Sales/Admin.
9. Dashboard data updates from MongoDB aggregation endpoints.

## Reference UI

The original uploaded screenshots used to recreate the interface are included in `reference-ui/` for side-by-side comparison.

## Production notes

Before deployment:

- Use a strong unique `JWT_SECRET`.
- Use a production MongoDB URI.
- Set `NODE_ENV=production`.
- Set `FRONTEND_URL` to the deployed frontend domain.
- Store uploads in durable object storage if deploying to ephemeral infrastructure.
- Serve frontend and backend over HTTPS so secure cookies are enabled.
- Remove or rotate all demo credentials.

