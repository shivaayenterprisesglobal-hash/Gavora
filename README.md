# Gavora

A premium multi-category e-commerce platform: a React storefront, a separate admin console, and an Express + MongoDB API. Supports online payment via Razorpay and Cash on Delivery.

> **Status: Phase 1 — foundation.** The architecture, configuration, data models, route table and design system are in place. Business logic (auth, catalogue, cart, checkout, payments, admin CRUD) is implemented in later phases. Nothing is deployed.

## Stack

| Layer    | Technology                                                          |
| -------- | ------------------------------------------------------------------- |
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router 7, Axios            |
| Backend  | Node.js 20+, Express 5, Mongoose 9, Zod                              |
| Database | MongoDB (Atlas)                                                      |
| Auth     | JWT access + refresh tokens, bcrypt password hashing                 |
| Payments | Razorpay (online) and Cash on Delivery                               |

## Prerequisites

- **Node.js 20.19 or later** (`node -v`) — the repo is developed against Node 24
- **npm 10 or later** (`npm -v`)
- A **MongoDB** connection string — a free [Atlas](https://www.mongodb.com/cloud/atlas) cluster is enough for local work

## Local setup

### 1. Install dependencies

Run this once from the repository root. It is an npm workspace, so a single install covers both `client` and `server`.

```bash
npm install
```

### 2. Create the environment files

```bash
# Windows PowerShell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env

# macOS / Linux
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Fill in `server/.env`

Three values are required before the server will start.

**`MONGO_URI`** — from Atlas: *Database → Connect → Drivers*. Append the database name before the query string:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/gavora?retryWrites=true&w=majority
```

Also add your machine's IP under *Atlas → Network Access*, or the connection will time out.

**`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`** — two different random strings of at least 32 characters. Generate each with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Razorpay keys can stay blank until the payments phase.

### 4. Run both apps

```bash
npm run dev
```

- Storefront: <http://localhost:5173>
- API: <http://localhost:5000/api>
- Health check: <http://localhost:5000/api/health>

To run them separately:

```bash
npm run dev:server
npm run dev:client
```

## Commands

All commands run from the repository root.

| Command               | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `npm install`         | Install dependencies for both workspaces                  |
| `npm run dev`         | Run the API and the storefront together                   |
| `npm run dev:server`  | Run the API only, with file watching                      |
| `npm run dev:client`  | Run the Vite dev server only                              |
| `npm run build`       | Production build of the storefront into `client/dist`      |
| `npm run preview`     | Serve the production build locally                        |
| `npm start`           | Run the API without file watching                         |
| `npm run lint`        | Lint both workspaces                                      |
| `npm run lint:fix`    | Lint and auto-fix both workspaces                         |
| `npm run format`      | Format the repository with Prettier                       |

## Project structure

```
Gavora/
├── client/                     # React storefront + admin console
│   └── src/
│       ├── components/         # layout, ui primitives, shared common pieces
│       ├── context/            # auth and cart providers, plus their hooks
│       ├── layouts/            # PublicLayout, AuthLayout, AdminLayout
│       ├── lib/                # axios API client
│       ├── pages/              # route components (storefront, account, admin)
│       ├── router/             # route table
│       ├── utils/              # formatters and helpers
│       └── index.css           # Tailwind v4 theme — the design token source
├── server/                     # Express API
│   └── src/
│       ├── config/             # env validation, database, CORS
│       ├── middleware/         # errors, validation, sanitising, rate limits
│       ├── models/             # Mongoose schemas
│       ├── routes/             # /api route table
│       └── utils/              # ApiError, response envelope, logger
├── .env files                  # never committed — see the .env.example files
├── package.json                # workspace root
└── README.md
```

## API surface

| Route              | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `/api/health`      | Liveness and database readiness                |
| `/api/auth`        | Customer signup, login, logout, token refresh  |
| `/api/products`    | Public catalogue: list, search, detail         |
| `/api/categories`  | Public category list and detail                |
| `/api/orders`      | Authenticated customer orders                  |
| `/api/users`       | Profile and saved addresses                    |
| `/api/payments`    | Razorpay order creation and verification       |
| `/api/admin`       | Admin-only dashboard and management            |

Endpoints not yet implemented return `501` with a description of what they will do. Every response uses one envelope:

```json
{ "success": true, "message": "OK", "data": {} }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "details": {} } }
```

## Security model

- Passwords are stored only as bcrypt hashes. `passwordHash` is `select: false`, so it is excluded from queries unless explicitly requested, and is stripped from every JSON response.
- All environment variables are validated by Zod at startup; secrets shorter than 32 characters or still containing placeholder text abort the boot.
- Secrets live only in `server/.env`. The client receives nothing beyond the Razorpay *publishable* key id, because Vite inlines every `VITE_*` variable into the browser bundle.
- Request bodies, params and query strings are stripped of MongoDB operator keys (`$`, `.`) before reaching a handler.
- CORS runs against an explicit origin allowlist with credentials enabled.
- `helmet` sets security headers; JSON bodies are capped at 1 MB; rate limits apply to the whole API and more tightly to credential endpoints.
- Order money is never taken from the client. Subtotal, discount, shipping and total are recalculated server-side from the catalogue at checkout, and Razorpay signatures are verified server-side before an order is marked paid.
- Error responses use fixed codes and safe messages; stack traces are development-only.

## Design system

Brand tokens — colour, typography, radii, shadows — are declared once in [client/src/index.css](client/src/index.css) inside Tailwind's `@theme` block, which turns each one into a utility class. Retune the brand there rather than in components.

- **Ink navy** (`ink-50` … `ink-950`) for surfaces, headers and primary actions
- **Warm gold** (`gold-50` … `gold-900`) for accents, prices and highlights, used sparingly
- **Off-white canvas** (`canvas`, `canvas-raised`, `canvas-sunken`) for page backgrounds
- **Fraunces** for display headings, **Inter** for body text
- Layouts are mobile-first and verified at desktop, tablet and mobile widths; `prefers-reduced-motion` is respected

## Deployment

Not configured, and deliberately so. The project runs locally only until deployment is explicitly approved.
