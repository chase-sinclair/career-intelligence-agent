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

// ── Admin ──────────────────────────────────────────────────────────────────────

export type DocType = 'resume' | 'project_doc' | 'bio_notes' | 'case_study'

export interface UploadResponse {
  doc_id: string
  filename: string
  saved_path: string
  doc_type: string
  status: string
}

export interface IngestResponse {
  processed: number
  results: Record<string, unknown>[]
  errors: string[]
}

export interface GenerateResponse {
  status: string
  profile_path: string | null
  content_path: string | null
  error: string | null
}

export interface AdminStatus {
  upload_dir_exists: boolean
  upload_file_count: number
  uploaded_files: string[]
  chroma_index_exists: boolean
  profile_exists: boolean
  site_content_exists: boolean
  profile_last_modified: string | null
  site_content_last_modified: string | null
}

// ── Evaluation ────────────────────────────────────────────────────────────────

export interface EvalQuestionResult {
  id: string
  question: string
  answer: string
  sources: string[]
  scores: EvaluationScores
  must_mention_pass: boolean
}

export interface EvalRunResult {
  run_id: string
  timestamp: string
  total_questions: number
  avg_groundedness: number
  avg_completeness: number
  avg_confidence: number
  unsupported_claim_rate: number
  must_mention_pass_rate: number
  results: EvalQuestionResult[]
}
