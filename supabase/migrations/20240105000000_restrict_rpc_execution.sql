-- These run as SECURITY DEFINER and were callable straight from the public REST
-- API, so anyone could inflate a view count or, worse, burn someone else's
-- read-once notebook without ever opening it. Only the server needs them.
--
-- Pinning search_path stops a caller-controlled path resolving these names
-- somewhere unexpected.

create or replace function public.increment_notebook_views(notebook_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notebooks set view_count = view_count + 1 where slug = notebook_slug;
end;
$$;

create or replace function public.consume_burn_link(notebook_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notebooks set burn_consumed = true
  where slug = notebook_slug and burn_after_read = true;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.increment_notebook_views(text) from public, anon, authenticated;
revoke all on function public.consume_burn_link(text) from public, anon, authenticated;

grant execute on function public.increment_notebook_views(text) to service_role;
grant execute on function public.consume_burn_link(text) to service_role;
