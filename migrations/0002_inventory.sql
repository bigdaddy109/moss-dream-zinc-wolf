-- 飾記 — hair-accessory inventory (unowned rows; auth off)

create table if not exists app_meta (
  key text primary key,
  value text not null
);

create table if not exists categories (
  id serial primary key,
  name text not null unique,
  sort_order int not null default 0
);

create table if not exists suppliers (
  id serial primary key,
  name text not null unique,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id serial primary key,
  sku text not null unique,
  name text not null,
  category_id int not null references categories (id),
  color text not null default '',
  spec text not null default '',
  cost numeric(12, 2) not null default 0,
  price numeric(12, 2) not null default 0,
  stock int not null default 0,
  min_stock int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products (category_id);
create index if not exists products_active_idx on products (is_active);

create table if not exists purchases (
  id serial primary key,
  number text not null unique,
  supplier_id int references suppliers (id),
  occurred_on date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists purchase_items (
  id serial primary key,
  purchase_id int not null references purchases (id) on delete cascade,
  product_id int not null references products (id),
  qty int not null check (qty > 0),
  unit_cost numeric(12, 2) not null default 0
);

create index if not exists purchase_items_purchase_idx on purchase_items (purchase_id);

create table if not exists sales (
  id serial primary key,
  number text not null unique,
  channel text not null default '門市',
  occurred_on date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists sale_items (
  id serial primary key,
  sale_id int not null references sales (id) on delete cascade,
  product_id int not null references products (id),
  qty int not null check (qty > 0),
  unit_price numeric(12, 2) not null default 0,
  unit_cost numeric(12, 2) not null default 0
);

create index if not exists sale_items_sale_idx on sale_items (sale_id);
create index if not exists sales_date_idx on sales (occurred_on);
create index if not exists purchases_date_idx on purchases (occurred_on);

create table if not exists stock_moves (
  id serial primary key,
  product_id int not null references products (id),
  kind text not null,
  qty_delta int not null,
  ref_type text not null default '',
  ref_id int,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists stock_moves_product_idx on stock_moves (product_id, created_at desc);
