import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const openaiKey = process.env.OPENAI_API_KEY ?? ''

// Use service role client for server-side breed lookups
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface BreedContext {
  breed_name: string
  health_predispositions: unknown[]
  behavioral_traits: Record<string, unknown>
  age_specific_concerns: Record<string, string>
  breed_specific_red_flags: string[]
  common_medications: unknown[]
  embedding_text: string
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI embedding error (${response.status})`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

function pickFallbackId(species: string, weightLbs?: number): string {
  if (species === 'cat') return 'cat_mixed'
  if (!weightLbs || weightLbs <= 25) return 'dog_mixed_small'
  if (weightLbs <= 55) return 'dog_mixed_medium'
  return 'dog_mixed_large'
}

const BREED_CONTEXT_FIELDS =
  'breed_name, health_predispositions, behavioral_traits, age_specific_concerns, breed_specific_red_flags, common_medications, embedding_text'

export async function getBreedContext(
  breedName: string,
  species: string,
  symptoms: string[],
  weightLbs?: number
): Promise<BreedContext | null> {
  try {
    // 1. Exact match (case-insensitive)
    const { data: exactMatch, error: exactError } = await supabaseAdmin
      .from('breed_knowledge')
      .select(BREED_CONTEXT_FIELDS)
      .ilike('breed_name', breedName)
      .limit(1)
      .single()

    if (!exactError && exactMatch) {
      return exactMatch as BreedContext
    }

    // 2. Semantic search fallback via embedding
    if (openaiKey) {
      const query = `${species} ${breedName} ${symptoms.join(' ')}`
      const embedding = await generateEmbedding(query)

      const { data: semanticMatch, error: semanticError } = await supabaseAdmin
        .rpc('match_breed_knowledge', {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 1,
        })

      if (!semanticError && semanticMatch && semanticMatch.length > 0) {
        return semanticMatch[0] as BreedContext
      }
    }

    // 3. Fallback to generic entry
    const fallbackId = pickFallbackId(species, weightLbs)
    const { data: fallback } = await supabaseAdmin
      .from('breed_knowledge')
      .select(BREED_CONTEXT_FIELDS)
      .eq('breed_id', fallbackId)
      .limit(1)
      .single()

    return (fallback as BreedContext) ?? null
  } catch (err) {
    console.error('[breed-knowledge] Error fetching breed context:', err)
    return null
  }
}

export function formatBreedContext(ctx: BreedContext): string {
  const sections: string[] = []

  sections.push(`Breed: ${ctx.breed_name}`)
  sections.push(`Summary: ${ctx.embedding_text}`)

  if (ctx.health_predispositions?.length) {
    const conditions = (ctx.health_predispositions as { condition: string; urgency_if_symptomatic: string }[])
      .map((h) => `- ${h.condition} (urgency: ${h.urgency_if_symptomatic})`)
      .join('\n')
    sections.push(`Health predispositions:\n${conditions}`)
  }

  if (ctx.behavioral_traits) {
    const bt = ctx.behavioral_traits as Record<string, string | string[]>
    const lines: string[] = []
    if (bt.temperament) lines.push(`- Temperament: ${bt.temperament}`)
    if (bt.anxiety_profile) lines.push(`- Anxiety profile: ${bt.anxiety_profile}`)
    if (Array.isArray(bt.notable_behaviors)) {
      lines.push(`- Notable behaviors: ${bt.notable_behaviors.join('; ')}`)
    }
    if (lines.length) sections.push(`Behavioral traits:\n${lines.join('\n')}`)
  }

  if (ctx.breed_specific_red_flags?.length) {
    sections.push(
      `Breed-specific red flags:\n${ctx.breed_specific_red_flags.map((f) => `- ${f}`).join('\n')}`
    )
  }

  if (ctx.common_medications?.length) {
    const meds = (ctx.common_medications as { medication: string; used_for: string }[])
      .map((m) => `- ${m.medication}: ${m.used_for}`)
      .join('\n')
    sections.push(`Common medications for this breed:\n${meds}`)
  }

  if (ctx.age_specific_concerns) {
    const age = Object.entries(ctx.age_specific_concerns)
      .map(([stage, note]) => `- ${stage}: ${note}`)
      .join('\n')
    sections.push(`Age-specific concerns:\n${age}`)
  }

  return sections.join('\n\n')
}
