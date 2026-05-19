import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Ingredient } from '../lib/supabase'

type Step = { id: number; text: string }
type IngredientRow = Ingredient & { id: number }

let uid = 0
const newId = () => ++uid

export default function CreateRecipeView() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { id: newId(), name: '', amount: '', unit: '' },
  ])
  const [steps, setSteps] = useState<Step[]>([
    { id: newId(), text: '' },
  ])

  const addIngredient = () =>
    setIngredients(prev => [...prev, { id: newId(), name: '', amount: '', unit: '' }])

  const updateIngredient = (id: number, field: keyof Ingredient, value: string) =>
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const removeIngredient = (id: number) =>
    setIngredients(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev)

  const addStep = () => setSteps(prev => [...prev, { id: newId(), text: '' }])

  const updateStep = (id: number, text: string) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, text } : s))

  const removeStep = (id: number) =>
    setSteps(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await supabase.from('recipes').insert({
        title: title.trim(),
        description: description.trim() || null,
        ingredients: ingredients.filter(i => i.name.trim()).map(({ name, amount, unit }) => ({ name, amount, unit })),
        instructions: steps.filter(s => s.text.trim()).map(s => s.text.trim()),
        cook_time_minutes: cookTime ? parseInt(cookTime) || null : null,
        servings: servings ? parseInt(servings) || null : null,
        source: 'manual',
        external_id: null,
        image_url: null,
        macros: null,
      })
      navigate('/library')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.back} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={s.heading}>Create Recipe</h1>
        <button style={{ ...s.saveBtn, opacity: title.trim() ? 1 : 0.4 }} onClick={handleSave} disabled={saving || !title.trim()}>
          {saving ? <Loader2 size={16} /> : 'Save'}
        </button>
      </div>

      {/* Title */}
      <input
        style={s.titleInput}
        placeholder="Recipe name"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      {/* Description */}
      <textarea
        style={s.textarea}
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
      />

      {/* Cook time + servings */}
      <div style={s.row}>
        <div style={s.halfField}>
          <label style={s.label}>Cook time (min)</label>
          <input style={s.smallInput} type="number" placeholder="30" value={cookTime} onChange={e => setCookTime(e.target.value)} />
        </div>
        <div style={s.halfField}>
          <label style={s.label}>Servings</label>
          <input style={s.smallInput} type="number" placeholder="4" value={servings} onChange={e => setServings(e.target.value)} />
        </div>
      </div>

      {/* Ingredients */}
      <p style={s.sectionTitle}>Ingredients</p>
      {ingredients.map((ing, i) => (
        <div key={ing.id} style={s.ingredientRow}>
          <input
            style={{ ...s.field, flex: 2 }}
            placeholder="Ingredient"
            value={ing.name}
            onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
          />
          <input
            style={{ ...s.field, flex: 1 }}
            placeholder="Amount"
            value={ing.amount}
            onChange={e => updateIngredient(ing.id, 'amount', e.target.value)}
          />
          <input
            style={{ ...s.field, flex: 1 }}
            placeholder="Unit"
            value={ing.unit}
            onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
          />
          <button style={s.removeBtn} onClick={() => removeIngredient(ing.id)} tabIndex={-1}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button style={s.addRowBtn} onClick={addIngredient}>
        <Plus size={15} /> Add ingredient
      </button>

      {/* Instructions */}
      <p style={s.sectionTitle}>Instructions</p>
      {steps.map((step, i) => (
        <div key={step.id} style={s.stepRow}>
          <span style={s.stepNum}>{i + 1}</span>
          <textarea
            style={s.stepInput}
            placeholder={`Step ${i + 1}`}
            value={step.text}
            rows={2}
            onChange={e => updateStep(step.id, e.target.value)}
          />
          <button style={s.removeBtn} onClick={() => removeStep(step.id)} tabIndex={-1}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button style={s.addRowBtn} onClick={addStep}>
        <Plus size={15} /> Add step
      </button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '0 16px 100px', maxWidth: '700px', margin: '0 auto' },
  topBar: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0 20px', position: 'sticky', top: 0, background: '#111827', zIndex: 10 },
  back: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' },
  heading: { flex: 1, margin: 0, fontSize: '20px', fontWeight: 700, color: '#f9fafb' },
  saveBtn: { background: '#f97316', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '15px', padding: '8px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  titleInput: { width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f9fafb', fontSize: '18px', fontWeight: 600, padding: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f9fafb', fontSize: '15px', padding: '12px 14px', outline: 'none', resize: 'none', marginBottom: '16px', boxSizing: 'border-box', fontFamily: 'inherit' },
  row: { display: 'flex', gap: '12px', marginBottom: '20px' },
  halfField: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  smallInput: { background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', color: '#f9fafb', fontSize: '15px', padding: '10px 12px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  sectionTitle: { margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' },
  ingredientRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  field: { background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', color: '#f9fafb', fontSize: '14px', padding: '10px 12px', outline: 'none', minWidth: 0 },
  removeBtn: { background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '6px', flexShrink: 0, display: 'flex' },
  addRowBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px dashed #374151', borderRadius: '10px', color: '#6b7280', padding: '10px 14px', cursor: 'pointer', fontSize: '14px', width: '100%', marginBottom: '24px' },
  stepRow: { display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' },
  stepNum: { width: '24px', height: '24px', background: '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#9ca3af', flexShrink: 0, marginTop: '10px' },
  stepInput: { flex: 1, background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', color: '#f9fafb', fontSize: '14px', padding: '10px 12px', outline: 'none', resize: 'none', fontFamily: 'inherit' },
}
