'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/TopNav'
import { getProjects } from '@/lib/api'
import type { ProjectCard } from '@/lib/types'

// ── Decorative icon set — cycles by card index ────────────────────────────────
const CARD_ICONS = [
  'database', 'insights', 'share', 'route',
  'memory', 'science', 'hub', 'model_training',
] as const

// ── Impact bullet icon set — cycles by bullet index ──────────────────────────
const BULLET_ICONS = [
  'trending_up', 'target', 'bolt', 'security',
  'visibility', 'hub', 'timer', 'verified_user',
] as const

// ── Link key heuristics ───────────────────────────────────────────────────────
function githubUrl(links: Record<string, string>): string | undefined {
  return (
    links.github ?? links.repo ?? links.repository ??
    links.source ?? links.code
  )
}

function demoUrl(links: Record<string, string>): string | undefined {
  return (
    links.demo ?? links.live ?? links.url ??
    links.website ?? links.paper ?? links.docs
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <TopNav subtitle="Technical Projects" />
        <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
          <div className="pt-24 pb-12 px-8 flex items-center gap-2 text-on-surface-variant font-mono text-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Loading projects...
          </div>
        </main>
      </>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <TopNav subtitle="Technical Projects" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="pt-24 pb-12 px-8 min-h-screen">

          {/* Page Header */}
          <header className="mb-12 max-w-4xl">
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Technical Projects
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl font-body">
              A curated selection of high-impact AI and Data Science initiatives designed for
              enterprise scalability.
            </p>
          </header>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
            {projects.map((project, i) => {
              const cardIcon   = CARD_ICONS[i % CARD_ICONS.length]
              const codeLink   = githubUrl(project.links)
              const liveLink   = demoUrl(project.links)

              return (
                <div
                  key={i}
                  className="group bg-surface-container-low p-8 rounded-lg transition-all duration-300 hover:bg-surface-container-high relative overflow-hidden border border-outline-variant/10"
                >
                  {/* Decorative Background Icon */}
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">{cardIcon}</span>
                  </div>

                  {/* Name & Description */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed font-body">
                      {project.summary}
                    </p>
                  </div>

                  {/* Tech Stack Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech_stack.map((tech, j) => (
                      <span
                        key={j}
                        className="font-mono text-[10px] px-2 py-1 rounded bg-surface-container-highest text-secondary border border-secondary/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Impact Bullets */}
                  <div className="space-y-3 mb-8">
                    {project.impact_bullets.map((bullet, j) => (
                      <div key={j} className="flex items-start space-x-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                          {BULLET_ICONS[j % BULLET_ICONS.length]}
                        </span>
                        <p className="text-xs text-on-surface/80 font-body leading-tight">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer: Links */}
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                    <div className="flex space-x-3">
                      {codeLink ? (
                        <a
                          href={codeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors"
                          title="Source code"
                        >
                          <span className="material-symbols-outlined text-xl">code</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant/30 cursor-not-allowed"
                          title="No repository link"
                        >
                          <span className="material-symbols-outlined text-xl">code</span>
                        </button>
                      )}

                      {liveLink ? (
                        <a
                          href={liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors"
                          title="Live demo / paper"
                        >
                          <span className="material-symbols-outlined text-xl">open_in_new</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant/30 cursor-not-allowed"
                          title="No live link"
                        >
                          <span className="material-symbols-outlined text-xl">open_in_new</span>
                        </button>
                      )}
                    </div>

                    {/* Status: not provided by API — omitted */}
                  </div>
                </div>
              )
            })}

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="col-span-2 py-20 flex flex-col items-center gap-4 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">
                  folder_open
                </span>
                <p className="font-mono text-sm text-on-surface-variant/50">
                  No projects found. Run POST /profile/generate to populate project data.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
