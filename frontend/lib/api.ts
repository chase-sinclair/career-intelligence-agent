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

// ── Evaluation ────────────────────────────────────────────────────────────────

export function runEval(): Promise<EvalRunResult> {
  return apiFetch<EvalRunResult>('/eval/run', { method: 'POST' })
}

export function getEvalResults(): Promise<EvalRunResult> {
  return apiFetch<EvalRunResult>('/eval/results')
}
