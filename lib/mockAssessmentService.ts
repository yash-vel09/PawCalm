import type { AssessmentResult, ConcernAssessmentInput } from '@/store'

const MOCK_RESULTS: AssessmentResult[] = [
  // ── Monitor ──────────────────────────────────────────────────────────────
  {
    recommendation: 'monitor',
    likely_explanations: [
      "Stress or a mild environmental shift — dogs are highly sensitive to changes in routine or atmosphere, even subtle ones",
      "A temporary digestive adjustment — minor stomach sensitivities often resolve on their own within 24 hours",
      "Simply an off day — like us, dogs occasionally have low-energy or low-appetite moments without an underlying issue",
    ],
    what_to_watch_for: [
      "Whether eating, energy, and behavior return to normal within 24 hours",
      "Any new symptoms appearing — vomiting, limping, or signs of visible discomfort",
      "Continued disinterest in food beyond one missed meal, which would warrant a vet call",
    ],
    suggested_actions: [
      "Offer their regular food at the next mealtime without pressure — don't try to coax them",
      "Keep their routine as normal and consistent as possible for the next day",
      "Jot down a note with the time and what you observed so you have a clear picture if it continues",
    ],
    questions_for_vet: [],
    reassurance_note: "It's completely understandable to worry — you know your dog better than anyone. Based on what you've shared, this looks like something to keep a gentle eye on rather than act on urgently. Most situations like this resolve on their own within a day, and reaching out was the right instinct.",
  },

  // ── Try This ─────────────────────────────────────────────────────────────
  {
    recommendation: 'try_this',
    likely_explanations: [
      "Mild digestive upset — often caused by dietary changes, eating something unusual outside, or stress",
      "A stress response to a recent change in their environment, schedule, or household",
      "Minor physical discomfort that home care can often help resolve before it escalates",
    ],
    what_to_watch_for: [
      "Whether symptoms improve within 24 hours of trying the steps below",
      "Any escalation — increased frequency, visible pain, loss of appetite entirely, or additional symptoms",
      "Changes in water intake or energy, which can indicate dehydration or something more significant",
    ],
    suggested_actions: [
      "Offer small portions of bland food — boiled chicken and plain rice — to settle their stomach and rebuild appetite",
      "Ensure constant access to fresh water and a quiet, comfortable resting spot away from stimulation",
      "Reduce activity and keep their environment calm for the next 12–24 hours, then reassess",
    ],
    questions_for_vet: [
      "How long should I try home care before scheduling an appointment?",
      "Are there any symptoms I should watch for that would make this more urgent?",
    ],
    reassurance_note: "Your instinct to check in is exactly right — that's what a caring pet parent does. These steps often help in situations like this. Give it 24 hours and see how they respond. If things don't improve or you feel more worried, trust that instinct and call your vet.",
  },

  // ── Call Vet ─────────────────────────────────────────────────────────────
  {
    recommendation: 'call_vet',
    likely_explanations: [
      "A combination of symptoms and timing that warrants a professional's eyes — some things are hard to assess without a physical examination",
      "Physical symptoms that, alongside your concern level, suggest something beyond a home-care situation",
      "A condition that may be related to a recent change and needs to be ruled out by your vet",
    ],
    what_to_watch_for: [
      "Any difficulty breathing, collapse, or loss of consciousness — these require emergency care immediately",
      "Worsening of current symptoms while you're waiting to reach your vet",
      "Signs of severe pain such as crying, inability to get comfortable, or guarding a body part",
    ],
    suggested_actions: [
      "Call your vet clinic now and describe what you've observed — mention when it started and your worry level",
      "Keep them calm and comfortable with minimal movement until they can be seen",
      "Bring a brief note on when symptoms started, any recent changes to food or routine, and current medications",
    ],
    questions_for_vet: [
      "Based on what I've described, is there anything I should watch for that would mean I need emergency care tonight?",
      "Could this be related to something they may have eaten recently, or a change in their environment?",
    ],
    reassurance_note: "You're doing exactly the right thing by taking this seriously. Calling your vet is always the right move when something doesn't feel right — they'll be glad you reached out, not the other way around. You're looking out for your dog, and that's what matters most.",
  },
]

export async function runAssessment(_input: ConcernAssessmentInput): Promise<AssessmentResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1500))
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
}
