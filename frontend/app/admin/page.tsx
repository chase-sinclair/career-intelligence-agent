'use client'

import { useEffect, useRef, useState } from 'react'
import TopNav from '@/components/TopNav'
import {
  getAdminStatus,
  uploadFile as apiUploadFile,
  rebuildIndex,
  generateProfile,
} from '@/lib/api'
import type {
  AdminStatus,
  DocType,
  GenerateResponse,
  IngestResponse,
  UploadResponse,
} from '@/lib/types'

function StatusPill({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'success' | 'warning'
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-secondary/10 text-secondary border-secondary/20'
      : tone === 'warning'
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        : 'bg-surface-container-highest text-on-surface-variant border-white/5'

  return (
    <div className={`rounded-full border px-3 py-1 ${toneClass}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em]">{label}</span>
      <span className="ml-2 font-mono text-[10px] font-bold">{value}</span>
    </div>
  )
}

function InfoCard({
  icon,
  eyebrow,
  title,
  body,
}: {
  icon: string
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-container-low p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-on-surface-variant/70">
        {eyebrow}
      </p>
      <h3 className="mb-2 text-lg font-bold text-on-surface">{title}</h3>
      <p className="text-sm leading-relaxed text-on-surface-variant">{body}</p>
    </div>
  )
}

function formatTs(iso: string | null): string {
  if (!iso) return 'Not generated yet'
  return new Date(iso).toLocaleString()
}

export default function DemoLabPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<AdminStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocType>('resume')
  const [projectName, setProjectName] = useState('')

  const [isRunning, setIsRunning] = useState(false)
  const [runStage, setRunStage] = useState('Ready')
  const [runError, setRunError] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [ingestResult, setIngestResult] = useState<IngestResponse | null>(null)
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(null)
  const workspaceChecks: Array<{ label: string; ok: boolean }> = [
    { label: 'Knowledge base', ok: status?.chroma_index_exists ?? false },
    { label: 'Profile file', ok: status?.profile_exists ?? false },
    { label: 'Site content', ok: status?.site_content_exists ?? false },
  ]

  async function fetchStatus() {
    setStatusLoading(true)
    setStatusError(null)
    try {
      setStatus(await getAdminStatus())
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed to load demo status')
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  async function handleRunDemo() {
    if (isRunning) return
    if (!selectedFile && (!status || status.upload_file_count === 0)) {
      setRunError('Select a file to try the demo, or upload one previously and run again.')
      return
    }

    setIsRunning(true)
    setRunError(null)
    setUploadResult(null)
    setIngestResult(null)
    setGenerateResult(null)

    try {
      let latestUpload: UploadResponse | null = null

      if (selectedFile) {
        setRunStage('Uploading source document')
        latestUpload = await apiUploadFile(
          selectedFile,
          docType,
          docType !== 'resume' && projectName ? projectName : undefined,
        )
        setUploadResult(latestUpload)
        setSelectedFile(null)
        setProjectName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      }

      setRunStage('Rebuilding demo knowledge base')
      const rebuilt = await rebuildIndex()
      setIngestResult(rebuilt)

      setRunStage('Generating profile experience')
      const generated = await generateProfile()
      setGenerateResult(generated)

      await fetchStatus()
      setRunStage(
        latestUpload
          ? 'Demo profile updated from uploaded source'
          : 'Demo profile regenerated from current uploaded sources',
      )
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'Demo pipeline failed')
      setRunStage('Demo run interrupted')
    } finally {
      setIsRunning(false)
    }
  }

  const readyState = status?.profile_exists && status?.site_content_exists
  const statusTone = readyState ? 'success' : 'warning'

  return (
    <>
      <TopNav subtitle="Demo Lab" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_top_right,rgba(68,226,205,0.08),transparent_24%),linear-gradient(180deg,#121315_0%,#141518_100%)] px-8 pb-16 pt-24">
          <div className="mx-auto max-w-6xl space-y-8">
            <section className="relative overflow-hidden rounded-[28px] border border-white/5 bg-surface-container-low p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.08),transparent_30%,rgba(68,226,205,0.06))]" />
              <div className="relative grid gap-10 lg:grid-cols-[1.35fr_0.85fr]">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill label="Mode" value="Demo" tone="warning" />
                    <StatusPill
                      label="Profile State"
                      value={readyState ? 'Live Default Profile' : 'Needs Refresh'}
                      tone={statusTone}
                    />
                  </div>

                  <div className="space-y-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-primary">
                      Recruiter Demo Workflow
                    </p>
                    <h1 className="max-w-3xl text-4xl font-black tracking-tight text-on-surface lg:text-5xl">
                      Show how this platform can turn raw career artifacts into a searchable AI profile.
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
                      This page is now framed as a guided demo instead of a system console. It
                      explains the concept, gives a smoother upload flow, and makes it easier to
                      test the candidate-ingestion idea without competing with your public profile.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                        Step 1
                      </p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">Add a resume or project file</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                        Step 2
                      </p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">Run the demo pipeline</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                        Step 3
                      </p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">Explore the generated profile</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/5 bg-[#101114]/90 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-on-surface-variant/60">
                        Demo Video
                      </p>
                      <h2 className="mt-2 text-lg font-bold text-on-surface">Placeholder for walkthrough</h2>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                      Soon
                    </span>
                  </div>

                  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[20px] border border-dashed border-primary/20 bg-[linear-gradient(180deg,rgba(56,189,248,0.04),rgba(0,0,0,0.08))] text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                      <span className="material-symbols-outlined text-3xl text-primary">play_circle</span>
                    </div>
                    <p className="mb-2 text-lg font-bold text-on-surface">Future embedded demo video</p>
                    <p className="max-w-xs text-sm leading-relaxed text-on-surface-variant">
                      Add a short walkthrough here later to show the upload flow, profile generation,
                      and recruiter Q&A experience end to end.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <InfoCard
                icon="visibility"
                eyebrow="What This Demonstrates"
                title="A candidate can become a searchable AI profile"
                body="The demo is built to show how a resume, project notes, and supporting artifacts can be transformed into a grounded research surface recruiters can explore through natural language."
              />
              <InfoCard
                icon="account_tree"
                eyebrow="Behind The Scenes"
                title="The pipeline still runs end to end"
                body="Uploading a file triggers the same backend capability stack underneath: file ingestion, indexing into Chroma, profile synthesis, and refreshed site content generation."
              />
              <InfoCard
                icon="experiment"
                eyebrow="Current State"
                title="Intentionally labeled as a demo"
                body="This area is not the priority product surface right now, so it is framed as an exploratory capability showcase rather than a production multi-user workflow."
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-white/5 bg-surface-container-low p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-secondary">
                      Guided Demo
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-on-surface">Upload and run in one pass</h2>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container-lowest px-4 py-3 text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                      Current Stage
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">{runStage}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group rounded-[24px] border border-dashed border-outline-variant/40 bg-surface-container-lowest px-8 py-10 transition-all hover:border-primary/40 hover:bg-surface-container-highest/40"
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                        <span className="material-symbols-outlined text-3xl text-primary">
                          {selectedFile ? 'description' : 'upload_file'}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-on-surface">
                        {selectedFile ? selectedFile.name : 'Choose a resume or supporting document'}
                      </p>
                      <p className="max-w-md text-sm leading-relaxed text-on-surface-variant">
                        Drop in a PDF, markdown note, or text file to demonstrate how the system
                        turns source material into a profile and retrieval experience.
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">
                        .pdf .md .txt .text
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.md,.txt,.text"
                      className="hidden"
                      onChange={e => {
                        setSelectedFile(e.target.files?.[0] ?? null)
                        setRunError(null)
                        setUploadResult(null)
                      }}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Document Type
                      </label>
                      <select
                        value={docType}
                        onChange={e => setDocType(e.target.value as DocType)}
                        className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                      >
                        <option value="resume">Resume</option>
                        <option value="project_doc">Project Doc</option>
                        <option value="bio_notes">Bio Notes</option>
                        <option value="case_study">Case Study</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        placeholder="Optional, useful for project docs"
                        disabled={docType === 'resume'}
                        className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleRunDemo}
                      disabled={isRunning || (!selectedFile && (!status || status.upload_file_count === 0))}
                      className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <span className={`material-symbols-outlined text-base ${isRunning ? 'animate-spin' : ''}`}>
                        {isRunning ? 'progress_activity' : 'rocket_launch'}
                      </span>
                      {isRunning ? 'RUNNING DEMO...' : 'RUN DEMO PIPELINE'}
                    </button>

                    <button
                      onClick={fetchStatus}
                      disabled={statusLoading}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-40"
                    >
                      <span className={`material-symbols-outlined text-sm ${statusLoading ? 'animate-spin' : ''}`}>
                        refresh
                      </span>
                      Refresh Status
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-surface-container-lowest p-5">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                      How This Version Works
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        <span className="font-semibold text-on-surface">1.</span> Upload a file if
                        you want fresh source material.
                      </p>
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        <span className="font-semibold text-on-surface">2.</span> The app rebuilds
                        the vector index for the demo workspace.
                      </p>
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        <span className="font-semibold text-on-surface">3.</span> It regenerates a
                        profile and updated site content in one guided run.
                      </p>
                    </div>
                  </div>

                  {(uploadResult || ingestResult || generateResult || runError) && (
                    <div className="rounded-2xl border border-white/5 bg-[#101114] p-5">
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                        Latest Run
                      </p>

                      {uploadResult && (
                        <p className="mb-2 text-sm text-on-surface-variant">
                          Uploaded <span className="font-semibold text-on-surface">{uploadResult.filename}</span>
                        </p>
                      )}
                      {ingestResult && (
                        <p className="mb-2 text-sm text-on-surface-variant">
                          Indexed <span className="font-semibold text-on-surface">{ingestResult.processed}</span>{' '}
                          source file{ingestResult.processed !== 1 ? 's' : ''}
                        </p>
                      )}
                      {generateResult && !generateResult.error && (
                        <p className="mb-2 text-sm text-on-surface-variant">
                          Generated refreshed profile and site content for the demo workspace.
                        </p>
                      )}
                      {generateResult?.error && (
                        <p className="mb-2 text-sm text-red-400">{generateResult.error}</p>
                      )}
                      {runError && <p className="text-sm text-red-400">{runError}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <section className="rounded-[28px] border border-white/5 bg-surface-container-low p-8">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary">
                        Demo Status
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-on-surface">Current workspace snapshot</h2>
                    </div>
                    <StatusPill
                      label="Uploads"
                      value={status ? String(status.upload_file_count) : '...'}
                      tone="neutral"
                    />
                  </div>

                  {statusError ? (
                    <p className="text-sm text-red-400">{statusError}</p>
                  ) : statusLoading && !status ? (
                    <p className="text-sm text-on-surface-variant/60">Loading demo status...</p>
                  ) : status && (
                    <div className="space-y-4">
                      <div className="grid gap-3">
                        {workspaceChecks.map(({ label, ok }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-surface-container-lowest px-4 py-3"
                          >
                            <span className="text-sm text-on-surface">{label}</span>
                            <span
                              className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
                                ok ? 'text-secondary' : 'text-amber-300'
                              }`}
                            >
                              {ok ? 'Ready' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-white/5 bg-surface-container-lowest p-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                          Last Generated
                        </p>
                        <p className="mt-2 text-sm text-on-surface-variant">
                          Profile: {formatTs(status.profile_last_modified)}
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          Site content: {formatTs(status.site_content_last_modified)}
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-[28px] border border-white/5 bg-surface-container-low p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-secondary">
                    Notes
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-on-surface">Important caveat</h2>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    This demo still uses the same underlying ingestion and generation pipeline. It
                    is useful for showing the concept, but the public recruiter-facing experience on
                    the rest of the site remains the main priority.
                  </p>
                  <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/8 p-4">
                    <p className="text-sm leading-relaxed text-amber-200">
                      Running the demo pipeline will update the active runtime profile and knowledge
                      base. Use it when you want to showcase the capability, not as your default
                      public profile workflow.
                    </p>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
