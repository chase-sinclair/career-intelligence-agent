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
  UploadResponse,
  IngestResponse,
  GenerateResponse,
} from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <div
      className={`w-2 h-2 rounded-full shrink-0 ${
        ok ? 'bg-secondary shadow-[0_0_6px_rgba(68,226,205,0.5)]' : 'bg-red-500/70'
      }`}
    />
  )
}

function formatTs(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  // Status
  const [status, setStatus] = useState<AdminStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [filesExpanded, setFilesExpanded] = useState(false)

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocType>('resume')
  const [projectName, setProjectName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Ingest
  const [rebuilding, setRebuilding] = useState(false)
  const [ingestResult, setIngestResult] = useState<IngestResponse | null>(null)
  const [ingestError, setIngestError] = useState<string | null>(null)

  // Generate profile
  const [generating, setGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // ── Status fetch ────────────────────────────────────────────────────────────

  async function fetchStatus() {
    setStatusLoading(true)
    setStatusError(null)
    try {
      setStatus(await getAdminStatus())
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed to load status')
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => { fetchStatus() }, [])

  // ── Upload handler ──────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!selectedFile || uploading) return
    setUploading(true)
    setUploadResult(null)
    setUploadError(null)
    try {
      const res = await apiUploadFile(
        selectedFile,
        docType,
        docType !== 'resume' && projectName ? projectName : undefined,
      )
      setUploadResult(res)
      setSelectedFile(null)
      setProjectName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchStatus()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Rebuild handler ─────────────────────────────────────────────────────────

  async function handleRebuild() {
    if (rebuilding) return
    setRebuilding(true)
    setIngestResult(null)
    setIngestError(null)
    try {
      setIngestResult(await rebuildIndex())
      await fetchStatus()
    } catch (e) {
      setIngestError(e instanceof Error ? e.message : 'Rebuild failed')
    } finally {
      setRebuilding(false)
    }
  }

  // ── Generate handler ────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (generating) return
    setGenerating(true)
    setGenerateResult(null)
    setGenerateError(null)
    try {
      setGenerateResult(await generateProfile())
      await fetchStatus()
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Profile generation failed')
    } finally {
      setGenerating(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <TopNav subtitle="System Admin" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="p-10 space-y-10 max-w-5xl">

          {/* ── Page Header ──────────────────────────────────────────────────── */}
          <header>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              System Admin
            </h2>
            <p className="text-on-surface-variant text-lg font-body">
              Upload documents, rebuild the vector index, and regenerate the candidate profile.
            </p>
          </header>

          {/* ── Section A: System Status ──────────────────────────────────────── */}
          <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">monitor_heart</span>
                System Status
              </h3>
              <button
                onClick={fetchStatus}
                disabled={statusLoading}
                className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
              >
                <span className={`material-symbols-outlined text-sm ${statusLoading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                Refresh
              </button>
            </div>

            {statusError ? (
              <p className="font-mono text-xs text-red-400">{statusError}</p>
            ) : statusLoading && !status ? (
              <p className="font-mono text-xs text-on-surface-variant/50">Loading...</p>
            ) : status && (
              <div className="space-y-6">
                {/* Indicator rows */}
                <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                  {[
                    { label: 'Upload directory',  ok: status.upload_dir_exists  },
                    { label: 'Chroma index',       ok: status.chroma_index_exists },
                    { label: 'candidate_profile.json', ok: status.profile_exists },
                    { label: 'site_content.json',  ok: status.site_content_exists },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-3">
                      <StatusDot ok={ok} />
                      <span className="font-mono text-[11px] text-on-surface-variant">{label}</span>
                      <span className={`ml-auto font-mono text-[10px] font-bold ${ok ? 'text-secondary' : 'text-red-400'}`}>
                        {ok ? 'OK' : 'MISSING'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Timestamps */}
                <div className="h-[1px] bg-surface-container-highest" />
                <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                  <div>
                    <span className="block font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-1">
                      Profile last modified
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {formatTs(status.profile_last_modified)}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-1">
                      Site content last modified
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {formatTs(status.site_content_last_modified)}
                    </span>
                  </div>
                </div>

                {/* Uploaded files */}
                <div className="h-[1px] bg-surface-container-highest" />
                <div>
                  <button
                    onClick={() => setFilesExpanded(p => !p)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <span className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                      Uploaded files
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[9px] font-bold border border-secondary/20">
                      {status.upload_file_count}
                    </span>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant/50 ml-auto">
                      {filesExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {filesExpanded && (
                    <div className="mt-3 space-y-1">
                      {status.uploaded_files.length === 0 ? (
                        <p className="font-mono text-[11px] text-on-surface-variant/40">No files uploaded yet.</p>
                      ) : (
                        status.uploaded_files.map(f => (
                          <div key={f} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-on-surface-variant/50">description</span>
                            <span className="font-mono text-[11px] text-on-surface-variant">{f}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ── Section B: File Upload ────────────────────────────────────────── */}
          <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />

            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">upload_file</span>
              Upload Document
            </h3>

            <div className="space-y-6">
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-surface-container-highest/30 transition-all"
              >
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">
                  {selectedFile ? 'description' : 'cloud_upload'}
                </span>
                <span className="font-mono text-sm text-on-surface-variant">
                  {selectedFile ? selectedFile.name : 'Click to select a file'}
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                  .pdf · .md · .txt
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.md,.txt,.text"
                  className="hidden"
                  onChange={e => {
                    setSelectedFile(e.target.files?.[0] ?? null)
                    setUploadResult(null)
                    setUploadError(null)
                  }}
                />
              </div>

              {/* Doc type + project name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value as DocType)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="resume">Resume</option>
                    <option value="project_doc">Project Doc</option>
                    <option value="bio_notes">Bio Notes</option>
                    <option value="case_study">Case Study</option>
                  </select>
                </div>

                {docType !== 'resume' && (
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                      Project Name (optional)
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                      placeholder="e.g. RAG Pipeline"
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Upload button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {uploading ? (
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">upload</span>
                )}
                {uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
              </button>

              {/* Upload result */}
              {uploadResult && (
                <div className="bg-surface-container-lowest p-4 rounded-lg border-l-2 border-secondary">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                    <span className="font-mono text-[10px] text-secondary uppercase tracking-widest font-bold">Upload Successful</span>
                  </div>
                  <p className="font-mono text-xs text-on-surface-variant">
                    <span className="text-on-surface">{uploadResult.filename}</span>
                    {' '}saved as doc_id <span className="text-primary">{uploadResult.doc_id}</span>
                  </p>
                </div>
              )}
              {uploadError && (
                <div className="bg-surface-container-lowest p-4 rounded-lg border-l-2 border-red-500/50">
                  <p className="font-mono text-xs text-red-400">{uploadError}</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Section C: Operations ─────────────────────────────────────────── */}
          <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-tertiary" />

            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-sm">settings_suggest</span>
              Operations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Rebuild Index */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-on-surface">Rebuild Index</h4>
                  <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                    Re-ingests all uploaded documents into the Chroma vector store. Run after uploading new files.
                  </p>
                </div>
                <button
                  onClick={handleRebuild}
                  disabled={rebuilding || generating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {rebuilding ? (
                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">data_object</span>
                  )}
                  {rebuilding ? 'REBUILDING...' : 'REBUILD INDEX'}
                </button>

                {ingestResult && (
                  <div className="bg-surface-container-lowest p-4 rounded-lg border-l-2 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                      <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-bold">
                        Complete — {ingestResult.processed} file{ingestResult.processed !== 1 ? 's' : ''} processed
                      </span>
                    </div>
                    {ingestResult.errors.length > 0 && (
                      <ul className="space-y-1 mt-2">
                        {ingestResult.errors.map((err, i) => (
                          <li key={i} className="font-mono text-[10px] text-red-400">{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {ingestError && (
                  <div className="bg-surface-container-lowest p-4 rounded-lg border-l-2 border-red-500/50">
                    <p className="font-mono text-xs text-red-400">{ingestError}</p>
                  </div>
                )}
              </div>

              {/* Regenerate Profile */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-on-surface">Regenerate Profile</h4>
                  <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                    Rebuilds <span className="font-mono text-[10px]">candidate_profile.json</span> and{' '}
                    <span className="font-mono text-[10px]">site_content.json</span> from the indexed data.
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating || rebuilding}
                  className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {generating ? (
                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  )}
                  {generating ? 'GENERATING...' : 'REGENERATE PROFILE'}
                </button>

                {generateResult && (
                  <div className={`bg-surface-container-lowest p-4 rounded-lg border-l-2 ${generateResult.error ? 'border-red-500/50' : 'border-secondary'}`}>
                    {generateResult.error ? (
                      <p className="font-mono text-xs text-red-400">{generateResult.error}</p>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                          <span className="font-mono text-[10px] text-secondary uppercase tracking-widest font-bold">
                            {generateResult.status}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-on-surface-variant/70">
                          {generateResult.profile_path && `Profile → ${generateResult.profile_path}`}
                        </p>
                        <p className="font-mono text-[10px] text-on-surface-variant/70">
                          {generateResult.content_path && `Content → ${generateResult.content_path}`}
                        </p>
                      </>
                    )}
                  </div>
                )}
                {generateError && (
                  <div className="bg-surface-container-lowest p-4 rounded-lg border-l-2 border-red-500/50">
                    <p className="font-mono text-xs text-red-400">{generateError}</p>
                  </div>
                )}
              </div>

            </div>
          </section>

        </div>
      </main>
    </>
  )
}
