# VaultLink — Homefirst × Kleeto

Angular 17 project for the VaultLink document vaulting portal.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
ng serve

# 3. Open browser
http://localhost:4200
```

## Login Credentials
- **Email:** admin@kleeto.com
- **Password:** kleeto123

## Project Structure

```
src/app/
├── auth/
│   └── login.component.ts          # Login page
├── layout/
│   └── layout.component.ts         # Sidebar + topbar shell
├── pages/
│   ├── request-for-pickup/         # Kleeto: incoming requests + confirm modal
│   ├── pickup-scheduled/           # Kleeto: confirmed, awaiting collection
│   ├── intransit/                  # Kleeto: picked up, en route
│   ├── delivered/                  # Kleeto: delivered to vault (read-only)
│   ├── vault-management/           # Kleeto + HF: Track Pickups drill-down + Acknowledge
│   └── dashboard/                  # HomeFirst: overview stats
├── shared/
│   ├── models/models.ts            # TypeScript interfaces
│   └── services/
│       ├── auth.service.ts         # Login / role switching
│       ├── data.service.ts         # All mock data + state mutations (signals)
│       └── toast.service.ts        # Global toast notifications
├── app.component.ts                # Root: login vs app shell
├── app.config.ts                   # Router config
└── app.routes.ts                   # Route definitions
```

## Key Features
- **Angular 17** with standalone components, signals, and `@for`/`@if` control flow
- **Role switching** — HomeFirst vs Kleeto views in one app
- **Kleeto workflow**: Request for Pickup → Pickup Scheduled → Intransit → Delivered
- **Vault Management**: 3-level drill-down (Branch → LAI → Document Items) with Acknowledge toggle and Vault status toggle
- **Reactive state** using Angular signals — all counts/tables update instantly

## Connect to Salesforce
Replace the mock data in `data.service.ts` with actual HTTP calls to your Salesforce Connected App API. The signal-based state will propagate updates automatically throughout the UI.
