import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { importRecipeFromUrl } from '../lib/anthropic'
import type { WeekMeal } from '../lib/supabase'

export function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function weekLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function useWeekMeals(weekStart?: string) {
  const week = weekStart ?? getWeekStart()
  const [meals, setMeals] = useState<WeekMeal[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('week_meals')
      .select('*, recipe:recipes(*)')
      .eq('week_start', week)
      .order('created_at', { ascending: true })
    setMeals(data ?? [])
    setLoading(false)
  }, [week])

  useEffect(() => { load() }, [load])

  const addFromUrl = async (url: string) => {
    const imported = await importRecipeFromUrl(url)

    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes')
      .insert({
        title: imported.title,
        description: imported.description,
        ingredients: imported.ingredients,
        instructions: imported.instructions,
        cook_time_minutes: imported.cook_time_minutes,
        servings: imported.servings,
        image_url: imported.image_url,
        source: 'feed',
        external_id: url,
        macros: null,
      })
      .select()
      .single()
    if (recipeErr) throw recipeErr

    const { data: meal, error: mealErr } = await supabase
      .from('week_meals')
      .insert({ recipe_id: recipe.id, week_start: week })
      .select('*, recipe:recipes(*)')
      .single()
    if (mealErr) throw mealErr

    setMeals(prev => [...prev, meal])
  }

  const addFromLibrary = async (recipeId: string) => {
    const { data: meal, error } = await supabase
      .from('week_meals')
      .insert({ recipe_id: recipeId, week_start: week })
      .select('*, recipe:recipes(*)')
      .single()
    if (error) throw error
    setMeals(prev => [...prev, meal])
  }

  const removeMeal = async (mealId: string) => {
    await supabase.from('week_meals').delete().eq('id', mealId)
    setMeals(prev => prev.filter(m => m.id !== mealId))
  }

  return { meals, loading, addFromUrl, addFromLibrary, removeMeal, reload: load, week }
}

export function usePastWeeks() {
  const [weeks, setWeeks] = useState<Record<string, WeekMeal[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentWeek = getWeekStart()
    supabase
      .from('week_meals')
      .select('*, recipe:recipes(*)')
      .lt('week_start', currentWeek)
      .order('week_start', { ascending: false })
      .then(({ data }) => {
        const grouped: Record<string, WeekMeal[]> = {}
        for (const meal of data ?? []) {
          if (!grouped[meal.week_start]) grouped[meal.week_start] = []
          grouped[meal.week_start].push(meal)
        }
        setWeeks(grouped)
        setLoading(false)
      })
  }, [])

  return { weeks, loading }
}
