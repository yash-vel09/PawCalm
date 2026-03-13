import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ─── Emergency safety check ────────────────────────────────────────────────

const EMERGENCY_KEYWORDS = [
  'seizure', 'bloat', 'not breathing', 'difficulty breathing', 'collapse',
  'poisoning', 'ate chocolate', 'ate rat poison', 'ate antifreeze',
  'uncontrolled bleeding', 'hit by car', 'unconscious', "can't stand",
  'stomach distended', 'hard stomach',
]

function isEmergency(concernTypes: string[], description: string): boolean {
  const text = [...concernTypes, description].join(' ').toLowerCase()
  return EMERGENCY_KEYWORDS.some((kw) => text.includes(kw))
}

// ─── Label maps (for building the user message) ───────────────────────────

const CONCERN_LABEL: Record<string, string> = {
  not_eating:      'Not eating / eating less',
  low_energy:      'Low energy / lethargy',
  vomiting:        'Vomiting / upset stomach',
  bathroom_issues: 'Bathroom issues',
  unusual_barking: 'Unusual barking / whining',
  aggression:      'Aggression / behavior changes',
  limping:         'Limping / mobility issues',
  something_else:  'Something else',
}
const ONSET_LABEL: Record<string, string> = {
  within_the_hour: 'Within the last hour',
  earlier_today:   'Earlier today',
  yesterday:       'Yesterday',
  few_days:        'A few days ago',
  week_or_more:    'A week or more ago',
}
const SYMPTOM_LABEL: Record<string, string> = {
  excessive_drooling: 'Excessive drooling', shaking: 'Shaking / trembling',
  coughing: 'Coughing', sneezing: 'Sneezing', eye_discharge: 'Eye discharge',
  swelling: 'Swelling', skin_changes: 'Skin changes', bad_breath: 'Bad breath',
  excessive_thirst: 'Excessive thirst', weight_change: 'Weight change',
}
const CHANGE_LABEL: Record<string, string> = {
  new_food: 'New food introduced', moved_home: 'Moved home',
  new_pet: 'New pet in household', new_family_member: 'New family member',
  schedule_change: 'Schedule change', boarding_travel: 'Boarding or travel',
  weather_change: 'Weather change', new_medication: 'New medication',
  vet_visit: 'Recent vet visit', loss_of_companion: 'Loss of companion',
}
const EATING_LABEL: Record<string, string> = {
  eats_everything: 'Eats everything', moderate_eater: 'Moderate eater',
  picky_eater: 'Picky eater', variable: 'Variable',
}
const ENERGY_LABEL: Record<string, string> = {
  very_active: 'Very active', moderately_active: 'Moderately active',
  calm: 'Calm', low_energy: 'Low energy',
}
const HEALTH_LABEL: Record<string, string> = {
  allergies: 'Allergies', joint_issues: 'Joint issues',
  heart_condition: 'Heart condition', diabetes: 'Diabetes',
  seizures: 'Seizures', other: 'Other',
}

// ─── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are PawCalm, a compassionate AI assistant helping dog owners understand their pet's behavioral changes. Your purpose is to reduce anxiety and provide clear guidance — not to diagnose or prescribe.

YOUR IDENTITY:
- You are a knowledgeable, calm, and caring companion
- You speak like a trusted friend who happens to know a lot about dogs
- You always use the dog's name to personalize your response
- You acknowledge worry before providing guidance

STRICT BOUNDARIES — NEVER DO:
- Provide specific medical diagnoses
- Recommend medications or dosages
- Discourage veterinary consultation
- Make definitive claims about health conditions
- Dismiss owner concerns as "nothing"

ALWAYS DO:
- Recommend immediate vet care for: difficulty breathing, seizures, bloat symptoms, trauma, poisoning, collapse, severe pain, uncontrolled bleeding
- Include a brief disclaimer in the reassurance_note
- Provide multiple possible explanations (not diagnoses)
- Give clear, actionable next steps
- Use the dog's name throughout

RECOMMENDATION LOGIC:
- "monitor": Likely benign, no immediate action needed, watch for changes
- "try_this": Specific home interventions may help, monitor response over 24-48 hours
- "call_vet": Symptoms warrant professional evaluation (ALWAYS err toward this when uncertain)

Respond ONLY with valid JSON matching this exact structure:
{
  "likely_explanations": ["2-3 possible reasons, ranked by likelihood"],
  "what_to_watch_for": ["2-3 specific signs to monitor"],
  "recommendation": "monitor" | "try_this" | "call_vet",
  "suggested_actions": ["2-3 practical steps the owner can take"],
  "questions_for_vet": ["2-3 questions if vet visit recommended, else empty array"],
  "reassurance_note": "A warm, empathetic 1-2 sentence message that acknowledges the concern, uses the dog's name, provides perspective, and ends with: This is general guidance and not a substitute for veterinary advice."
}`

// ─── User message builder ──────────────────────────────────────────────────

interface DogProfileInput {
  name: string; breed: string; age_years: number | null; is_puppy: boolean
  weight_lbs: number; health_conditions: string[]; medications: string
  normal_eating: string; normal_energy: string; vet_clinic: string
}
interface ConcernInput {
  concern_types: string[]; description: string; onset_timing: string | null
  physical_symptoms: string[]; recent_changes: string[]; worry_level: number | null
}

function buildUserMessage(dp: DogProfileInput, concern: ConcernInput): string {
  const age = dp.is_puppy
    ? 'under 1 year old (puppy)'
    : dp.age_years
    ? `${dp.age_years} year${dp.age_years === 1 ? '' : 's'} old`
    : 'age unknown'

  const conditions = (dp.health_conditions ?? [])
    .filter((c: string) => c !== 'none')
    .map((c: string) => HEALTH_LABEL[c] ?? c)
    .join(', ') || 'None'

  const concernTypes = (concern.concern_types ?? [])
    .map((c: string) => CONCERN_LABEL[c] ?? c)
    .join(', ')

  const symptoms = (concern.physical_symptoms ?? [])
    .filter((s: string) => s !== 'none')
    .map((s: string) => SYMPTOM_LABEL[s] ?? s)
    .join(', ') || 'None reported'

  const changes = (concern.recent_changes ?? [])
    .filter((c: string) => c !== 'nothing_changed')
    .map((c: string) => CHANGE_LABEL[c] ?? c)
    .join(', ') || 'No recent changes'

  const onset = concern.onset_timing
    ? (ONSET_LABEL[concern.onset_timing] ?? concern.onset_timing)
    : 'Unknown'

  return `My dog ${dp.name} is ${age}, a ${dp.breed}, weighing ${dp.weight_lbs} lbs.
Known health conditions: ${conditions}.
Current medications: ${dp.medications || 'None'}.
Normal eating: ${EATING_LABEL[dp.normal_eating] ?? dp.normal_eating}. Normal energy: ${ENERGY_LABEL[dp.normal_energy] ?? dp.normal_energy}.

Current concern: ${concernTypes}
Details: ${concern.description || 'No additional details provided'}
Started: ${onset}
Physical symptoms: ${symptoms}
Recent changes: ${changes}
Owner's worry level: ${concern.worry_level ?? 'Not specified'} out of 5`
}

// ─── Fallback response ─────────────────────────────────────────────────────

const FALLBACK_RESPONSE = {
  recommendation: 'call_vet' as const,
  likely_explanations: [],
  what_to_watch_for: [],
  suggested_actions: ['Consider contacting your vet if you remain concerned'],
  questions_for_vet: [],
  reassurance_note:
    "We weren't able to complete the analysis right now. When in doubt, checking in with your vet is always a good idea. Please try again in a moment.",
  error: true,
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dog_profile, concern } = body

    if (!dog_profile || !concern) {
      return NextResponse.json(FALLBACK_RESPONSE, { status: 400 })
    }

    // Safety check — skip AI for emergencies
    if (isEmergency(concern.concern_types ?? [], concern.description ?? '')) {
      return NextResponse.json({
        recommendation: 'call_vet',
        is_emergency: true,
        likely_explanations: [
          'The symptoms you described may require immediate professional attention',
        ],
        what_to_watch_for: [
          'Any worsening of current symptoms',
          'Changes in breathing, consciousness, or ability to stand',
        ],
        suggested_actions: [
          'Contact your vet or emergency animal hospital immediately',
          'Keep your dog calm and still while you arrange transport',
        ],
        questions_for_vet: [
          'Is this an emergency that needs to be seen right now?',
          'What should I do while on my way to the clinic?',
        ],
        reassurance_note: `Based on what you've described, please contact your vet or emergency animal hospital right away. ${dog_profile.name} needs professional attention for this. This is general guidance and not a substitute for veterinary advice.`,
      })
    }

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
      console.error('ANTHROPIC_API_KEY is not configured')
      return NextResponse.json(FALLBACK_RESPONSE, { status: 500 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const userMessage = buildUserMessage(dog_profile, concern)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const contentBlock = message.content[0]
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected content type from Claude')
    }

    // Strip markdown code fences if Claude wrapped the JSON
    const jsonText = contentBlock.text
      .trim()
      .replace(/^```json\s*/m, '')
      .replace(/^```\s*/m, '')
      .replace(/```\s*$/m, '')

    const parsed = JSON.parse(jsonText)

    // Validate the required fields are present
    const required = ['likely_explanations', 'what_to_watch_for', 'recommendation', 'suggested_actions', 'questions_for_vet', 'reassurance_note']
    for (const field of required) {
      if (!(field in parsed)) throw new Error(`Missing field: ${field}`)
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[/api/assess] Error:', error)
    return NextResponse.json(FALLBACK_RESPONSE, { status: 500 })
  }
}
