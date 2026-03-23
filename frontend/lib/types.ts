// ── Evaluation ────────────────────────────────────────────────────────────────

export interface EvaluationScores {
  groundedness: number      // 0.0–1.0
  completeness: number      // 0.0–1.0
  unsupported_claim: boolean
  confidence: number        // 0.0–1.0
  explanation: string
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  query: string
  conversation_history: ConversationMessage[]
}

export interface ChatResponse {
  answer: string
  sources: string[]
  evidence_snippets: string[]
  scores: EvaluationScores
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface ExperienceEntry {
  company: string
  title: string
  start_date: string
  end_date: string | null
  description: string
  impact_bullets: string[]
}

export interface ProjectEntry {
  name: string
  summary: string
  tech_stack: string[]
  impact_bullets: string[]
  links: Record<string, string>
}

export interface CandidateProfile {
  name: string
  headline: string
  summary: string
  experience: ExperienceEntry[]
  skills: string[]
  tools: string[]
  education: Record<string, string>[]
  certifications: string[]
  projects: ProjectEntry[]
  leadership_examples: string[]
  quantified_impacts: string[]
}

// ── Site Content ──────────────────────────────────────────────────────────────

export interface ProjectCard {
  name: string
  summary: string
  tech_stack: string[]
  impact_bullets: string[]
  links: Record<string, string>
}

export interface AboutContent {
  hero_headline: string
  hero_subhead: string
  about_paragraphs: string[]
  suggested_prompts: string[]
}
