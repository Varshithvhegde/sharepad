# SharePad Android App — Product Requirements Document

**Version:** 1.0  
**Date:** August 14, 2026  
**Production API base URL:** `https://sharepad.in`  
**Development API base URL:** `http://10.0.2.2:3000` (Android emulator → host machine) or `http://localhost:3000`  
**Web reference:** [https://sharepad.in](https://sharepad.in) · [GitHub](https://github.com/Varshithvhegde/sharepad)

---

## 1. Executive summary

SharePad is a no-signup markdown notebook: create a notebook, get a secret edit link, share a public view link. The web app at **sharepad.in** already has a complete backend (Next.js API routes → Supabase Postgres → Cloudflare R2 for images). **This Android app must be a native client of that backend — no new database, no separate server.**

The Android app should feel like carrying the same paper notebook in your pocket: handwritten warmth, ruled/grid/dot paper textures, split editor + live preview, page sidebar, sharing, settings, version history, comments, and image uploads — all powered by the existing REST APIs documented in Section 4.

---

## 2. Goals and non-goals

### 2.1 Goals

| # | Goal |
|---|------|
| G1 | **Full feature parity** with the web editor for create, edit, view, share, settings, pages, images, comments, version history, export |
| G2 | **Zero new backend infrastructure** — only call `https://sharepad.in/api/*` (plus two tiny read endpoints described in §4.15) |
| G3 | **Token-based ownership** — store edit tokens locally (like web `localStorage`); no accounts |
| G4 | **Deep links** — open `sharepad.in/n/{slug}` and `sharepad.in/e/{token}` in the app |
| G5 | **Paper aesthetic** on mobile — warm off-white, ink borders, sketch typography for headings |
| G6 | **Autosave** — debounced PATCH on content changes (800 ms, matching web) |

### 2.2 Non-goals (v1)

| # | Non-goal |
|---|----------|
| NG1 | User accounts / login |
| NG2 | Offline-first sync engine (show offline banner; queue saves for v2) |
| NG3 | Push notifications |
| NG4 | In-app browser for marketing pages (`/blog`, `/use-cases/*`) — use Chrome Custom Tabs |
| NG5 | PostHog analytics in v1 (optional v1.1) |
| NG6 | Print/PDF layout engine (link to web print view or export `.md`) |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SharePad Android App                      │
│  Jetpack Compose · Material 3 · Retrofit/OkHttp · Coil     │
├─────────────────────────────────────────────────────────────┤
│  UI Layer          │  ViewModels · Navigation · Theme       │
│  Domain Layer      │  NotebookRepository · PageRepository   │
│  Data Layer        │  SharePadApi (Retrofit) · TokenStore     │
│                    │  EncryptedSharedPreferences              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              sharepad.in (existing Next.js backend)        │
│  /api/notebooks · /api/pages · /api/images · /api/export  │
├─────────────────────────────────────────────────────────────┤
│  Supabase Postgres          │  Cloudflare R2 (images)       │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Recommended tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | Kotlin 2.x | |
| UI | Jetpack Compose + Material 3 | Adaptive layouts for tablets |
| Navigation | Navigation Compose | Type-safe routes |
| Networking | Retrofit 2 + OkHttp 4 | Interceptor injects `X-Edit-Token` |
| JSON | kotlinx.serialization or Moshi | Mirror `lib/types.ts` |
| Images | Coil 3 | Load R2 URLs in preview |
| Markdown render | Markwon or Compose Markdown | GFM: tables, task lists, code blocks |
| Local storage | EncryptedSharedPreferences | Edit tokens, unlocked slugs |
| Deep links | App Links (`sharepad.in`) | `android:autoVerify` |
| Min SDK | 26 (Android 8.0) | Encrypted prefs |
| Target SDK | 35 | |

### 3.2 Package structure (suggested)

```
com.sharepad.app/
├── data/
│   ├── api/SharePadApi.kt
│   ├── api/dto/          # NotebookDto, PageDto, …
│   ├── repository/
│   └── local/TokenStore.kt
├── domain/model/
├── ui/
│   ├── theme/            # PaperTheme.kt
│   ├── home/
│   ├── create/
│   ├── editor/
│   ├── view/
│   ├── recover/
│   ├── settings/
│   └── components/
└── MainActivity.kt
```

---

## 4. Complete backend API reference

All URLs are relative to **`BASE_URL`** (`https://sharepad.in`).

### 4.1 Authentication model

SharePad has **no user accounts**. Access is controlled by:

| Mechanism | Header / param | Used for |
|-----------|----------------|----------|
| Edit token (owner) | `X-Edit-Token: {64-char hex}` or `?token=` | Notebook settings, version history, owner edits |
| Open editing | No token; notebook has `allow_public_edit: true` | Anyone can PATCH pages |
| Password | Unlock via POST body; web uses cookie — **Android uses JSON response + local cache** | Password-protected view/edit |

**Edit token format:** exactly 64 hexadecimal characters (`/^[a-f0-9]{64}$/i`).

**Example header (all authenticated writes):**

```http
X-Edit-Token: 9f2c8a1b4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
Content-Type: application/json
```

---

### 4.2 Health check

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `https://sharepad.in/api/ping` |
| **Auth** | None |

**Response 200:**

```json
{ "ok": true }
```

Use on app launch or settings → “Check connection”.

---

### 4.3 Create notebook

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `https://sharepad.in/api/notebooks` |
| **Auth** | None |

**Request body** (`CreateNotebookInput`):

```json
{
  "title": "My notebook",
  "slug": "my-notebook",
  "description": "Optional subtitle",
  "emoji": "rocket",
  "theme": "plain",
  "font": "hand",
  "password": "optional-secret",
  "allowPublicEdit": false,
  "expiresInDays": 10,
  "pages": [
    {
      "title": "First page",
      "icon": "file",
      "content": "# Hello\n\nMarkdown here."
    }
  ]
}
```

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `title` | string | `"Untitled notebook"` | |
| `slug` | string? | auto-generated | Lowercase, `[a-z0-9-]`, not reserved |
| `description` | string? | null | |
| `emoji` | string? | `"notebook"` | Icon id from §8.4 |
| `theme` | `"ruled"` \| `"grid"` \| `"dot"` \| `"plain"` | `"plain"` | Paper texture |
| `font` | `"hand"` \| `"serif"` \| `"sans"` \| `"mono"` | `"hand"` | |
| `password` | string? | none | Sets `has_password: true` |
| `allowPublicEdit` | boolean | `false` | Anyone with view link can edit |
| `expiresInDays` | number \| `null` | `10` | `null` = never expires |
| `pages` | array? | welcome template | Initial pages |

**Response 200:**

```json
{
  "notebook": { /* Notebook object, §4.14 */ },
  "editToken": "64-char-hex-string",
  "editUrl": "/e/64-char-hex-string",
  "viewUrl": "/n/my-notebook"
}
```

**Errors:** `400` invalid slug, `409` slug taken, `500` server error.

**Android action:** Persist `{ slug, title, editToken, createdAt }` to `TokenStore` immediately after create.

---

### 4.4 Get notebook metadata (by UUID)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `https://sharepad.in/api/notebooks/{notebookId}` |
| **Auth** | None |

**Response 200:**

```json
{
  "notebook": { /* Notebook, no secrets */ }
}
```

**Note:** Does **not** return pages. Use §4.15 load endpoints or aggregate from export POST.

---

### 4.5 Update notebook settings

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `https://sharepad.in/api/notebooks/{notebookId}` |
| **Auth** | `X-Edit-Token` required |

**Request body** (`UpdateNotebookInput` — all fields optional):

```json
{
  "title": "Renamed",
  "description": "New description",
  "emoji": "study",
  "theme": "ruled",
  "font": "serif",
  "visibility": "unlisted",
  "read_only": false,
  "allow_public_edit": true,
  "burn_after_read": false,
  "allow_comments": true,
  "password": "newpass",
  "expiresInDays": 30
}
```

| Field | Notes |
|-------|-------|
| `password: null` | Removes password |
| `expiresInDays: null` | Never expires |
| `visibility` | `"public"` \| `"unlisted"` \| `"private"` |

**Response 200:** `{ "notebook": { … } }`

---

### 4.6 Delete notebook

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `https://sharepad.in/api/notebooks/{notebookId}` |
| **Auth** | `X-Edit-Token` required |

**Response 200:** `{ "ok": true }`

Also deletes all R2 images for that notebook server-side.

**Android action:** Remove from `TokenStore`; navigate to Home with snackbar “Notebook deleted”.

---

### 4.7 Check slug availability

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `https://sharepad.in/api/slug-check?slug={slug}` |
| **Auth** | None |

**Response 200:**

```json
{ "available": true, "reason": "ok" }
```

| `reason` | Meaning |
|----------|---------|
| `"ok"` | Available |
| `"taken"` | Already used |
| `"invalid"` | Bad format or reserved word |
| `"empty"` | Missing slug param |

Debounce 400 ms in Create Notebook UI while user types custom link.

---

### 4.8 Unlock password-protected notebook

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `https://sharepad.in/api/notebooks/unlock/{slug}` |
| **Auth** | None |

**Request body:**

```json
{ "password": "secret" }
```

**Response 200:**

```json
{
  "ok": true,
  "notebook": { /* Notebook */ }
}
```

**Web behavior:** Also sets httpOnly cookie `sp_unlock_{slug}=1` (24 h).

**Android behavior:** Ignore cookie. On success:
1. Use `notebook` from JSON immediately.
2. Store `unlocked_{slug}` + expiry timestamp in EncryptedSharedPreferences (24 h TTL).
3. Call §4.15 view load endpoint (or use pages from a follow-up load).

**Errors:** `400` no password on notebook, `401` wrong password, `404` not found.

---

### 4.9 Create page

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `https://sharepad.in/api/pages` |
| **Auth** | `X-Edit-Token` **or** open-edit notebook |

**Request body:**

```json
{
  "notebook_id": "uuid",
  "title": "Meeting notes",
  "slug": "meeting-notes",
  "content": "## Agenda\n",
  "icon": "checklist"
}
```

**Response 200:** `{ "page": { /* Page */ } }`

**Limits:** Max **200 pages** per notebook → `400`.

---

### 4.10 Update page

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `https://sharepad.in/api/pages/{pageId}` |
| **Auth** | `X-Edit-Token` or open-edit |

**Request body** (partial):

```json
{
  "title": "Renamed page",
  "content": "Updated markdown",
  "icon": "code",
  "slug": "new-page-slug",
  "sort_order": 2,
  "pinned": true
}
```

**Response 200:** `{ "page": { … } }`

**Side effect:** When `content` changes, server saves previous content to `page_versions` (keeps last **10**).

**Android:** Debounce content PATCH **800 ms** after last keystroke. Show “Saving…” / “Saved” indicator in top bar.

---

### 4.11 Delete page

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `https://sharepad.in/api/pages/{pageId}` |
| **Auth** | `X-Edit-Token` or open-edit |

**Response 200:** `{ "ok": true }`

**Error 400:** Cannot delete last page (“A notebook needs at least one page”).

---

### 4.12 Page version history

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `https://sharepad.in/api/pages/{pageId}/versions` |
| **Auth** | `X-Edit-Token` required (owner only) |

**Response 200:**

```json
{
  "versions": [
    {
      "id": "uuid",
      "page_id": "uuid",
      "content": "previous markdown snapshot",
      "created_at": "2026-08-14T10:00:00.000Z"
    }
  ]
}
```

Up to 10 versions, newest first.

**Restore flow (client-side):** PATCH page with `content` from selected version (creates new version entry for current content).

---

### 4.13 Comments

| | |
|---|---|
| **GET** | `https://sharepad.in/api/pages/{pageId}/comments` |
| **POST** | same URL |

**GET auth:** None (public read if notebook allows comments).

**POST body:**

```json
{
  "author_name": "Alex",
  "content": "Great notes!"
}
```

**POST response 200:** `{ "comment": { … } }`

**POST error 403:** `"Comments disabled"` when `allow_comments: false`.

---

### 4.14 Export markdown

| | |
|---|---|
| **GET** | `https://sharepad.in/api/export/{slug}` |
| **POST** | `https://sharepad.in/api/export/{slug}` |

**GET** — Public download as `.md` file.

- **Response:** `Content-Type: text/markdown`
- **Body:** `# Notebook title\n\n# Page title\n\ncontent\n\n---\n…`
- Android: use DownloadManager or share intent with cached file.

**POST** — **Bootstrap edit session** (existing workaround).

- **Auth:** `X-Edit-Token`
- **Response 200:**

```json
{
  "notebook": { /* raw notebook row — ignore hash fields */ },
  "pages": [ /* Page[] */ ]
}
```

- **403:** slug in URL does not match token’s notebook.

**Limitation:** Requires knowing `slug` before call. Deep link `/e/{token}` does not include slug → **needs §4.15.2**.

---

### 4.15 Image upload

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `https://sharepad.in/api/images` |
| **Auth** | `X-Edit-Token` or open-edit |
| **Content-Type** | `multipart/form-data` |

**Form fields:**

| Field | Type | Required |
|-------|------|----------|
| `notebook_id` | string | yes |
| `file` | binary | yes |

**Response 200:**

```json
{
  "url": "https://images.sharepad.in/{notebookId}/{random}.webp",
  "bytes": 123456,
  "contentType": "image/webp"
}
```

**Limits:**

| Limit | Value |
|-------|-------|
| Max file size | 5 MB |
| Max images per notebook | 50 |
| Rate limit | 60 uploads / 10 min / IP |
| Allowed types | PNG, JPEG, WebP, GIF, AVIF |

**Android flow:**
1. Optional: resize longest edge to 1600 px before upload (matches web).
2. POST multipart.
3. Insert `![](url)` at cursor in editor.

**Errors:** `413` too large, `415` not an image, `429` rate limit (respect `Retry-After` header), `503` R2 not configured.

---

### 4.16 Required minimal backend additions (not a new backend)

The web app loads view/edit data **server-side** (HTML pages), not via public JSON. For Android v1, add **two routes** to the existing SharePad Next.js app:

#### 4.15.1 `GET /api/notebooks/view/{slug}`

Public read endpoint mirroring `app/n/[slug]/page.tsx` logic.

**Query params:** none  
**Optional header:** `X-Unlock-Password: {password}` (alternative to prior unlock POST)

**Response 200:**

```json
{
  "notebook": { /* Notebook */ },
  "pages": [ /* Page[], sorted pinned first */ ]
}
```

**Response 401:** `{ "error": "Password required", "has_password": true }`  
**Response 404:** expired, private, burn consumed, or not found

**Side effects (server):** increment view count; consume burn-after-read if applicable.

#### 4.15.2 `GET /api/notebooks/load`

Bootstrap edit session from token alone.

**Headers:** `X-Edit-Token: {token}`

**Response 200:**

```json
{
  "notebook": { /* Notebook */ },
  "pages": [ /* Page[] */ ],
  "editToken": "{same token}"
}
```

**Response 401/403:** missing or invalid token

This replaces the need to guess slug for `POST /api/export/{slug}` when opening `/e/{token}` deep links.

> **Implementation note:** These are ~40 lines each, reusing `stripSensitiveNotebook`, `sortPages`, `notebookAccessible`, and `getNotebookByEditToken` from the existing codebase. **No new infrastructure.**

---

### 4.17 API quick reference table

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/ping` | — | Health |
| POST | `/api/notebooks` | — | Create |
| GET | `/api/notebooks/{id}` | — | Metadata only |
| PATCH | `/api/notebooks/{id}` | Token | Settings |
| DELETE | `/api/notebooks/{id}` | Token | Delete |
| GET | `/api/notebooks/view/{slug}` | — | **View load (add)** |
| GET | `/api/notebooks/load` | Token | **Edit load (add)** |
| POST | `/api/notebooks/unlock/{slug}` | — | Password unlock |
| GET | `/api/slug-check?slug=` | — | Slug availability |
| POST | `/api/pages` | Token/open | Create page |
| PATCH | `/api/pages/{id}` | Token/open | Update page |
| DELETE | `/api/pages/{id}` | Token/open | Delete page |
| GET | `/api/pages/{id}/versions` | Token | History |
| GET | `/api/pages/{id}/comments` | — | List comments |
| POST | `/api/pages/{id}/comments` | — | Add comment |
| GET | `/api/export/{slug}` | — | Download `.md` |
| POST | `/api/export/{slug}` | Token | Export JSON |
| POST | `/api/images` | Token/open | Upload image |

---

### 4.18 Data models (mirror `lib/types.ts`)

```kotlin
// Enums
enum class PaperTexture { ruled, grid, dot, plain }
enum class NotebookFont { hand, serif, sans, mono }
enum class NotebookVisibility { public, unlisted, private }

data class Notebook(
    val id: String,
    val slug: String,
    val title: String,
    val description: String?,
    val emoji: String,
    val theme: PaperTexture,
    val font: NotebookFont,
    val visibility: NotebookVisibility,
    val read_only: Boolean,
    val allow_public_edit: Boolean,
    val burn_after_read: Boolean,
    val burn_consumed: Boolean,
    val expires_at: String?,
    val view_count: Int,
    val allow_comments: Boolean,
    val has_password: Boolean,
    val created_at: String,
    val updated_at: String
)

data class Page(
    val id: String,
    val notebook_id: String,
    val slug: String,
    val title: String,
    val content: String,
    val icon: String,
    val sort_order: Int,
    val pinned: Boolean,
    val created_at: String,
    val updated_at: String
)

data class SavedNotebook(
    val slug: String,
    val title: String,
    val editToken: String,
    val createdAt: String
)
```

---

## 5. Local storage and security

### 5.1 Token store (EncryptedSharedPreferences)

Key: `sharepad_saved_notebooks`

```json
[
  {
    "slug": "my-notes",
    "title": "My notes",
    "editToken": "64-char-hex",
    "createdAt": "2026-08-14T10:00:00Z"
  }
]
```

- Same concept as web `localStorage` key `sharepad:saved`.
- **Never** log edit tokens.
- **Never** send edit token in analytics URLs.
- Show “Copy edit link” as `https://sharepad.in/e/{token}` — warn user to treat like a password.

### 5.2 Password unlock cache

Key pattern: `unlock_{slug}` → expiry epoch millis (24 h after successful unlock).

### 5.3 Deep link handling

| URL pattern | Action |
|-------------|--------|
| `https://sharepad.in/n/{slug}` | ViewNotebookScreen |
| `https://sharepad.in/e/{token}` | `GET /api/notebooks/load` → EditorScreen |
| `https://sharepad.in/quick` | QuickShareScreen (optional: WebView or native) |
| `sharepad://n/{slug}` | Same as above |

Register intent filter in `AndroidManifest.xml` with `android:autoVerify="true"` for App Links.

---

## 6. Navigation map

```
                    ┌─────────────┐
                    │    Home     │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │   Create   │  │  Recover   │  │ Saved nb   │
    │  Notebook  │  │ Edit Link  │  │  (list)    │
    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                 ┌────────────────┐
                 │ Notebook Editor │◄──── Deep link /e/{token}
                 │  (edit mode)    │
                 └────────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  Settings  │  │   Share    │  │  Version   │
   │   Sheet    │  │   Sheet    │  │  History   │
   └────────────┘  └────────────┘  └────────────┘

    Deep link /n/{slug} ──► View mode (read-only UI)
                              │
                              ▼
                      Password Gate (if needed)
```

---

## 7. Screen-by-screen UI specification

### 7.1 Design system — “paper & ink”

Replicate web CSS variables from `app/globals.css`:

| Token | Hex | Usage |
|-------|-----|-------|
| `--paper` | `#FAF9F6` | Screen background |
| `--paper-2` | `#F2EDE4` | Secondary surfaces |
| `--paper-3` | `#E9E3D7` | Dividers, sidebar |
| `--ink` | `#1C1C1C` | Primary text, borders |
| `--ink-2` | `#5A5850` | Secondary text |
| `--ink-3` | `#6F6C64` | Hints, timestamps |
| `--ink-faint` | `#AAA89E` | Placeholders |
| `--rule` | `#CCC9BC` | Ruled lines |
| `--red` | `#C8443C` | Errors, destructive |
| `--tape-y` | `#FDE047` @ 72% | Selection highlight |

**Typography:**

| Role | Font | Android equivalent |
|------|------|-------------------|
| Display / H1 | Sketch (Caveat) | `Caveat` Google Font |
| Body (hand mode) | Kalam | `Kalam` Google Font |
| Body (serif) | Georgia-like | `Noto Serif` |
| Body (sans) | System sans | `Roboto` |
| Body (mono) | Monospace | `JetBrains Mono` |
| UI chrome | System default | Material 3 `Roboto` |

**Card style (“sketch box”):**
- White fill `#FFFFFF`
- Border: 1.8 dp solid `#1C1C1C`
- Shadow: offset 3×4 dp, low opacity (no heavy Material elevation)

**Paper textures** (draw behind editor):
- `ruled` — horizontal lines every 28 dp, `--rule` color
- `grid` — 20 dp grid
- `dot` — dots at intersections
- `plain` — solid `--paper`

---

### 7.2 Screen: Home

**Route:** `/`  
**Purpose:** Entry point — create, recover, open saved notebooks.

**Layout:**

```
┌──────────────────────────────────────┐
│  [SharePad logo]          [? Help]   │
│                                      │
│     A notebook for sharing           │
│     notes — no signup first.         │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  + Create a notebook           │  │  ← primary CTA, btn-ink style
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  🔗 Open with edit link        │  │  ← secondary
│  └────────────────────────────────┘  │
│                                      │
│  Your notebooks on this device       │
│  ┌────────────────────────────────┐  │
│  │ 🚀 Team retro    · 3 days left │  │
│  │ 📓 Trip plans    · Kept forever │  │
│  └────────────────────────────────┘  │
│                                      │
│  sharepad.in                         │
└──────────────────────────────────────┘
```

**Behaviors:**
- Saved list from `TokenStore`; tap → `GET /api/notebooks/load` with stored token.
- Swipe-to-remove from device list only (does not delete server notebook).
- Empty state: “Notebooks you create or open will show up here.”
- Expiry badge using same logic as web `expiryLabel()` — warn if ≤3 days left.

---

### 7.3 Screen: Create notebook

**Route:** `/new`

**Form fields:**

| Field | UI control | API mapping |
|-------|------------|-------------|
| Title | TextField | `title` |
| Custom link | TextField + live check | `slug` → `/api/slug-check` |
| Description | TextField (optional) | `description` |
| Icon | Grid picker (32 icons) | `emoji` |
| Paper | 4 swatches: ruled/grid/dot/plain | `theme` |
| Font | Chips: Hand / Serif / Sans / Mono | `font` |
| Password | TextField (optional) | `password` |
| Expires | Dropdown: 1d, 7d, 10d, 30d, 90d, 1y, Never | `expiresInDays` |
| Open editing | Switch | `allowPublicEdit` |

**Primary button:** “Create notebook” → `POST /api/notebooks` → navigate to Editor with token.

**Post-create dialog (blocking, non-dismissible):**

```
┌─────────────────────────────────────┐
│  Save your edit link                │
│                                     │
│  This is the only way back in.      │
│  We cannot recover it.              │
│                                     │
│  [https://sharepad.in/e/9f2c…]      │
│                                     │
│  [Copy link]  [Share…]              │
│                                     │
│  ☐ I saved this link                │
│  [ Open notebook ]  (disabled until  │
│                       checkbox)     │
└─────────────────────────────────────┘
```

---

### 7.4 Screen: Recover edit link

**Route:** `/recover`

**UI:** Multiline TextField — paste full URL or raw 64-char token.

**Validation:** Regex `/\/e\/([a-f0-9]{64})/i` or bare token.

**Action:** `GET /api/notebooks/load` → save to TokenStore → Editor.

**Error:** “That doesn't look like an edit link.”

---

### 7.5 Screen: Notebook editor (core)

**Route:** `/editor/{notebookId}` or loaded via token/slug.

**Modes:**

| Mode | Token | Editable | Settings | Share |
|------|-------|----------|----------|-------|
| `edit` | yes | yes* | yes | yes |
| `view` | no | no** | no | view link only |

\*Unless `read_only: true`  
\**Unless `allow_public_edit: true` (show edit affordances without token)

**Top app bar:**

```
┌──────────────────────────────────────────────────────────┐
│ [≡]  Title (editable)     [Saving…|Saved|Offline]  [⋮]  │
└──────────────────────────────────────────────────────────┘
```

**Menu (⋮):** Share · Settings · Version history · Export markdown · Help · Delete (edit only)

**Main layout — phone (portrait):**

```
┌──────────────────────────────────────┐
│ Top bar                              │
├──────────────────────────────────────┤
│  Tab: [ Write ] [ Preview ]          │  ← segmented control
├──────────────────────────────────────┤
│                                      │
│  Paper texture background            │
│  Markdown TextField (monospace)      │
│  OR rendered preview                 │
│                                      │
├──────────────────────────────────────┤
│  Page tabs / bottom sheet trigger    │
└──────────────────────────────────────┘
```

**Main layout — tablet / landscape:**

```
┌──────────┬───────────────────────────┐
│ Sidebar  │  Write │ Preview (split)   │
│ pages    │                           │
│ list     │                           │
└──────────┴───────────────────────────┘
```

**Sidebar (≡):**
- Notebook title + icon at top
- Sort: pinned first, then `sort_order`
- Each row: page icon + title + pin indicator
- Long-press: Pin, Rename, Delete, Duplicate (client duplicates via POST)
- Footer: “+ New page” → template picker

**Page templates** (from `lib/templates.ts`): Blank, Meeting notes, Daily journal, Project brief, Reading notes, Weekly review — copy exact markdown from web.

**Editor toolbar (Write tab):**
- Bold, Italic, Link, Heading, List, Code, Image (pick from gallery → upload), Table insert snippet

**Preview tab:**
- Render GFM: headings, tables, task lists, fenced code with syntax highlight, blockquotes, images via Coil
- Tap heading → scroll sync (optional v1.1)

**Autosave:**
- On `content` change: debounce 800 ms → `PATCH /api/pages/{id}`
- On `title` change: debounce 500 ms
- Show error snackbar on failure with Retry

**Keyboard shortcuts (hardware keyboard / tablet):**
- Ctrl+S → force save
- Ctrl+B / Ctrl+I → wrap selection

---

### 7.6 Bottom sheet: Share

**Content:**

| Row | Value | Action |
|-----|-------|--------|
| View link | `https://sharepad.in/n/{slug}` | Copy, Share intent |
| Edit link | `https://sharepad.in/e/{token}` | Copy (edit mode only), Share |
| QR code | Generated for view link | Expandable |
| Export | Download markdown | `GET /api/export/{slug}` |

**Visibility note:** If `visibility: private`, show warning “Only people with the link can find this.”

---

### 7.7 Bottom sheet: Settings

Mirror web `SettingsPanel.tsx` fields:

| Setting | Control | API field |
|---------|---------|-----------|
| Title | TextField | `title` |
| Description | TextField | `description` |
| Icon | Picker | `emoji` |
| Paper | 4 options | `theme` |
| Font | 4 options | `font` |
| Visibility | Radio: Public / Unlisted / Private | `visibility` |
| Read-only | Switch | `read_only` |
| Anyone can edit | Switch | `allow_public_edit` |
| Comments | Switch | `allow_comments` |
| Burn after read | Switch + warning | `burn_after_read` |
| Password | Set / change / remove | `password` |
| Expires | Dropdown | `expiresInDays` |
| Delete notebook | Destructive button | `DELETE` |

**Delete confirmation:** Type notebook title to confirm.

Each change → immediate `PATCH /api/notebooks/{id}` (optimistic UI + rollback on error).

---

### 7.8 Bottom sheet: Version history

- `GET /api/pages/{pageId}/versions`
- List: relative time (“2 hours ago”) + content preview (first 120 chars)
- Tap → diff view or full-screen preview
- “Restore this version” → PATCH page content

---

### 7.9 Panel: Comments

- Toggle from page overflow menu when `allow_comments: true`
- List newest first (`GET`)
- Compose: name (remember last used) + text → `POST`
- View mode: read + add (no delete in v1 — matches web)

---

### 7.10 Screen: Password gate

Shown when `GET /api/notebooks/view/{slug}` returns 401 or local unlock expired.

```
┌──────────────────────────────────────┐
│  [tape decoration]                   │
│  {notebook title}                    │
│  This notebook is password-protected │
│                                      │
│  Password: [____________]            │
│  [ Unlock ]                          │
└──────────────────────────────────────┘
```

→ `POST /api/notebooks/unlock/{slug}` → cache unlock → reload view.

---

### 7.11 Screen: View-only states

| State | UI |
|-------|-----|
| Expired | Illustration + “This notebook expired” + link to create new |
| Burn consumed | “This link has already been opened” |
| Private / not found | 404 screen |
| Read-only banner | “This notebook is read-only” (yellow tape strip) |

---

### 7.12 Screen: Help & shortcuts

Static content mirroring web help modal:
- Markdown cheat sheet
- “Your edit link is your password”
- Link to `https://sharepad.in` FAQ / blog

---

## 8. Icon system

Use Material Icons Outlined mapped from web `lib/icons.tsx`:

| ID | Label | Android icon suggestion |
|----|-------|-------------------------|
| `notebook` | Notebook | `MenuBook` |
| `book` | Book | `AutoStories` |
| `rocket` | Rocket | `RocketLaunch` |
| `briefcase` | Work | `Work` |
| `study` | Study | `School` |
| `code` | Code | `Code` |
| `checklist` | Checklist | `Checklist` |
| `calendar` | Calendar | `CalendarMonth` |
| `idea` | Idea | `Lightbulb` |
| `map` | Map | `Map` |
| `recipe` | Recipe | `Restaurant` |
| `travel` | Travel | `Flight` |
| `music` | Music | `MusicNote` |
| `photo` | Photo | `Photo` |
| `chat` | Chat | `Chat` |
| `star` | Star | `Star` |
| `pin` | Pin | `PushPin` |
| `file` | File | `Description` |
| … | (see full list in `lib/icons.tsx`) | |

Legacy notebooks may store emoji in `emoji` field — render as-is Text if not in map.

---

## 9. Feature parity matrix

| Feature | Web | Android v1 | API |
|---------|-----|------------|-----|
| Create notebook | ✅ | ✅ | POST `/api/notebooks` |
| Custom slug | ✅ | ✅ | slug-check + create |
| Edit link recovery | ✅ | ✅ | load endpoint |
| Saved notebooks list | ✅ localStorage | ✅ EncryptedPrefs | load endpoint |
| Multi-page sidebar | ✅ | ✅ | pages in load |
| Pin / reorder pages | ✅ | ✅ | PATCH sort_order, pinned |
| Markdown editor | ✅ | ✅ | PATCH content |
| Live preview | ✅ | ✅ | client-side |
| Paper themes | ✅ | ✅ | notebook.theme |
| Font selection | ✅ | ✅ | notebook.font |
| Image upload | ✅ | ✅ | POST `/api/images` |
| Autosave | ✅ 800ms | ✅ 800ms | PATCH pages |
| Version history | ✅ | ✅ | GET versions |
| Comments | ✅ | ✅ | comments API |
| Share view/edit links | ✅ | ✅ | intents |
| Export markdown | ✅ | ✅ | GET export |
| Password protect | ✅ | ✅ | unlock API |
| Visibility modes | ✅ | ✅ | PATCH notebook |
| Read-only | ✅ | ✅ | PATCH + UI guard |
| Open editing | ✅ | ✅ | allow_public_edit |
| Burn after read | ✅ | ✅ | view load side effect |
| Expiry | ✅ | ✅ | expires_at |
| Delete notebook | ✅ | ✅ | DELETE |
| Quick paste flow | ✅ | ⚪ v1.1 | create with auto slug |
| Print/PDF all pages | ✅ | ⚪ link out | web `/n/{slug}` print |
| SEO landing pages | ✅ | ⚪ Custom Tab | web only |
| PostHog analytics | ✅ | ⚪ optional | — |

---

## 10. Error handling and edge cases

| Scenario | UX |
|----------|-----|
| No network | Banner “Offline — changes will retry”; queue PATCH in Room (v1.1) or block with message |
| 401 missing token | Prompt recover edit link |
| 403 read-only | Snackbar + disable editor |
| 409 slug taken | Inline field error |
| 429 image rate limit | Show retry minutes from message |
| 413 image too large | “Images must be under 5 MB” |
| Token invalid | Remove from saved list; show recover screen |
| App backgrounded mid-save | OkHttp call completes; WorkManager for retry (v1.1) |

---

## 11. Implementation phases

### Phase 1 — Foundation (week 1–2)
- [ ] Android Studio project, Compose, theme
- [ ] Retrofit `SharePadApi` for all existing endpoints
- [ ] Add §4.15 routes to SharePad web repo (PR to same GitHub)
- [ ] TokenStore + deep links
- [ ] Home, Create, Recover screens

### Phase 2 — Editor (week 3–4)
- [ ] Notebook load (edit + view)
- [ ] Page sidebar + CRUD
- [ ] Markdown write + preview
- [ ] Autosave
- [ ] Paper themes + fonts

### Phase 3 — Polish (week 5–6)
- [ ] Share sheet + export
- [ ] Settings sheet (all fields)
- [ ] Version history
- [ ] Comments
- [ ] Image pick + upload + insert
- [ ] Password gate

### Phase 4 — Ship (week 7)
- [ ] App Links verification
- [ ] Play Store listing (screenshots, privacy policy)
- [ ] Beta via Firebase App Distribution
- [ ] Production release

---

## 12. Play Store and legal

| Item | Detail |
|------|--------|
| App name | SharePad |
| Package | `in.sharepad.app` |
| Privacy policy | Must state: content stored on SharePad servers, edit tokens stored locally encrypted, no account email collected |
| Permissions | `INTERNET`, `READ_MEDIA_IMAGES` (photo picker), optional `CAMERA` |
| Data safety form | “Data collected: user-generated content; not linked to identity” |

---

## 13. Testing checklist

- [ ] Create notebook → save token dialog → reopen from saved list
- [ ] Deep link `sharepad.in/e/{token}` opens editor
- [ ] Deep link `sharepad.in/n/{slug}` opens view
- [ ] Password notebook: wrong password, correct password, 24 h re-prompt
- [ ] Autosave survives rotation
- [ ] Add/delete/reorder/pin pages (min 1 page enforced)
- [ ] Upload PNG/JPEG → image renders in preview
- [ ] Export markdown share intent
- [ ] Delete notebook removes from server + local list
- [ ] Expired notebook shows expired UI
- [ ] Open-edit notebook: edit without token
- [ ] Read-only notebook: editor disabled
- [ ] Version restore creates new version
- [ ] Comment post when enabled; 403 when disabled
- [ ] Rate limit image upload gracefully

---

## 14. Reference links

| Resource | URL |
|----------|-----|
| Production site | https://sharepad.in |
| View notebook | `https://sharepad.in/n/{slug}` |
| Edit notebook | `https://sharepad.in/e/{editToken}` |
| API ping | https://sharepad.in/api/ping |
| GitHub source | https://github.com/Varshithvhegde/sharepad |
| Type definitions | `lib/types.ts` |
| API auth logic | `lib/api-auth.ts` |
| Web editor reference | `components/NotebookEditor.tsx` |
| Image limits | `lib/images.ts` |

---

## 15. Appendix: Example Retrofit interface

```kotlin
interface SharePadApi {
    @GET("api/ping")
    suspend fun ping(): PingResponse

    @POST("api/notebooks")
    suspend fun createNotebook(@Body body: CreateNotebookRequest): CreateNotebookResponse

    @GET("api/notebooks/load")
    suspend fun loadNotebook(@Header("X-Edit-Token") token: String): LoadNotebookResponse

    @GET("api/notebooks/view/{slug}")
    suspend fun viewNotebook(@Path("slug") slug: String): LoadNotebookResponse

    @PATCH("api/notebooks/{id}")
    suspend fun updateNotebook(
        @Path("id") id: String,
        @Header("X-Edit-Token") token: String,
        @Body body: UpdateNotebookRequest
    ): NotebookResponse

    @DELETE("api/notebooks/{id}")
    suspend fun deleteNotebook(
        @Path("id") id: String,
        @Header("X-Edit-Token") token: String
    ): OkResponse

    @GET("api/slug-check")
    suspend fun checkSlug(@Query("slug") slug: String): SlugCheckResponse

    @POST("api/notebooks/unlock/{slug}")
    suspend fun unlock(@Path("slug") slug: String, @Body body: UnlockRequest): UnlockResponse

    @POST("api/pages")
    suspend fun createPage(@Header("X-Edit-Token") token: String?, @Body body: CreatePageRequest): PageResponse

    @PATCH("api/pages/{id}")
    suspend fun updatePage(@Header("X-Edit-Token") token: String?, @Path("id") id: String, @Body body: UpdatePageRequest): PageResponse

    @DELETE("api/pages/{id}")
    suspend fun deletePage(@Header("X-Edit-Token") token: String?, @Path("id") id: String): OkResponse

    @GET("api/pages/{id}/versions")
    suspend fun getVersions(@Header("X-Edit-Token") token: String, @Path("id") pageId: String): VersionsResponse

    @GET("api/pages/{id}/comments")
    suspend fun getComments(@Path("id") pageId: String): CommentsResponse

    @POST("api/pages/{id}/comments")
    suspend fun postComment(@Path("id") pageId: String, @Body body: CommentRequest): CommentResponse

    @GET("api/export/{slug}")
    @Streaming
    suspend fun exportMarkdown(@Path("slug") slug: String): ResponseBody

    @Multipart
    @POST("api/images")
    suspend fun uploadImage(
        @Header("X-Edit-Token") token: String?,
        @Part("notebook_id") notebookId: RequestBody,
        @Part file: MultipartBody.Part
    ): ImageUploadResponse
}
```

---

*This PRD is the single source of truth for building SharePad for Android in Android Studio. Implement the two read endpoints (§4.15) in the existing SharePad Next.js codebase before Android Phase 1 is complete.*
