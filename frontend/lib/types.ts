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

export interface JobPreferences {
  target_titles: string[]
  exclude_title_keywords: string[]
  target_keywords: string[]
  preferred_locations: string[]
  remote_preference: string
  salary_floor: number | null
  target_seniority: string[]
  preferred_industries: string[]
  preferred_company_types: string[]
  tech_focus_areas: string[]
  public_sector_interest: string
  work_authorization_notes: string
  avoid_keywords: string[]
  stretch_roles_allowed: boolean
}

export interface JobPosting {
  id: string
  source: string
  source_label: string
  title: string
  company: string
  location: string
  posted_at: string | null
  salary_text: string | null
  description: string
  employment_type: string | null
  remote_type: string | null
  normalized_tags: string[]
  url: string | null
  fetched_at: string | null
  discovery_mode: string
  priority_tier: number
  liveness_status: string
  liveness_note: string
}

export interface JobSourceConfig {
  id: string
  name: string
  platform: string
  identifier: string
  discovery_mode: string
  priority_tier: number
  enabled: boolean
  notes: string
}

export interface JobSourcePack {
  id: string
  name: string
  description: string
  recommended_for: string[]
  sources: JobSourceConfig[]
}

export interface RankedCount {
  label: string
  count: number
}

export interface JobSourcePackRecommendation {
  pack_id: string
  pack_name: string
  reason: string
  match_score: number
}

export interface JobFitResult {
  job: JobPosting
  overall_score: number
  profile_match_score: number
  preference_match_score: number
  strengths: string[]
  risks: string[]
  why_it_fits: string
  likely_resume_angles: string[]
  match_bucket: string
  shortlist_status: string
  shortlist_note: string
}

export interface JobShortlistEntry {
  job_id: string
  status: string
  note: string
  updated_at: string
}

export interface TopFitJobsResponse {
  total_jobs: number
  generated_for: string
  live_jobs_count: number
  uses_seed_fallback: boolean
  display_company_cap: number
  brief_headline: string
  brief_summary: string
  new_since_refresh_count: number
  best_fit_count: number
  strong_consideration_count: number
  stretch_count: number
  ready_to_review_count: number
  shortlisted_count: number
  applied_count: number
  recommended_pack: JobSourcePackRecommendation
  top_companies: RankedCount[]
  top_titles: RankedCount[]
  top_matches: JobFitResult[]
}

export interface JobRefreshResponse {
  fetched_jobs: number
  enabled_sources: number
  source_errors: string[]
  used_seed_fallback: boolean
  added_jobs: number
  dropped_jobs: number
  unchanged_jobs: number
  added_previews: string[]
  dropped_previews: string[]
  verified_live_jobs: number
  unverified_jobs: number
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
