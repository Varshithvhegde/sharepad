# SharePad

**Write a notebook of markdown pages. Share it with one link. No signup, no login.**

Live at **[sharepad.in](https://sharepad.in)** · [Report a bug](https://github.com/Varshithvhegde/sharepad/issues) · [Privacy policy](https://sharepad.in/privacy)

![SharePad editor — split view with markdown on the left and live preview on the right](./public/screenshot.png)

---

## Table of contents

- [What is SharePad?](#what-is-sharepad)
- [Features](#features)
- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Image uploads (Cloudflare R2)](#image-uploads-cloudflare-r2)
- [Expiry and cleanup](#expiry-and-cleanup)
- [Security and privacy](#security-and-privacy)
- [Analytics (optional)](#analytics-optional)
- [Project structure](#project-structure)
- [API routes](#api-routes)
- [GitHub Actions](#github-actions)
- [Deployment](#deployment)
- [Tech stack](#tech-stack)
- [License](#license)

---

## What is SharePad?

SharePad is a zero-friction note-sharing app. You create a **notebook** — a collection of **markdown pages** behind a single URL — and hand out the link. Readers open it in their browser with no account. You keep a secret **edit link** to change content, adjust settings, or delete the notebook later.

It is built for situations where you need to share formatted text quickly: meeting notes, project docs, checklists, readme drafts, temporary handoffs, or anything that deserves more structure than a chat message but less ceremony than a wiki.

**Free forever. No signup required.**

---

## Features

### Writing and editing

| Feature | Description |
|---------|-------------|
| **Multi-page notebooks** | One link, many pages — sidebar index, reorder, duplicate, delete |
| **Markdown + GFM** | Tables, task lists, strikethrough, autolinks, fenced code blocks |
| **Syntax highlighting** | Code blocks rendered with `rehype-highlight` |
| **Split editor** | Write / split / read modes with synced scroll |
| **Auto-save** | Debounced save while typing |
| **Undoable toolbar** | Bold, links, code blocks, etc. participate in Ctrl+Z |
| **Tab indentation** | Tab / Shift+Tab indent lists and blocks in the editor |
| **Keyboard shortcuts** | `⌘S` save, `⌘B` bold, `⌘I` italic, `⌘/` cycle modes, `?` help |
| **Version history** | Last 10 drafts per page, restorable |
| **Page templates** | Blank, meeting notes, project brief, journal, weekly plan |
| **Import `.md`** | Load a local markdown file into the editor |
| **Copy markdown** | One-click copy of the current page |
| **Formatting help** | In-editor popup explaining markdown syntax |

### Sharing and access

| Feature | Description |
|---------|-------------|
| **Quick paste-and-share** | Drop text at `/quick` — title and slug generated automatically |
| **Custom slugs** | Pick your URL: `/n/kitchen-reno`, checked live for availability |
| **Two links** | View link (`/n/slug`) to share; edit link (`/e/token`) to keep private |
| **Open editing** | Optionally let anyone with the view link write content |
| **Password lock** | Optional bcrypt-hashed password before viewing |
| **Read-only mode** | Freeze content for everyone (edit token still works for the owner) |
| **Burn after read** | View link works exactly once |
| **Visibility** | Public (indexable), unlisted (link-only), or private (view link blocked) |
| **QR code** | Generate a QR for the view link in the share panel |
| **Recover edit link** | Paste a lost edit URL at `/recover` |

### Appearance

| Feature | Description |
|---------|-------------|
| **Paper textures** | Ruled, grid, dotted, or plain |
| **Typefaces** | Handwritten, serif, sans, or monospace |
| **Red margin rule** | Notebook-style layout in view and edit modes |
| **Print / PDF** | `/n/slug/print` — clean serif document, table of contents, page breaks |
| **Markdown export** | Download the whole notebook as one `.md` file |

### Images

| Feature | Description |
|---------|-------------|
| **Paste, drop, or pick** | Images go straight into markdown as `![](url)` |
| **Client-side compression** | Resized to 1600px max edge, re-encoded as WebP before upload |
| **GIF support** | Animated GIFs pass through untouched |
| **Cloudflare R2 storage** | Zero egress cost at any volume |

### Other

| Feature | Description |
|---------|-------------|
| **Anonymous comments** | Per-page comments with a display name, no account |
| **View counter** | Anonymous view count on each notebook |
| **Saved notebooks** | Edit tokens stored in browser `localStorage`, listed on the home page |
| **Custom error pages** | Themed 404 and error screens |
| **SEO landing pages** | Use-case pages targeting common search phrases |
| **Accessibility** | Skip links, ARIA labels, keyboard navigation, tooltips |

---

## How it works

There are **no user accounts**. Ownership is token-based.

```
Create notebook
  → server generates a 32-byte edit token (shown once)
  → SHA-256 hash stored in Postgres
  → browser saves token in localStorage
  → user copies the edit URL
```

### URLs

| URL | Purpose |
|-----|---------|
| `/` | Home page |
| `/quick` | Paste text, get a link instantly |
| `/new` | Full notebook creation form |
| `/recover` | Recover access via edit link |
| `/n/{slug}` | **View** a notebook (read mode) |
| `/n/{slug}/print` | Print-friendly / PDF view |
| `/e/{token}` | **Edit** a notebook (owner mode) |
| `/privacy` | Privacy policy |

### Permission model

- **View link** — read pages, comment (if enabled), export
- **Edit link** — change content, pages, settings, delete notebook
- **Open editing** — visitors with the view link can edit *content* only; settings, expiry, and deletion always require the edit token

This means a visitor to an open-edit notebook cannot lock the owner out or change the password.

---

## Quick start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- Optional: [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket for image uploads

### Run locally

```bash
git clone https://github.com/Varshithvhegde/sharepad.git
cd sharepad
npm install

cp .env.example .env.local
# Fill in your Supabase keys (see below)

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

### Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` is used for canonical URLs, the sitemap, `llms.txt`, Open Graph tags, and links in the share panel. Set it to your production domain (e.g. `https://sharepad.in`) when deployed.

### Optional — analytics

```env
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Without a PostHog token, analytics is completely skipped.

### Optional — image uploads

All five must be set or image upload stays disabled:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=sharepad
R2_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
```

`R2_PUBLIC_BASE_URL` is the public URL from your bucket's Settings tab (enable the `r2.dev` subdomain or attach a custom domain like `https://img.sharepad.in`).

### Optional — image sweep

```env
IMAGE_SWEEP_SECRET=any-long-random-string
```

Used by the weekly GitHub Action to authenticate `/api/images/sweep`. Add the same value as a repository secret in GitHub.

---

## Database setup

SQL migrations live in `supabase/migrations/`. Apply them **in order**:

| Migration | What it adds |
|-----------|--------------|
| `20240101000000_initial_schema.sql` | Notebooks, pages, versions, comments, RLS, RPC functions |
| `20240102000000_paper_textures.sql` | Paper texture themes (ruled, grid, dot, plain) |
| `20240103000000_open_editing_and_fonts.sql` | Open editing toggle, font selection |
| `20240104000000_purge_expired_notebooks.sql` | Nightly expiry purge via `pg_cron` |
| `20240105000000_restrict_rpc_execution.sql` | Lock down RPC to service role |
| `20240106000000_images_and_rate_limits.sql` | Images table, rate limiting |

### Apply migrations

**Option A — Supabase CLI** (recommended):

```bash
supabase link --project-ref your-project-ref
supabase db push
```

**Option B — SQL editor:**

Open the Supabase dashboard → SQL editor → paste and run each migration file in order.

### Schema overview

```
notebooks        slug, title, edit_token_hash, password_hash, settings, expires_at
pages            notebook_id, title, content, sort_order, icon, pinned
page_versions    page_id, content (last 10 kept per page)
comments         page_id, author_name, content
images           notebook_id, object_key, byte_size, content_type
rate_limits      bucket, identity, window_start, hits
```

Row-level security is enabled on all tables. The app reaches the database through the **service role key** on the server — there are no public write policies.

---

## Image uploads (Cloudflare R2)

Images are stored in **Cloudflare R2**, not Supabase Storage. R2 charges nothing for egress, which matters when a widely shared notebook is opened repeatedly.

### How upload works

1. User pastes, drops, or picks an image in the editor
2. Browser compresses it (max 1600px edge, WebP at 82% quality; GIFs pass through)
3. Server sniffs the file's magic bytes (not the declared Content-Type)
4. Object stored in R2 under `{notebook_id}/{random}.{ext}`
5. Row inserted in the `images` table
6. Markdown link inserted: `![alt](https://pub-...r2.dev/...)`

### Limits

| Limit | Value |
|-------|-------|
| Max file size (after compression) | 5 MB |
| Max images per notebook | 50 |
| Upload rate limit | 60 per IP per 10 minutes |

Rate limiting uses an atomic Postgres function so two simultaneous requests cannot both slip through.

### Cleanup

| Trigger | What happens |
|---------|--------------|
| **Notebook deleted** | All R2 objects for that notebook removed immediately |
| **Notebook expired** | Nightly DB purge removes the row; weekly sweep deletes orphaned R2 objects |
| **Image removed from markdown** | File stays in R2 until notebook deletion (not content-aware yet) |

---

## Expiry and cleanup

Notebooks expire based on an **absolute timestamp**, not a rolling countdown.

| Setting | Default |
|---------|---------|
| Default lifetime | 10 days |
| Options | 1 day, 7 days, 10 days, 30 days, 90 days, 1 year, never |

### Timeline

1. **Expiry moment** — view and print links return 404 immediately
2. **3 days later** — `pg_cron` job deletes the notebook row (pages, versions, comments cascade)
3. **Burn-after-read** — removed 1 day after the single view

The owner can still open the edit link during the 3-day grace window and extend the expiry.

```sql
-- Runs nightly at 03:15 UTC
select cron.schedule(
  'purge-expired-notebooks', '15 3 * * *',
  $$select public.purge_expired_notebooks()$$
);
```

---

## Security and privacy

### Token-based ownership

- Edit tokens are 32 random bytes, shown once at creation
- Only the SHA-256 hash is stored in the database
- Tokens are sent via the `X-Edit-Token` header on API requests
- Tokens saved in browser `localStorage` for the "Saved notebooks" list

**There is no end-to-end encryption.** Notebook content is stored in plaintext in Postgres. Do not put secrets in a notebook unless you also password-lock it and accept the trust model.

### HTML in markdown

Raw HTML is parsed and then **sanitized** against GitHub's schema before rendering. This is not optional — notebooks with open editing can be written to by anyone with the link, and an injected script would run on the owner's page (where the edit token lives in the URL).

Blocked: `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, event-handler attributes, `javascript:` URLs.

Allowed extras: `<mark>`, `<abbr>`, `<figure>`, `<figcaption>`, table alignment attributes.

Schema: `lib/markdown-schema.ts`

### Password protection

View passwords are hashed with bcrypt. A successful unlock sets an httpOnly cookie (`sp_unlock_{slug}`) for 24 hours.

### Privacy policy

Full details at [/privacy](https://sharepad.in/privacy). Summary:

- No accounts, no email collection
- Content stored in Supabase Postgres
- Edit tokens in browser localStorage only
- Optional PostHog analytics (no content, no tokens, no session recording on notebook pages)
- Third parties: Supabase (database), Cloudflare R2 (images, if enabled), PostHog (analytics, if enabled)

---

## Analytics (optional)

Analytics is **off by default**. Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` to enable it.

Privacy constraints baked in:

- **Autocapture off** — would record text people click on
- **Session recording off on notebook routes** — would record private notes being typed
- **No content in events** — only counts and setting names, never titles, slugs, or edit tokens
- **Memory-only persistence** — no cookies, no consent banner needed

Events are defined in `lib/analytics.ts` as a typed union.

---

## Project structure

```
sharepad/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Home page
│   ├── quick/page.tsx          # Paste-and-share
│   ├── new/page.tsx            # Create notebook form
│   ├── recover/page.tsx        # Recover edit link
│   ├── privacy/page.tsx        # Privacy policy
│   ├── n/[slug]/               # View + print routes
│   ├── e/[token]/              # Edit route
│   ├── api/                    # REST API routes
│   ├── llms.txt/               # AI/LLM discovery file
│   └── sitemap.ts, robots.ts   # SEO
├── components/
│   ├── NotebookEditor.tsx      # Main editor shell
│   ├── SettingsPanel.tsx       # Notebook settings + delete
│   ├── SharePanel.tsx          # Share links + QR
│   ├── MarkdownPreview.tsx     # Rendered markdown
│   ├── editor/                 # Toolbar, comments, history
│   └── marketing/              # Header, footer, FAQ, landing pages
├── lib/
│   ├── supabase/               # Client, server, admin clients
│   ├── api-auth.ts             # Token validation
│   ├── images.ts               # Upload limits + magic-byte sniffing
│   ├── r2.ts                   # Cloudflare R2 client
│   ├── rate-limit.ts           # IP-based rate limiting
│   ├── notebooks.ts            # TOC, expiry checks, sanitization
│   ├── local-storage.ts        # Saved edit tokens
│   └── ...
├── supabase/migrations/        # Database schema (apply in order)
├── public/                     # Static assets (icon, screenshot)
└── .github/workflows/          # Keep-alive + image sweep cron jobs
```

---

## API routes

All write operations require the `X-Edit-Token` header (or open editing for content changes).

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/notebooks` | Create a notebook |
| `GET/PATCH/DELETE` | `/api/notebooks/[id]` | Read, update, or delete a notebook |
| `POST` | `/api/notebooks/unlock/[slug]` | Unlock password-protected notebook |
| `POST` | `/api/pages` | Add a page |
| `PATCH/DELETE` | `/api/pages/[id]` | Update or delete a page |
| `GET/POST` | `/api/pages/[id]/comments` | List or add comments |
| `GET` | `/api/pages/[id]/versions` | Page version history |
| `GET` | `/api/export/[slug]` | Download notebook as markdown |
| `GET` | `/api/slug-check?slug=` | Check slug availability |
| `POST` | `/api/images` | Upload an image |
| `POST` | `/api/images/sweep` | Remove orphaned R2 objects (authenticated) |
| `GET` | `/api/ping` | Health check (used by keep-alive workflow) |

---

## GitHub Actions

Two scheduled workflows keep production healthy:

### Keep Supabase alive

`.github/workflows/keep-alive.yml` — pings `/api/ping` every 3 days so the free-tier Supabase project does not pause after 7 days of inactivity.

### Sweep orphaned images

`.github/workflows/sweep-images.yml` — runs weekly, calls `/api/images/sweep` to delete R2 objects whose notebook no longer exists in Postgres.

Both workflows accept an optional `SITE_URL` repository variable (defaults to `https://sharepad.in`). The sweep workflow requires the `IMAGE_SWEEP_SECRET` repository secret.

---

## Deployment

SharePad is a standard Next.js app. Deploy to [Vercel](https://vercel.com), [Railway](https://railway.app), or any Node.js host.

### Checklist

1. Set all required environment variables in your hosting dashboard
2. Apply Supabase migrations
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain
4. (Optional) Configure R2 for image uploads
5. (Optional) Add `IMAGE_SWEEP_SECRET` to GitHub repository secrets
6. (Optional) Add PostHog token for analytics

### Supabase free tier

The included keep-alive workflow prevents the project from pausing. If it does pause, wake it from the Supabase dashboard and the next scheduled ping will keep it alive.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Database | [Supabase](https://supabase.com) (Postgres + `pg_cron`) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm + rehype-highlight |
| Images | [Cloudflare R2](https://developers.cloudflare.com/r2/) via aws4fetch |
| Analytics | [PostHog](https://posthog.com) (optional) |
| Icons | [Lucide React](https://lucide.dev) |
| Fonts | Kalam, Architects Daughter, Source Serif 4, Inter, JetBrains Mono |

---

## License

MIT — see [LICENSE](LICENSE) if present, otherwise MIT applies to this repository.

## Author

[Varshith Hegde](https://github.com/Varshithvhegde)

Support the project: [Ko-fi](https://ko-fi.com/varshithvhegde) · [GitHub Issues](https://github.com/Varshithvhegde/sharepad/issues)
