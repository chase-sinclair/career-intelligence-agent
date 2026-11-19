'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useInView } from '@/hooks/useInView'
import { Eyebrow, Heading2, Divider } from '@/components/shared/typography'
import {
  ARROW_PATH,
  CaseStudyShell,
  CloseStrip,
  Figure,
  Glyph,
  PipelineList,
  reveal,
  useOnceInView,
} from '@/components/case-study/chrome'
import {
  EVIDENCE_LINKS,
  EXPERIMENTS,
  HERO_QUESTIONS,
  LOOKS_RIGHT,
  PROTOCOL,
  REPO_URL,
  type Experiment,
} from '@/lib/eval-lab-data'

/**
 * The page's own figures: the hero question deck, the scorecard and the three
 * "looks right" cards. Tokens only, scoped under `.evallab`.
 *
 * Each experiment is its own numbered card. Colours come from site tokens only.
 */
const EXTRA_CSS = `
/* hero question deck: one card per experiment, cycling */
.evallab .qstack { display: grid; padding-bottom: 20px; }
.evallab .qcard {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 13px;
  padding: 18px 18px 16px;
  /* Panel tokens are translucent; layer over the page colour so stacked cards don't show through. */
  background: linear-gradient(var(--panel), var(--panel)), var(--bg);
  border: 0.5px solid rgba(var(--ink-rgb), 0.13);
  box-shadow: 0 6px 18px -10px rgba(var(--ink-rgb), 0.22);
  transform-origin: 50% 100%;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s;
}
.evallab .qcard.d0 { z-index: 4; border-color: rgba(var(--accent-rgb), 0.3); }
.evallab .qcard.d1 { z-index: 3; transform: translateY(10px) scale(0.96); opacity: 0.7; }
.evallab .qcard.d2 { z-index: 2; transform: translateY(20px) scale(0.92); opacity: 0.4; }
.evallab .qcard.d3 { z-index: 1; transform: translateY(20px) scale(0.92); opacity: 0; }
.evallab .qcard.gone { z-index: 5; transform: translateY(-16px) scale(1.02); opacity: 0; }
.evallab .qcard:not(.d0):not(.gone) > * { visibility: hidden; }
.evallab .qcard:not(.d0) { pointer-events: none; }
.evallab .qtag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  line-height: 1.3;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}
.evallab .qtext {
  font-size: 1.3rem;
  font-weight: 300;
  line-height: 1.32;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-wrap: pretty;
}
.evallab .qvs { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.evallab .qvs span {
  font-size: 12px;
  line-height: 1.3;
  padding: 5px 9px;
  border-radius: 7px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  color: rgba(var(--ink-rgb), 0.75);
}
.evallab .qvs span:last-child { border-color: rgba(var(--accent-rgb), 0.3); background: rgba(var(--accent-rgb), 0.06); }
.evallab .qvs i {
  font-style: normal;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.4);
}
.evallab .qgo {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
  font-size: 13px;
  color: var(--accent);
}
.evallab .qgo:hover { text-decoration: underline; text-underline-offset: 3px; }
.evallab .qrotation {
  display: block;
  margin: 0 0 10px auto;
  padding: 4px 0;
  border: 0;
  background: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 12px;
}
.evallab .qrotation:hover { text-decoration: underline; text-underline-offset: 3px; }
.evallab .qgo:focus-visible, .evallab .qdot:focus-visible, .evallab .qrotation:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}
.evallab .qnav { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
.evallab .qdot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0 4px;
  background: none;
  border: 0;
  cursor: pointer;
  text-align: left;
}
.evallab .qdot .num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(var(--ink-rgb), 0.38);
  transition: color 0.25s;
}
.evallab .qdot.on .num, .evallab .qdot:hover .num { color: var(--accent); }
.evallab .qdot .bar { position: relative; height: 2px; border-radius: 2px; overflow: hidden; background: rgba(var(--ink-rgb), 0.12); }
.evallab .qdot .bar i {
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform-origin: 0 50%;
  animation: qfill 5.5s linear forwards paused;
}
.evallab .qdeck[data-rotation-enabled="true"]:not(:focus-within) .qdot .bar i {
  animation-play-state: running;
}
@media (hover: hover) {
  .evallab .qdeck[data-rotation-enabled="true"]:hover .qdot .bar i {
    animation-play-state: paused;
  }
}
@media (prefers-reduced-motion: reduce) {
  .evallab .qdot .bar i { animation: none; }
  .evallab .qcard { transition: none; }
  .evallab .qrotation { display: none; }
}
@keyframes qfill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.evallab .xp { scroll-margin-top: 96px; }

/* scorecard: one numbered card per experiment */
.evallab .score { display: grid; gap: 14px; }
.evallab .xp {
  border-radius: 16px;
  background: var(--panel-3);
  border: 0.5px solid rgba(var(--ink-rgb), 0.13);
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.evallab .xp:hover { border-color: rgba(var(--ink-rgb), 0.22); }
.evallab .xp.top { border-color: rgba(var(--accent-rgb), 0.34); }
.evallab .xp.open {
  background: var(--panel);
  box-shadow: 0 1px 2px rgba(var(--ink-rgb), 0.04), 0 14px 32px -16px rgba(var(--ink-rgb), 0.16);
}
.evallab .xp-head {
  width: 100%;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 20px;
  gap: 16px;
  align-items: start;
  padding: 22px 22px 22px 20px;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
  border-radius: 16px;
}
.evallab .xp-head:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.evallab .xp-num {
  font-size: 1.875rem;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--ink-rgb), 0.26);
  transition: color 0.25s;
}
.evallab .xp.open .xp-num,
.evallab .xp.top .xp-num { color: var(--accent); }
.evallab .xp-tag {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.5);
  margin-bottom: 9px;
}
.evallab .xp-tag .star { color: var(--accent); }
.evallab .xp-q {
  display: block;
  font-size: 1.125rem;
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin-bottom: 6px;
  text-wrap: pretty;
}
.evallab .xp.top .xp-q { font-size: clamp(1.25rem, 1.6vw, 1.5rem); letter-spacing: -0.02em; }
.evallab .xp-r {
  display: block;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.64);
  text-wrap: pretty;
}
.evallab .chev {
  margin-top: 5px;
  color: rgba(var(--ink-rgb), 0.4);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.evallab .xp.open .chev { transform: rotate(90deg); color: var(--accent); }
@media (max-width: 520px) {
  .evallab .xp-head { grid-template-columns: 30px minmax(0, 1fr) 16px; gap: 12px; padding: 18px 16px 18px 14px; }
  .evallab .xp-num { font-size: 1.375rem; }
}

.evallab .xp-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.evallab .xp.open .xp-body { grid-template-rows: 1fr; }
.evallab .xp-inner { overflow: hidden; min-height: 0; }
/*
 * Expanded row: context beside the chart, then findings beside the call.
 * Single column under 900px, in reading order: why, results, findings, call.
 */
.evallab .xp-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'ctx bars'
    'ctx take'
    'finds take';
  grid-template-rows: auto auto 1fr;
  gap: 24px 40px;
  padding: 4px 22px 26px;
}
.evallab .xp-grid.has-vers {
  grid-template-areas:
    'ctx bars'
    'vers vers'
    'finds take';
  grid-template-rows: auto auto auto;
}
.evallab .vers { grid-area: vers; }
.evallab .ctx { grid-area: ctx; }
.evallab .bars { grid-area: bars; }
.evallab .finds { grid-area: finds; }
.evallab .take { grid-area: take; }
@media (max-width: 900px) {
  .evallab .xp-grid,
  .evallab .xp-grid.has-vers { grid-template-columns: 1fr; grid-template-areas: none; grid-template-rows: none; gap: 22px; }
  .evallab .xp-grid { padding: 2px 16px 20px; }
  .evallab .vers,
  .evallab .ctx,
  .evallab .bars,
  .evallab .finds,
  .evallab .take { grid-area: auto; }
}
.evallab .xp-grid .lab { display: block; margin-bottom: 9px; }
.evallab .ctx .blk + .blk { margin-top: 18px; }
.evallab .ctx p,
.evallab .finds li {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.74);
  text-wrap: pretty;
}
/*
 * Version cards. Each tone maps to an existing site token; the tint and
 * border are mixed from it, so no new colour values enter the page.
 */
.evallab .vgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (max-width: 620px) {
  .evallab .vgrid { grid-template-columns: 1fr; }
}
.evallab .vc { --vc: var(--ink); }
.evallab .vc.t-accent { --vc: var(--accent); }
.evallab .vc.t-blue { --vc: var(--sk-viz); }
.evallab .vc.t-purple { --vc: var(--sk-platform); }
.evallab .vc.t-orange { --vc: var(--sk-data); }
.evallab .vc {
  border-radius: 12px;
  padding: 14px 16px 15px;
  background: var(--panel-2);
  background: color-mix(in srgb, var(--vc) 7%, var(--panel-2));
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  border-color: color-mix(in srgb, var(--vc) 32%, transparent);
  border-top: 3px solid var(--vc);
}
.evallab .vc-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.evallab .vc-tag {
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1;
  color: var(--accent-ink);
  background: var(--vc);
}
.evallab .vc-name { flex: 1; min-width: 0; font-size: 0.9688rem; line-height: 1.3; font-weight: 500; color: var(--ink); }
.evallab .vc-score {
  flex: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1;
  color: var(--vc);
}
.evallab .vc p { font-size: 0.875rem; line-height: 1.55; color: var(--ink); margin-bottom: 9px; text-wrap: pretty; }
.evallab .vc ul { list-style: none; margin: 0; padding: 0; }
.evallab .vc li {
  position: relative;
  padding-left: 14px;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgba(var(--ink-rgb), 0.68);
  text-wrap: pretty;
}
.evallab .vc li + li { margin-top: 5px; }
.evallab .vc li::before {
  content: '';
  position: absolute;
  left: 1px;
  top: 0.6em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--vc);
}
.evallab .vers .after {
  margin-top: 14px;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.74);
  text-wrap: pretty;
}
.evallab .bars {
  align-self: start;
  border-radius: 12px;
  padding: 16px 16px 8px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.evallab .bars .lab { margin-bottom: 14px; }
.evallab .finds ul { list-style: none; margin: 0; padding: 0; }
.evallab .finds li { position: relative; padding-left: 18px; }
.evallab .finds li + li { margin-top: 10px; }
.evallab .finds li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0.62em;
  width: 6px;
  height: 6px;
  border-radius: 1.5px;
  background: var(--accent);
}
.evallab .brow {
  display: grid;
  grid-template-columns: 136px minmax(0, 1fr) 52px;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}
@media (max-width: 520px) {
  .evallab .brow { grid-template-columns: 104px minmax(0, 1fr) 46px; gap: 9px; }
}
.evallab .brow .bl { font-size: 12.5px; line-height: 1.3; color: rgba(var(--ink-rgb), 0.66); }
.evallab .brow.best .bl { color: var(--ink); }
.evallab .track { height: 10px; border-radius: 3px; background: rgba(var(--ink-rgb), 0.07); overflow: hidden; }
.evallab .fill {
  height: 100%;
  border-radius: 3px;
  background: rgba(var(--ink-rgb), 0.28);
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.evallab .brow.best .fill { background: var(--accent); }
.evallab .xp.open .fill { transform: scaleX(1); }
/* Stagger set per bar as --d, so it works for any number of rows. */
.evallab .xp.open .fill { transition-delay: var(--d, 0s); }
/* Group heading for bars that share a configuration (one bar per provider). */
.evallab .bgroup {
  display: block;
  margin: 12px 0 6px;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 500;
  color: var(--ink);
}
.evallab .bars .lab + div .bgroup { margin-top: 0; }
.evallab .brow .rd {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1;
  text-align: right;
  color: rgba(var(--ink-rgb), 0.78);
}
.evallab .take {
  align-self: start;
  border-radius: 12px;
  padding: 16px 17px 17px;
  background: rgba(var(--accent-rgb), 0.05);
  border: 0.5px solid rgba(var(--accent-rgb), 0.24);
}
.evallab .take .lab { color: var(--accent); }
.evallab .take p { font-size: 0.9688rem; line-height: 1.55; color: var(--ink); margin-bottom: 14px; text-wrap: pretty; }
.evallab .take p.cv { font-size: 0.8438rem; line-height: 1.6; color: rgba(var(--ink-rgb), 0.58); margin-bottom: 16px; }
.evallab .take p.cv b { font-weight: 500; color: rgba(var(--ink-rgb), 0.74); }
.evallab .cs-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: var(--accent);
  border-bottom: 0.5px solid rgba(var(--accent-rgb), 0.4);
  padding-bottom: 2px;
  transition: border-color 0.18s;
}
.evallab .cs-link:hover { border-color: var(--accent); }
.evallab .cs-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }
.evallab .note {
  margin-top: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 1.6;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.45);
}

/* looks right, isn't */
.evallab .lr { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 8px; }
@media (max-width: 900px) {
  .evallab .lr { grid-template-columns: 1fr; max-width: 520px; }
}
.evallab .lrc {
  border-radius: 13px;
  padding: 16px 17px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.evallab .lr.go .lrc { opacity: 1; transform: none; }
.evallab .lr.go .lrc:nth-child(2) { transition-delay: 0.14s; }
.evallab .lr.go .lrc:nth-child(3) { transition-delay: 0.28s; }
.evallab .lrc .lab { display: block; margin-bottom: 12px; }
.evallab .lrc .ask { font-size: 0.875rem; line-height: 1.5; color: rgba(var(--ink-rgb), 0.6); }
.evallab .lrc code {
  display: block;
  margin: 10px 0 12px;
  padding: 9px 11px;
  border-radius: 7px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--ink);
  background: var(--panel-solid);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  word-break: break-word;
}
.evallab .lrc .out {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--ink);
}
.evallab .lrc .out i {
  flex: none;
  margin-top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink);
}

/* links to scored evidence */
.evallab .evidence-links { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 6px; }
.evallab .evidence-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.06);
  border: 0.5px solid rgba(var(--accent-rgb), 0.28);
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}
.evallab .evidence-link:hover { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.evallab .evidence-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
`

function ScoreRow({
  xp,
  open,
  index,
  top,
  onToggle,
}: {
  xp: Experiment
  open: boolean
  index: number
  top: boolean
  onToggle: () => void
}) {
  const bodyId = `xp-${xp.id}`
  return (
    <div id={`card-${xp.id}`} className={`xp${open ? ' open' : ''}${top ? ' top' : ''}`}>
      <button type="button" className="xp-head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
        <span className="xp-num" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>
          <span className="xp-tag">
            {xp.topic}
            {top && <span className="star"> · Strongest result</span>}
          </span>
          <span className="xp-q">{xp.question}</span>
          <span className="xp-r">{xp.result}</span>
        </span>
        <span className="chev">
          <Glyph d={ARROW_PATH} size={14} width={2} />
        </span>
      </button>
      <div className="xp-body" id={bodyId} role="region" aria-label={xp.question} aria-hidden={!open}>
        <div className="xp-inner">
          <div className={`xp-grid${xp.versions ? ' has-vers' : ''}`}>
            <div className="ctx">
              <div className="blk">
                <span className="lab">Why I ran it</span>
                <p>{xp.why}</p>
              </div>
              <div className="blk">
                <span className="lab">How I tested it</span>
                <p>{xp.setup}</p>
              </div>
            </div>
            {xp.versions && (
              <div className="vers">
                <span className="lab">The four versions</span>
                <div className="vgrid">
                  {xp.versions.map((v) => (
                    <div key={v.tag} className={`vc t-${v.tone}`}>
                      <div className="vc-head">
                        <span className="vc-tag" aria-hidden="true">
                          {v.tag}
                        </span>
                        <span className="vc-name">{v.name}</span>
                        <span className="vc-score">{v.score}</span>
                      </div>
                      <p>{v.summary}</p>
                      <ul>
                        {v.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {xp.setupAfter && <p className="after">{xp.setupAfter}</p>}
              </div>
            )}
            <div className="bars">
              <span className="lab">{xp.measure}</span>
              {xp.bars.map((b, i) => (
                <div key={`${b.group ?? ''}-${b.label}`}>
                  {b.group && b.group !== xp.bars[i - 1]?.group && <span className="bgroup">{b.group}</span>}
                  <div className={`brow${b.best ? ' best' : ''}`}>
                    <span className="bl">{b.label}</span>
                    <span className="track">
                      <span
                        className="fill"
                        style={
                          {
                            display: 'block',
                            width: `${Math.max(2, Math.round((b.value / b.max) * 100))}%`,
                            '--d': `${i * 0.05}s`,
                          } as CSSProperties
                        }
                      />
                    </span>
                    <span className="rd">{b.readout}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="finds">
              <span className="lab">What I found</span>
              <ul>
                {xp.findings.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="take">
              <span className="lab">The call</span>
              <p>{xp.call}</p>
              <p className="cv">
                <b>Limits.</b> {xp.caveat}
              </p>
              {/* Collapsed rows stay out of the tab order. */}
              <a
                className="cs-link"
                href={xp.caseStudy}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? undefined : -1}
              >
                Read the full case study
                <Glyph d={ARROW_PATH} size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Hero figure: the question each experiment asked, cycling as a card stack.
 * The fill bar is the clock. Hover, focus and visibility pause it independently
 * of the manual control. Reduced motion disables the clock in CSS.
 */
function QuestionDeck({ onOpen }: { onOpen: (id: string) => void }) {
  const n = HERO_QUESTIONS.length
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [seen, setSeen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let inView = false
    const update = () => setSeen(inView && !document.hidden)
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      update()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  const byId = (id: string) => EXPERIMENTS.findIndex((e) => e.id === id)

  return (
    <div ref={ref} className="qdeck" data-rotation-enabled={seen && !paused}>
      <Figure name="Questions the Lab tested" category={`${pad(i + 1)} / ${pad(n)}`}>
        <button type="button" className="qrotation" onClick={() => setPaused((value) => !value)}>
          {paused ? 'Resume rotation' : 'Pause rotation'}
        </button>
        <div className="qstack">
          {HERO_QUESTIONS.map((h, k) => {
            const d = (k - i + n) % n
            const xi = byId(h.id)
            return (
              <div
                key={h.id}
                className={`qcard d${Math.min(d, 3)}${d === n - 1 && n > 3 ? ' gone' : ''}`}
                aria-hidden={d !== 0}
              >
                <span className="qtag">
                  Experiment {pad(xi + 1)} · {EXPERIMENTS[xi]?.topic}
                </span>
                <p className="qtext">{h.q}</p>
                <div className="qvs">
                  <span>{h.vs[0]}</span>
                  <i>vs</i>
                  <span>{h.vs[1]}</span>
                </div>
                <button type="button" className="qgo" tabIndex={d === 0 ? undefined : -1} onClick={() => onOpen(h.id)}>
                  See what happened
                  <Glyph d={ARROW_PATH} size={11} />
                </button>
              </div>
            )
          })}
        </div>
        <div className="qnav" role="group" aria-label="Choose a question">
          {HERO_QUESTIONS.map((h, k) => (
            <button
              key={h.id}
              type="button"
              className={`qdot${k === i ? ' on' : ''}`}
              aria-label={`Question ${k + 1}: ${h.q}`}
              aria-current={k === i ? 'true' : undefined}
              onClick={() => setI(k)}
            >
              <span className="num" aria-hidden="true">
                {pad(k + 1)}
              </span>
              <span className="bar" aria-hidden="true">
                {k === i && (
                  <i onAnimationEnd={() => setI((current) => (current === k ? (k + 1) % n : current))} />
                )}
              </span>
            </button>
          ))}
        </div>
      </Figure>
    </div>
  )
}

export default function EvalLabPage() {
  const { ref: scoreRef, inView: scoreIn } = useInView({ threshold: 0.05 })
  const { ref: patRef, inView: patIn } = useInView({ threshold: 0.1 })
  const { ref: honRef, inView: honIn } = useInView({ threshold: 0.1 })
  const { ref: askRef, inView: askIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })
  const { ref: lrRef, fired: lrGo } = useOnceInView<HTMLDivElement>(0.3)

  // The strongest result starts open so the first screen shows a chart.
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set([EXPERIMENTS[0].id]))
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  // From the hero deck: open that experiment's card and bring it into view.
  const openXp = (id: string) => {
    setOpen((prev) => new Set(prev).add(id))
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() =>
      document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' }),
    )
  }

  return (
    <CaseStudyShell subtitle="AI Evaluation Lab · Six controlled experiments" pageClass="evallab" extraCss={EXTRA_CSS}>
      {/* ── 1 Hero ──────────────────────────────────────────────────── */}
      <header>
        <Eyebrow>Evaluation Research</Eyebrow>
        <div className="hero">
          <div>
            <h1
              className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]"
              style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}
            >
              Six controlled experiments on when AI improves a business workflow.
            </h1>
            <p className="lede">
              Adding AI to a workflow is easy to justify and harder to measure. Each experiment here runs the same
              cases with and without one change, such as more context, a larger model or an extra AI check, so any
              difference comes from that change. One example: a finance SQL assistant answered the same 36 questions
              with only the database layout, then again with written definitions of the business terms.
            </p>
          </div>
          <QuestionDeck onOpen={openXp} />
        </div>
      </header>

      <Divider />

      {/* ── 2 Scorecard ─────────────────────────────────────────────── */}
      <section ref={scoreRef} className={reveal(scoreIn)}>
        <Heading2 className="mb-[26px] max-w-[18ch]">Results</Heading2>
        <div className="score">
          {EXPERIMENTS.map((xp, i) => (
            <ScoreRow key={xp.id} xp={xp} index={i} top={i === 0} open={open.has(xp.id)} onToggle={() => toggle(xp.id)} />
          ))}
        </div>
        <p className="note">Decision tests on small, controlled workloads, not benchmarks</p>
      </section>

      <Divider />

      {/* ── 3 The pattern ───────────────────────────────────────────── */}
      <section ref={patRef} className={reveal(patIn)}>
        <Heading2 className="mb-[18px] max-w-[20ch]">Failures that passed format checks</Heading2>
        <p className="body mb-[26px]">
          A check that only asked whether the output was well formed, or whether it ran, would have accepted all three.
        </p>
        <div ref={lrRef} className={`lr${lrGo ? ' go' : ''}`}>
          {LOOKS_RIGHT.map((c) => (
            <div key={c.kind} className="lrc">
              <span className="lab">{c.kind}</span>
              <p className="ask">{c.asked}</p>
              <code>{c.output}</code>
              <p className="out">
                <i aria-hidden="true" />
                {c.outcome}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 4 How it stayed honest ──────────────────────────────────── */}
      <section ref={honRef} className={reveal(honIn)}>
        <Heading2 className="mb-[18px] max-w-[18ch]">Method</Heading2>
        <p className="body">
          Every live model run followed the same five steps, so no result could be rerun until it looked better.
        </p>
        <PipelineList label="Every live run" rows={PROTOCOL} />
        <p className="coda">
          Two runs stopped early when a response hit its length limit. Both stayed in the record and were re-planned
          as new runs, not retried.
        </p>
      </section>

      <Divider />

      {/* ── 5 Go deeper ─────────────────────────────────────────────── */}
      <section ref={askRef} className={reveal(askIn)}>
        <Heading2 className="mb-[18px] max-w-[18ch]">Experiment 006 results</Heading2>
        <div className="evidence-links">
          {EVIDENCE_LINKS.map(({ label, href }) => (
            <a key={href} className="evidence-link" href={href}>
              {label}
              <Glyph d={ARROW_PATH} size={11} />
            </a>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 6 Close ─────────────────────────────────────────────────── */}
      <section ref={closeRef} className={reveal(closeIn)}>
        <CloseStrip
          title="Read the full case studies"
          body="Designs, data, scoring code and the audit trail for all six experiments are in the repository."
          cta="View on GitHub"
          href={REPO_URL}
          external
        />
      </section>
    </CaseStudyShell>
  )
}
