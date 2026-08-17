# SharePad Android — UI & Interaction Design PRD

**Version:** 1.0  
**Date:** August 14, 2026  
**Companion doc:** [ANDROID_PRD.md](./ANDROID_PRD.md) (API, architecture, tech stack)  
**Design reference:** [sharepad.in](https://sharepad.in) web app — pixel-parity in *feel*, native Android in *patterns*

This document specifies **every screen, sheet, dialog, dropdown, banner, toast, and interaction** in the SharePad Android app. A designer or Android developer should be able to build the full UI from this file alone.

---

## Table of contents

1. [Design principles](#1-design-principles)
2. [Global design system](#2-global-design-system)
3. [Reusable components](#3-reusable-components)
4. [Global behaviors](#4-global-behaviors)
5. [Screen & overlay inventory](#5-screen--overlay-inventory)
6. [Screen specifications](#6-screen-specifications)
7. [Overlay specifications (modals, sheets, menus)](#7-overlay-specifications)
8. [Inline panels (within editor preview)](#8-inline-panels)
9. [State-specific full screens](#9-state-specific-full-screens)
10. [Gestures, motion, and haptics](#10-gestures-motion-and-haptics)
11. [Accessibility](#11-accessibility)
12. [Responsive layout rules](#12-responsive-layout-rules)

---

## 1. Design principles

| Principle | Implementation |
|-----------|----------------|
| **Paper first** | Warm off-white backgrounds, visible ink borders, subtle rotation on sticky-note cards |
| **No account anxiety** | Never show login/signup; emphasize “your edit link is your key” |
| **Progressive disclosure** | Quick flow for speed; “Set one up properly” for power users |
| **Native where it helps** | Material bottom sheets, system share sheet, photo picker — but styled with SharePad colors |
| **Forgiving editing** | Autosave, version history, clear save status |
| **Trust through clarity** | Destructive actions always confirm; edit link warnings are blocking on first create |

---

## 2. Global design system

### 2.1 Color tokens

| Token | Hex / value | Usage |
|-------|-------------|-------|
| `paper` | `#FAF9F6` | App background |
| `paper-2` | `#F2EDE4` | Toolbar, secondary surfaces |
| `paper-3` | `#E9E3D7` | Sidebar background |
| `surface-white` | `#FFFFFF` | Sketch cards |
| `ink` | `#1C1C1C` | Primary text, borders |
| `ink-2` | `#5A5850` | Secondary text |
| `ink-3` | `#6F6C64` | Hints, metadata |
| `ink-faint` | `#AAA89E` | Placeholders |
| `rule` | `#CCC9BC` | Ruled lines, dashed dividers |
| `red` | `#C8443C` | Errors, destructive, pin icon |
| `red-soft` | `#E3A9A4` | — |
| `success-green` | `#3F7D46` | Slug available checkmark |
| `overlay-scrim` | `#1C1C1C` @ 40% | Modal backdrop |
| `overlay-scrim-light` | `#1C1C1C` @ 35% | Side sheet backdrop |

**Sticky note tints (cards, toasts, tabs):**

| Token | Hex |
|-------|-----|
| `sticky-y` | `#FEF9C3` |
| `sticky-p` | `#FCE7F3` |
| `sticky-b` | `#DBEAFE` |
| `sticky-g` | `#DCFCE7` |
| `sticky-o` | `#FFEDD5` |

**Tape decoration (optional on cards/modals):**

| Token | Hex @ 72% |
|-------|-----------|
| `tape-y` | `#FDE047` |
| `tape-p` | `#F9A8D4` |
| `tape-b` | `#93C5FD` |
| `tape-g` | `#86EFAC` |
| `tape-o` | `#FDBA74` |

### 2.2 Typography

| Role | Font (Android) | Size | Weight | Line height |
|------|----------------|------|--------|-------------|
| Display H1 | Caveat | 32–40 sp | Regular | 1.06 |
| Display H2 | Caveat | 24–28 sp | Regular | 1.1 |
| Screen title | Caveat | 27 sp | Regular | Tight |
| Body (hand) | Kalam | 16 sp | Regular | 1.55 |
| Body (serif) | Noto Serif | 15.5 sp | Regular | 1.55 |
| Body (sans) | Roboto | 15 sp | Regular | 1.55 |
| Body (mono) | JetBrains Mono | 14 sp | Regular | 1.55 |
| UI label | Roboto | 14 sp | Medium | 1.4 |
| Caption / hint | Roboto | 12–13 sp | Regular | 1.4 |
| Monospace (URLs, code) | JetBrains Mono | 12–13 sp | Regular | 1.5 |
| Stamp badge | Roboto | 11 sp | Medium | 1 |

**Page title in editor:** Caveat 21 sp  
**Editor textarea:** JetBrains Mono 14.5 sp, line height 1.8

### 2.3 Spacing scale

4 dp base grid: `4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64`

Standard screen horizontal padding: **20 dp**  
Modal padding: **24 dp**  
List item vertical padding: **10–12 dp**

### 2.4 Borders & shadows

| Element | Border | Shadow |
|---------|--------|--------|
| Sketch card (`.sk`) | 1.8 dp solid `ink` | offset (3, 4) dp, `#1C1C1C` @ 12% + soft blur |
| Inactive card | 1.2 dp solid `ink` @ 45% | offset (2, 2) dp @ 8% |
| Input field | 1.8 dp solid `ink` | none |
| Header divider | 1.5 dp solid `ink` @ 16% | — |
| Chip selected | 1.8 dp solid `ink` | offset (2, 2) dp @ 18% |

### 2.5 Paper textures

Drawn as repeating backgrounds behind editor/preview:

| ID | Label | Pattern |
|----|-------|---------|
| `plain` | Plain | Solid `paper` |
| `ruled` | Ruled | Horizontal lines every **28 dp**, color `rule` |
| `grid` | Grid | **20 dp** grid, `rule` @ 80% |
| `dot` | Dotted | Dots at 20 dp intervals, `rule` |

### 2.6 Button styles

| Style | Background | Text | Border | Use |
|-------|------------|------|--------|-----|
| **Primary (btn-ink)** | `ink` | `paper` | none | Main CTAs |
| **Secondary (btn)** | `paper` | `ink` | 1.8 dp `ink` | Secondary actions |
| **Ghost (btn-ghost)** | transparent | `ink-2` | none | Icon buttons, toolbar |
| **Yellow (btn-y)** | `sticky-y` | `ink` | 1.8 dp `ink` | “New page” |
| **Red (btn-red)** | `red` | white | none | Destructive confirm |
| **Blue accent (btn-b)** | `sticky-b` | `ink` | 1.8 dp `ink` | Comment send |

Touch target minimum: **48 × 48 dp** (icon buttons can use 40 dp visual with 48 dp hit area).

### 2.7 Chips (toggle pills)

- Unselected: 1.5 dp border `ink` @ 20%, background transparent  
- Selected (`data-on`): 1.8 dp border `ink`, background `sticky-y`, shadow (2, 2)  
- Padding: 8 dp horizontal, 6 dp vertical  
- Font: 14 sp Roboto

---

## 3. Reusable components

### 3.1 `SketchCard`

White card with ink border and optional sticky tint background.

**Props:** `tint?`, `rotation?` (-1° to 1°), `showTape?`, `tapeColor?`  
**Anatomy:** border overlay + content slot  
**Usage:** saved notebook tiles, comment cards, version history items

### 3.2 `TapeDecoration`

Small rectangular strip centered above card top edge, rotated ±2°, 58–70 × 16–18 dp, semi-transparent colored fill with stripe texture. Purely decorative.

### 3.3 `Field` (text input)

- Full width, 1.8 dp `ink` border, background `paper` or white  
- Padding: 12 dp vertical, 14 dp horizontal  
- Placeholder color: `ink-faint`  
- Focus: no glow — border stays `ink` (matches web)

### 3.4 `StampBadge`

Small inline pill: “Read only”, “🔒”, “10 days left”, “Expired”  
- Border 1.2 dp `ink` @ 25%  
- Background `paper-2`  
- Font 11 sp, uppercase optional

### 3.5 `ItemIcon`

Renders notebook/page icon by string id (see §6.3 icon lists) or raw emoji fallback.

### 3.6 `SaveStatusIndicator`

States in header:
- **idle:** empty (width reserved 64 dp on tablet+)
- **saving:** spinner 11 dp + “Saving” in `ink-3`
- **saved:** checkmark + “Saved”, auto-clear after **1.8 s**

### 3.7 `LinkRow`

Read-only monospace URL field + Copy button (+ optional Open/Share).  
Copy shows checkmark for **2 s**.

---

## 4. Global behaviors

### 4.1 Navigation

| From | Action | To |
|------|--------|-----|
| Any | Android back | Previous screen / close overlay |
| Home | Tap saved notebook | Editor (load with token) |
| Deep link `/e/{token}` | App open | Editor edit mode |
| Deep link `/n/{slug}` | App open | Viewer or Password Gate |

### 4.2 Escape / back closes (priority stack)

When **Back** or **Esc** (hardware keyboard): close topmost overlay in order:

1. Confirm dialog  
2. Formatting help  
3. Shortcuts sheet  
4. Version history sheet  
5. Settings sheet  
6. Share sheet  
7. Download menu  
8. Template menu  
9. Icon picker menu  
10. Sidebar drawer  
11. Navigate back from screen  

### 4.3 Toasts

**Position:** bottom-end, 20 dp margin, above nav bar  
**Max visible:** 3 (drop oldest)  
**Auto-dismiss:** 3.4 s  
**Types:**

| Type | Background | Example messages |
|------|------------|------------------|
| success | `sticky-g` | “Page added”, “Markdown copied”, “Draft restored” |
| error | `sticky-p` | “That change didn't save”, “A notebook needs at least one page” |
| info | `sticky-y` | “Loaded notes.md” |

**Animation:** slight rotation ±0.8°, slide up + fade in  
**Dismiss:** tap X or timeout

### 4.4 Confirm dialog pattern

Used for: delete page, delete notebook, restore version.

- Scrim 40%, centered card max width 360 dp  
- Destructive: pink tape + `AlertTriangle` icon in `red`  
- Buttons: Cancel (secondary) | Confirm (primary red or ink)  
- Default focus: Confirm button  
- Back/Esc = Cancel

### 4.5 Autosave (editor)

- Debounce **1200 ms** after last change to `content` or `title` (match web)  
- Also **Ctrl/Cmd+S** forces immediate save  
- Optimistic UI: local state updates instantly; rollback + toast on API failure

### 4.6 Offline

When no connectivity:
- Banner below header: “You're offline — changes won't save until you're back” (`sticky-o` background)  
- Save attempts queue locally (v1.1) or show error toast (v1)

---

## 5. Screen & overlay inventory

### 5.1 Full screens (16)

| ID | Name | Route |
|----|------|-------|
| **S01** | Home | `/` |
| **S02** | Quick Paste (form) | `/quick` |
| **S02b** | Quick Paste (success) | `/quick` state |
| **S03** | Create Notebook (form) | `/new` |
| **S03b** | Create Notebook (success) | `/new` state |
| **S04** | Recover Edit Link | `/recover` |
| **S05** | Password Gate | overlay on view load |
| **S06** | Notebook Editor | `/editor` |
| **S07** | Notebook Viewer | `/view/{slug}` |
| **S08** | Not Found | error |
| **S09** | Expired Notebook | error |
| **S10** | Burn Link Used | error |
| **S11** | Private Notebook | error |
| **S12** | Privacy (WebView) | `/privacy` optional |
| **S13** | Help / About | `/help` optional |
| **S14** | Loading (skeleton) | transient |
| **S15** | Connection Error | retry screen |

### 5.2 Overlays & menus (11)

| ID | Name | Type |
|----|------|------|
| **O01** | Share Sheet | Center modal |
| **O02** | Settings Sheet | Center modal |
| **O03** | Version History | End side sheet |
| **O04** | Formatting Help | Center modal |
| **O05** | Keyboard Shortcuts | Center modal |
| **O06** | Confirm Dialog | Alert dialog |
| **O07** | Download Menu | Dropdown from header |
| **O08** | New Page Templates | Bottom popup menu |
| **O09** | Page Icon Picker | Dropdown grid |
| **O10** | Save Edit Link Gate | Blocking dialog (first open) |
| **O11** | Page Sidebar | Navigation drawer (phone) / fixed pane (tablet) |

### 5.3 Banners (inline, not full screen)

| ID | Name | When shown |
|----|------|------------|
| **B01** | Deleted notebook notice | Home after delete |
| **B02** | Open editing notice | Viewer/editor when `allow_public_edit` and not owner |
| **B03** | Expiry warning | ≤3 days until expiry |
| **B04** | Read-only notice | `read_only: true` |
| **B05** | Offline | No network |

---

## 6. Screen specifications

---

### S01 — Home

**Purpose:** App entry; create, recover, or reopen saved notebooks.

**Layout (scrollable):**

```
┌─────────────────────────────────────────┐
│  SharePad                    [? Help]   │  ← top bar, 56 dp
├─────────────────────────────────────────┤
│  [Deleted notice banner — if B01]       │
│                                         │
│  ┌─ PinnedTag ─────────────────────┐   │
│  │ Free forever · No sign-up       │   │  sticky-y card, rotated -1.2°
│  └─────────────────────────────────┘   │
│                                         │
│  Write it down.                         │  Caveat ~36 sp
│  Send one link.                         │
│  ~~~~ red underline SVG ~~~~            │
│                                         │
│  Subtitle paragraph (ink-2)             │
│                                         │
│  [ Paste something now        → ]       │  PRIMARY btn-ink, full width on phone
│  [ Set one up properly          ]       │  SECONDARY btn
│                                         │
│  Notes expire in 10 days · Recover link │
│                                         │
│  ┌─ NotebookPreview illustration ─┐    │  optional on phone: below fold
│  └────────────────────────────────┘    │
│                                         │
│  ── Back to your desk ──                │  if saved notebooks exist
│  Edit links this device remembers.      │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ card │ │ card │ │ card │           │  grid 1/2/3 cols
│  └──────┘ └──────┘ └──────┘           │
│                                         │
│  ── What you get ── (8 capability cards)│  optional v1.1 — link to web
│                                         │
│  sharepad.in                            │  footer tap → browser
└─────────────────────────────────────────┘
```

**Elements & behavior:**

| Element | Interaction | Result |
|---------|-------------|--------|
| **Paste something now** | tap | Navigate S02 |
| **Set one up properly** | tap | Navigate S03 |
| **Already have an edit link?** | tap | Navigate S04 |
| **Saved notebook card** | tap | `GET /api/notebooks/load` → S06 |
| **Forget** (trash on card) | tap | Remove from EncryptedPrefs only; confirm NOT required |
| **Help** | tap | S13 or O04 |
| **Deleted banner X** | tap | Dismiss B01 |

**Saved notebook card anatomy:**
- Tape decoration (cycles y/b/p/g by index)
- SketchCard with tint `sn-y/b/p/g`, rotation ±0.9°
- Title: Caveat 18 sp
- Subtitle: “Opens straight into editing” 12 sp ink-2
- Forget button: ghost, trash icon 12 dp

**Empty saved list:** Section hidden entirely (not empty state message).

---

### S02 — Quick Paste (form)

**Purpose:** Fastest path — paste markdown, get share link.

**App bar:** Back → S01

**Form card (SketchCard + tape-y):**

| Field | Spec |
|-------|------|
| Title | “Paste and share” Caveat 29 sp |
| Subtitle | ink-2, 15 sp |
| **Textarea** | min height 280 dp, monospace, placeholder multi-line (see web) |
| **Derived title hint** | When text non-empty: “It'll be called ‘{title}’ — you can rename after.” |
| **Open editing checkbox** | `allow_public_edit` |
| **Get my link** | Primary, disabled when empty or loading |
| **I want to choose settings** | Ghost link → S03 |
| Privacy link | underline → S12 |

**Checkbox copy:**
- Label: “Let anyone with the link edit it”
- Hint: “Good for a shared scratchpad…”

**Submit flow:**
1. Button shows spinner  
2. `POST /api/notebooks` with derived title, plain paper, hand font, 10-day expiry  
3. Save token locally  
4. Auto-copy view URL to clipboard  
5. Navigate to **S02b**

**Errors:** Red text below button — server message or “Could not reach the server”

---

### S02b — Quick Paste (success)

**Purpose:** Show links after quick create.

**Card centered vertically:**

| Block | Content |
|-------|---------|
| Title | “Here's your link” |
| Subtitle | “Already copied…” or “Send this to anyone. Disappears in 10 days.” |
| View link row | LinkRow + copy |
| Edit link box | Pink sticky background panel, smaller monospace field + copy |
| **Open it** | Primary → S06 |
| **Share another** | Secondary → reset S02 form |

---

### S03 — Create Notebook (form)

**Purpose:** Full control over notebook creation.

**App bar:** Back → S01

**Sections inside form card:**

#### 6.3.1 Title & notebook icon

| Element | Behavior |
|---------|----------|
| Label | “What are you writing about?” |
| Title input | Required, autofocus |
| Icon grid | 16 icons (`NOTEBOOK_ICON_IDS`), 36×36 dp cells, selected = yellow bg + ink border |

**Notebook icons:** notebook, book, rocket, briefcase, study, lab, palette, sprout, map, tools, food, film, house, globe, music, travel

#### 6.3.2 Custom address (slug)

| Element | Behavior |
|---------|----------|
| Prefix label | `/n/` monospace in paper-2 box |
| Input | Auto-slugify from title until user edits |
| Status line | Checking… / ✓ free (green) / taken (red) / invalid (red) / idle hint |
| Debounce | 400 ms → `GET /api/slug-check` |

#### 6.3.3 Expiry

Chip row: **1 day · 7 days · 10 days · 30 days · 90 days · 1 year · Never**  
Default: **10 days**  
Helper text below explains selection.

#### 6.3.4 Paper preview

4-column grid: Plain, Ruled, Grid, Dotted — each cell shows mini texture swatch 36 dp tall + label.

#### 6.3.5 Typeface

Chip row: Handwritten · Serif · Sans · Monospace  
Hint text updates per selection (from `FONT_OPTIONS`).

#### 6.3.6 Open editing

Same checkbox as S02.

#### 6.3.7 Password (optional)

- Collapsed: “Add a password” link with lock icon  
- Expanded: password field + “Remove” clears and collapses

#### 6.3.8 Submit

**Create it →** disabled when: loading, empty title, slug taken  
On success → **S03b**

---

### S03b — Create Notebook (success)

Same structure as S02b but copy differs:

- Title: “Your notebook is ready”
- Warning: “Save the edit link before you leave — it is the only way back in.”
- Both edit + view LinkRows with color labels (pink = edit, blue = view)
- **Open the notebook** → S06

**Optional enhancement (O10):** On first open of S06 from here, show blocking “I saved my edit link” checkbox gate.

---

### S04 — Recover Edit Link

**Purpose:** Paste edit URL or raw token to reopen notebook.

**Card:**

| Element | Spec |
|-------|------|
| Title | “Open a notebook” |
| Subtitle | “Paste the edit link you saved when you created it.” |
| Textarea | 3 rows, monospace, placeholder `https://…/e/9f2c…` |
| Error | Red: “That doesn't look like an edit link…” |
| Submit | “Open it →” |
| Footer note | “Lost the link? There is no way to recover it…” ink-3 |

**Validation:**
- Extract token from `/e/([a-f0-9]{64})` or accept bare 64-char hex
- On success: save to TokenStore, load notebook, → S06

---

### S05 — Password Gate

**Full screen centered form** (blocks content until unlocked)

| Element | Spec |
|-------|------|
| Tape | tape-p |
| Eyebrow | “LOCKED NOTEBOOK” uppercase tracking, ink-3 |
| Title | Notebook title, Caveat 26 sp |
| Subtitle | “Enter the password you were given to read this.” |
| Password field | autofocus, secure entry |
| Error | “That password doesn't match.” |
| Button | “Open it” — disabled when empty or loading |

**On success:**
- Cache unlock 24 h locally  
- Reload notebook content → S07

---

### S06 — Notebook Editor (edit mode)

**The primary screen.** Full viewport height, no system chrome overlap.

#### 6.6.1 Header bar (56 dp)

| Slot | Content |
|------|---------|
| Start | Menu icon (phone/tablet) → O11 sidebar |
| | SharePad logo text (tablet+) → S01 |
| | Divider |
| | Notebook icon + **editable title** (single line, truncate) |
| | Stamps: “Read only”, 🔒 if applicable |
| Center (tablet+) | View mode toggle: **Write \| Split \| Read** |
| End | Save status |
| | Download icon → O07 |
| | Share icon → O01 (owner only) |
| | Settings icon → O02 (owner only) |

**Notebook title edit:** Updates local state; on blur → `PATCH /api/notebooks/{id}` with `{ title }`.

**View mode toggle (segmented control):**
- Selected segment: ink background, paper text  
- Unselected: transparent, ink-2 text  
- **Phone:** Split hidden; if user had split selected, fall back to Write  
- Icons: Pencil, SplitHorizontal, Eye

#### 6.6.2 Banners (below header)

Show when applicable (see B02–B05):

**B02 Open editing (blue sticky):**  
Users icon + “The owner left this notebook open — anything you write is saved for everyone.”

**B03 Expiry warning (orange sticky):**  
“This notebook deletes itself in {N days}.” + link “Give it longer” → O02 + dismiss X

#### 6.6.3 Page sidebar (O11)

**Phone:** Modal drawer from start, width min(288 dp, 82vw), scrim behind  
**Tablet (≥840 dp):** Fixed 288 dp column, always visible

**Sidebar anatomy:**

```
┌─────────────────────┐
│ [🔍 Find a page    ]│  search field
├─────────────────────┤
│ ┌─ page tab ──────┐ │
│ │ 📄 Meeting notes│ │  sticky tint rotates slightly
│ │ [↑][↓][📌][📋][🗑]│ │  actions on active / long-press
│ └─────────────────┘ │
│ ... scroll ...      │
├─────────────────────┤
│ [ + New page      ] │  yellow btn → O08
└─────────────────────┘
```

**Page tab card:**
- Tint cycles sn-y/b/p/g/o by index  
- Active: stronger border, 0° rotation, stronger shadow  
- Inactive: ±0.5° rotation  
- Pin shown: red pin icon 11 dp  
- Tap tab → switch page (save pending changes first)

**Page actions (edit mode only):**

| Button | Action |
|--------|--------|
| ↑ | `movePage(-1)` swap sort_order |
| ↓ | `movePage(+1)` |
| 📌 | toggle `pinned` |
| 📋 | duplicate page (POST new page with “ copy” title) |
| 🗑 | delete → O06 confirm |

**Search:** Filters by page title OR content substring; empty → “Nothing matches ‘{q}'.”

**New page:** Opens O08 template menu above button.

#### 6.6.4 Page chrome row (below sidebar/header)

| Element | Behavior |
|---------|----------|
| Page icon button | Opens O09 grid picker |
| Page title | Editable Caveat 21 sp (edit) / plain heading (view) |
| Stats | “{words} words · {min} min read” hidden on narrow phone |
| Sync scroll toggle | Split mode only; yellow when linked |
| Import .md | File picker → replaces editor content locally |
| History | → O03 |
| Copy markdown | clipboard + toast |
| Print/PDF | Custom Tab → web print view |

#### 6.6.5 Markdown toolbar

Horizontal scroll row on phone; fixed row on tablet.

| # | Tool | Inserts |
|---|------|---------|
| 1 | Bold | `**bold**` |
| 2 | Italic | `*italic*` |
| 3 | H1 | `\n# Heading` |
| 4 | H2 | `\n## Heading` |
| 5 | Bullet list | `\n- item` |
| 6 | Numbered list | `\n1. item` |
| 7 | Checklist | `\n- [ ] to do` |
| 8 | Quote | `\n> quote` |
| 9 | Code block | `\n```\ncode\n```\n` |
| 10 | Link | `[text](https://)` |
| 11 | Table | 2×2 template |
| 12 | Divider | `\n\n---\n\n` |
| 13 | Image | photo picker → upload → `![](url)` |
| 14 | Help ? | → O04 |

Background: `paper-2`, bottom border 1.5 dp  
Image button shows spinner while uploading.

#### 6.6.6 Editor pane(s)

**Write pane:**
- Textarea fills remaining height  
- Paper texture background  
- Monospace 14.5 sp  
- Placeholder: “Start writing…”  
- Supports: paste image, drop image (tablet), Tab indent / Shift+Tab outdent  
- Scroll sync emits to preview when split + linked

**Preview pane:**
- Rendered markdown with notebook font class  
- Left margin rule (red vertical line) + padding like web  
- Deferred render (slight lag OK for perf)  
- Bottom: Table of Contents + Comments (§8)

**Layout widths:**
- Write only: 100%  
- Split: 50/50 with vertical divider  
- Read only: preview 100%

#### 6.6.7 Editor keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd+S | Save now |
| Ctrl/Cmd+B | Bold wrap |
| Ctrl/Cmd+I | Italic wrap |
| Ctrl/Cmd+/ | Cycle Write → Split → Read → Write |
| Tab | Indent list (in textarea) |
| Shift+Tab | Outdent |
| ? (not typing) | O05 Shortcuts |
| Esc | Close top overlay |

---

### S07 — Notebook Viewer (view mode)

Same shell as S06 but:

| Difference | Behavior |
|------------|----------|
| No edit token | Cannot open O02 Settings |
| Share button | Opens O01 with **view link only** (no edit link) |
| No Write/Split toggle | Preview/read only — single pane |
| No sidebar actions | Page list is navigation only |
| No toolbar | No markdown toolbar |
| No page title edit | Static heading |
| Metadata line | “{views} views · updated {date} · {expiry}” in ink-3 |
| Comments | Shown if `allow_comments` |
| Open edit banner | If `allow_public_edit`, show B02 and enable editing without token |

**Password required:** Show S05 first.

**Private / expired / burned:** → S08/S09/S10/S11

---

## 7. Overlay specifications

---

### O01 — Share Sheet

**Type:** Center modal, max width 400 dp, scrollable if needed  
**Tape:** tape-y  
**Dismiss:** tap scrim, X button, Back, Esc

**Header:**
- Title: “Share this notebook” Caveat 24 sp  
- Subtitle: `{icon} {title} · {expiry label}`

**Link blocks (repeat per link):**

| Link | Label tint | Hint |
|------|------------|------|
| View | sticky-b | “Give this to your readers” |
| Edit | sticky-p | “Your key. Anyone with it can change everything.” |

Each block: label chip + hint + LinkRow (URL + Copy + Open in browser)

**If no edit token (visitor sharing):**  
Info box paper-2: “You are sharing someone else's notebook…”

**QR section:**
- Toggle “Show QR code” / “Hide QR code”  
- QR encodes **view URL** only, 132×132 dp, white padding, ink border

**Footer button:** “Download every page” → export markdown

---

### O02 — Settings Sheet

**Type:** Center modal, max width 400 dp, body scroll max 62vh  
**Tape:** tape-g

**Header:** “Settings” + X

**Fields (scroll body):**

| # | Section | Control | API field |
|---|---------|---------|-----------|
| 1 | Description | 2-row textarea | `description` |
| 2 | Paper | 4 chips: Ruled/Grid/Dotted/Plain | `theme` |
| 3 | Typeface | 4 radio rows with hints | `font` |
| 4 | Expiry | 7 chips + “currently {label}” | `expiresInDays` |
| 5 | Visibility | 3 radio: Anyone with link / Public / Only me | `visibility` |
| 6 | Password | field + “Remove password” checkbox | `password` / null |
| 7 | Anyone can edit | checkbox + hint | `allow_public_edit` |
| 8 | Read-only | checkbox + hint | `read_only` |
| 9 | Let readers comment | checkbox | `allow_comments` |
| 10 | Delete after first read | checkbox | `burn_after_read` |

**Footer:**
- **Save settings** primary full width — PATCH all changed fields, close on success  
- **Trash** icon button — delete notebook flow

**Delete flow:**
1. O06: “Delete ‘{title}'?” destructive  
2. DELETE API  
3. Remove local token → S01 with B01

**Error:** Red inline above footer

---

### O03 — Version History

**Type:** End side sheet (Material `ModalDrawerSheet`), full height, max width 360 dp  
**Animation:** slide in from end 300 ms  
**Dismiss:** scrim tap, X, Back, Esc

**Header:** “Earlier drafts”

**Body states:**

| State | UI |
|-------|-----|
| Loading | Center spinner |
| Empty | “Nothing here yet. Drafts are kept each time you edit this page.” |
| List | Up to 10 cards, newest first |

**Version card:**
- Timestamp formatted datetime, ink-3  
- Preview: first 220 chars monospace, 4 line clamp  
- **Restore** button red ghost → O06 “Put this draft back?” → PATCH content, toast, close

---

### O04 — Formatting Help

**Type:** Center modal, max width 480 dp, z-index above others  
**Tape:** tape-b

**Header:** “What you can write” + subtitle “Type it on the left, get the thing on the right.”

**Sections (scroll):**

1. **Text** — bold, italic, strike, code, link, image  
2. **Structure** — headings, lists, tasks, quote, divider  
3. **Blocks** — fenced code, tables  
4. **HTML** — details/summary, kbd, sub/sup, mark, abbr, align (with sanitization note)

Each entry: monospace syntax block | plain description

**Footer:** “Back to writing” primary

---

### O05 — Keyboard Shortcuts

**Type:** Center modal, max width 360 dp  
**Tape:** tape-b

Two-column list: description | key cap badge

| Key | Action |
|-----|--------|
| ⌘S | Save now |
| ⌘B | Bold |
| ⌘I | Italic |
| ⌘/ | Cycle write / split / read |
| Tab | Indent list |
| ⇧Tab | Outdent |
| Esc Tab | Leave editor focus |
| ? | Open shortcuts |
| Esc | Close anything open |

**Footer:** “Got it”

---

### O06 — Confirm Dialog

**Variants:**

| Trigger | Title | Message | Confirm | Destructive |
|---------|-------|---------|---------|-------------|
| Delete page | Delete “{title}”? | Page + drafts gone… | Delete page | yes |
| Delete notebook | Delete “{title}”? | Everything gone… | Delete notebook | yes |
| Restore version | Put this draft back? | Current saved to history first… | Restore it | no |

---

### O07 — Download Menu

**Type:** Dropdown anchored below header download icon, width 208 dp  
**Dismiss:** tap outside, select item, Esc

| Item | Icon | Title | Subtitle | Action |
|------|------|-------|----------|--------|
| PDF | FileText | PDF | Every page, formatted for print | Custom Tab `/n/{slug}/print` |
| Markdown | FileCode | Markdown | One .md file | Download GET `/api/export/{slug}` |

---

### O08 — New Page Templates

**Type:** Popup menu above “New page” button (sidebar footer)  
**Dismiss:** select template, tap outside, Esc

| Template | Icon | Default title |
|----------|------|---------------|
| Blank page | file | Untitled |
| Meeting notes | checklist | Meeting notes |
| Task list | target | Tasks |
| Project readme | book | Readme |
| Journal entry | calendar | {today's date} |
| *(web has 5 templates)* | | |

**On select:** POST page, add to list, switch to new page, toast “Page added”

---

### O09 — Page Icon Picker

**Type:** Dropdown below page icon button  
**Grid:** 8 columns × 2 rows, width 272 dp

**Page icons:** file, checklist, idea, bookmark, target, star, flame, message, folder, pin, calendar, code, quote, picture, link, hash

Selected icon: yellow sticky background  
Tap → PATCH page icon, close menu

---

### O10 — Save Edit Link Gate (recommended)

**Type:** Blocking bottom sheet on first entry to S06 after create  
**Cannot dismiss** without checkbox

```
┌─────────────────────────────────────┐
│  Save your edit link                │
│  This is the only way back in.      │
│  [edit URL monospace]               │
│  [Copy]  [Share]                    │
│  ☐ I saved this link                │
│  [ Open notebook ]  (disabled)      │
└─────────────────────────────────────┘
```

---

### O11 — Page Sidebar

Specified in §6.6.3. On tablet, not a drawer — permanent column.

---

## 8. Inline panels

These live **inside the preview pane** at the bottom of page content (below markdown body).

### 8.1 Table of Contents

**Visibility:** Only if ≥2 headings in current page content  
**Title:** “On this page” Caveat 17 sp  
**List:** Indented by heading level (14 dp per level)  
**Tap heading:** Scroll preview to anchor (smooth scroll)

### 8.2 Comments panel

**Visibility:** When `notebook.allow_comments === true`

**States:**

| State | UI |
|-------|-----|
| Loading | Spinner |
| Empty | “No one has said anything yet. Leave the first note.” |
| List | Newest first, sticky note cards with author + date + body |

**Compose form:**
- Name field (optional, remember last used in prefs)  
- Comment text + send button (blue sticky)  
- Disabled send when empty or posting

**API:** GET/POST `/api/pages/{id}/comments` — no delete in v1

---

## 9. State-specific full screens

### S08 — Not Found

Center illustration + “We couldn't find that notebook”  
Subtitle: link may be wrong or expired  
Buttons: **Go home** | **Open edit link** (→ S04)

### S09 — Expired

“This notebook expired”  
Subtitle: SharePad deletes notebooks after their expiry date  
Button: **Create a new one** → S03

### S10 — Burn Link Used

“This link has already been opened”  
Subtitle: burn-after-read was enabled  
Button: **Go home**

### S11 — Private Notebook

“This notebook is private”  
Subtitle: owner set visibility to only me  
Button: **Go home**

### S14 — Loading

Skeleton: header bar + sidebar gray blocks + shimmer textarea  
Shown during `load` / `view` API calls (>200 ms)

### S15 — Connection Error

Full screen: “Couldn't reach SharePad”  
**Try again** → retry last request  
**Go home**

---

## 10. Gestures, motion, and haptics

| Interaction | Motion | Haptic |
|-------------|--------|--------|
| Open sidebar drawer | Slide from start 300 ms, scrim fade | light tick |
| Close modal | Fade out 200 ms | none |
| Side sheet (history) | Slide from end 300 ms | light tick |
| Toast enter | Slide up 250 ms + rotate | none |
| Page tab select | Crossfade content 150 ms | none |
| Save success | Checkmark fade | success tick (optional) |
| Delete confirm | none | warning tick |
| Pull-to-refresh (home saved list) | System default | refresh |

**Card rotation:** Random ±0.4–1° on sticky cards — **don't animate continuously**.

**Entry animation (`note-enter`):** subtle scale 0.97→1 + fade 300 ms on modal open.

---

## 11. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Touch targets | ≥48 dp |
| Content descriptions | All icon buttons labeled |
| Focus order | Modals trap focus; first focus on primary action |
| Live regions | Toasts `aria-live=polite`, save status `aria-live=polite` |
| Contrast | ink-3 on paper ≥5:1 (verified on web) |
| Font scaling | Support system font scale up to 130%; editor may horizontal scroll |
| TalkBack | Page list announces “{title}, page {n} of {total}, pinned” |

---

## 12. Responsive layout rules

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Compact phone** | <600 dp | Single pane editor, bottom tabs Write/Read, sidebar drawer |
| **Large phone / fold** | 600–839 dp | Same, but show word count |
| **Tablet** | ≥840 dp | Split view default, sidebar fixed, show Split toggle |
| **Landscape tablet** | ≥840 dp landscape | Split default 50/50 |

**System bars:** Edge-to-edge with `paper` status bar icons (dark icons)

---

## Appendix A — Toast message catalog

| Message | Type | Trigger |
|---------|------|---------|
| Page added | success | New page created |
| Page duplicated | success | Duplicate action |
| Page deleted | success | Delete confirmed |
| Draft restored | success | Version restore |
| Markdown copied | success | Copy button |
| Loaded {filename} | success | Import md |
| That change didn't save. Check your connection. | error | PATCH failed |
| A notebook needs at least one page | error | Delete last page |
| Could not add the page | error | POST page failed |
| {image error from API} | error | Upload failed |

---

## Appendix B — View mode state machine

```
                    ┌─────────┐
         ┌─────────►│  WRITE  │◄────────┐
         │          └────┬────┘         │
         │               │ Cmd+/        │
         │               ▼              │
         │          ┌─────────┐         │
         │   phone  │  SPLIT  │  phone  │
         │   skips  └────┬────┘  skips  │
         │               │ Cmd+/        │
         │               ▼              │
         │          ┌─────────┐         │
         └──────────│  READ   │─────────┘
                    └─────────┘
                      Cmd+/
```

On phone `<840dp`: SPLIT state redirects to WRITE but preference preserved for tablet.

---

## Appendix C — Editor mode matrix

| Condition | Mode | Can edit content | Can edit settings | Sees edit link |
|-----------|------|------------------|-------------------|----------------|
| Has edit token | edit | yes* | yes | yes |
| View + public edit | view+edit | yes* | no | no |
| View + read only | view | no | no | no |
| View + no public edit | view | no | no | no |

*Unless `read_only: true`

---

## Appendix D — Screen → API map (quick reference)

See [ANDROID_PRD.md §4](./ANDROID_PRD.md) for full API detail.

| UI action | API |
|-----------|-----|
| Create notebook | POST `/api/notebooks` |
| Load editor | GET `/api/notebooks/load` |
| Load viewer | GET `/api/notebooks/view/{slug}` |
| Unlock | POST `/api/notebooks/unlock/{slug}` |
| Save settings | PATCH `/api/notebooks/{id}` |
| Delete notebook | DELETE `/api/notebooks/{id}` |
| Save page | PATCH `/api/pages/{id}` |
| New page | POST `/api/pages` |
| Delete page | DELETE `/api/pages/{id}` |
| Versions | GET `/api/pages/{id}/versions` |
| Comments | GET/POST `/api/pages/{id}/comments` |
| Upload image | POST `/api/images` |
| Export md | GET `/api/export/{slug}` |
| Slug check | GET `/api/slug-check?slug=` |

---

*This UI PRD + [ANDROID_PRD.md](./ANDROID_PRD.md) together form the complete specification for SharePad Android.*
