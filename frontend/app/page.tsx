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
    icon: <User size={20} color="#C4A882" strokeWidth={1.5} />,
    title: 'Architect Profile',
    desc: 'Skills, experience & career timeline',
    accent: true,
  },
  {
    href: '/knowledge-base',
    icon: <MessageSquare size={20} color="#E2DFD0" strokeWidth={1.5} />,
    title: 'Ask About Chase',
    desc: 'Grounded answers from verified career artifacts',
  },
  {
    href: '/projects',
    icon: <LayoutGrid size={20} color="#E2DFD0" strokeWidth={1.5} />,
    title: 'Projects',
    desc: 'Deep dives into selected work',
  },
  {
    href: '/how-it-works',
    icon: <Layers size={20} color="#E2DFD0" strokeWidth={1.5} />,
    title: 'How It Works',
    desc: 'The RAG pipeline, evidence engine & AI stack',
  },
]

// ── Card component ────────────────────────────────────────────────────────────

function Card({ card }: { card: CardDef }) {
  const base =
    'relative overflow-hidden rounded-xl p-4 flex flex-col min-h-[100px] backdrop-blur-md border transition-all duration-200 group'

  const variant = card.accent
    ? 'bg-[rgba(180,158,120,0.08)] border-[rgba(180,158,120,0.22)] hover:bg-[rgba(180,158,120,0.13)] hover:border-[rgba(180,158,120,0.38)]'
    : 'bg-[rgba(226,223,208,0.04)] border-[rgba(226,223,208,0.10)] hover:bg-[rgba(226,223,208,0.07)] hover:border-[rgba(226,223,208,0.20)]'

  const sheenGradient = card.accent
    ? 'linear-gradient(135deg, rgba(180,158,120,0.13) 0%, transparent 60%)'
    : 'linear-gradient(135deg, rgba(226,223,208,0.07) 0%, transparent 60%)'

  const titleColor = card.accent ? 'text-[#C4A882]' : 'text-[#E2DFD0] opacity-80'
  const arrowColor = card.accent ? 'text-[#C4A882] opacity-45' : 'text-[#E2DFD0] opacity-[0.18]'
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

      <span className="text-[10px] text-[#E2DFD0] opacity-[0.32] leading-relaxed flex-1">
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
    <main className="min-h-screen flex flex-col bg-[#080808]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex-1">
        <ConstellationCanvas />

        {/* Gradient fade to page bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, #080808 100%)' }}
        />

        {/* Hero content — bottom-anchored */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-8 md:px-8 md:pb-10 pointer-events-none">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 mb-4">
            <span className="w-[5px] h-[5px] rounded-full bg-[#C4A882] opacity-80" />
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#E2DFD0] opacity-40">
              AI-Powered Candidate Profile
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl leading-none text-[#E2DFD0] mb-4"
            style={{ fontWeight: 300, letterSpacing: '-0.04em' }}
          >
            The Career
            <br />
            <em className="font-serif italic text-[#C4A882]">Architect.</em>
          </h1>

          {/* Body copy */}
          <p className="text-sm text-[#E2DFD0] opacity-50 leading-relaxed max-w-lg mb-6">
            <strong className="opacity-[0.75] font-medium not-italic">
              You&apos;re looking at an intelligent portfolio — not a résumé.
            </strong>{' '}
            Ask it anything about Chase&apos;s background, projects, and technical decisions.
            Every answer is grounded in real career artifacts and cited with evidence.
          </p>

          {/* CTA */}
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-2.5 bg-[#E2DFD0] rounded-full pl-4 pr-2 py-2 self-start hover:opacity-90 transition-opacity pointer-events-auto"
          >
            <span className="text-[#080808] text-xs font-medium">
              Ask the first question
            </span>
            <span className="w-7 h-7 bg-[#080808] rounded-full flex items-center justify-center shrink-0">
              <ArrowUpRight size={12} color="#E2DFD0" strokeWidth={2} />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-5">
        <p className="text-[9px] tracking-[0.18em] uppercase text-[#E2DFD0] opacity-25 mb-2.5 px-0.5">
          Explore Chase&apos;s Profile
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CARDS.map(card => (
            <Card key={card.href} card={card} />
          ))}
        </div>
      </section>

    </main>
  )
}
