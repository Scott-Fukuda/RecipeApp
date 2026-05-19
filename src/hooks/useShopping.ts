import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ShoppingItem, WeekMeal } from '../lib/supabase'

export function useShopping(weekStart: string) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('week_start', weekStart)
      .order('created_at', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }, [weekStart])

  useEffect(() => { load() }, [load])

  const generateFromMeals = async (meals: WeekMeal[]) => {
    await supabase.from('shopping_items').delete().eq('week_start', weekStart)

    const rows = meals.flatMap(meal =>
      (meal.recipe?.ingredients ?? []).map(ing => ({
        name: ing.name,
        amount: ing.amount || null,
        unit: ing.unit || null,
        checked: false,
        week_start: weekStart,
        recipe_id: meal.recipe_id,
      }))
    )

    if (rows.length === 0) { setItems([]); return }

    const { data, error } = await supabase.from('shopping_items').insert(rows).select()
    if (error) throw error
    setItems(data)
  }

  const toggleItem = async (id: string, checked: boolean) => {
    await supabase.from('shopping_items').update({ checked }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked } : i))
  }

  const clearChecked = async () => {
    await supabase.from('shopping_items').delete().eq('week_start', weekStart).eq('checked', true)
    setItems(prev => prev.filter(i => !i.checked))
  }

  return { items, loading, generateFromMeals, toggleItem, clearChecked }
}
