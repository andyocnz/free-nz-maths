export default function HintModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all scale-100">
        <h3 className="text-2xl font-bold mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-8 whitespace-pre-wrap">{message}</p>
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
