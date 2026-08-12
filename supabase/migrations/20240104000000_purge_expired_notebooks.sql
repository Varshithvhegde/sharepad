-- Expiry previously only hid a notebook. This is what removes it.

create extension if not exists pg_cron;

-- Pages, drafts and comments follow through their cascading foreign keys.
create or replace function public.purge_expired_notebooks()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.notebooks
  where
    -- Three days past expiry: readers lose access the moment it passes, but the
    -- owner keeps a window to open the edit link and push the date back.
    (expires_at is not null and expires_at < now() - interval '3 days')
    -- A consumed read-once link can never be opened again, so it only lingers.
    or (burn_after_read and burn_consumed and updated_at < now() - interval '1 day');

  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_expired_notebooks() from public, anon, authenticated;

-- Daily, 03:15 UTC.
select cron.schedule(
  'purge-expired-notebooks',
  '15 3 * * *',
  $$select public.purge_expired_notebooks()$$
);
