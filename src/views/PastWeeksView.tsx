import { Loader2, History } from 'lucide-react'
import { usePastWeeks, weekLabel } from '../hooks/useWeekMeals'

export default function PastWeeksView() {
  const { weeks, loading } = usePastWeeks()
  const weekKeys = Object.keys(weeks).sort((a, b) => b.localeCompare(a))

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Past Weeks</h1>

      {loading ? (
        <div style={s.center}><Loader2 size={24} color="#6b7280" /></div>
      ) : weekKeys.length === 0 ? (
        <div style={s.empty}>
          <History size={48} color="#374151" />
          <p style={s.emptyTitle}>No past weeks yet</p>
          <p style={s.emptySub}>Your meal history will appear here once the week rolls over.</p>
        </div>
      ) : (
        weekKeys.map(weekStart => (
          <div key={weekStart} style={s.section}>
            <p style={s.weekLabel}>{weekLabel(weekStart)}</p>
            {weeks[weekStart].map(meal => (
              <div key={meal.id} style={s.card}>
                {meal.recipe?.image_url && (
                  <img src={meal.recipe.image_url} alt="" style={s.img} />
                )}
                <div style={s.cardBody}>
                  <p style={s.title}>{meal.recipe?.title ?? 'Unknown'}</p>
                  {meal.recipe?.cook_time_minutes && (
                    <p style={s.meta}>{meal.recipe.cook_time_minutes} min · {meal.recipe.servings ?? '?'} servings</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '24px 16px 100px', maxWidth: '700px', margin: '0 auto' },
  heading: { margin: '0 0 24px', fontSize: '26px', fontWeight: 700, color: '#f9fafb' },
  center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '60px 0' },
  emptyTitle: { margin: 0, fontSize: '17px', fontWeight: 600, color: '#9ca3af' },
  emptySub: { margin: 0, fontSize: '14px', color: '#6b7280', textAlign: 'center', maxWidth: '260px' },
  section: { marginBottom: '32px' },
  weekLabel: { margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' },
  card: { display: 'flex', alignItems: 'center', background: '#1f2937', borderRadius: '14px', border: '1px solid #374151', marginBottom: '8px', overflow: 'hidden' },
  img: { width: '64px', height: '64px', objectFit: 'cover', flexShrink: 0 },
  cardBody: { flex: 1, padding: '14px 16px' },
  title: { margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#f9fafb' },
  meta: { margin: 0, fontSize: '12px', color: '#6b7280' },
}
