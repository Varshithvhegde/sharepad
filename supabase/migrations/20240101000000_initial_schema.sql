-- SharePad initial schema (no auth required)

-- Notebooks: a collection of pages under one share link
create table if not exists notebooks (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null default 'Untitled Notebook',
  description text,
  edit_token_hash text not null,
  password_hash text,
  emoji text default '📝',
  theme text not null default 'dark' check (theme in ('dark', 'paper', 'auto')),
  visibility text not null default 'unlisted' check (visibility in ('public', 'unlisted', 'private')),
  read_only boolean not null default false,
  burn_after_read boolean not null default false,
  burn_consumed boolean not null default false,
  expires_at timestamptz,
  view_count integer not null default 0,
  allow_comments boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notebooks_slug_idx on notebooks (slug);
create index if not exists notebooks_expires_idx on notebooks (expires_at) where expires_at is not null;

-- Pages within a notebook
create table if not exists pages (
  id uuid default gen_random_uuid() primary key,
  notebook_id uuid not null references notebooks(id) on delete cascade,
  slug text not null,
  title text not null default 'Untitled',
  content text not null default '',
  icon text default '📄',
  sort_order integer not null default 0,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (notebook_id, slug)
);

create index if not exists pages_notebook_idx on pages (notebook_id, sort_order);

-- Version history (last N snapshots)
create table if not exists page_versions (
  id uuid default gen_random_uuid() primary key,
  page_id uuid not null references pages(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_versions_page_idx on page_versions (page_id, created_at desc);

-- Anonymous comments
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  page_id uuid not null references pages(id) on delete cascade,
  author_name text not null default 'Anonymous',
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_page_idx on comments (page_id, created_at desc);

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notebooks_updated_at
  before update on notebooks
  for each row execute function set_updated_at();

create trigger pages_updated_at
  before update on pages
  for each row execute function set_updated_at();

-- RLS: public read for non-private notebooks, no direct writes (API uses service role)
alter table notebooks enable row level security;
alter table pages enable row level security;
alter table page_versions enable row level security;
alter table comments enable row level security;

create policy "Public notebooks readable" on notebooks
  for select using (
    visibility in ('public', 'unlisted')
    and (expires_at is null or expires_at > now())
    and (burn_after_read = false or burn_consumed = false)
  );

create policy "Public pages readable" on pages
  for select using (
    exists (
      select 1 from notebooks n
      where n.id = pages.notebook_id
        and n.visibility in ('public', 'unlisted')
        and (n.expires_at is null or n.expires_at > now())
        and (n.burn_after_read = false or n.burn_consumed = false)
    )
  );

create policy "Comments readable on public pages" on comments
  for select using (
    exists (
      select 1 from pages p
      join notebooks n on n.id = p.notebook_id
      where p.id = comments.page_id
        and n.visibility in ('public', 'unlisted')
        and n.allow_comments = true
    )
  );

create policy "Anyone can insert comments" on comments
  for insert with check (
    exists (
      select 1 from pages p
      join notebooks n on n.id = p.notebook_id
      where p.id = page_id
        and n.visibility in ('public', 'unlisted')
        and n.allow_comments = true
        and n.read_only = false
    )
  );

-- Increment view count function (called via RPC)
create or replace function increment_notebook_views(notebook_slug text)
returns void as $$
begin
  update notebooks set view_count = view_count + 1 where slug = notebook_slug;
end;
$$ language plpgsql security definer;

-- Mark burn-after-read consumed
create or replace function consume_burn_link(notebook_slug text)
returns void as $$
begin
  update notebooks set burn_consumed = true
  where slug = notebook_slug and burn_after_read = true;
end;
$$ language plpgsql security definer;
