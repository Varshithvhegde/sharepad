# SharePad — Product Plan

> Share multi-page markdown notebooks instantly. No signup. One link, many pages.

## Core Philosophy

- **Zero friction**: Create → share → done. No accounts, no email verification.
- **Token-based ownership**: A secret edit link is your "password" to manage a notebook.
- **One link, many pages**: A notebook is a collection of markdown pages under a single share URL.

---

## MVP (v0.1) — Implemented

| Feature | Description |
|---------|-------------|
| **Instant create** | Title + optional custom slug → notebook with edit token |
| **Multi-page notebooks** | Add, rename, reorder, delete pages in one notebook |
| **Markdown editor** | Split view: write MD on left, live preview on right |
| **GFM support** | Tables, task lists, strikethrough, autolinks |
| **Syntax highlighting** | Code blocks with rehype-highlight |
| **Share links** | View URL (`/n/slug`) + Edit URL (`/e/token`) |
| **Custom slugs** | Pick your URL: `sharepad.app/n/my-project-notes` |
| **Password lock** | Optional password to view (bcrypt hashed) |
| **Read-only mode** | Toggle notebook to view-only (edit token still works) |
| **Local recovery** | Edit tokens saved in browser localStorage ("My Notebooks") |
| **Embed** | iframe + script tag for any page |
| **Export** | Download all pages as `.md` zip or single page |
| **Copy markdown** | One-click copy raw MD |
| **QR code** | Generate QR for mobile sharing |
| **OG meta tags** | Rich social previews per notebook/page |
| **Table of contents** | Auto-generated from headings in preview |
| **View counter** | Anonymous view count per notebook |
| **Expiry** | Optional auto-delete after N days |
| **Theme** | Dark (BillForge) / Paper (PostItUp) / Auto per notebook |
| **Burn after read** | One-time view link (optional) |
| **Anonymous comments** | Per-page comments with display name |
| **Version snapshots** | Last 10 edits saved per page |
| **Search** | Full-text search across pages in a notebook |
| **Pin pages** | Pin important pages to top of sidebar |
| **Page icons** | Emoji icon per page |
| **Cover + description** | Notebook metadata for sharing |
| **Keyboard shortcuts** | `Cmd+S` save, `Cmd+B` bold, `Cmd+/` toggle preview |
| **Auto-save** | Debounced save every 2s while editing |
| **Responsive** | Mobile-friendly editor with collapsible sidebar |

---

## v0.2 — Next Up

| Feature | Description |
|---------|-------------|
| **Real-time collab** | Supabase Realtime for live multi-user editing |
| **Short links** | `/s/abc123` redirect to full slug |
| **Custom domains** | Point your domain to a notebook |
| **Mermaid diagrams** | Render flowcharts, sequence diagrams |
| **LaTeX math** | KaTeX for equations |
| **File attachments** | Upload images/files via Supabase Storage |
| **Templates** | Meeting notes, README, changelog, retro |
| **Duplicate notebook** | Fork any public notebook |
| **Import** | Paste MD, upload `.md` / `.zip` |
| **Print / PDF export** | Print-friendly stylesheet + PDF generation |
| **Presentation mode** | Slide-deck view from `# headings` |
| **Diff view** | Compare version snapshots |
| **Webhooks** | Notify on edit (for automation) |
| **API access** | Read-only public API for published notebooks |
| **Rate limiting** | IP-based limits on create/comment |
| **Spam protection** | Honeypot + turnstile on comments |
| **Analytics dashboard** | Views over time (token-gated) |
| **PWA** | Install as app, offline read cached pages |
| **i18n** | UI in multiple languages |

---

## v0.3 — Future

| Feature | Description |
|---------|-------------|
| **E2E encryption** | Client-side encrypt before store |
| **Team workspaces** | Optional login for org features only |
| **Public directory** | Discover public notebooks |
| **Reactions** | 👍 on pages without comments |
| **Backlinks** | Wiki-style `[[page]]` links |
| **Graph view** | Visualize page connections |
| **AI assist** | Summarize, improve writing (opt-in) |
| **Notion import** | Migrate from Notion export |
| **GitHub sync** | Push notebook to a repo |
| **Scheduled publish** | Go live at a specific time |
| **Access logs** | Who viewed when (IP hashed) |
| **Custom CSS** | Inject styles into public view |
| **Plugin system** | Custom MD remark plugins |

---

## Auth Model (No Login)

```
Create notebook
  → generates edit_token (32 bytes, shown once)
  → stores SHA-256 hash in DB
  → user saves token in localStorage + copies edit URL

View:  GET /n/{slug}           → public read (if not password/expired)
Edit:  GET /e/{edit_token}     → validates token → editor session cookie
Admin: POST /api/* with X-Edit-Token header
```

Password-protected notebooks:
```
POST /api/notebooks/{id}/unlock { password }
  → sets httpOnly cookie `sp_unlock_{slug}` for 24h
```

---

## Database Schema

```
notebooks     — slug, title, edit_token_hash, password_hash, settings
pages         — notebook_id, slug, title, content, sort_order, icon, pinned
page_versions — page_id, content snapshot
comments      — page_id, author_name, content
view_events   — notebook_id, fingerprint (for unique views)
```

---

## Design System — BillForge × PostItUp Fusion

| Element | Source | Value |
|---------|--------|-------|
| Background | BillForge | `#0c0c0e` dark shell |
| Accent | BillForge | `#f97316` orange |
| Paper mode | PostItUp | `#faf9f6` warm paper |
| Fonts | Fusion | Inter (UI) + Instrument Serif (headlines) + Kalam (sketch accents) |
| Cards | PostItUp | Slight rotation, tape effect, sticky colors |
| Nav | BillForge | Glass blur, subtle borders |
| Grid | PostItUp | Dot grid background overlay |

---

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** (Postgres + Realtime + Storage later)
- **Tailwind CSS 4**
- **react-markdown** + remark-gfm + rehype-highlight

---

## Repo

GitHub: [varshithvhegde/sharepad](https://github.com/varshithvhegde/sharepad)
