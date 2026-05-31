import { useState } from 'react'
import { Trash2, Plus, Link, Loader2, ChefHat, ShoppingCart, ClipboardCopy, Check } from 'lucide-react'
import { useWeekMeals, weekLabel } from '../hooks/useWeekMeals'
import { useNavigate } from 'react-router-dom'

export default function ThisWeekView() {
  const { meals, loading, addFromUrl, removeMeal, week } = useWeekMeals()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const copyGroceryList = () => {
    const names = meals.flatMap(m => m.recipe?.ingredients ?? []).map(i => i.name).filter(Boolean)
    navigator.clipboard.writeText(names.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = async () => {
    if (!url.trim()) return
    setImporting(true)
    setError('')
    try {
      await addFromUrl(url.trim())
      setUrl('')
      setShowModal(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import recipe')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>This Week</h1>
          <p style={s.sub}>{weekLabel(week)}</p>
        </div>
        <button style={s.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={20} />
        </button>
      </div>

      {loading ? (
        <div style={s.center}><Loader2 size={24} color="#6b7280" className="spin" /></div>
      ) : meals.length === 0 ? (
        <div style={s.empty}>
          <ChefHat size={48} color="#374151" />
          <p style={s.emptyTitle}>No meals yet</p>
          <p style={s.emptySub}>Paste a recipe link to add it to this week.</p>
          <button style={s.emptyBtn} onClick={() => setShowModal(true)}>
            <Link size={16} /> Add Recipe
          </button>
        </div>
      ) : (
        <>
          {meals.map(meal => {
            const recipeUrl = meal.recipe?.external_id
            return (
              <div key={meal.id} style={s.card}>
                {meal.recipe?.image_url && (
                  <img src={meal.recipe.image_url} alt="" style={s.img} />
                )}
                <div
                  style={{ ...s.cardBody, cursor: recipeUrl ? 'pointer' : 'default' }}
                  onClick={() => recipeUrl && window.open(recipeUrl, '_blank', 'noopener')}
                >
                  <p style={s.title}>{meal.recipe?.title ?? 'Unknown'}</p>
                  {meal.recipe?.cook_time_minutes && (
                    <p style={s.meta}>{meal.recipe.cook_time_minutes} min · {meal.recipe.servings ?? '?'} servings</p>
                  )}
                </div>
                <button style={s.removeBtn} onClick={() => removeMeal(meal.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
          <div style={s.actions}>
            <button style={s.copyBtn} onClick={copyGroceryList}>
              {copied ? <Check size={17} /> : <ClipboardCopy size={17} />}
              {copied ? 'Copied!' : 'Copy Grocery List'}
            </button>
            <button style={s.shoppingBtn} onClick={() => navigate('/shopping')}>
              <ShoppingCart size={17} /> Shopping List
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div style={s.overlay} onClick={() => !importing && setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Add Recipe</h2>
            <p style={s.modalSub}>Paste any recipe URL — Claude will fetch and parse it.</p>
            <div style={s.inputRow}>
              <Link size={16} color="#6b7280" style={{ flexShrink: 0 }} />
              <input
                style={s.input}
                type="url"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleImport()}
                autoFocus
                disabled={importing}
              />
            </div>
            {error && <p style={s.errorText}>{error}</p>}
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)} disabled={importing}>
                Cancel
              </button>
              <button style={s.importBtn} onClick={handleImport} disabled={importing || !url.trim()}>
                {importing ? <><Loader2 size={15} /> Importing…</> : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '24px 16px 100px', maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  heading: { margin: '0 0 2px', fontSize: '26px', fontWeight: 700, color: '#f9fafb' },
  sub: { margin: 0, fontSize: '13px', color: '#6b7280' },
  addBtn: { background: '#f97316', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 },
  center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '60px 0' },
  emptyTitle: { margin: 0, fontSize: '17px', fontWeight: 600, color: '#9ca3af' },
  emptySub: { margin: 0, fontSize: '14px', color: '#6b7280', textAlign: 'center', maxWidth: '260px' },
  emptyBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', color: '#f9fafb', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
  card: { display: 'flex', alignItems: 'center', background: '#1f2937', borderRadius: '14px', border: '1px solid #374151', marginBottom: '10px', overflow: 'hidden' },
  img: { width: '72px', height: '72px', objectFit: 'cover', flexShrink: 0 },
  cardBody: { flex: 1, padding: '14px 16px' },
  title: { margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#f9fafb' },
  meta: { margin: 0, fontSize: '12px', color: '#6b7280' },
  removeBtn: { background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '16px', borderLeft: '1px solid #374151', display: 'flex' },
  actions: { display: 'flex', gap: '10px', marginTop: '16px' },
  copyBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', background: '#1f2937', border: '1px solid #374151', borderRadius: '14px', color: '#f9fafb', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  shoppingBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', background: '#f97316', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 50 },
  modal: { background: '#1f2937', borderRadius: '20px 20px 0 0', padding: '28px 20px 40px', width: '100%', maxWidth: '700px', margin: '0 auto' },
  modalTitle: { margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#f9fafb' },
  modalSub: { margin: '0 0 20px', fontSize: '14px', color: '#9ca3af' },
  inputRow: { display: 'flex', alignItems: 'center', gap: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' },
  input: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f9fafb', fontSize: '15px' },
  errorText: { margin: '0 0 12px', fontSize: '13px', color: '#f87171' },
  modalActions: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: { flex: 1, padding: '14px', background: '#374151', border: 'none', borderRadius: '12px', color: '#9ca3af', fontSize: '15px', cursor: 'pointer' },
  importBtn: { flex: 2, padding: '14px', background: '#f97316', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
}
