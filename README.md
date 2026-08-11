# SharePad

Share multi-page markdown notebooks instantly — **no signup, no login**.

One link. Many pages. Password lock. Embed anywhere.

## Features

- Multi-page markdown notebooks under a single share URL
- Live split editor with GFM preview & syntax highlighting
- Secret edit link (token-based ownership, no accounts)
- Custom slugs, password lock, read-only mode
- Embed via iframe or script tag
- Export all pages as Markdown
- QR codes, auto-expire, burn-after-read
- Anonymous comments & version history
- BillForge × PostItUp fusion UI (dark + paper themes)

## Quick Start

```bash
# Clone
git clone https://github.com/varshithvhegde/sharepad.git
cd sharepad

# Install
npm install

# Set up env
cp .env.example .env.local
# Add your Supabase URL, anon key, and service role key

# Run Supabase migration
# Paste supabase/migrations/20240101000000_initial_schema.sql in Supabase SQL editor

# Dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Create a notebook → Save your edit link.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## How It Works

1. **Create** a notebook → get a secret edit token
2. **Edit** at `/e/{token}` — add pages, write markdown
3. **Share** the view link `/n/{slug}` — read-only for others
4. **Recover** notebooks from browser localStorage ("Your notebooks" on homepage)

## Tech Stack

- Next.js 16 (App Router)
- Supabase (Postgres)
- Tailwind CSS 4
- react-markdown + remark-gfm

## Roadmap

See [PLAN.md](./PLAN.md) for the full feature roadmap.

## License

MIT

## Author

[Varshith Hegde](https://github.com/varshithvhegde)
