# SharePad

Write a notebook of markdown pages and share it with a single link. **No signup, no login.**

## What it does

- **Multi-page notebooks** behind one address, with a tabbed page index
- **Paste and share** — drop text in, get a link back, title and address chosen for you
- **Your own address** — `/n/kitchen-reno`, checked for availability as you type
- **Expiry** — 10 days by default, adjustable up to a year or off entirely
- **Two links** — a view link to hand out, a secret edit link you keep
- **Open editing** — optionally let anyone with the link write in it too
- **Password lock**, read-only mode, and burn-after-reading
- **Version history** — the last ten drafts of every page, restorable
- **Comments** from readers, no account required
- **PDF export** — the whole notebook as a clean document, no handwriting
- **Markdown export** and `.md` import
- **Paper and typeface** — ruled, grid, dotted or plain; handwritten, serif, sans or mono

## Running it

```bash
git clone https://github.com/Varshithvhegde/sharepad.git
cd sharepad
npm install

cp .env.example .env.local   # then fill in your Supabase keys

npm run dev
```

Apply the SQL in `supabase/migrations/` in order via the Supabase SQL editor, or
`supabase db push` if you have the CLI linked.

### Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## How ownership works

There are no accounts. Creating a notebook mints a 32-byte edit token; only its
SHA-256 hash is stored. Whoever holds the token owns the notebook, and the browser
keeps a copy in `localStorage` so it shows up on the home page.

```
/n/{slug}        read it
/n/{slug}/print  the printable document
/e/{token}       edit it
/recover         paste an edit link to get back in
```

Opening a notebook for public editing lets visitors change *content*. Settings,
expiry and deletion always require the edit token, so a visitor can't lock the
owner out.

## Design

Paper and ink: Kalam and Architects Daughter, taped sticky-note cards, and a red
margin rule down each page. Printed output deliberately drops all of it in favour
of Source Serif and a plain white sheet.

## Stack

Next.js 16 (App Router) · Supabase Postgres · Tailwind CSS 4 · react-markdown

## License

MIT

## Author

[Varshith Hegde](https://github.com/Varshithvhegde)
