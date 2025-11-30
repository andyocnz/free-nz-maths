import React, { useState } from 'react'
import { legacyLevel1Papers, newSystemLevel1Papers } from './nceaStructuredData.js'

// Summarise papers by standard code: collect title and available years
function buildStandardSummary(papers) {
  const byStandard = {}

  papers.forEach(paper => {
    const standard = String(paper.standard)
    if (!byStandard[standard]) {
      byStandard[standard] = {
        standardNumber: standard,
        title: paper.title,
        years: []
      }
    }
    if (paper.year && !byStandard[standard].years.includes(paper.year)) {
      byStandard[standard].years.push(paper.year)
    }
  })

  return Object.values(byStandard).map(s => ({
    ...s,
    years: s.years.sort((a, b) => b - a), // newest first
    latestYear: s.years[0] || null
  }))
}

// Hard-coded ordering and labels for Level 1 standards we care about
const LEGACY_LEVEL1_ORDER = ['91027', '91028', '91031']
const NEW_SYSTEM_LEVEL1_ORDER = ['91946', '91947']

export default function PastPapersIndex({ onBack, onStartStandardTrial, onStartFullTrial }) {
  // Default to the revised 2024+ standards
  const [activeTab, setActiveTab] = useState('new') // 'legacy' | 'new'

  const legacySummaryAll = buildStandardSummary(legacyLevel1Papers || [])
  const newSummaryAll = buildStandardSummary(newSystemLevel1Papers || [])

  const legacyStandards = LEGACY_LEVEL1_ORDER.map(code =>
    legacySummaryAll.find(s => s.standardNumber === code)
  ).filter(Boolean)

  const newSystemStandards = NEW_SYSTEM_LEVEL1_ORDER.map(code =>
    newSummaryAll.find(s => s.standardNumber === code)
  ).filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-300 text-slate-700 text-sm font-semibold shadow-sm transition"
        >
          <span className="mr-2">←</span> Back to main page
        </button>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            NCEA Level 1 – Trial Exams
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Choose between the legacy (pre‑2024) Level 1 standards and the new 2024+ standards,
            then start a trial exam for the standard you want to practise.
          </p>
        </div>

        {/* Legacy vs New system selector as a simple timeline */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('legacy')}
            className={`flex-1 rounded-2xl border px-4 py-3 text-left transition ${
              activeTab === 'legacy'
                ? 'border-[#0077B6] bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-[#0077B6]/70'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Legacy system
            </div>
            <div className="text-sm md:text-base font-bold text-slate-900 mt-1">
              Pre‑2024 Level 1 externals
            </div>
            <div className="text-[11px] md:text-xs text-slate-600 mt-1">
              91027 (Algebra), 91028 (Tables, equations, graphs), 91031 (Statistics &amp;
              probability)
            </div>
          </button>

          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="w-10 h-0.5 bg-slate-300" />
            <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
              replaced by (from 2024)
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 rounded-2xl border px-4 py-3 text-left transition ${
              activeTab === 'new'
                ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-emerald-600/70'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Revised standards (from 2024)
              </div>
              <div className="text-sm md:text-base font-bold text-slate-900 mt-1">
                2024+ Level 1 externals
              </div>
              <div className="text-[11px] md:text-xs text-slate-600 mt-1">
                91946 (Algebra), 91947 (Graphs, geometry, trig &amp; reasoning)
              </div>
            </button>

          {/* Connector to future levels */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="w-10 h-0.5 bg-slate-200" />
            <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
              upcoming change (from 2028+)
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-left bg-slate-50/70">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Year 11 moves to a Foundational Skills Award replacing NCEA Level 1
            </div>
            <div className="text-sm md:text-base font-bold text-slate-500 mt-1">
              (literacy &amp; numeracy)
            </div>
            <div className="text-[11px] md:text-xs text-slate-400 mt-1">
              Coming later on Mathx.nz when available.
            </div>
          </div>
        </div>

        {/* Legacy tab */}
        {activeTab === 'legacy' && (
          <>
            <div className="mb-4 text-xs md:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
              Old system (pre‑2024) had three external exams:
              <br />
              <span className="font-mono font-semibold">91027</span> – Algebra (MCAT)
              <br />
              <span className="font-mono font-semibold">91028</span> – Tables, equations, graphs
              <br />
              <span className="font-mono font-semibold">91031</span> – Statistics &amp; probability
            </div>
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    Legacy Level 1 external standards
                  </h2>
                  <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                    Click a title or the button to start a trial for that standard. We use the most
                    recent paper available for each standard.
                  </p>
                </div>
              </div>
              <table className="min-w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-slate-800">Standard</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Title</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Years available</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Practice</th>
                  </tr>
                </thead>
                <tbody>
                  {legacyStandards.map(std => (
                    <tr key={std.standardNumber} className="border-t border-slate-100">
                      <td className="px-4 py-2 whitespace-nowrap font-mono text-slate-900">
                        {std.standardNumber}
                      </td>
                      <td className="px-4 py-2 text-slate-800">
                        {onStartStandardTrial ? (
                          <button
                            type="button"
                            onClick={() =>
                              onStartStandardTrial({
                                yearId: std.latestYear,
                                standardNumber: std.standardNumber
                              })
                            }
                            className="text-left text-[#0077B6] hover:underline font-semibold"
                          >
                            {std.title}
                          </button>
                        ) : (
                          std.title
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-slate-800">
                        {std.years && std.years.length ? std.years.join(', ') : '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {onStartStandardTrial ? (
                          <button
                            type="button"
                            onClick={() =>
                              onStartStandardTrial({
                                yearId: std.latestYear,
                                standardNumber: std.standardNumber
                              })
                            }
                            className="px-3 py-1 rounded-full bg-[#0077B6] hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition"
                          >
                            Start trial
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Coming soon</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* New system tab */}
        {activeTab === 'new' && (
          <>
            <div className="mb-4 text-xs md:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
              Revised NCEA Level 1 standards (from 2024) have two external exams:
              <br />
              <span className="font-mono font-semibold">91946</span> – Replaces 91027 (pure algebra)
              <br />
              <span className="font-mono font-semibold">91947</span> – Replaces 91028 and parts of
              91031 (graphs, geometry, trig, some statistics reasoning)
            </div>
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    New Level 1 external standards (2024+)
                  </h2>
                  <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                    Click a title or the button to start a trial for that standard. We use the most
                    recent paper available for each standard.
                  </p>
                </div>
              </div>
              <table className="min-w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-slate-800">Standard</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Title</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Years available</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Practice</th>
                  </tr>
                </thead>
                <tbody>
                  {newSystemStandards.map(std => (
                    <tr key={std.standardNumber} className="border-t border-slate-100">
                      <td className="px-4 py-2 whitespace-nowrap font-mono text-slate-900">
                        {std.standardNumber}
                      </td>
                      <td className="px-4 py-2 text-slate-800">
                        {onStartStandardTrial ? (
                          <button
                            type="button"
                            onClick={() =>
                              onStartStandardTrial({
                                yearId: std.latestYear,
                                standardNumber: std.standardNumber
                              })
                            }
                            className="text-left text-[#0077B6] hover:underline font-semibold"
                          >
                            {std.title}
                          </button>
                        ) : (
                          std.title
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-slate-800">
                        {std.years && std.years.length ? std.years.join(', ') : '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {onStartStandardTrial ? (
                          <button
                            type="button"
                            onClick={() =>
                              onStartStandardTrial({
                                yearId: std.latestYear,
                                standardNumber: std.standardNumber
                              })
                            }
                            className="px-3 py-1 rounded-full bg-[#0077B6] hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition"
                          >
                            Start trial
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Coming soon</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
