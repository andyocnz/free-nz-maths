import { getStrandsForYear } from './templateEngine.js'
import curriculumData from './curriculumDataMerged.js'

export default function CurriculumMap({ currentStrand, currentTopic, currentSkill, onSelectSkill, collapsed = false, year = 7 }) {
  const effectiveYear = year || 6
  const strands = getStrandsForYear(curriculumData, effectiveYear)

  return (
    <div style={{
      position: 'fixed',
      left: collapsed ? '-280px' : '0',
      top: '0',
      width: '280px',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      overflowY: 'auto',
      transition: 'left 0.3s ease',
      zIndex: 1000,
      padding: '20px',
      boxShadow: '2px 0 10px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{marginBottom: '30px'}}>
        <h3 style={{fontSize: '0.9em', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px'}}>
          Year {effectiveYear} Mathematics
        </h3>
        <h2 style={{fontSize: '1.3em', margin: '0', fontWeight: '600'}}>
          Curriculum Map
        </h2>
      </div>

      {/* Full Curriculum */}
      {strands.map((strand, strandIdx) => {
        const isCurrentStrand = strand.strand === currentStrand

        return (
          <div key={strandIdx} style={{marginBottom: '25px'}}>
            <div style={{
              fontSize: '0.85em',
              fontWeight: '600',
              color: isCurrentStrand ? '#4CAF50' : '#ccc',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {strand.strand}
            </div>

            {/* Skills */}
            <div style={{marginLeft: '10px'}}>
              {strand.skills.map((skill, skillIdx) => {
                const isCurrentSkill = skill.id === currentSkill

                return (
                  <div
                    key={skillIdx}
                    onClick={() => onSelectSkill && onSelectSkill(skill.id)}
                    style={{
                      fontSize: '0.75em',
                      color: isCurrentSkill ? '#4CAF50' : '#999',
                      marginBottom: '8px',
                      cursor: onSelectSkill ? 'pointer' : 'default',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      backgroundColor: isCurrentSkill ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                      transition: 'all 0.2s',
                      fontWeight: isCurrentSkill ? '500' : '400',
                      borderLeft: isCurrentSkill ? '3px solid #4CAF50' : '3px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      if (onSelectSkill) {
                        e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.1)'
                        e.currentTarget.style.color = '#4CAF50'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isCurrentSkill && onSelectSkill) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#999'
                      }
                    }}
                  >
                    {isCurrentSkill && '→ '}{skill.name}{skill.isNew && <span style={{marginLeft:8, color:'#ffca28', fontSize:'0.7em', fontWeight:700}}>NEW</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CurriculumMapToggle({ collapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed',
        left: collapsed ? '10px' : '290px',
        top: '20px',
        zIndex: 1001,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 15px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'left 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}
      onMouseOver={e => e.target.style.backgroundColor = '#333'}
      onMouseOut={e => e.target.style.backgroundColor = '#1a1a1a'}
    >
      {collapsed ? '☰' : '✕'}
    </button>
  )
}
