-- Run this in Supabase SQL editor
-- Single-user app: no auth, no RLS

-- Recipes
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  ingredients jsonb not null default '[]',
  instructions jsonb not null default '[]',
  macros jsonb,
  cook_time_minutes integer,
  servings integer,
  source text not null default 'ai' check (source in ('ai', 'manual', 'feed')),
  external_id text,
  image_url text,
  created_at timestamptz default now()
);

-- Meal Lists
create table if not exists meal_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- List Recipes (junction)
create table if not exists list_recipes (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references meal_lists on delete cascade not null,
  recipe_id uuid references recipes on delete cascade not null,
  added_at timestamptz default now(),
  unique (list_id, recipe_id)
);

-- Cook History
create table if not exists cook_history (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes on delete cascade not null,
  cooked_at timestamptz default now(),
  notes text
);

-- Grocery Lists
create table if not exists grocery_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Grocery Items
create table if not exists grocery_items (
  id uuid primary key default gen_random_uuid(),
  grocery_list_id uuid references grocery_lists on delete cascade not null,
  name text not null,
  amount text,
  unit text,
  checked boolean not null default false,
  recipe_id uuid references recipes on delete set null,
  created_at timestamptz default now()
);
