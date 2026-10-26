import Link from 'next/link'
import {
  ArrowUpRight,
  User,
  MessageSquare,
  LayoutGrid,
  Layers,
  ChevronRight,
} from 'lucide-react'
import ConstellationCanvas from '@/components/ConstellationCanvas'

// ── Card definitions ──────────────────────────────────────────────────────────

interface CardDef {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
  accent?: boolean
}

const CARDS: CardDef[] = [
  {
    href: '/about',
    icon: <User size={20} color="var(--accent)" strokeWidth={1.5} />,
    title: 'Architect Profile',
    desc: 'Skills, experience & career timeline',
    accent: true,
  },
  {
    href: '/knowledge-base',
    icon: <MessageSquare size={20} color="var(--ink)" strokeWidth={1.5} />,
    title: 'Ask About Chase',
    desc: 'Grounded answers from verified career artifacts',
  },
  {
    href: '/projects',
    icon: <LayoutGrid size={20} color="var(--ink)" strokeWidth={1.5} />,
    title: 'Projects',
    desc: 'Deep dives into selected work',
  },
  {
    href: '/how-it-works',
    icon: <Layers size={20} color="var(--ink)" strokeWidth={1.5} />,
    title: 'How It Works',
    desc: 'The RAG pipeline, evidence engine & AI stack',
  },
]

// ── Card component ────────────────────────────────────────────────────────────

function Card({ card }: { card: CardDef }) {
  const base =
    'relative overflow-hidden rounded-xl p-4 flex flex-col min-h-[100px] backdrop-blur-md border transition-all duration-200 group'

  const variant = card.accent
    ? 'bg-[rgba(var(--accent-rgb),0.08)] border-[rgba(var(--accent-rgb),0.24)] hover:bg-[rgba(var(--accent-rgb),0.13)] hover:border-[rgba(var(--accent-rgb),0.38)]'
    : 'bg-[var(--panel-2)] border-[rgba(var(--ink-rgb),0.10)] hover:bg-[var(--panel)] hover:border-[rgba(var(--ink-rgb),0.20)]'

  const sheenGradient = card.accent
    ? 'linear-gradient(135deg, rgba(var(--accent-rgb),0.13) 0%, transparent 60%)'
    : 'linear-gradient(135deg, rgba(var(--ink-rgb),0.07) 0%, transparent 60%)'

  const titleColor = card.accent ? 'text-[var(--accent)]' : 'text-[var(--ink)] opacity-80'
  const arrowColor = card.accent ? 'text-[var(--accent)] opacity-45' : 'text-[var(--ink)] opacity-[0.24]'
  const iconOpacity = card.accent ? 'opacity-90' : 'opacity-[0.55]'

  return (
    <Link href={card.href} className={`${base} ${variant}`}>
      {/* Sheen */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: sheenGradient }}
      />

      <div className={`w-5 h-5 mb-3 ${iconOpacity}`}>{card.icon}</div>

      <span className={`text-[11px] font-medium mb-1 ${titleColor}`}>
        {card.title}
      </span>

      <span className="text-[10px] text-[var(--ink)] opacity-[0.60] leading-relaxed flex-1">
        {card.desc}
      </span>

      <ChevronRight
        size={10}
        className={`mt-2.5 self-end ${arrowColor}`}
        strokeWidth={1.5}
      />
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="h-screen overflow-hidden relative flex flex-col bg-[var(--bg)]">

      {/* Constellation spans the full main area — behind hero AND cards */}
      <ConstellationCanvas />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex-1 overflow-hidden min-h-0">

        {/* Gradient fade toward cards */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(var(--bg-rgb),0.55) 100%)' }}
        />

        {/* Hero content — bottom-anchored */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-8 md:px-8 md:pb-10 pointer-events-none">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 mb-4">
            <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent)] opacity-80" />
            <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--ink)] opacity-[0.62]">
              AI-Powered Candidate Profile
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl lg:text-[60px] leading-none text-[var(--ink)] mb-4"
            style={{ fontWeight: 300, letterSpacing: '-0.04em' }}
          >
            The Career
            <br />
            <em className="font-serif italic text-[var(--accent)]">Architect.</em>
          </h1>

          {/* Body copy */}
          <p className="text-sm text-[var(--ink)] opacity-[0.62] leading-relaxed max-w-[32rem] mb-6">
            <strong className="opacity-[0.75] font-medium not-italic">
              You&apos;re looking at an intelligent portfolio — not a résumé.
            </strong>{' '}
            Ask it anything about Chase&apos;s background, projects, and technical decisions.
            Every answer is grounded in real career artifacts and cited with evidence.
          </p>

          {/* CTA */}
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-2.5 bg-[var(--ink)] rounded-full pl-4 pr-2 py-2 self-start hover:opacity-90 transition-opacity pointer-events-auto"
          >
            <span className="text-[var(--bg)] text-xs font-medium">
              Ask the first question
            </span>
            <span className="w-7 h-7 bg-[var(--bg)] rounded-full flex items-center justify-center shrink-0">
              <ArrowUpRight size={12} color="var(--ink)" strokeWidth={2} />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      <section className="relative flex-shrink-0 px-4 pb-5">

        {/* Dark veil to dim constellation nodes behind card zone */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: '-8px 0 0 0',
            background: 'linear-gradient(to bottom, rgba(var(--bg-rgb),0) 0%, rgba(var(--bg-rgb),0.55) 30%, rgba(var(--bg-rgb),0.55) 100%)',
            zIndex: -1,
          }}
        />

        <p className="text-[9px] tracking-[0.18em] uppercase text-[var(--ink)] opacity-[0.62] mb-2.5 px-0.5">
          Explore Chase&apos;s Profile
        </p>

        {/* 3-col, 2-row grid: row 1 = Architect Profile / Ask About Chase / Projects
            row 2 = How It Works (col 1 only) */}
        <div className="grid grid-cols-3 gap-2">
          {CARDS.map(card => (
            <Card key={card.href} card={card} />
          ))}
        </div>
      </section>

    </main>
  )
}
