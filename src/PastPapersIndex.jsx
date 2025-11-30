import React, { useState } from 'react'
import { nceaLevel1YearOverviews } from './pastPapersData.js'

export default function PastPapersIndex({ onBack, onStartStandardTrial, onStartFullTrial }) {
  const [selectedYearId, setSelectedYearId] = useState(
    nceaLevel1YearOverviews[0]?.yearId || '2024'
  )

  const currentYear = nceaLevel1YearOverviews.find(y => y.yearId === selectedYearId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-300 text-slate-700 text-sm font-semibold shadow-sm transition"
        >
          <span className="mr-2">↩</span> Back to main page
        </button>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            NCEA Level 1 – Trial Exams
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Choose a year, see the Level 1 standards and credits, then either start a full trial exam
            or practise one standard at a time.
          </p>
        </div>

        {/* Year selector */}
        <div className="mb-6 flex flex-wrap gap-3">
          {nceaLevel1YearOverviews.map(year => (
            <button
              key={year.yearId}
              type="button"
              onClick={() => setSelectedYearId(year.yearId)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                selectedYearId === year.yearId
                  ? 'bg-[#0077B6] text-white border-[#0077B6] shadow'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-[#0077B6]'
              }`}
            >
              {year.label}
            </button>
          ))}
        </div>

        {currentYear && (
          <>
            {currentYear.note && (
              <div className="mb-4 text-xs md:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                {currentYear.note}
              </div>
            )}

            {/* Full trial button */}
            {onStartFullTrial && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => onStartFullTrial(currentYear.yearId)}
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm md:text-base shadow-md transition"
                >
                  Start full trial exam
                </button>
              </div>
            )}

            {/* Standards table */}
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900">
                    NCEA Level 1 – {currentYear.label}
                  </h2>
                  <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                    Standards breakdown: click a title or the button to start a trial for that
                    standard.
                  </p>
                </div>
              </div>
              <table className="min-w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-slate-800">Standard</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Title</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Credits</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Type</th>
                    <th className="px-4 py-2 font-semibold text-slate-800">Practice</th>
                  </tr>
                </thead>
                <tbody>
                  {currentYear.standards.map(std => (
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
                                yearId: currentYear.yearId,
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
                        {std.credits ?? '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-slate-800">
                        {std.assessmentType || '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {onStartStandardTrial ? (
                          <button
                            type="button"
                            onClick={() =>
                              onStartStandardTrial({
                                yearId: currentYear.yearId,
                                standardNumber: std.standardNumber
                              })
                            }
                            className="px-3 py-1 rounded-full bg-[#0077B6] hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition"
                          >
                            Start trial for this standard
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
