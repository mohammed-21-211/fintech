-- ============================================================
-- Global Default Categories (user_id = null = available to all)
-- ============================================================
insert into public.categories (id, user_id, name, icon, color, type) values
  (uuid_generate_v4(), null, 'Salary',        'briefcase',     '#4ADE80', 'income'),
  (uuid_generate_v4(), null, 'Freelance',     'laptop',        '#60A5FA', 'income'),
  (uuid_generate_v4(), null, 'Investment',    'trending-up',   '#A78BFA', 'income'),
  (uuid_generate_v4(), null, 'Gift',          'gift',          '#F9A8D4', 'income'),
  (uuid_generate_v4(), null, 'Food',          'utensils',      '#FB923C', 'expense'),
  (uuid_generate_v4(), null, 'Transport',     'car',           '#FACC15', 'expense'),
  (uuid_generate_v4(), null, 'Housing',       'home',          '#F87171', 'expense'),
  (uuid_generate_v4(), null, 'Health',        'heart',         '#EC4899', 'expense'),
  (uuid_generate_v4(), null, 'Education',     'book',          '#6EE7B7', 'expense'),
  (uuid_generate_v4(), null, 'Entertainment', 'film',          '#C084FC', 'expense'),
  (uuid_generate_v4(), null, 'Shopping',      'shopping-bag',  '#F472B6', 'expense'),
  (uuid_generate_v4(), null, 'Utilities',     'zap',           '#38BDF8', 'expense'),
  (uuid_generate_v4(), null, 'Travel',        'plane',         '#34D399', 'expense'),
  (uuid_generate_v4(), null, 'Other',         'more-horizontal','#94A3B8','expense')
on conflict do nothing;
