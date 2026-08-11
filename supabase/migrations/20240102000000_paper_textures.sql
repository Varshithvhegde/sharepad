-- Repurpose `theme` from a colour scheme into the notebook's paper texture.

alter table notebooks drop constraint if exists notebooks_theme_check;

update notebooks set theme = 'ruled' where theme not in ('ruled', 'grid', 'dot', 'plain');

alter table notebooks alter column theme set default 'ruled';

alter table notebooks
  add constraint notebooks_theme_check
  check (theme in ('ruled', 'grid', 'dot', 'plain'));
