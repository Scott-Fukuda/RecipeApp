import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
  Run this SQL in your Supabase dashboard to create the new tables:

  CREATE TABLE IF NOT EXISTS week_meals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
    week_start date NOT NULL,
    created_at timestamptz DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS shopping_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    amount text,
    unit text,
    checked boolean NOT NULL DEFAULT false,
    week_start date NOT NULL,
    recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
  );
*/

export type Ingredient = { name: string; amount: string; unit: string }

export type Recipe = {
  id: string
  title: string
  description: string | null
  ingredients: Ingredient[]
  instructions: string[]
  cook_time_minutes: number | null
  servings: number | null
  source: string
  external_id: string | null
  image_url: string | null
  macros: null
  created_at: string
}

export type WeekMeal = {
  id: string
  recipe_id: string
  week_start: string
  created_at: string
  recipe?: Recipe
}

export type ShoppingItem = {
  id: string
  name: string
  amount: string | null
  unit: string | null
  checked: boolean
  week_start: string
  recipe_id: string | null
  created_at: string
}
