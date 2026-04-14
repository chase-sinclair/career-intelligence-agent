import type {
  ChatRequest,
  ChatResponse,
  CandidateProfile,
  AboutContent,
  ProjectCard,
  DocType,
  UploadResponse,
  IngestResponse,
  GenerateResponse,
  AdminStatus,
  JobPreferences,
  JobShortlistEntry,
  JobSourceConfig,
  JobSourcePack,
  JobRefreshResponse,
  TopFitJobsResponse,
  EvalRunResult,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new Error(`API ${path} failed (${res.status}): ${detail}`)
  }
  return res.json() as Promise<T>
}

export function chat(req: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export function getProfile(): Promise<CandidateProfile> {
  return apiFetch<CandidateProfile>('/profile')
}

export function getAboutContent(): Promise<AboutContent> {
  return apiFetch<AboutContent>('/about-content')
}

export function getProjects(): Promise<ProjectCard[]> {
  return apiFetch<ProjectCard[]>('/projects')
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export function getAdminStatus(): Promise<AdminStatus> {
  return apiFetch<AdminStatus>('/admin/status')
}

export async function uploadFile(
  file: File,
  docType: DocType,
  projectName?: string,
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  form.append('doc_type', docType)
  if (projectName) form.append('project_name', projectName)

  const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new Error(`API /upload failed (${res.status}): ${detail}`)
  }
  return res.json() as Promise<UploadResponse>
}

export function rebuildIndex(): Promise<IngestResponse> {
  return apiFetch<IngestResponse>('/ingest/rebuild', { method: 'POST' })
}

export function generateProfile(): Promise<GenerateResponse> {
  return apiFetch<GenerateResponse>('/profile/generate', { method: 'POST' })
}

export function getJobPreferences(): Promise<JobPreferences> {
  return apiFetch<JobPreferences>('/job-preferences')
}

export function updateJobPreferences(preferences: JobPreferences): Promise<JobPreferences> {
  return apiFetch<JobPreferences>('/job-preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  })
}

export function getTopFitJobs(limit = 12, recentDays = 0, dedupe = true): Promise<TopFitJobsResponse> {
  const recentParam = recentDays > 0 ? `&recent_days=${recentDays}` : ''
  return apiFetch<TopFitJobsResponse>(`/jobs/top-fit?limit=${limit}${recentParam}&dedupe=${dedupe}`)
}

export function getJobSources(): Promise<JobSourceConfig[]> {
  return apiFetch<JobSourceConfig[]>('/job-sources')
}

export function getJobSourcePacks(): Promise<JobSourcePack[]> {
  return apiFetch<JobSourcePack[]>('/job-source-packs')
}

export function updateJobSources(sources: JobSourceConfig[]): Promise<JobSourceConfig[]> {
  return apiFetch<JobSourceConfig[]>('/job-sources', {
    method: 'PUT',
    body: JSON.stringify(sources),
  })
}

export function refreshJobs(): Promise<JobRefreshResponse> {
  return apiFetch<JobRefreshResponse>('/jobs/refresh', { method: 'POST' })
}

export function applyJobSourcePack(packId: string): Promise<JobSourceConfig[]> {
  return apiFetch<JobSourceConfig[]>(`/job-source-packs/${encodeURIComponent(packId)}/apply`, {
    method: 'POST',
  })
}

export function getJobShortlist(): Promise<JobShortlistEntry[]> {
  return apiFetch<JobShortlistEntry[]>('/jobs/shortlist')
}

export function updateJobShortlist(
  jobId: string,
  status: string,
  note = '',
): Promise<JobShortlistEntry> {
  return apiFetch<JobShortlistEntry>(`/jobs/${encodeURIComponent(jobId)}/shortlist`, {
    method: 'PUT',
    body: JSON.stringify({ status, note }),
  })
}

// ── Evaluation ────────────────────────────────────────────────────────────────

export function runEval(): Promise<EvalRunResult> {
  return apiFetch<EvalRunResult>('/eval/run', { method: 'POST' })
}

export function getEvalResults(): Promise<EvalRunResult> {
  return apiFetch<EvalRunResult>('/eval/results')
}
