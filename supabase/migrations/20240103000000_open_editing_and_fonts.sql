-- Open editing, selectable typefaces, and plain paper as the new default.

alter table notebooks add column if not exists allow_public_edit boolean not null default false;

alter table notebooks add column if not exists font text not null default 'hand';
alter table notebooks drop constraint if exists notebooks_font_check;
alter table notebooks
  add constraint notebooks_font_check
  check (font in ('hand', 'serif', 'sans', 'mono'));

alter table notebooks alter column theme set default 'plain';

-- Edit tokens are looked up by hash, so index the column instead of scanning.
create index if not exists notebooks_edit_token_idx on notebooks (edit_token_hash);
