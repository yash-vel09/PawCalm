import type { HistoryEntry, AssessmentResult } from '@/store'

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

const R_MONITOR_EATING: AssessmentResult = {
  recommendation: 'monitor',
  likely_explanations: [
    "A temporary loss of appetite from a minor environmental change or off day — very common in dogs",
    "Mild stress or excitement from something in their surroundings, even if not obviously visible",
    "Simply not hungry — like us, dogs occasionally skip a meal with no underlying cause",
  ],
  what_to_watch_for: [
    "Whether appetite returns by the next mealtime",
    "Any signs of lethargy, vomiting, or unusual behavior alongside the reduced appetite",
    "Continued disinterest in food beyond 24–36 hours, which would warrant a vet call",
  ],
  suggested_actions: [
    "Offer their regular food at the next scheduled time without pressure or coaxing",
    "Keep their routine consistent and avoid introducing new foods while monitoring",
    "Note the time and what you observed so you have a clear record if it continues",
  ],
  questions_for_vet: [],
  reassurance_note: "One skipped meal or reduced appetite is rarely cause for alarm — you're right to notice it, and keeping a gentle eye on things is exactly the right approach.",
}

const R_MONITOR_BARKING: AssessmentResult = {
  recommendation: 'monitor',
  likely_explanations: [
    "A change in their environment — new sounds, smells, or activity nearby that's caught their attention",
    "Mild anxiety or over-stimulation from something in their routine that shifted subtly",
    "A form of communication — dogs often vocalize more during seasonal changes or when they sense something outside",
  ],
  what_to_watch_for: [
    "Whether the barking is directed at something specific or generalized throughout the day",
    "Signs of fear, pacing, or unsettled behavior accompanying the vocalization",
    "Whether it settles naturally once the source of stimulation passes",
  ],
  suggested_actions: [
    "Check for obvious environmental triggers — a new neighbor, construction, or seasonal wildlife activity",
    "Keep their routine predictable and ensure they're getting adequate exercise and mental stimulation",
    "If it continues beyond a few days, note when it occurs to share with your vet if needed",
  ],
  questions_for_vet: [],
  reassurance_note: "Increased vocalization often has a simple environmental explanation. You're being attentive — and that's always the right instinct.",
}

const R_TRY_THIS_ENERGY: AssessmentResult = {
  recommendation: 'try_this',
  likely_explanations: [
    "Mild fatigue from increased activity, heat exposure, or a disrupted sleep schedule",
    "A subtle digestive issue or minor upset that's sapping energy without other visible symptoms",
    "Stress from a recent change — even small shifts in routine can affect energy levels in sensitive dogs",
  ],
  what_to_watch_for: [
    "Whether energy levels improve after rest and a normal meal",
    "Any additional symptoms appearing — loss of appetite, vomiting, or reluctance to move",
    "Whether the low energy persists for more than 48 hours without improvement",
  ],
  suggested_actions: [
    "Ensure they have access to fresh water and a quiet, comfortable rest spot",
    "Keep activity light for the next 24 hours — gentle walks only, no vigorous play",
    "Offer their regular food without pressure; mild broth over kibble can encourage eating if appetite is low",
  ],
  questions_for_vet: [
    "At what point should persistent low energy in a dog like mine warrant an appointment?",
    "Are there any supplements or dietary adjustments that might help with energy levels?",
  ],
  reassurance_note: "Low energy often has a simple explanation and resolves with rest. Your instinct to check in is right — give these steps a try and reassess in a day or two.",
}

const R_TRY_THIS_STOMACH: AssessmentResult = {
  recommendation: 'try_this',
  likely_explanations: [
    "Mild dietary indiscretion — eating something outside, eating too fast, or a small change in their food",
    "Stress-related gastrointestinal upset, which is common and often resolves without intervention",
    "A temporary sensitivity that typically responds well to a bland diet and some rest",
  ],
  what_to_watch_for: [
    "Whether symptoms resolve within 24 hours of home care",
    "Any blood in vomit or stool, severe abdominal distension, or signs of significant pain",
    "Worsening frequency or new symptoms appearing alongside the stomach upset",
  ],
  suggested_actions: [
    "Introduce a bland diet — plain boiled chicken (no seasoning) and white rice in small portions",
    "Withhold regular food for 4–6 hours to let their stomach settle, then offer bland food gradually",
    "Keep them calm, hydrated, and away from strenuous activity for 24 hours",
  ],
  questions_for_vet: [
    "How long should I continue the bland diet before switching back to regular food?",
    "Are there any over-the-counter options that are safe for dogs with stomach upset?",
  ],
  reassurance_note: "Stomach upset is one of the most common issues in dogs and often resolves quickly with simple home care. You're handling this the right way.",
}

const R_CALL_VET_LIMPING: AssessmentResult = {
  recommendation: 'call_vet',
  likely_explanations: [
    "A soft tissue injury such as a sprain or strain, which needs to be assessed to determine severity",
    "Joint discomfort or early signs of a condition affecting mobility — worth having professionally examined",
    "A foreign object lodged in the paw, or a cut or abrasion that may not be immediately visible",
  ],
  what_to_watch_for: [
    "Any worsening of the limp or full refusal to bear weight on the affected leg",
    "Swelling, heat, redness, or visible injury around the paw, ankle, or leg",
    "Signs of pain such as whimpering, persistent licking of the area, or flinching when touched",
  ],
  suggested_actions: [
    "Limit movement and restrict access to stairs, jumping, or running until seen by a vet",
    "Gently inspect the paw for visible cuts, thorns, or foreign objects — don't probe if the area is tender",
    "Call your vet today and describe when it started, which leg is affected, and your current worry level",
  ],
  questions_for_vet: [
    "Based on the description, do you think this needs to be seen today or can it wait until tomorrow?",
    "Should I restrict activity completely, or is gentle movement okay in the meantime?",
    "Could this be related to their age or a breed-specific joint condition?",
  ],
  reassurance_note: "You're right to take limping seriously — it's one of those signs that's worth having a professional look at. Calling your vet is the right move.",
}

const R_CALL_VET_VOMITING: AssessmentResult = {
  recommendation: 'call_vet',
  likely_explanations: [
    "Repeated vomiting with your worry level and timing suggests this warrants professional assessment",
    "Possible ingestion of something causing persistent irritation — hard to rule out without an examination",
    "A gastrointestinal condition that may not respond adequately to home care alone",
  ],
  what_to_watch_for: [
    "Any blood in vomit, extreme lethargy, or signs of abdominal pain or distension",
    "Whether vomiting continues even after fluids are temporarily restricted",
    "Signs of dehydration — dry or tacky gums, sunken eyes, or loss of skin elasticity",
  ],
  suggested_actions: [
    "Do not offer food for now; allow small sips of water to help prevent dehydration",
    "Call your vet and describe the frequency, appearance, and timing of vomiting episodes",
    "Keep them calm and comfortable — avoid stressful environments or car rides until seen",
  ],
  questions_for_vet: [
    "Should I bring them in today, or is it okay to monitor through tonight if vomiting slows?",
    "Is there anything safe I can give at home to settle their stomach while I wait for an appointment?",
    "Could this be related to something they may have eaten outside recently?",
  ],
  reassurance_note: "You're doing the right thing by taking this seriously. Calling your vet gives you — and your dog — the clearest path forward.",
}

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 'mock-1',
    concernSummary: 'Not eating / eating less',
    recommendation: 'monitor',
    createdAt: daysAgo(2),
    resolved: true,
    result: R_MONITOR_EATING,
  },
  {
    id: 'mock-2',
    concernSummary: 'Low energy / lethargy, Vomiting / upset stomach',
    recommendation: 'try_this',
    createdAt: daysAgo(6),
    resolved: true,
    result: R_TRY_THIS_STOMACH,
  },
  {
    id: 'mock-3',
    concernSummary: 'Unusual barking / whining',
    recommendation: 'monitor',
    createdAt: daysAgo(10),
    resolved: null,
    result: R_MONITOR_BARKING,
  },
  {
    id: 'mock-4',
    concernSummary: 'Limping / mobility issues',
    recommendation: 'call_vet',
    createdAt: daysAgo(16),
    resolved: true,
    result: R_CALL_VET_LIMPING,
  },
  {
    id: 'mock-5',
    concernSummary: 'Low energy / lethargy',
    recommendation: 'try_this',
    createdAt: daysAgo(22),
    resolved: false,
    result: R_TRY_THIS_ENERGY,
  },
  {
    id: 'mock-6',
    concernSummary: 'Vomiting / upset stomach, Bathroom issues',
    recommendation: 'call_vet',
    createdAt: daysAgo(29),
    resolved: true,
    result: R_CALL_VET_VOMITING,
  },
]
