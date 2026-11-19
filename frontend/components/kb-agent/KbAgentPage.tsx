'use client'

import { Divider } from '@/components/shared/typography'
import { CaseStudyShell } from '@/components/case-study/chrome'
import KbAgentHero, { KB_HERO_CSS } from '@/components/kb-agent/KbAgentHero'
import KbAgentProblem, { KB_PROBLEM_CSS } from '@/components/kb-agent/KbAgentProblem'
import KbAgentBuild, { KB_BUILD_CSS } from '@/components/kb-agent/KbAgentBuild'
import KbWalkthroughSection, { KB_WALKTHROUGH_CSS } from '@/components/kb-agent/KbWalkthroughSection'
import KbAgentArchitecture, { KB_ARCH_CSS } from '@/components/kb-agent/KbAgentArchitecture'
import KbAgentDecisions, { KB_DECISIONS_CSS } from '@/components/kb-agent/KbAgentDecisions'
import KbAgentReflection, { KB_REFLECTION_CSS } from '@/components/kb-agent/KbAgentReflection'
import ProjectClosing, { PROJECT_CLOSING_CSS } from '@/components/case-study/ProjectClosing'

/**
 * Closing CTA data. `sourceUrl` stays null until the KB Agent repository is
 * confirmed public and approved to link; the component omits the link while
 * it is null. When confirmed, point this (and the hero) at `KB_AGENT_REPO`.
 */
const KB_CLOSING = {
  projectName: 'KB Agent',
  suggestions: [
    'Why did you build KB Agent?',
    'What was the hardest technical challenge in KB Agent?',
    'What other AI systems have you built?',
  ],
  sourceUrl: null,
} as const

/**
 * KB Agent case study.
 *
 * SECTIONS 01-06. The page shell, TopNav, back link, routing and the shared
 * `case-study` design system are untouched.
 *
 * Each section is its own module beside the others, imported here in order,
 * with its stylesheet appended to `extraCss`. Section 06 (Engineering
 * Decisions & Reflections) is the last numbered section. A short, unnumbered
 * Project Reflection closes the case study; there is no Section 07. After it,
 * the shared `ProjectClosing` CTA and utility row end the page.
 *
 * Section 04 replaced the development-only `StagedWalkthroughTarget`. It
 * carries the same `KB_WALKTHROUGH_ID`, so the hero's primary CTA now lands
 * on the walkthrough itself.
 */
export default function KbAgentPage() {
  return (
    <CaseStudyShell
      subtitle="KB Agent · Proposal Intelligence"
      pageClass="kb-agent"
      extraCss={KB_HERO_CSS + KB_PROBLEM_CSS + KB_BUILD_CSS + KB_WALKTHROUGH_CSS + KB_ARCH_CSS + KB_DECISIONS_CSS + KB_REFLECTION_CSS + PROJECT_CLOSING_CSS}
    >
      <KbAgentHero />

      <Divider />
      <KbAgentProblem />

      <Divider />
      <KbAgentBuild />

      <Divider />
      <KbWalkthroughSection />

      <Divider />
      <KbAgentArchitecture />

      <Divider />
      <KbAgentDecisions />

      <Divider />
      <KbAgentReflection />

      {/* Unnumbered closing area; not part of any section navigation. */}
      <Divider />
      <ProjectClosing
        projectName={KB_CLOSING.projectName}
        suggestions={KB_CLOSING.suggestions}
        sourceUrl={KB_CLOSING.sourceUrl}
        topId="kb-hero"
      />
    </CaseStudyShell>
  )
}
