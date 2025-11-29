export default function HintModal({ isOpen, onClose, title, message, htmlContent }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all scale-100">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
        <div className="max-h-[60vh] overflow-y-auto mb-6 pr-1">
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap">{message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-[#0077B6] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#005a9e] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
