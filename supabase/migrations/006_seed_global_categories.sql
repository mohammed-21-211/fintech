-- ============================================================
-- Global default categories in the new expense schema.
-- organization_id = null  =>  visible to every tenant (read-only via RLS).
-- Idempotent: re-running will not create duplicates.
-- ============================================================

insert into expense.categories (organization_id, name, icon, color, type)
select null, v.name, v.icon, v.color, v.type
from (values
  ('Salary',        'briefcase',       '#4ADE80', 'income'),
  ('Freelance',     'laptop',          '#60A5FA', 'income'),
  ('Investment',    'trending-up',     '#A78BFA', 'income'),
  ('Gift',          'gift',            '#F9A8D4', 'income'),
  ('Food',          'utensils',        '#FB923C', 'expense'),
  ('Transport',     'car',             '#FACC15', 'expense'),
  ('Housing',       'home',            '#F87171', 'expense'),
  ('Health',        'heart',           '#EC4899', 'expense'),
  ('Education',     'book',            '#6EE7B7', 'expense'),
  ('Entertainment', 'film',            '#C084FC', 'expense'),
  ('Shopping',      'shopping-bag',    '#F472B6', 'expense'),
  ('Utilities',     'zap',             '#38BDF8', 'expense'),
  ('Travel',        'plane',           '#34D399', 'expense'),
  ('Other',         'more-horizontal', '#94A3B8', 'expense')
) as v(name, icon, color, type)
where not exists (
  select 1 from expense.categories c
  where c.organization_id is null
    and c.name = v.name
);
