import { useState } from 'react'
import { RefreshCw, Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { useWeekMeals, weekLabel } from '../hooks/useWeekMeals'
import { useShopping } from '../hooks/useShopping'

export default function ShoppingView() {
  const { meals, week } = useWeekMeals()
  const { items, loading, generateFromMeals, toggleItem, clearChecked } = useShopping(week)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try { await generateFromMeals(meals) }
    finally { setGenerating(false) }
  }

  const checkedCount = items.filter(i => i.checked).length

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>Shopping List</h1>
          <p style={s.sub}>{weekLabel(week)}</p>
        </div>
        <button style={s.regenBtn} onClick={handleGenerate} disabled={generating || meals.length === 0}>
          {generating ? <Loader2 size={16} /> : <RefreshCw size={16} />}
        </button>
      </div>

      {checkedCount > 0 && (
        <button style={s.clearBtn} onClick={clearChecked}>
          <Trash2 size={14} /> Clear {checkedCount} checked
        </button>
      )}

      {loading ? (
        <div style={s.center}><Loader2 size={24} color="#6b7280" /></div>
      ) : items.length === 0 ? (
        <div style={s.empty}>
          <ShoppingBag size={48} color="#374151" />
          <p style={s.emptyTitle}>No items yet</p>
          <p style={s.emptySub}>
            {meals.length === 0
              ? 'Add meals to This Week first, then come back here.'
              : 'Tap the refresh button to generate from this week\'s meals.'}
          </p>
          {meals.length > 0 && (
            <button style={s.generateBtn} onClick={handleGenerate} disabled={generating}>
              {generating ? <><Loader2 size={15} /> Generating…</> : 'Generate List'}
            </button>
          )}
        </div>
      ) : (
        <div style={s.list}>
          {items.map(item => (
            <button
              key={item.id}
              style={{ ...s.item, opacity: item.checked ? 0.45 : 1 }}
              onClick={() => toggleItem(item.id, !item.checked)}
            >
              <span style={{ ...s.checkbox, background: item.checked ? '#f97316' : 'transparent', borderColor: item.checked ? '#f97316' : '#4b5563' }}>
                {item.checked && <span style={s.checkmark}>✓</span>}
              </span>
              <span style={{ ...s.itemName, textDecoration: item.checked ? 'line-through' : 'none' }}>
                {item.name}
              </span>
              {(item.amount || item.unit) && (
                <span style={s.itemAmt}>{[item.amount, item.unit].filter(Boolean).join(' ')}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '24px 16px 100px', maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  heading: { margin: '0 0 2px', fontSize: '26px', fontWeight: 700, color: '#f9fafb' },
  sub: { margin: 0, fontSize: '13px', color: '#6b7280' },
  regenBtn: { background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px 12px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  clearBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #374151', borderRadius: '8px', padding: '8px 14px', color: '#9ca3af', cursor: 'pointer', fontSize: '13px', marginBottom: '16px' },
  center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '60px 0' },
  emptyTitle: { margin: 0, fontSize: '17px', fontWeight: 600, color: '#9ca3af' },
  emptySub: { margin: 0, fontSize: '14px', color: '#6b7280', textAlign: 'center', maxWidth: '260px' },
  generateBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f97316', border: 'none', borderRadius: '10px', color: '#fff', padding: '12px 24px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, marginTop: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '2px' },
  item: { display: 'flex', alignItems: 'center', gap: '14px', background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'opacity 0.15s' },
  checkbox: { width: '22px', height: '22px', borderRadius: '6px', border: '2px solid', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: '13px', fontWeight: 700 },
  itemName: { flex: 1, fontSize: '15px', color: '#f9fafb' },
  itemAmt: { fontSize: '13px', color: '#6b7280', flexShrink: 0 },
}
