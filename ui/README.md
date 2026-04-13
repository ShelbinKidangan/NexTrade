# NexTrade UI

Next.js 16 frontend for NexTrade — AI-native B2B platform.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui components
- next-themes for dark mode

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open http://localhost:3000

## Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register (no top nav)
│   ├── (app)/           # Authenticated pages (with top nav)
│   │   ├── dashboard/
│   │   ├── discover/
│   │   ├── catalog/
│   │   ├── rfqs/
│   │   ├── messages/
│   │   ├── connections/
│   │   └── settings/
│   ├── (public)/        # Public business profiles
│   │   └── business/[uid]/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/              # shadcn/ui primitives
│   └── app/             # App-specific components
│       ├── top-nav.tsx
│       ├── business-card.tsx
│       └── providers.tsx
└── lib/
    ├── api.ts           # API client
    ├── auth.tsx         # Auth context
    ├── types/           # TypeScript types
    └── utils.ts         # cn(), fmtDate()
```

## Design System

- **Layout:** Top navigation (not sidebar) — NexTrade is a discovery platform
- **Colors:** Blue accent, Notion warm-gray palette
- **Typography:** Inter (sans), JetBrains Mono (mono)
- **Components:** shadcn/ui with `data-slot` attributes
- **Dark mode:** Supported via `next-themes`

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | NexTrade API base URL | `http://localhost:5000` |
