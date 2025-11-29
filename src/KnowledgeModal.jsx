import React from 'react'

export default function KnowledgeModal({ isOpen, onClose, snippet }) {
  if (!isOpen || !snippet) return null

  const { title, summary, key_formulas, example, common_misconceptions } = snippet

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[110]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 p-6 md:p-8 relative">
        {/* Close button top-right */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          ×
        </button>

        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          {title || 'Concept reminder'}
        </h3>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {summary && (
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              {summary}
            </p>
          )}

          {key_formulas && key_formulas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Key formulas</h4>
              <ul className="list-disc list-inside text-gray-700 text-sm md:text-base space-y-1">
                {key_formulas.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {example && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Example</h4>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {example}
              </p>
            </div>
          )}

          {common_misconceptions && common_misconceptions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Common misconceptions</h4>
              <ul className="list-disc list-inside text-gray-700 text-sm md:text-base space-y-1">
                {common_misconceptions.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom close button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-slate-800 text-white font-semibold py-3 rounded-xl hover:bg-slate-900 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

