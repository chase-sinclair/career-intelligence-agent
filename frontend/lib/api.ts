import type {
  ChatRequest,
  ChatResponse,
  CandidateProfile,
  AboutContent,
  ProjectCard,
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
