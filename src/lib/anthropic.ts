import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Ingredient } from './supabase'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string)

export type ImportedRecipe = {
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  cook_time_minutes: number | null
  servings: number | null
  image_url: string | null
}

// Parse ISO 8601 duration (e.g. "PT45M", "PT1H30M") to minutes
function parseDuration(iso?: string): number | null {
  if (!iso) return null
  const h = iso.match(/(\d+)H/)?.[1]
  const m = iso.match(/(\d+)M/)?.[1]
  return (parseInt(h ?? '0') * 60) + parseInt(m ?? '0') || null
}

function firstImageUrl(image: unknown): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  if (Array.isArray(image)) return firstImageUrl(image[0])
  if (typeof image === 'object' && image !== null && 'url' in image) return (image as { url: string }).url
  return null
}

// Parse a "1 cup flour" style string into structured ingredient
function parseIngredientString(raw: string): Ingredient {
  const trimmed = raw.trim()
  // Match optional leading number/fraction + optional unit
  const match = trimmed.match(/^([\d\s¼-¾⅐-⅞\/\.]+)?\s*([a-zA-Z]+\.?)?\s+(.+)$/)
  if (match) {
    return { amount: (match[1] ?? '').trim(), unit: (match[2] ?? '').trim(), name: match[3].trim() }
  }
  return { amount: '', unit: '', name: trimmed }
}

function parseInstructions(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((step: unknown) => {
      if (typeof step === 'string') return step.trim()
      if (typeof step === 'object' && step !== null && 'text' in step) return String((step as { text: string }).text).trim()
      return ''
    }).filter(Boolean)
  }
  if (typeof raw === 'string') return raw.split(/\n+/).map(s => s.trim()).filter(Boolean)
  return []
}

// Try to extract a Recipe from JSON-LD embedded in the page HTML
function extractJsonLd(html: string): ImportedRecipe | null {
  const scriptTags = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  for (const tag of scriptTags) {
    try {
      const parsed = JSON.parse(tag[1])
      const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed]
      // Unwrap @graph if present
      const candidates: unknown[] = []
      for (const item of items) {
        if (item && typeof item === 'object' && '@graph' in item) {
          candidates.push(...((item as { '@graph': unknown[] })['@graph'] ?? []))
        } else {
          candidates.push(item)
        }
      }
      const recipe = candidates.find(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null &&
          String((item as Record<string, unknown>)['@type']).includes('Recipe')
      )
      if (!recipe) continue

      const ingredients = ((recipe.recipeIngredient as string[]) ?? []).map(parseIngredientString)
      const instructions = parseInstructions(recipe.recipeInstructions)

      return {
        title: String(recipe.name ?? ''),
        description: String(recipe.description ?? ''),
        ingredients,
        instructions,
        cook_time_minutes: parseDuration(recipe.totalTime as string) ?? parseDuration(recipe.cookTime as string),
        servings: recipe.recipeYield ? parseInt(String(recipe.recipeYield)) || null : null,
        image_url: firstImageUrl(recipe.image),
      }
    } catch { /* malformed JSON-LD, skip */ }
  }
  return null
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)
  if (!res.ok) throw new Error(`Could not fetch page (${res.status})`)
  return res.text()
}

// Gemini fallback: strip HTML to minimal text and ask the model to parse it
async function parseWithGemini(url: string, html: string): Promise<ImportedRecipe> {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2500)

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  const prompt = `Extract the recipe from this page content (${url}).
Return ONLY valid JSON, no markdown:
{"title":"...","description":"...","ingredients":[{"name":"...","amount":"...","unit":"..."}],"instructions":["..."],"cook_time_minutes":30,"servings":4,"image_url":null}

Page content:
${text}`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()
  const clean = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0]) as ImportedRecipe
}

export async function importRecipeFromUrl(url: string): Promise<ImportedRecipe> {
  const html = await fetchHtml(url)

  // Try JSON-LD first — works for most major recipe sites, uses zero AI tokens
  const fromSchema = extractJsonLd(html)
  if (fromSchema?.title && fromSchema.ingredients.length > 0) {
    return fromSchema
  }

  // Fall back to Gemini with minimal page text
  return parseWithGemini(url, html)
}
