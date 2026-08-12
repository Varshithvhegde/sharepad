-- Uploaded images, and the counters that stop anyone flooding them in.

create table if not exists images (
  id uuid default gen_random_uuid() primary key,
  notebook_id uuid not null references notebooks(id) on delete cascade,
  object_key text unique not null,
  byte_size integer not null,
  content_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists images_notebook_idx on images (notebook_id);

alter table images enable row level security;
-- No policies: the server reaches this with the service role, nothing else may.

-- Fixed-window counters, keyed by a hashed client identity.
create table if not exists rate_limits (
  bucket text not null,
  identity text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, identity, window_start)
);

create index if not exists rate_limits_window_idx on rate_limits (window_start);

alter table rate_limits enable row level security;

/*
 * Counts a request and reports whether it is allowed, in one statement, so two
 * simultaneous uploads cannot both read the old count and both be let through.
 */
create or replace function consume_rate_limit(
  p_bucket text,
  p_identity text,
  p_window_seconds integer,
  p_max_hits integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz;
  new_total integer;
begin
  current_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (bucket, identity, window_start, hits)
  values (p_bucket, p_identity, current_window, 1)
  on conflict (bucket, identity, window_start)
    do update set hits = public.rate_limits.hits + 1
  returning hits into new_total;

  return new_total <= p_max_hits;
end;
$$;

revoke all on function consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function consume_rate_limit(text, text, integer, integer) to service_role;

-- Old windows are dead weight; clear them out nightly.
create or replace function purge_rate_limits()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.rate_limits where window_start < now() - interval '1 day';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function purge_rate_limits() from public, anon, authenticated;

select cron.schedule(
  'purge-rate-limits',
  '30 3 * * *',
  $$select public.purge_rate_limits()$$
);
