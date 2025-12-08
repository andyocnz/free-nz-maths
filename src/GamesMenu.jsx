import { useState, useEffect } from 'react'

export default function GamesMenu({ isCollapsed = false }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState(null)

  // Dynamically load game files from /game folder
  useEffect(() => {
    const loadGames = async () => {
      try {
        // Fetch the game folder contents
        const response = await fetch('/game/')
        const html = await response.text()

        // Parse HTML to find all .html files
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        // Extract links that end with .html (excluding index.html and common directory files)
        const links = Array.from(doc.querySelectorAll('a'))
          .map(a => a.href || a.textContent)
          .filter(href => {
            const filename = href.split('/').pop()
            return filename.endsWith('.html') &&
                   filename !== 'index.html' &&
                   !filename.startsWith('?') &&
                   !filename.startsWith('..') &&
                   filename.length > 0
          })
          .map(href => {
            const filename = href.split('/').pop()
            return {
              filename,
              path: `/game/${filename}`,
              name: filename.replace('.html', '').replace(/([A-Z])/g, ' $1').trim()
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ')
            }
          })

        setGames(links)
        setLoading(false)
      } catch (error) {
        console.error('Error loading games:', error)
        // Fallback: manually list known games
        setGames([
          {
            filename: 'burningrope.html',
            path: '/game/burningrope.html',
            name: 'Burning Rope'
          },
          {
            filename: 'bridgecrossing.html',
            path: '/game/bridgecrossing.html',
            name: 'Bridge Crossing'
          }
        ])
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  const openGame = (gamePath) => {
    // Open game in new tab
    window.open(gamePath, '_blank')
  }

  return (
    <div style={{
      marginTop: '24px',
      paddingTop: '20px',
      paddingBottom: '20px',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{
        fontSize: '0.85em',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '12px',
        fontWeight: '600'
      }}>
        🎮 Games & Puzzles
      </h3>

      {loading ? (
        <div style={{ fontSize: '0.9em', color: '#666', paddingLeft: '8px' }}>
          Loading games...
        </div>
      ) : games.length === 0 ? (
        <div style={{ fontSize: '0.9em', color: '#666', paddingLeft: '8px' }}>
          No games available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {games.map((game) => (
            <button
              key={game.filename}
              onClick={() => openGame(game.path)}
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: '500',
                transition: 'all 0.2s',
                textAlign: 'left',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(76, 201, 240, 0.2)'
                e.target.style.borderColor = 'rgba(76, 201, 240, 0.5)'
                e.target.style.color = '#4cc9f0'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'
                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                e.target.style.color = '#e0e0e0'
              }}
            >
              {game.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
