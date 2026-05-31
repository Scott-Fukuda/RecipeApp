import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Check, BookOpen, Loader2, SquarePen, ClipboardCopy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useWeekMeals } from '../hooks/useWeekMeals'
import type { Recipe } from '../lib/supabase'

export default function LibraryView() {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const { meals, addFromLibrary } = useWeekMeals()
  const [copied, setCopied] = useState<string | null>(null)

  const copyIngredients = (recipeId: string, ingredients: { name: string }[]) => {
    const text = ingredients.map(i => i.name).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(recipeId)
    setTimeout(() => setCopied(null), 2000)
  }

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setRecipes(data ?? []); setLoading(false) })
  }, [])

  // Pre-populate which recipes are already in this week
  useEffect(() => {
    setAdded(new Set(meals.map(m => m.recipe_id)))
  }, [meals])

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase())
  )

  const handleAdd = async (recipe: Recipe) => {
    if (adding) return
    setAdding(recipe.id)
    try {
      await addFromLibrary(recipe.id)
      setAdded(prev => new Set([...prev, recipe.id]))
    } finally {
      setAdding(null)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <h1 style={s.heading}>Library</h1>
        <button style={s.createBtn} onClick={() => navigate('/create')}>
          <SquarePen size={16} /> Create
        </button>
      </div>

      <div style={s.searchRow}>
        <Search size={16} color="#6b7280" style={{ flexShrink: 0 }} />
        <input
          style={s.searchInput}
          placeholder="Search recipes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={s.center}><Loader2 size={24} color="#6b7280" /></div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <BookOpen size={48} color="#374151" />
          <p style={s.emptyTitle}>{recipes.length === 0 ? 'No recipes yet' : 'No results'}</p>
          <p style={s.emptySub}>
            {recipes.length === 0
              ? 'Import a recipe from This Week to build your library.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        filtered.map(recipe => {
          const isAdded = added.has(recipe.id)
          const isAdding = adding === recipe.id
          const url = recipe.external_id
          return (
            <div key={recipe.id} style={s.card}>
              {recipe.image_url && (
                <img src={recipe.image_url} alt="" style={s.img} />
              )}
              <div
                style={{ ...s.cardBody, cursor: url ? 'pointer' : 'default' }}
                onClick={() => url && window.open(url, '_blank', 'noopener')}
              >
                <p style={s.title}>{recipe.title}</p>
                {(recipe.cook_time_minutes || recipe.servings) && (
                  <p style={s.meta}>
                    {[
                      recipe.cook_time_minutes && `${recipe.cook_time_minutes} min`,
                      recipe.servings && `${recipe.servings} servings`,
                    ].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              {recipe.ingredients?.length > 0 && (
                <button
                  style={s.clipBtn}
                  onClick={() => copyIngredients(recipe.id, recipe.ingredients)}
                  title="Copy ingredients"
                >
                  {copied === recipe.id
                    ? <Check size={15} color="#4ade80" />
                    : <ClipboardCopy size={15} color="#6b7280" />}
                </button>
              )}
              <button
                style={{ ...s.addBtn, background: isAdded ? '#14532d' : '#1e3a5f' }}
                onClick={() => !isAdded && handleAdd(recipe)}
                disabled={isAdding}
              >
                {isAdding
                  ? <Loader2 size={16} color="#93c5fd" />
                  : isAdded
                    ? <Check size={16} color="#4ade80" />
                    : <Plus size={16} color="#93c5fd" />}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '24px 16px 100px', maxWidth: '700px', margin: '0 auto' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  heading: { margin: 0, fontSize: '26px', fontWeight: 700, color: '#f9fafb' },
  createBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', color: '#9ca3af', fontSize: '14px', fontWeight: 500, padding: '8px 14px', cursor: 'pointer' },
  searchRow: { display: 'flex', alignItems: 'center', gap: '10px', background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px' },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f9fafb', fontSize: '15px' },
  center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '60px 0' },
  emptyTitle: { margin: 0, fontSize: '17px', fontWeight: 600, color: '#9ca3af' },
  emptySub: { margin: 0, fontSize: '14px', color: '#6b7280', textAlign: 'center', maxWidth: '260px' },
  card: { display: 'flex', alignItems: 'center', background: '#1f2937', borderRadius: '14px', border: '1px solid #374151', marginBottom: '10px', overflow: 'hidden' },
  img: { width: '72px', height: '72px', objectFit: 'cover', flexShrink: 0 },
  cardBody: { flex: 1, padding: '14px 16px' },
  title: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#f9fafb' },
  meta: { margin: 0, fontSize: '12px', color: '#6b7280' },
  clipBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  addBtn: { border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '14px', flexShrink: 0 },
}
