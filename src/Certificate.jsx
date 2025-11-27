import { useRef } from 'react'

export default function Certificate({ username, year, score, total, topicName = 'Full Assessment' }) {
  const certificateRef = useRef(null)

  const percentage = Math.round((score / total) * 100)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleDownload = async () => {
    // Dynamically import html2canvas and jsPDF
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const element = certificateRef.current
    if (!element) return

    // Generate canvas from the certificate element
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    // Convert to PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)

    // Save with user's name
    const filename = `Certificate_${username.replace(/\s+/g, '_')}_Year${year}.pdf`
    pdf.save(filename)
  }

  return (
    <div className="flex flex-col items-center py-8">
      <button
        onClick={handleDownload}
        className="mb-8 px-10 py-4 bg-[#3C5B6F] text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-[#2c4a5c] transition-colors"
      >
        Download Certificate as PDF
      </button>

      <div
        ref={certificateRef}
        className="relative w-[297mm] h-[210mm] bg-white border-2 border-[#D4AF37] shadow-2xl overflow-hidden"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#222' }}
      >
        {/* Background math symbols */}
        <div
          className="absolute inset-0 flex justify-between items-center px-[8%] pointer-events-none"
          style={{
            fontSize: '140px',
            opacity: 0.05,
            color: '#D4AF37',
            letterSpacing: '180px',
            zIndex: 0
          }}
        >
          π ∑ ∫ ∞ ∂ √ ∝ ∇ λ
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 h-full flex flex-col justify-between">
          <div>
            {/* Title */}
            <h1
              className="text-center m-0"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: '64px' }}
            >
              CERTIFICATE
            </h1>
            <p
              className="text-center mt-2 mb-6"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: '40px', color: '#C5A66B' }}
            >
              of Achievement
            </p>
            <p
              className="text-center mb-5"
              style={{ fontSize: '16px', color: '#555', textTransform: 'uppercase', letterSpacing: '3px' }}
            >
              is proudly presented to
            </p>

            {/* Name */}
            <div
              className="text-center my-4"
              style={{ fontFamily: "'Dancing Script', cursive", fontSize: '72px', color: '#3C5B6F' }}
            >
              {username}
            </div>
            <div className="h-[3px] bg-[#C5A66B] w-[450px] mx-auto my-4"></div>

            {/* Description */}
            <p
              className="text-center max-w-[900px] mx-auto"
              style={{ fontSize: '20px', lineHeight: '1.6' }}
            >
              For successfully achieving a score of{' '}
              <span className="font-bold" style={{ color: '#C5A66B' }}>
                {percentage}%
              </span>{' '}
              ({score}/{total}) in the{' '}
              <span className="font-bold" style={{ color: '#3C5B6F' }}>
                {topicName} - Year {year}
              </span>{' '}
              at Mathx.nz,
              <br />
              demonstrating exemplary competence and unwavering commitment to educational progression.
            </p>

            <p
              className="text-center mt-6"
              style={{ fontSize: '18px', fontWeight: 600 }}
            >
              Awarded on {currentDate}
            </p>
          </div>

          {/* Footer with seal and signature */}
          <div className="flex flex-col items-center mt-8">
            {/* Gold Seal */}
            <div className="w-16 h-16 mb-3">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                <defs>
                  <radialGradient id="goldSealGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{ stopColor: '#FFD700' }} />
                    <stop offset="60%" style={{ stopColor: '#DAA520' }} />
                    <stop offset="100%" style={{ stopColor: '#B8860B' }} />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#goldSealGradient)" stroke="#B8860B" strokeWidth="1"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#FFF" strokeWidth="1" strokeDasharray="2 2"/>
                <path d="M50 15 L60 40 L85 40 L65 55 L75 80 L50 65 L25 80 L35 55 L15 40 L40 40 Z" fill="#FFF" opacity="0.9"/>
                <text x="50" y="58" textAnchor="middle" fontSize="10" fill="#DAA520" fontWeight="bold">HONOR</text>
              </svg>
            </div>

            {/* Signature */}
            <div className="text-center">
              <svg viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto mx-auto mb-1">
                <path
                  d="M 20 40 C 40 20, 60 20, 70 40 C 80 55, 90 50, 100 35 C 110 20, 130 20, 150 40 C 160 50, 170 40, 165 35"
                  stroke="#000000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <text x="15" y="55" fontFamily="'Dancing Script', cursive" fontSize="45" fontWeight="700" fill="#000000">
                  Mathx
                </text>
              </svg>
              <div className="h-px bg-black w-48 mx-auto"></div>
              <p className="text-xs uppercase tracking-widest mt-1 font-semibold text-gray-800">
                Certification Authority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Font preload links for PDF generation */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Dancing+Script:wght@700&family=Cormorant+Garamond:wght@400;600&display=swap"
        rel="stylesheet"
      />
    </div>
  )
}
