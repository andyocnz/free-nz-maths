// Configuration file for Mathx.nz

export const config = {
  // Google Forms URL for reporting issues
  googleFormReportURL: 'https://docs.google.com/forms/d/e/1FAIpQLSfwqDJy0V4ePonb0VZJ3Ph6t5TsKYrO9tXxjKtsgr3FnSEiBQ/viewform?usp=pp_url&entry.193960772={timestamp}&entry.661014612={question}&entry.939831606={answer}&entry.2087041182={year}&entry.204114429={topic}',

  // Group test URLs
  REGISTRY_URL: "https://script.google.com/macros/s/AKfycbxCeRbxwZLESKhge29qEY-r87RjHYnEt8-EejPwV81FNkkxGpkskLpzegoq8vFyO5PC/exec",
  SCORES_URL:   "https://script.google.com/macros/s/AKfycbxfmlIXtK13RbXl9hZyROdO-02jBFzNftjEPj1OcVjk57vDALeiUjTARjkSe88h6SIpSA/exec",

  // App settings
  defaultYear: 7,
  questionsPerTopic: 20,
  assessmentQuestions: 60,

  // Feature flags
  enableCertificates: true,
  enablePracticeHistory: true,

  // Styling
  brandColors: {
    primary: '#0077B6',
    secondary: '#00BFFF',
    success: '#4CAF50'
  }
}

// Helper function to generate report URL
export function generateReportURL({ question, answer, year, topic }) {
  const timestamp = new Date().toISOString()

  return config.googleFormReportURL
    .replace('{timestamp}', encodeURIComponent(timestamp))
    .replace('{question}', encodeURIComponent(question || 'N/A'))
    .replace('{answer}', encodeURIComponent(answer || 'N/A'))
    .replace('{year}', encodeURIComponent(year || 'N/A'))
    .replace('{topic}', encodeURIComponent(topic || 'N/A'))
}
