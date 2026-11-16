"use client";

import React, { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Eye,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  ListOrdered,
  List,
  Quote,
  Code,
  FileCode,
  Plus,
  Smile,
  AtSign,
  Video,
  Mic,
  Send,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import type {
  TicketStage,
  WalkthroughActions,
  WalkthroughState,
} from "@/components/kb-agent/useWalkthroughReplay";

/**
 * Section 04 Slack replay: the approved standalone demo, integrated.
 *
 * What changed from the standalone source, and why (see SECTION_04_NOTES.md):
 *
 *  - State is lifted. The component is now a controlled view over
 *    `useWalkthroughReplay`, so the explanation panel and this replay can
 *    never disagree about the active step, subcommand, stage or playback.
 *  - Step 08's stage tabs are gated: a stage opens only after it has been
 *    reached through the guided buttons; afterwards back/forward is free.
 *  - Step 04's composite-score caveat left the bot message (the page shows it
 *    as an editorial note under the frame).
 *  - Honesty labels: activity lines are marked illustrative, every output
 *    carries a recorded / excerpt tag.
 *  - Accessibility: decorative formatting controls and the split chevron are
 *    inert, aria-hidden markup rather than buttons; Send keeps focus while a
 *    replay runs (aria-disabled, not disabled); pills expose aria-pressed;
 *    focus is handed to the next sensible control when the one pressed
 *    disappears.
 *  - Tailwind v3 fixes: `shadow-xs` / `shadow-2xs` (v4-only) replaced, and
 *    `animate-ping` limited to `motion-safe`.
 *  - The eight pills are a separate export (`SlackCommandPills`) rendered by
 *    the section above both columns, in one row.
 *  - The client frame has a fixed height set by the page (`.kb-slack-frame`):
 *    the message history scrolls internally and the composer and Send stay
 *    pinned at the bottom, like a real messaging client. Nothing is
 *    truncated; a "More below" control appears whenever content is hidden.
 *
 * The Slack visual system, the eight workflows, every command and every
 * captured output string are unchanged.
 */

// ============================================================================
// LOCKED 8-STEP DEMO SEQUENCE (FROM KB_AGENT_PORTFOLIO_DEMO_FINAL_OUTLINE.md)
//
// Captured content. Site integration changed only presentation metadata here:
// `outputTag` was added per step, and Step 04's `engineeringNote` moved out of
// the bot message into an editorial note owned by the page
// (`KB_WALKTHROUGH.replayNotes` in lib/kb-agent-data.ts). No command, output
// row, figure or footer was altered.
// ============================================================================
export const DEMO_STEPS = [
  {
    id: 1,
    stepNumber: "1",
    pillLabel: "1. /kb list",
    commandShort: "/kb list",
    title: "The whole library, in one line",
    ephemeral: true,
    outputTag: "Recorded result",
    timestamp: "1:09 PM",
    command: "/kb list",
    reasoningLines: [],
    blockHeader: "📚 Knowledge Bases",
    collectionsList: [
      { name: "Contracts", slug: "contracts", chunks: 54 },
      { name: "CostVolume", slug: "costvolume", chunks: 49 },
      { name: "PastPerformance", slug: "pastperformance", chunks: 57 },
      { name: "Resumes", slug: "resumes", chunks: 58 },
      { name: "TechnicalVolume", slug: "technicalvolume", chunks: 56 },
    ],
    footerPrompt: {
      prefix: "Use",
      code: '/kb ask <folder> "question"',
      suffix: "to query",
    },
  },
  {
    id: 2,
    stepNumber: "2",
    pillLabel: "2. /kb agent",
    commandShort: "/kb agent",
    title: "The AI investigates across folders on its own",
    ephemeral: false,
    outputTag: "Recorded result · selected excerpt",
    timestamp: "1:11 PM",
    command: `/kb agent Across our completed federal security operations programs, which SIEM platforms did we actually deploy and what measured improvement did each one achieve, and which capabilities in our proposed SOC technical approach have no matching delivery record?`,
    reasoningLines: [
      `🔍 I can see several relevant collections. For this question, I need:\n1. pastperformance - for completed programs, actual SIEM deployments, and measured improvements\n2. technicalvolume - for proposed SOC technical approach capabilities\n\nSearching relevant document collections...`,
      `⚙️ Calling query_collection with {"collection": "pastperformance", "query": "SIEM platform deployment federal security operations measured improvement metrics results"}`,
      `⚙️ Calling query_collection with {"collection": "technicalvolume", "query": "SOC technical approach capabilities SIEM security operations center proposed solution"}`,
    ],
    blockHeader: "🤖 Agent Investigation — Multi-Collection Findings",
    agentTable: [
      {
        program: "DHS Cyber Transformation (2023)",
        platform: "Splunk Enterprise Security",
        improvement: "67% reduction in MTTD — from 22 hours to 7.2 hours",
      },
      {
        program: "DOE SOC Consolidation (2021-2023)",
        platform: "Elastic Security",
        improvement: "44% reduction in MTTR — from 96 minutes to 54 minutes",
      },
    ],
    verbatimBlocks: [
      `We have proven SIEM deployment credentials on **both Splunk ES and Elastic Security** with quantified detection/response improvements. However, the AI/ML capabilities (UEBA, NLP phishing, SOAR auto-triage) and dedicated threat intel integrations in the current proposal represent **capability extensions beyond our demonstrated delivery record**.`,
    ],
    contextFooter:
      "📄 Completed in 29.56s • 13 reasoning events across 3 tool rounds (Variant C)",
  },
  {
    id: 3,
    stepNumber: "3",
    pillLabel: "3. /kb compare",
    commandShort: "/kb compare",
    title: "Put proven work beside proposed work",
    ephemeral: true,
    outputTag: "Recorded result · selected excerpt, 2 of 6 dimensions",
    timestamp: "1:15 PM",
    command: `/kb compare pastperformance technicalvolume "For the SOC modernization pursuit, what security operations capability does each of these collections actually establish, and where do they disagree about what we can prove?"`,
    reasoningLines: [
      `🔍 Retrieving top-10 hybrid chunks (dense + BM25 RRF k=60) from pastperformance...`,
      `🔍 Retrieving top-10 hybrid chunks (dense + BM25 RRF k=60) from technicalvolume...`,
      `⚙️ Synthesizing 6-dimension cross-collection comparison table with source citations...`,
    ],
    blockHeader: "⚖️ Comparison — PastPerformance vs. TechnicalVolume",
    compareTable: [
      {
        dimension: "SIEM & Telemetry",
        proven:
          "Splunk ES (DHS, 4.2 TB/day) & Elastic Security (DOE, 11 tools consolidated, 5,300 endpoints)",
        proposed:
          "Cloud-native SIEM + UEBA behavioral analytics + automated SOAR playbooks",
        gap: "SIEM migration proven; UEBA & SOAR auto-triage have no past delivery record",
      },
      {
        dimension: "Detection & Response KPIs",
        proven:
          "DHS: 67% MTTD reduction (22h → 7.2h); DOE: 44% MTTR reduction (96m → 54m)",
        proposed:
          "Commits to 96.3% detection accuracy & 60% Tier-1 auto-triage; no MTTD/MTTR target specified",
        gap: "Metric definitions differ (MTTD vs MTTR); proposal omits both in favor of unvalidated ML targets",
      },
    ],
    monospaceTable: `Dimension                  | pastperformance (Proven Delivery)                                                                 | technicalvolume (Proposed Approach)                                                               | Gap / Disagreement
---------------------------+---------------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------------
SIEM & Telemetry           | Splunk ES (DHS, 4.2 TB/day) & Elastic Security (DOE, 11 tools consolidated, 5,300 endpoints)     | Cloud-native SIEM + UEBA behavioral analytics + automated SOAR playbooks                          | SIEM migration proven; UEBA & SOAR auto-triage have no past delivery record
Detection & Response KPIs  | DHS: 67% MTTD reduction (22h -> 7.2h); DOE: 44% MTTR reduction (96m -> 54m)                       | Commits to 96.3% detection accuracy & 60% Tier-1 auto-triage; no MTTD/MTTR target specified       | Metric definitions differ (MTTD vs MTTR); proposal omits both in favor of unvalidated ML targets`,
    verbatimBlocks: [
      `• **Metric definitions differ**: DOE measured MTTR (response), DHS measured MTTD (detection)—the Technical Volume doesn't specify which metric it will target, making direct comparison to past results difficult (2021_DOE_SOC_Consolidation.md, 2023_DHS_CyberTransformation.md, TechnicalApproach_CyberSOC.md)`,
      `An evaluator asking "have you done this before?" will find strong evidence for platform migration and analyst workflow design, but will find the AI-assisted threat detection and SOAR automation are forward commitments without historical validation.`,
    ],
    contextFooter: "📄 Compared top-10 chunks per collection (20 chunks total)",
  },
  {
    id: 4,
    stepNumber: "4",
    pillLabel: "4. /kb score",
    commandShort: "/kb score",
    title: "Grade readiness against the customer's actual words",
    ephemeral: true,
    outputTag: "Recorded result · selected excerpt, 2 of 6 criteria",
    timestamp: "1:18 PM",
    command: `/kb score technicalvolume "The contractor shall operate a 24x7 Security Operations Center providing continuous monitoring, incident detection, and incident response across hybrid cloud environments, and shall report mean time to detect and mean time to respond monthly."`,
    reasoningLines: [
      `🔍 Deconstructing solicitation requirement into 6 evaluable sub-criteria...`,
      `⚙️ Querying technicalvolume (top-15 chunks across 6 sources) for substantiating evidence...`,
      `📊 Grading criterion readiness and flagging unsupported solicitation elements...`,
    ],
    blockHeader: "📊 Readiness Scorecard — TechnicalVolume",
    verbatimBlocks: [
      `• Hybrid Cloud Coverage — 5/10: No explicit hybrid cloud monitoring architecture described. Cloud migration documents reference AWS GovCloud and GCP but are separate engagements, not integrated into SOC proposal. (TechnicalApproach_CloudMigration.md)

• MTTD/MTTR Monthly Reporting — 3/10: No mention of mean time to detect or mean time to respond metrics, measurement methodology, reporting cadence, or baseline targets. Quality documents discuss availability metrics but not security-specific KPIs. (not found)`,
      `• MTTD/MTTR reporting requirement completely unaddressed — no metrics, baselines, or reporting methodology mentioned (not found)`,
    ],
    contextFooter: "📄 Evaluated against 15 chunk(s) from 6 source(s)",
  },
  {
    id: 5,
    stepNumber: "5",
    pillLabel: "5. /kb gaps",
    commandShort: "/kb gaps",
    title: "Find what is missing — and what disagrees",
    ephemeral: true,
    outputTag: "Recorded result · selected excerpt",
    timestamp: "1:21 PM",
    command: `/kb gaps costvolume "cost realism justification and indirect rate support for the SOC pursuit"`,
    reasoningLines: [
      `🔍 Scanning costvolume (top-20 chunks) for DCAA audit history, FPRA letters, and rate tables...`,
      `⚙️ Cross-checking indirect rate percentages across PricingStrategy_Notes.md and IndirectRates_Memo.md...`,
      `⚠️ Detected cross-document rate conflict (42% overhead on labor vs. 30% on wages + fringe)...`,
    ],
    blockHeader: "🔍 Gaps — CostVolume",
    verbatimBlocks: [
      `**Hard Gaps**
• No DCAA audit history or forward pricing rate agreement documentation: Include most recent DCAA audit report or FPRA letter showing approved indirect rates
• No cost realism narrative explaining why proposed labor rates are realistic for the SOC pursuit: Develop narrative comparing proposed rates to salary surveys, BLS data, or actual incumbent compensation`,
      `• Indirect rate calculation for SOC pursuit uses inconsistent factors (42% overhead in PricingStrategy_Notes vs. 30% in IndirectRates_Memo): Reconcile which rate schedule applies and document the variance explanation`,
      `**Priority**
Obtain and include DCAA audit documentation or FPRA approval to substantiate indirect rates—without this, cost realism evaluation will likely result in upward adjustments.`,
    ],
    contextFooter:
      "📄 Evaluated against 20 chunk(s) in costvolume • Allocation bases differ — requires human reconciliation",
  },
  {
    id: 6,
    stepNumber: "6",
    pillLabel: "6. /kb draft",
    commandShort: "/kb draft",
    title: "Write the section, flagging anything unsupported",
    ephemeral: false,
    outputTag: "Recorded result · selected draft excerpt",
    timestamp: "1:25 PM",
    command: `/kb draft pastperformance "Describe the offeror's demonstrated experience operating and modernizing federal security operations centers, including contract values, periods of performance, and measurable detection and response outcomes."`,
    reasoningLines: [
      `🔍 Retrieving top-20 pastperformance chunks for DHS Cyber Transformation and DOE SOC Consolidation...`,
      `⚙️ Extracting verified contract numbers, dollar values, periods of performance, and customer quotes...`,
      `✍️ Drafting narrative paragraphs and inserting [EVIDENCE MISSING] flags for unsupported claims...`,
    ],
    blockHeader: "💬 PastPerformance — First Draft (Requires Human Review)",
    verbatimBlocks: [
      `We further demonstrated SOC modernization expertise through the DOE SOC Consolidation effort for the Department of Energy's Office of the CISO (Contract DE-SOC-21-T-0118, $11.5M CPFF, April 2021–March 2023). Under Program Manager Marcus Delgado, we executed SIEM consolidation on Elastic Security, integrating records from 11 legacy tools into a unified operational view covering 5,300 endpoints.`,
      `[EVIDENCE MISSING: additional SOC operations contracts demonstrating 24/7/365 sustained operations metrics over multi-year periods] [EVIDENCE MISSING: SOC staffing levels and FTE counts for operational engagements]`,
    ],
    contextFooter:
      "📄 Grounded first draft from 20 chunk(s) in pastperformance (synthetic demonstration corpus)",
  },
  {
    id: 7,
    stepNumber: "7",
    pillLabel: "7. /kb changes + diff",
    commandShort: "/kb changes",
    title: "Notice and explain a teammate's edit (2-command sequence)",
    ephemeral: true,
    outputTag: "Recorded result · historical capture",
    timestamp: "1:34 PM",
    command: `/kb changes costvolume`,
    subCommands: [
      {
        partLabel: "Command 1 of 2: /kb changes",
        commandShort: "/kb changes",
        command: `/kb changes costvolume`,
        timestamp: "1:34 PM",
        reasoningLines: [
          `☁️ OneDrive Delta API sync detected modification to CostVolume/PricingStrategy_Notes.md (10s ago)...`,
          `🔍 Querying SQLite version history for recent re-ingestions in costvolume...`,
        ],
        blockHeader: "🔄 Recent Changes — CostVolume",
        verbatimBlocks: [
          `• **PricingStrategy_Notes.md** – revised and re-indexed on 2026-11-09 at 21:33 UTC; contains 6 chunks across 3 version snapshots`,
        ],
        contextFooter:
          "📄 Captured 2026-11-09 • 1 modified source detected in costvolume (3 version snapshots)",
        nextActionLabel: "Inspect document changes",
      },
      {
        partLabel: "Command 2 of 2: /kb diff",
        commandShort: "/kb diff",
        command: `/kb diff CostVolume PricingStrategy_Notes.md`,
        timestamp: "1:35 PM",
        reasoningLines: [
          `🔍 Fetching SQLite version snapshots for PricingStrategy_Notes.md (comparing snapshot 1 → 2 of 3)...`,
          `⚙️ Summarizing semantic additions and rate reconciliation action items...`,
        ],
        blockHeader: "📑 Semantic Diff — CostVolume / PricingStrategy_Notes.md",
        verbatimBlocks: [
          `**Addition: Rate Reconciliation Section**

A new section titled "Rate Reconciliation - Open Action" was added on 2026-11-09, documenting:

- **Discrepancy identified**: The indirect rates in this pricing summary don't match the official FY2024 rates memo
- **Specific conflict**: This file uses 42% overhead on labor and 8% G&A on labor plus overhead, while the FY2024 memo specifies 30% delivery overhead on direct wages plus fringe, and 10% G&A on a broader base including other direct costs
- **Complication noted**: The allocation bases differ, making the schedules not directly comparable
- **Action required**: Finance must confirm in writing which rate schedule governs bid HQ-2024-SOC-0041`,
        ],
        contextFooter:
          "📄 Captured 2026-11-09 against snapshot state 1→2 of 3 (discrepancy documented & assigned, not yet resolved)",
      },
    ],
  },
  {
    id: 8,
    stepNumber: "8",
    pillLabel: "8. /kb ticket",
    commandShort: "/kb ticket",
    title: "Turn the loose end into a tracked task in Notion",
    ephemeral: false,
    outputTag: "Recorded capture · replayed, creates nothing",
    timestamp: "6:22 PM",
    command: `/kb ticket "Confirm which indirect rate schedule governs the HQ-2024-SOC-0041 cost volume" high 2026-11-20`,
    reasoningLines: [
      `⚙️ Parsing ticket arguments (title, priority: High, due: 2026-11-20)...`,
      `🪟 Opening Slack Block Kit review modal pre-filled with rate conflict notes...`,
    ],
    blockHeader: "🪟 Review Ticket — Prefilled Slack Modal",
    ticketWorkflow: {
      stageHeaders: {
        modal: "🪟 Stage 1: Review Ticket — Prefilled Slack Modal",
        confirmed: "🎫 Stage 2: Ticket Created — Recorded Slack Confirmation",
        notion: "📓 Stage 3: Verified Notion Task — Recorded Page Properties",
      },
      stageFooters: {
        modal:
          "📄 Stage 1 of 3 • /kb ticket opens a prefilled Slack Block Kit modal for human review before any task is created",
        confirmed:
          "📄 Stage 2 of 3 • Recorded Slack confirmation message captured 2026-11-09 at 6:22 PM",
        notion:
          "📄 Stage 3 of 3 • Notion-verified task record • Captured 2026-11-09 at 6:22 PM",
      },
      modalFields: {
        taskName:
          "Confirm which indirect rate schedule governs the HQ-2024-SOC-0041 cost volume",
        priority: "High",
        dueDate: "November 20th, 2026",
        assignee: "Chase Sinclair",
        // Pass 3: corrected to the Notion page body as transcribed in the
        // capture archive (KB_AGENT_PORTFOLIO_DEMO_SEQUENCE.md, Step 8). The
        // notes entered in the modal are what Notion saved to the page body.
        additionalNotes:
          "The SOC pricing notes reference a 42% overhead rate on labor, while the FY2024 indirect-rate memo specifies a 30% delivery-overhead rate on a different allocation base.\n\nFinance must confirm which rate schedule governs solicitation HQ-2024-SOC-0041, document the justification, and provide supporting rate documentation before cost-volume submission.",
      },
      verbatimConfirmation: `🎫 Ticket Created
────────────────────────────────────────────────────────────
✅ Confirm which indirect rate schedule governs the HQ-2024-SOC-0041 cost volume created (Priority: High), due 2026-11-20
Assigned to Chase Sinclair in Notion
Additional notes saved to the page body.

Open in Notion`,
      notionPage: {
        taskName:
          "Confirm which indirect rate schedule governs the HQ-2024-SOC-0041 cost volume",
        assignee: "Chase Sinclair",
        dueDate: "11/20/2026",
        priority: "High",
        status: "Not started",
      },
    },
    contextFooter: "📄 Slack-executed & Notion-verified • 2026-11-09 6:22 PM",
  },
];

function KbAgentAvatar() {
  return (
    <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] border border-[#D2E3FC] flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)] select-none">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="14"
          height="18"
          rx="2"
          transform="rotate(-6 3 3)"
          fill="#1A73E8"
        />
        <line
          x1="6.5"
          y1="8"
          x2="13.5"
          y2="7.2"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="6.8"
          y1="11.5"
          x2="13.8"
          y2="10.7"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="7.1"
          y1="15"
          x2="11.5"
          y2="14.5"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18.5 5.5L21 8L14 15L11 15.5L11.5 12.5L18.5 5.5Z"
          fill="#FBBC04"
          stroke="#EA8600"
          strokeWidth="1"
        />
        <path d="M18.5 5.5L20 4L22.5 6.5L21 8L18.5 5.5Z" fill="#F28B82" />
      </svg>
    </div>
  );
}

function SlackCodePill({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 mx-0.5 text-[12.5px] font-mono text-[#E01E5A] bg-[#F8F8F8] border border-[#E0E0E0] rounded-[4px]">
      {children}
    </code>
  );
}

function formatSlackVerbatimText(text: string) {
  if (!text) return null;

  const segments = text.split(/(\[EVIDENCE MISSING:[^\]]+\])/g);

  return segments.map((segment, idx) => {
    if (segment.startsWith("[EVIDENCE MISSING:")) {
      return (
        <span
          key={idx}
          className="inline-block my-1 px-1.5 py-0.5 text-[12.5px] font-mono text-[#E01E5A] bg-[#FDF2F4] border border-[#F5C2C7] rounded-[4px] font-medium"
        >
          {segment}
        </span>
      );
    }

    const tokens = segment.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <React.Fragment key={idx}>
        {tokens.map((tok, tIdx) => {
          if (tok.startsWith("**") && tok.endsWith("**")) {
            return (
              <strong key={tIdx} className="font-bold text-[#1D1C1D]">
                {tok.slice(2, -2)}
              </strong>
            );
          }
          if (tok.startsWith("`") && tok.endsWith("`")) {
            return <SlackCodePill key={tIdx}>{tok.slice(1, -1)}</SlackCodePill>;
          }
          return <span key={tIdx}>{tok}</span>;
        })}
      </React.Fragment>
    );
  });
}

/** Small inert stand-in for a Slack formatting control. Decorative only. */
function DecorIcon({ children, className = "p-1" }: { children: ReactNode; className?: string }) {
  return <span className={`${className} rounded text-[#616061] inline-flex`}>{children}</span>;
}

/** Monospace provenance tag used above activity lines and outputs. */
function ProvenanceTag({
  tone,
  children,
}: {
  tone: "recorded" | "illustrative";
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] leading-none px-1.5 py-[5px] rounded-[3px] border ${
        tone === "recorded"
          ? "text-[#0A6059] bg-[#EEF6F5] border-[#C9E1DE]"
          : "text-[#5E5E5E] bg-white border-dashed border-[#C4C4C4]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-[5px] h-[5px] rounded-full ${tone === "recorded" ? "bg-[#0A6059]" : "bg-[#9A9A9A]"}`}
      />
      {children}
    </span>
  );
}

/**
 * The eight prepared commands as one horizontal row. Rendered by the section
 * container above both columns, so it spans the full content width. Scrolls
 * horizontally rather than wrapping if the row is ever wider than its box.
 */
export function SlackCommandPills({
  stepIdx,
  onSelect,
  labelledBy,
}: {
  stepIdx: number;
  onSelect: (index: number) => void;
  labelledBy?: string;
}) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="font-sans bg-white rounded-xl border border-gray-200 px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-nowrap items-center justify-between gap-1.5 overflow-x-auto"
    >
      {DEMO_STEPS.map((step, index) => {
        const isSelected = index === stepIdx;
        const name = step.pillLabel.replace(/^\d+\.\s*/, "");
        return (
          <button
            key={step.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={`Step ${step.stepNumber}: ${name}`}
            onClick={() => onSelect(index)}
            className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[11.5px] font-mono transition-colors cursor-pointer inline-flex items-baseline gap-1.5 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059] ${
              isSelected
                ? "bg-[#3F0E40] border-[#3F0E40] text-white font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            }`}
          >
            <span
              className={`text-[10px] font-normal ${isSelected ? "text-white/60" : "text-gray-400"}`}
            >
              {step.stepNumber.padStart(2, "0")}
            </span>
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Activity collapse / expand duration, seconds. */
const COLLAPSE_S = 0.24;

/** Context-appropriate wording for the collapsed activity row. Presentation only. */
const ACTIVITY_SUMMARY: Record<string, string> = {
  "2": "Investigation complete",
  "3": "Comparison complete",
  "4": "Scoring complete",
  "5": "Gap scan complete",
  "6": "Draft complete",
  "7.0": "Change check complete",
  "7.1": "Diff complete",
  "8": "Ticket form prepared",
};

/** Smooth scrolling unless the visitor prefers reduced motion. */
const smooth = () =>
  typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STAGE_LABELS: Record<TicketStage, string> = {
  modal: "Stage 1: Review ticket",
  confirmed: "Stage 2: Recorded Slack confirmation",
  notion: "Stage 3: Verified Notion task",
};

export default function SlackWalkthroughSection04({
  state,
  actions,
}: {
  state: WalkthroughState;
  actions: WalkthroughActions;
}) {
  const { stepIdx, sub, status, visibleLines, stage, stageReached } = state;
  const currentStep = DEMO_STEPS[stepIdx];
  const activeStep7Sub = currentStep.subCommands ? currentStep.subCommands[sub] : null;

  const activeReasoningLines = activeStep7Sub
    ? activeStep7Sub.reasoningLines
    : currentStep.reasoningLines || [];
  const activeTimestamp = activeStep7Sub ? activeStep7Sub.timestamp : currentStep.timestamp;
  const activeCommandShort = activeStep7Sub
    ? activeStep7Sub.commandShort
    : currentStep.commandShort;
  const composerText = activeStep7Sub ? activeStep7Sub.command : currentStep.command;
  const activeBlockHeader =
    currentStep.id === 8 && currentStep.ticketWorkflow
      ? currentStep.ticketWorkflow.stageHeaders[stage]
      : activeStep7Sub
      ? activeStep7Sub.blockHeader
      : currentStep.blockHeader;
  const activeVerbatimBlocks = activeStep7Sub
    ? activeStep7Sub.verbatimBlocks
    : currentStep.verbatimBlocks;
  const activeContextFooter =
    currentStep.id === 8 && currentStep.ticketWorkflow
      ? currentStep.ticketWorkflow.stageFooters[stage]
      : activeStep7Sub
      ? activeStep7Sub.contextFooter
      : currentStep.contextFooter;

  const [step3Mode, setStep3Mode] = React.useState<"rendered" | "monospace">("rendered");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sendRef = useRef<HTMLButtonElement | null>(null);
  const stageTabRefs = useRef<Partial<Record<TicketStage, HTMLButtonElement | null>>>({});
  /** Control to focus after the render that removes the one just pressed. */
  const pendingFocus = useRef<(() => void) | null>(null);

  // Auto-fit the read-only composer so the full command is always visible.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [composerText]);

  useEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current();
      pendingFocus.current = null;
    }
  });

  // ── Message-history scrolling ────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const activityRowRef = useRef<HTMLButtonElement | null>(null);
  const [moreBelow, setMoreBelow] = React.useState(false);
  /** Activity disclosure after completion. Closed on every new run or selection. */
  const [activityOpen, setActivityOpen] = React.useState(false);
  /**
   * Set as soon as the visitor scrolls the history themselves (wheel, touch,
   * scroll keys, scrollbar, More below). While set, nothing scrolls the window
   * automatically. Cleared when they start something new: a Send, another
   * step or subcommand, or a Step 08 stage button.
   */
  const userScrolledRef = useRef(false);
  const markUserScroll = () => {
    userScrolledRef.current = true;
  };
  const onHistoryKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) markUserScroll();
  };
  const onHistoryPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // A press on the region itself (not its content) is the scrollbar.
    if (e.target === e.currentTarget) markUserScroll();
  };

  // A new run (reasoning) or a new selection (idle) starts fresh; reaching
  // "done" must not clear a scroll the visitor made while it was running.
  useEffect(() => {
    if (status === "done") return;
    setActivityOpen(false);
    userScrolledRef.current = false;
  }, [status, stepIdx, sub]);

  useEffect(() => {
    userScrolledRef.current = false;
  }, [stage]);

  const updateMoreBelow = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
  }, []);

  const scrollDownAPage = () => {
    const el = scrollRef.current;
    if (!el) return;
    markUserScroll();
    el.scrollBy({ top: el.clientHeight * 0.8, behavior: smooth() ? "smooth" : "auto" });
  };

  // Keep the indicator honest as content mounts, animates in or resizes.
  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updateMoreBelow());
    ro.observe(content);
    if (scrollRef.current) ro.observe(scrollRef.current);
    return () => ro.disconnect();
  }, [updateMoreBelow]);

  /**
   * Bring the start of the result (its collapsed activity row, then the
   * recorded output) to the top of the window, or show all of it if it fits. Runs once the activity has finished collapsing, so it measures
   * the settled layout and makes one short, smooth move instead of chasing a
   * moving target. Skipped if the visitor has started scrolling themselves.
   */
  const scrollToResult = React.useCallback(() => {
    const wait = smooth() ? COLLAPSE_S * 1000 + 30 : 0;
    window.setTimeout(() => {
      const el = scrollRef.current;
      const r = resultRef.current;
      if (!el || !r || !r.isConnected) return;
      if (userScrolledRef.current) {
        updateMoreBelow();
        return;
      }
      // Lead with the collapsed activity row when there is one, so "View
      // activity" and the start of the result are both in view together.
      const lead = activityRowRef.current?.isConnected ? activityRowRef.current : r;
      const offset = lead.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
      const fits = el.scrollHeight - offset <= el.clientHeight;
      el.scrollTo({
        top: fits ? el.scrollHeight : Math.max(0, offset - 10),
        behavior: smooth() ? "smooth" : "auto",
      });
      updateMoreBelow();
    }, wait);
  }, [updateMoreBelow]);

  /**
   * The result block is keyed per step / subcommand / Step 08 stage, and
   * AnimatePresence mounts the new one only after the old one has exited. A
   * callback ref therefore fires exactly when the content to read is in the
   * DOM, which is when the window should move to it.
   */
  const setResultRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      resultRef.current = node;
      if (node) scrollToResult();
    },
    [scrollToResult],
  );

  /**
   * Chat-client behaviour. While activity lines stream in, follow the newest
   * line; when idle, rest at the top.
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (status === "idle") el.scrollTop = 0;
    else if (status === "reasoning" && !userScrolledRef.current)
      el.scrollTo({ top: el.scrollHeight, behavior: smooth() ? "smooth" : "auto" });
    updateMoreBelow();
  }, [status, visibleLines, stepIdx, sub, updateMoreBelow]);

  const isSendReady = composerText.trim().length > 0 && status !== "reasoning";

  const handleSend = () => {
    if (!isSendReady) return;
    actions.send();
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Loads a Step 07 subcommand and hands focus to Send; never executes it. */
  const loadSub = (s: 0 | 1) => {
    actions.selectSub(s);
    pendingFocus.current = () => sendRef.current?.focus();
  };

  const goToStage = (next: TicketStage) => {
    actions.setStage(next);
    pendingFocus.current = () => stageTabRefs.current[next]?.focus();
  };

  const linesShown = status === "done" ? activeReasoningLines.length : visibleLines;
  /**
   * Compact window while nothing has been replayed yet for the loaded command
   * (Pass 3). Step 07's second command keeps the full height once the first
   * has run, so the window doesn't shrink and regrow between the two sends.
   */
  const compact = status === "idle" && !(currentStep.id === 7 && state.changesSeen);
  const activitySummary = ACTIVITY_SUMMARY[`${currentStep.id}${activeStep7Sub ? `.${sub}` : ""}`] ?? "Investigation complete";

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full space-y-2.5 font-sans text-[#1D1C1D]" data-replay-status={status}>
          {/* Step 07 sub-command sequence */}
          {currentStep.id === 7 && currentStep.subCommands && (
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-between gap-2">
              <span id="kb-wt-sub-label" className="text-[11.5px] text-gray-600 font-medium">
                Step 07 sequence — two separate Slack commands:
              </span>
              <div role="group" aria-labelledby="kb-wt-sub-label" className="flex items-center gap-1.5">
                {currentStep.subCommands.map((subCmd, sIdx) => {
                  const isSubActive = sub === sIdx;
                  return (
                    <button
                      key={subCmd.commandShort}
                      type="button"
                      aria-pressed={isSubActive}
                      onClick={() => loadSub(sIdx as 0 | 1)}
                      className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer transition-colors border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059] ${
                        isSubActive
                          ? "bg-[#007A5A] text-white border-[#007A5A] font-semibold"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {subCmd.partLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* SLACK LIGHT-MODE CLIENT FRAME */}
        <div
          className="kb-slack-frame rounded-xl overflow-hidden border border-[#DCDCDC] bg-white shadow-lg flex"
          data-compact={compact}
        >
          <div className="w-5 sm:w-7 bg-[#3F0E40] shrink-0 select-none" aria-hidden="true" />

          <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-white">
            {/* MESSAGE HISTORY: fixed-height window, scrolls internally like a real client */}
            <div className="relative flex-1 min-h-0">
              <div
                ref={scrollRef}
                role="region"
                aria-label="Slack message history (scrollable)"
                tabIndex={0}
                onScroll={updateMoreBelow}
                onWheel={markUserScroll}
                onTouchMove={markUserScroll}
                onKeyDown={onHistoryKeyDown}
                onPointerDown={onHistoryPointerDown}
                className="absolute inset-0 overflow-y-auto overscroll-contain focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0A6059]"
              >
              <div ref={contentRef} className="min-h-full flex flex-col justify-end">
              {status === "idle" && (
                <div className="my-auto px-6 py-6 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#00664B] text-xs font-medium">
                    <span>
                      {currentStep.id === 7
                        ? `Step 07 (${sub + 1} of 2) ready in the composer below`
                        : "Prepared command ready in the composer below"}
                    </span>
                  </div>
                  <p className="text-sm text-[#1D1C1D] font-medium">
                    Step {currentStep.stepNumber}: {currentStep.title}
                  </p>
                  <p className="text-xs text-[#616061]">
                    Press{" "}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#007A5A] text-white text-[10px] font-semibold">
                      Send ➤
                    </span>{" "}
                    (or{" "}
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[11px] font-mono">
                      Enter
                    </kbd>{" "}
                    in the command box) to replay{" "}
                    <SlackCodePill>{activeCommandShort}</SlackCodePill>.
                  </p>
                </div>
              )}

              {(status === "reasoning" || status === "done") && (
                <div
                  className={`px-4 sm:px-6 pt-3 pb-5 border-b border-[#E8E8E8] transition-colors ${
                    currentStep.ephemeral ? "bg-[#F8F8F8]" : "bg-white"
                  }`}
                >
                  {currentStep.ephemeral && (
                    <div className="flex items-center gap-1.5 text-[12px] text-[#616061] mb-2 select-none">
                      <Eye className="w-3.5 h-3.5 text-[#616061]" aria-hidden="true" />
                      <span>Only visible to you</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <KbAgentAvatar />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="font-black text-[15px] text-[#1D1C1D] tracking-tight">
                          kb-agent
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1 py-[2px] rounded-[3px] bg-[#E8E8E8] text-[#616061] tracking-wide">
                          APP
                        </span>
                        <span className="text-[12px] text-[#616061] ml-1">{activeTimestamp}</span>
                      </div>

                      {/* ACTIVITY STREAM — staged narration, labelled as such.
                          Streams in while running; collapses to one summary row
                          once the recorded result is on screen. */}
                      {activeReasoningLines.length > 0 && (
                        <div className="mt-2.5">
                          {status === "done" && (
                            <button
                              ref={activityRowRef}
                              type="button"
                              aria-expanded={activityOpen}
                              aria-controls="kb-wt-activity"
                              onClick={() => setActivityOpen((o) => !o)}
                              className="group w-full flex items-center gap-2 text-left px-3 py-[7px] rounded-md border border-dashed border-[#C4C4C4] bg-white hover:bg-[#FAFAFA] hover:border-[#A8A8A8] cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059]"
                            >
                              <span aria-hidden="true" className="w-[5px] h-[5px] rounded-full bg-[#9A9A9A] shrink-0" />
                              <span className="text-[12.5px] text-[#1D1C1D] font-medium">{activitySummary}</span>
                              <span className="text-[12.5px] text-[#616061]">
                                · {activityOpen ? "Hide activity" : "View activity"}
                              </span>
                              <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-[#5E5E5E]">
                                Illustrative · {activeReasoningLines.length} steps
                              </span>
                              <ChevronDown
                                aria-hidden="true"
                                className={`w-3.5 h-3.5 text-[#616061] shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                                  activityOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}

                          <AnimatePresence initial={false}>
                            {(status === "reasoning" || activityOpen) && (
                              <motion.div
                                id="kb-wt-activity"
                                key="activity"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: smooth() ? COLLAPSE_S : 0, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden"
                              >
                                <div className={`space-y-1.5 ${status === "done" ? "pt-1.5" : ""}`}>
                                  {status === "reasoning" && (
                                    <ProvenanceTag tone="illustrative">
                                      Illustrative activity · not runtime logs
                                    </ProvenanceTag>
                                  )}
                                  {activeReasoningLines.slice(0, linesShown).map((line, rIdx) => (
                                    <motion.div
                                      key={rIdx}
                                      initial={status === "reasoning" ? { opacity: 0, y: 4 } : false}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="text-[12.5px] font-mono text-[#4A4A4A] bg-white border border-[#E2E2E2] rounded-md px-3 py-2 whitespace-pre-wrap break-words leading-relaxed shadow-[0_1px_1px_rgba(0,0,0,0.03)]"
                                    >
                                      {line}
                                    </motion.div>
                                  ))}

                                  {status === "reasoning" && (
                                    <div className="flex items-center gap-2 text-[12px] text-[#616061] pt-1 pl-1">
                                      <span
                                        aria-hidden="true"
                                        className="w-2 h-2 rounded-full bg-[#007A5A] motion-safe:animate-ping"
                                      />
                                      <span>kb-agent is investigating collections...</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* FINAL BLOCK KIT OUTPUT */}
                      <AnimatePresence mode="wait">
                        {status === "done" && (
                          <motion.div
                            ref={setResultRef}
                            key={`done-${currentStep.id}-${sub}-${stage}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className="mt-3"
                          >
                            <div className="mb-2">
                              <ProvenanceTag tone="recorded">{currentStep.outputTag}</ProvenanceTag>
                            </div>
                            <div className="font-bold text-[15px] text-[#1D1C1D] flex items-center justify-between gap-2 flex-wrap">
                              <span>{activeBlockHeader}</span>

                              {currentStep.id === 3 && (
                                <div
                                  role="group"
                                  aria-label="Comparison table format"
                                  className="inline-flex items-center bg-[#EBEBEB] p-0.5 rounded-md border border-[#D8D8D8] text-[11px] font-mono font-normal"
                                >
                                  {(["rendered", "monospace"] as const).map((mode) => (
                                    <button
                                      key={mode}
                                      type="button"
                                      aria-pressed={step3Mode === mode}
                                      onClick={() => setStep3Mode(mode)}
                                      className={`px-2 py-0.5 rounded-[4px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6059] ${
                                        step3Mode === mode
                                          ? "bg-white text-[#1D1C1D] font-semibold shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                                          : "text-[#616061] hover:text-[#1D1C1D]"
                                      }`}
                                    >
                                      {mode === "rendered" ? "Structured Table" : "Raw Monospace"}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <hr className="my-2.5 border-t border-[#DDDDDD]" />

                            {/* STEP 1: 5-collection list */}
                            {currentStep.id === 1 && currentStep.collectionsList && (
                              <div className="space-y-2.5 text-[15px] text-[#1D1C1D] py-0.5">
                                {currentStep.collectionsList.map((col) => (
                                  <div key={col.slug} className="leading-snug">
                                    <strong className="font-bold">{col.name}</strong>{" "}
                                    <span className="text-[#616061]">→</span>{" "}
                                    <SlackCodePill>{col.slug}</SlackCodePill>{" "}
                                    <span className="text-[#1D1C1D]">– {col.chunks} chunks</span>
                                  </div>
                                ))}

                                <hr className="my-3 border-t border-[#DDDDDD]" />

                                <div className="text-[13px] text-[#616061]">
                                  {currentStep.footerPrompt?.prefix}{" "}
                                  <SlackCodePill>{currentStep.footerPrompt?.code}</SlackCodePill>{" "}
                                  {currentStep.footerPrompt?.suffix}
                                </div>
                              </div>
                            )}

                            {/* STEP 2 table */}
                            {currentStep.id === 2 && currentStep.agentTable && (
                              <div className="mb-3 overflow-x-auto rounded-md border border-[#DCDCDC] bg-white">
                                <table className="w-full text-left border-collapse text-[13.5px]">
                                  <thead>
                                    <tr className="bg-[#F4F5F7] border-b border-[#DCDCDC] text-[#1D1C1D]">
                                      <th scope="col" className="py-2 px-3 font-bold">Program</th>
                                      <th scope="col" className="py-2 px-3 font-bold">SIEM Platform</th>
                                      <th scope="col" className="py-2 px-3 font-bold">Measured Improvement</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#EAEAEA]">
                                    {currentStep.agentTable.map((row, idx) => (
                                      <tr key={idx} className="hover:bg-[#FAFAFA] align-top">
                                        <td className="py-2.5 px-3 font-semibold text-[#1D1C1D]">{row.program}</td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                          <SlackCodePill>{row.platform}</SlackCodePill>
                                        </td>
                                        <td className="py-2.5 px-3 font-medium text-[#00664B]">{row.improvement}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* STEP 3 table or raw monospace */}
                            {currentStep.id === 3 && step3Mode === "rendered" && currentStep.compareTable && (
                              <div className="mb-3 overflow-x-auto rounded-md border border-[#DCDCDC] bg-white">
                                <table className="w-full min-w-[640px] text-left border-collapse text-[13px]">
                                  <thead>
                                    <tr className="bg-[#F4F5F7] border-b border-[#DCDCDC] text-[#1D1C1D]">
                                      <th scope="col" className="py-2 px-3 font-bold">Dimension</th>
                                      <th scope="col" className="py-2 px-3 font-bold">PastPerformance (Proven)</th>
                                      <th scope="col" className="py-2 px-3 font-bold">TechnicalVolume (Proposed)</th>
                                      <th scope="col" className="py-2 px-3 font-bold">Key Gap</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#EAEAEA]">
                                    {currentStep.compareTable.map((row, idx) => (
                                      <tr key={idx} className="hover:bg-[#FAFAFA] align-top">
                                        <td className="py-2.5 px-3 font-semibold text-[#1D1C1D]">{row.dimension}</td>
                                        <td className="py-2.5 px-3 text-[#1D1C1D]">{row.proven}</td>
                                        <td className="py-2.5 px-3 text-[#1D1C1D]">{row.proposed}</td>
                                        <td className="py-2.5 px-3 text-[#C0174B] font-medium">{row.gap}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {currentStep.id === 3 && step3Mode === "monospace" && (
                              <div className="mb-3">
                                <pre
                                  tabIndex={0}
                                  aria-label="Raw monospace comparison table, scrolls horizontally"
                                  className="text-[12px] font-mono text-[#1D1C1D] bg-white p-3 rounded-md border border-[#DDDDDD] overflow-x-auto whitespace-pre leading-relaxed focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6059]"
                                >
                                  {currentStep.monospaceTable}
                                </pre>
                              </div>
                            )}

                            {/* STEP 8 three-stage progression:
                                review form -> recorded Slack confirmation -> verified Notion task */}
                            {currentStep.id === 8 && currentStep.ticketWorkflow && (
                              <div className="space-y-3">
                                <div role="group" aria-label="Recorded ticket stages" className="flex flex-wrap items-center gap-1.5">
                                  {(["modal", "confirmed", "notion"] as const).map((s, sIdx) => {
                                    const locked = sIdx > stageReached;
                                    const on = stage === s;
                                    return (
                                      <button
                                        key={s}
                                        ref={(el) => {
                                          stageTabRefs.current[s] = el;
                                        }}
                                        type="button"
                                        aria-pressed={on}
                                        aria-disabled={locked}
                                        title={locked ? "Reached by continuing through the recorded steps" : undefined}
                                        onClick={() => {
                                          if (!locked) goToStage(s);
                                        }}
                                        className={`px-2.5 py-1 rounded text-xs font-medium border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059] ${
                                          on
                                            ? "bg-[#007A5A] text-white border-[#007A5A] cursor-pointer"
                                            : locked
                                            ? "bg-[#F4F4F4] text-[#8A8A8A] border-dashed border-[#D0D0D0] cursor-not-allowed"
                                            : "bg-white text-[#1D1C1D] border-[#CCCCCC] cursor-pointer"
                                        }`}
                                      >
                                        {locked && <Lock className="inline w-2.5 h-2.5 mr-1 -mt-px" aria-hidden="true" />}
                                        {STAGE_LABELS[s]}
                                      </button>
                                    );
                                  })}
                                </div>

                                {stage === "modal" && (
                                  <div className="bg-white border border-[#CFCFCF] rounded-lg shadow-md max-w-lg overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#E8E8E8] flex items-center justify-between gap-2 bg-[#F8F8F8]">
                                      <span className="font-bold text-sm text-[#1D1C1D]">
                                        Create Notion Ticket (Review Before Write)
                                      </span>
                                      <span className="text-[11px] font-mono text-[#616061] shrink-0">
                                        Prefilled Slack Modal
                                      </span>
                                    </div>
                                    <div className="p-4 space-y-3 text-xs">
                                      <div>
                                        <div className="font-semibold text-[#1D1C1D] mb-1">Task name</div>
                                        <div className="p-2 rounded border border-[#CCCCCC] bg-[#FAFAFA] font-mono text-[#1D1C1D]">
                                          {currentStep.ticketWorkflow.modalFields.taskName}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <div className="font-semibold text-[#1D1C1D] mb-1">Priority</div>
                                          <div className="p-2 rounded border border-[#CCCCCC] bg-[#FAFAFA]">
                                            <span aria-hidden="true">🔴 </span>
                                            {currentStep.ticketWorkflow.modalFields.priority}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-[#1D1C1D] mb-1">Due date <span className="font-normal text-[#616061]">(optional)</span></div>
                                          <div className="p-2 rounded border border-[#CCCCCC] bg-[#FAFAFA]">
                                            {currentStep.ticketWorkflow.modalFields.dueDate}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-[#1D1C1D] mb-1">Assignee <span className="font-normal text-[#616061]">(optional)</span></div>
                                          <div className="p-2 rounded border border-[#CCCCCC] bg-[#FAFAFA] font-medium">
                                            <span aria-hidden="true">👤 </span>
                                            {currentStep.ticketWorkflow.modalFields.assignee}
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-[#1D1C1D] mb-1">Additional notes <span className="font-normal text-[#616061]">(optional)</span></div>
                                        <div className="p-2.5 rounded border border-[#CCCCCC] bg-[#FAFAFA] text-[#1D1C1D] whitespace-pre-line leading-relaxed">
                                          {currentStep.ticketWorkflow.modalFields.additionalNotes}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-4 py-2.5 bg-[#F8F8F8] border-t border-[#E8E8E8] flex items-center justify-between gap-2">
                                      <span className="text-[11px] text-[#616061]">
                                        A person reviewed and submitted this form in the recorded run.
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => goToStage("confirmed")}
                                        className="px-3.5 py-1.5 rounded bg-[#007A5A] hover:bg-[#00664B] text-white font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059]"
                                      >
                                        <span>View recorded confirmation</span>
                                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {stage === "confirmed" && (
                                  <div className="space-y-2.5">
                                    <pre className="text-[13px] font-mono text-[#1D1C1D] bg-[#F8F8F8] p-3.5 rounded-md border border-[#DDDDDD] whitespace-pre-wrap break-words leading-relaxed">
                                      {currentStep.ticketWorkflow.verbatimConfirmation}
                                    </pre>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => goToStage("notion")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#007A5A] hover:bg-[#00664B] text-white text-xs font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059]"
                                      >
                                        <span>Inspect verified Notion task</span>
                                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => goToStage("modal")}
                                        className="text-xs text-[#616061] hover:text-[#1D1C1D] underline cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6059]"
                                      >
                                        Back to Stage 1 (Review form)
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {stage === "notion" && (
                                  <div className="bg-white border border-[#DDDDDD] rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-3 text-xs">
                                    <div className="flex items-center justify-between gap-3 border-b border-[#EEEEEE] pb-2">
                                      <div>
                                        <span className="text-[11px] font-mono uppercase text-[#616061] block">
                                          Notion Task Title
                                        </span>
                                        <span className="font-bold text-sm text-[#1D1C1D]">
                                          {currentStep.ticketWorkflow.notionPage.taskName}
                                        </span>
                                      </div>
                                      <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#00664B] font-mono text-[11px] shrink-0">
                                        Status: {currentStep.ticketWorkflow.notionPage.status}
                                      </span>
                                    </div>
                                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAFAFA] p-2.5 rounded border border-[#EAEAEA]">
                                      <div>
                                        <dt className="text-[#616061]">Assignee (people)</dt>
                                        <dd className="font-bold text-[#1D1C1D]">
                                          <span aria-hidden="true">👤 </span>
                                          {currentStep.ticketWorkflow.notionPage.assignee}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-[#616061]">Priority (select)</dt>
                                        <dd className="font-bold text-[#C0174B]">
                                          {currentStep.ticketWorkflow.notionPage.priority}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-[#616061]">Due date (date)</dt>
                                        <dd className="font-bold text-[#1D1C1D]">
                                          {currentStep.ticketWorkflow.notionPage.dueDate}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-[#616061]">Status</dt>
                                        <dd className="font-bold text-[#1D1C1D]">
                                          {currentStep.ticketWorkflow.notionPage.status}
                                        </dd>
                                      </div>
                                    </dl>
                                    <div>
                                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#616061] mb-1">
                                        Additional Notes (Page Body)
                                      </div>
                                      <div className="p-3 rounded bg-[#F8F8F8] border border-[#E5E5E5] whitespace-pre-line leading-relaxed text-[#1D1C1D]">
                                        {currentStep.ticketWorkflow.modalFields.additionalNotes}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* STANDARD VERBATIM BLOCKS */}
                            {activeVerbatimBlocks && (
                              <div className="space-y-2.5">
                                {activeVerbatimBlocks.map((block, bIdx) => (
                                  <div
                                    key={bIdx}
                                    className="text-[14px] text-[#1D1C1D] bg-white p-3.5 rounded-md border border-[#E2E2E2] whitespace-pre-wrap break-words leading-relaxed font-sans"
                                  >
                                    {formatSlackVerbatimText(block)}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* STEP 07: load the second command (/kb diff) without running it */}
                            {currentStep.id === 7 && sub === 0 && (
                              <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-xs text-[#616061]">
                                  Next in Step 07: load{" "}
                                  <SlackCodePill>/kb diff CostVolume PricingStrategy_Notes.md</SlackCodePill>{" "}
                                  into the composer
                                </span>
                                <button
                                  type="button"
                                  onClick={() => loadSub(1)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#007A5A] hover:bg-[#00664B] text-white text-xs font-semibold cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059]"
                                >
                                  <span>Inspect document changes</span>
                                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            )}

                            {currentStep.id === 7 && sub === 1 && (
                              <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => loadSub(0)}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[#616061] hover:text-[#1D1C1D] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6059]"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Back to Command 1 (/kb changes costvolume)</span>
                                </button>
                              </div>
                            )}

                            {activeContextFooter && (
                              <>
                                <hr className="my-2.5 border-t border-[#DDDDDD]" />
                                <div className="text-[12px] text-[#616061]">{activeContextFooter}</div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
              </div>
              </div>
              {/* Quiet "more below" cue: a short fade over the last few pixels of
                  the history, and a small pill that straddles the history /
                  composer divider, so it sits in padding rather than on text. */}
              {moreBelow && (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/90 to-transparent"
                  />
                  <button
                    type="button"
                    onClick={scrollDownAPage}
                    className="absolute z-10 left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-white border border-[#D6D6D6] text-[#5E5E5E] hover:text-[#1D1C1D] hover:border-[#BDBDBD] text-[11px] leading-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059]"
                  >
                    More below
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {/* READ-ONLY, AUTO-FITTING COMPOSER */}
            <div className="shrink-0 px-4 sm:px-5 pt-3 pb-2 bg-white border-t border-[#EDEDED]">
              <div className="rounded-lg border border-[#CCCCCC] bg-white overflow-hidden shadow-[0_1px_1px_rgba(0,0,0,0.03)] focus-within:border-[#868686]">
                {/* Formatting toolbar: decorative, not operable */}
                <div className="px-2.5 py-1.5 bg-[#F8F8F8] border-b border-[#EAEAEA] flex items-center justify-between gap-2 text-[#616061] select-none overflow-x-auto">
                  <div className="flex items-center gap-1" aria-hidden="true">
                    <DecorIcon><Bold className="w-3.5 h-3.5" /></DecorIcon>
                    <DecorIcon><Italic className="w-3.5 h-3.5" /></DecorIcon>
                    <DecorIcon><Underline className="w-3.5 h-3.5" /></DecorIcon>
                    <DecorIcon><Strikethrough className="w-3.5 h-3.5" /></DecorIcon>
                    <span className="h-4 w-[1px] bg-[#DCDCDC] mx-1" />
                    <DecorIcon><Link2 className="w-3.5 h-3.5" /></DecorIcon>
                    <DecorIcon><ListOrdered className="w-3.5 h-3.5" /></DecorIcon>
                    <DecorIcon><List className="w-3.5 h-3.5" /></DecorIcon>
                    <span className="h-4 w-[1px] bg-[#DCDCDC] mx-1" />
                    <DecorIcon><Quote className="w-3.5 h-3.5" /></DecorIcon>
                    <DecorIcon><Code className="w-3.5 h-3.5" /></DecorIcon>
                    <DecorIcon><FileCode className="w-3.5 h-3.5" /></DecorIcon>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#5E5E5E] bg-[#EFEFEF] px-2 py-0.5 rounded border border-[#E0E0E0] shrink-0">
                    <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>Prepared command replay (read-only)</span>
                  </span>
                </div>

                <div className="px-3.5 py-2.5 flex items-center">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    readOnly
                    value={composerText}
                    onKeyDown={handleTextareaKeyDown}
                    aria-label="Prepared Slack command (read-only). Press Enter to replay it."
                    aria-describedby="kb-wt-composer-hint"
                    className="w-full resize-none overflow-hidden border-0 bg-transparent text-[14.5px] text-[#1D1C1D] focus:outline-none leading-relaxed font-sans whitespace-pre-wrap break-words"
                  />
                </div>

                <div className="px-2.5 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#616061] select-none" aria-hidden="true">
                    <span className="w-7 h-7 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#1D1C1D]">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span className="px-1.5 py-1 rounded text-xs font-serif font-semibold underline">Aa</span>
                    <DecorIcon className="p-1.5"><Smile className="w-4 h-4" /></DecorIcon>
                    <DecorIcon className="p-1.5"><AtSign className="w-4 h-4" /></DecorIcon>
                    <span className="h-4 w-[1px] bg-[#DCDCDC] mx-0.5" />
                    <DecorIcon className="p-1.5"><Video className="w-4 h-4" /></DecorIcon>
                    <DecorIcon className="p-1.5"><Mic className="w-4 h-4" /></DecorIcon>
                    <span className="h-4 w-[1px] bg-[#DCDCDC] mx-0.5" />
                    <span className="p-1.5 rounded font-mono text-xs border border-[#DCDCDC] leading-none">/</span>
                  </div>

                  {/* Send stays focusable while a replay runs (aria-disabled), so
                      keyboard focus is never dropped to <body>. The chevron half
                      of Slack's split button is decorative. */}
                  <div
                    className={`inline-flex items-center rounded-[4px] overflow-hidden transition-colors ${
                      isSendReady ? "bg-[#007A5A] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "bg-[#EAEAEA] text-[#8A8A8A]"
                    }`}
                  >
                    <button
                      ref={sendRef}
                      type="button"
                      aria-disabled={!isSendReady}
                      aria-label={`Send prepared command ${activeCommandShort}`}
                      onClick={handleSend}
                      className={`px-2.5 py-1.5 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6059] ${
                        isSendReady ? "hover:bg-[#00664B] cursor-pointer" : "cursor-not-allowed"
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span
                      aria-hidden="true"
                      className={`h-4 w-[1px] ${isSendReady ? "bg-white/25" : "bg-[#CCCCCC]"}`}
                    />
                    <span aria-hidden="true" className="px-1.5 py-1.5 flex items-center justify-center opacity-80">
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              <div
                id="kb-wt-composer-hint"
                className="mt-1 flex items-center justify-between gap-3 text-[11px] text-[#616061] select-none"
              >
                <span>Only the selected prepared command can run. Nothing is sent anywhere.</span>
                <span>
                  Press <strong className="font-semibold">Enter</strong> in the command box or{" "}
                  <strong className="font-semibold text-[#00664B]">Send</strong> to replay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
