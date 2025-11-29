import React from 'react'
import nceaExams from './pastPapersData.js'

export default function PastPapersIndex({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
        >
          ← Back to main
        </button>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
          NCEA Past Papers (Prototype)
        </h1>
        <p className="text-slate-600 mb-8 text-sm md:text-base max-w-2xl">
          Practice with real NCEA exam questions. Start with Level 1 MCAT 91027 papers.
          This is an early prototype: you can browse papers and open the official PDF
          while we build fully interactive marking.
        </p>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {nceaExams.map(exam => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  {exam.level} · Standard {exam.standard} · {exam.year}
                </div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                  {exam.title}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mb-3">
                  {exam.credits} credits · {exam.total_marks} marks · {exam.duration}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                {exam.exam_url && (
                  <a
                    href={exam.exam_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#0077B6] hover:bg-sky-700 shadow-sm"
                  >
                    Open exam PDF
                  </a>
                )}
                {exam.schedule_url && (
                  <a
                    href={exam.schedule_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-[#0077B6] bg-slate-50 border border-slate-200 hover:bg-slate-100"
                  >
                    Marking schedule
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

