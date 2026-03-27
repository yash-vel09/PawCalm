import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ─── Emergency safety check ────────────────────────────────────────────────

const EMERGENCY_KEYWORDS = [
  // Dog emergencies
  'seizure', 'bloat', 'not breathing', 'difficulty breathing', 'collapse',
  'poisoning', 'ate chocolate', 'ate rat poison', 'ate antifreeze',
  'uncontrolled bleeding', 'hit by car', 'unconscious', "can't stand",
  'stomach distended', 'hard stomach',
  // Cat emergencies
  'straining to urinate', "can't urinate", 'cannot urinate', 'blood in urine',
  'urinary blockage', 'open mouth breathing', 'panting cat', 'cat panting',
  'ate lily', 'ate lilies', 'ate string', 'thread hanging from mouth',
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

const SYSTEM_PROMPT = `You are PawCalm, a compassionate AI assistant helping pet owners understand their pet's behavioral changes. Your purpose is to reduce anxiety and provide clear guidance — not to diagnose or prescribe.

YOUR IDENTITY:
- You are a knowledgeable, calm, and caring companion
- You speak like a trusted friend who happens to know a lot about dogs and cats
- You always use the pet's name to personalize your response
- You acknowledge worry before providing guidance

STRICT BOUNDARIES — NEVER DO:
- Provide specific medical diagnoses
- Recommend medications or dosages
- Discourage veterinary consultation
- Make definitive claims about health conditions
- Dismiss owner concerns as "nothing"

ALWAYS DO:
- Recommend immediate vet care for: difficulty breathing, seizures, bloat symptoms, trauma, poisoning, collapse, severe pain, uncontrolled bleeding, urinary blockage in cats, lily ingestion in cats, open-mouth breathing in cats
- Include a brief disclaimer in the reassurance_note
- Provide multiple possible explanations (not diagnoses)
- Give clear, actionable next steps
- Use the pet's name throughout — never use "they", "their", or "them" when referring to the pet; use their name or "your dog"/"your cat" instead

SPECIES-SPECIFIC GUIDANCE:
You support both dogs and cats. Adjust your guidance based on the pet's species.

FOR DOGS:
- Reference breed-specific tendencies when relevant (e.g., "Golden Retrievers are prone to...")
- Common dog red flags: bloat/GDV, chocolate ingestion, xylitol, antifreeze

FOR CATS:
- Cats hide pain instinctively — acknowledge this to owners ("Cats are experts at hiding discomfort, so the fact that you noticed a change is important")
- Litter box changes are often the FIRST sign of illness in cats — take them seriously
- Male cats straining to urinate is a MEDICAL EMERGENCY — always recommend immediate vet
- Common cat red flags: urinary blockage (especially male cats), lily ingestion, open-mouth breathing, string/thread ingestion
- Indoor vs outdoor cats have different risk profiles (outdoor: injuries, parasites, toxins; indoor: stress, obesity, urinary issues)
- Reference breed-specific tendencies when relevant
- Always use species-appropriate language (e.g., "litter box" not "bathroom" for cats)

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
  "reassurance_note": "A warm, empathetic 1-2 sentence message that acknowledges the concern, uses the pet's name, provides perspective, and ends with: This is general guidance and not a substitute for veterinary advice."
}`

// ─── User message builder ──────────────────────────────────────────────────

interface DogProfileInput {
  species: string; name: string; breed: string; age_years: number | null; is_puppy: boolean
  weight_lbs: number; health_conditions: string[]; medications: string
  normal_eating: string; normal_energy: string; vet_clinic: string
  // Cat-specific
  indoor_outdoor?: string; normal_litter_box?: string; normal_grooming?: string
}
interface ConcernInput {
  concern_types: string[]; description: string; onset_timing: string | null
  physical_symptoms: string[]; symptom_notes?: string
  recent_changes: string[]; recent_changes_notes?: string
  worry_level: number | null
}

function buildUserMessage(dp: DogProfileInput, concern: ConcernInput): string {
  const species = dp.species === 'cat' ? 'cat' : 'dog'
  const isCat = species === 'cat'

  const age = dp.is_puppy
    ? `under 1 year old (${isCat ? 'kitten' : 'puppy'})`
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

  const catContext = isCat ? [
    dp.indoor_outdoor ? `Living situation: ${dp.indoor_outdoor}.` : '',
    dp.normal_litter_box ? `Normal litter box habits: ${dp.normal_litter_box}.` : '',
    dp.normal_grooming ? `Normal grooming: ${dp.normal_grooming}.` : '',
  ].filter(Boolean).join('\n') : ''

  return `My ${species} ${dp.name} is ${age}, a ${dp.breed}, weighing ${dp.weight_lbs} lbs.
Known health conditions: ${conditions}.
Current medications: ${dp.medications || 'None'}.
Normal eating: ${EATING_LABEL[dp.normal_eating] ?? dp.normal_eating}. Normal energy: ${ENERGY_LABEL[dp.normal_energy] ?? dp.normal_energy}.
${catContext ? catContext + '\n' : ''}
Current concern: ${concernTypes}
Details: ${concern.description || 'No additional details provided'}
Started: ${onset}
Physical symptoms: ${symptoms}${concern.symptom_notes?.trim() ? `\nAdditional symptom details: ${concern.symptom_notes.trim()}` : ''}
Recent changes: ${changes}${concern.recent_changes_notes?.trim() ? `\nAdditional context about changes: ${concern.recent_changes_notes.trim()}` : ''}
Owner's worry level: ${concern.worry_level ?? 'Not specified'} out of 5`
}

// ─── Fallback response (actual errors) ─────────────────────────────────────

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

// ─── Demo mock responses (no API key configured) ───────────────────────────

const DOG_MOCK_MONITOR = {
  recommendation: 'monitor' as const,
  likely_explanations: [
    'Dogs occasionally skip a meal due to environmental changes or mild stress',
    'Mild stomach upset that usually resolves on its own within 24 hours',
    'Simply not hungry — even food-motivated dogs have off days',
  ],
  what_to_watch_for: [
    'Whether your dog returns to normal eating at the next mealtime',
    'Any vomiting, diarrhea, or lethargy accompanying the change',
    'Continued disinterest in food beyond 24 hours',
  ],
  suggested_actions: [
    "Offer your dog's regular food again at the next scheduled mealtime",
    "Keep your dog's routine as normal as possible",
    'Note whether your dog shows interest in treats or sniffs food but walks away',
  ],
  questions_for_vet: [],
  reassurance_note:
    "It's completely understandable to notice and worry about changes in your dog's behavior. One off day is very common and rarely a cause for concern on its own — keep an eye on things and trust your instincts. This is general guidance and not a substitute for veterinary advice.",
}

const CAT_MOCK_MONITOR = {
  recommendation: 'monitor' as const,
  likely_explanations: [
    'Cats often retreat and hide when their environment changes or they feel stressed — this is normal self-regulation',
    'A new smell, sound, or change in routine can temporarily shift a cat\'s comfort level',
    'Seasonal or temperature changes can affect activity and hiding patterns in cats',
  ],
  what_to_watch_for: [
    'Whether your cat returns to their usual spots and routine within 24-48 hours',
    'Eating, drinking, and litter box use remaining normal despite hiding',
    'Any signs of physical discomfort — hunched posture, avoiding touch, or vocalizing when moved',
  ],
  suggested_actions: [
    'Give your cat space and avoid forcing interaction — let your cat come to you',
    "Keep food, water, and litter box easily accessible near your cat's hiding spot",
    'Check for any recent changes that might be causing stress (new smells, visitors, sounds)',
  ],
  questions_for_vet: [],
  reassurance_note:
    "Cats are experts at hiding discomfort, so the fact that you noticed a change is important. Hiding is a very common response to stress in cats and often resolves on its own once they feel safe again. This is general guidance and not a substitute for veterinary advice.",
}

const CAT_MOCK_TRY_THIS = {
  recommendation: 'try_this' as const,
  likely_explanations: [
    'Frequent hairballs are common in cats, especially medium- to long-haired breeds, when grooming increases',
    'A change in diet, eating speed, or food type can contribute to more frequent vomiting',
    'Seasonal shedding can lead to increased hair ingestion during grooming',
  ],
  what_to_watch_for: [
    'Vomiting more than 2-3 times per week — that warrants a vet check',
    'Any blood in vomit, loss of appetite, or significant weight change',
    'Signs of distress during or after vomiting, or unproductive retching',
  ],
  suggested_actions: [
    'Try a hairball-formula food or add a small amount of hairball gel (available at pet stores)',
    'Brush your cat more frequently to reduce the amount of hair swallowed',
    "Ensure your cat is eating at a calm pace — puzzle feeders can help if eating too fast",
  ],
  questions_for_vet: [
    'Could a dietary change help reduce the frequency of hairballs?',
    "Is the vomiting frequency within normal range for your cat's age and breed?",
  ],
  reassurance_note:
    "Occasional hairballs are a normal part of cat life, but frequent vomiting deserves attention. The good news is there are simple things you can try at home first. This is general guidance and not a substitute for veterinary advice.",
}

const CAT_MOCK_CALL_VET = {
  recommendation: 'call_vet' as const,
  likely_explanations: [
    'Straining in the litter box in male cats can indicate a urinary blockage — a serious medical condition requiring immediate attention',
    'Urinary tract infection or inflammation (FLUTD) can cause difficulty urinating and significant discomfort',
    'Bladder crystals or stones may be blocking normal urine flow',
  ],
  what_to_watch_for: [
    'Any complete inability to urinate — this is a medical emergency requiring immediate vet care',
    'Crying out, excessive licking of the genital area, or blood in the litter box',
    'Lethargy, vomiting, or loss of appetite alongside litter box straining',
  ],
  suggested_actions: [
    'Contact your vet or emergency animal hospital right away — do not wait to see if it resolves',
    'Keep your cat calm and restrict movement while you arrange transport',
    'Note when you last observed them urinating normally',
  ],
  questions_for_vet: [
    'Could this be a urinary blockage, and how urgently do we need to be seen?',
    'What are the signs I should watch for that mean this is an emergency?',
    'What dietary or lifestyle changes can help prevent this from recurring?',
  ],
  reassurance_note:
    "When male cats strain in the litter box, it's important to act quickly — urinary blockages can become life-threatening within hours. Please reach out to your vet or emergency clinic now. This is general guidance and not a substitute for veterinary advice.",
}

function pickDemoResponse(species: string, concernTypes: string[], petSex?: string) {
  if (species === 'cat') {
    const isStraining = concernTypes.some((c) =>
      c === 'litter_box_changes' || c === 'bathroom_issues'
    )
    if (isStraining && petSex === 'male') return CAT_MOCK_CALL_VET
    const isHairball = concernTypes.some((c) => c === 'hairballs' || c === 'vomiting')
    if (isHairball) return CAT_MOCK_TRY_THIS
    return CAT_MOCK_MONITOR
  }
  return DOG_MOCK_MONITOR
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dog_profile, concern } = body

    if (!dog_profile || !concern) {
      return NextResponse.json(FALLBACK_RESPONSE, { status: 400 })
    }

    const petName = dog_profile.name ?? 'Your pet'
    const species = dog_profile.species === 'cat' ? 'cat' : 'dog'

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
          `Keep ${petName} calm and still while you arrange transport`,
        ],
        questions_for_vet: [
          'Is this an emergency that needs to be seen right now?',
          'What should I do while on my way to the clinic?',
        ],
        reassurance_note: `Based on what you've described, please contact your vet or emergency animal hospital right away. ${petName} needs professional attention for this. This is general guidance and not a substitute for veterinary advice.`,
      })
    }

    // No API key — return a species-aware demo response so the app is usable in development
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
      console.warn('ANTHROPIC_API_KEY is not configured — returning demo response')
      return NextResponse.json(
        pickDemoResponse(species, concern.concern_types ?? [], dog_profile.sex),
      )
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
