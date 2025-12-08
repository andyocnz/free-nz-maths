import { useState, useEffect } from 'react'

export default function GamesHub({ onClose }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingGame, setPlayingGame] = useState(null)

  useEffect(() => {
    // Use fallback list directly - it's more reliable than trying to fetch directory listing
    const fallbackGames = [
      {
        filename: 'burningrope.html',
        path: '/game/burningrope.html',
        name: 'Burning Rope',
        emoji: '🔥',
        description: 'Logic puzzle: Measure exactly 45 minutes using two 60-minute burning ropes'
      },
      {
        filename: 'bridgecrossing.html',
        path: '/game/bridgecrossing.html',
        name: 'Bridge Crossing',
        emoji: '🏮',
        description: 'Optimization puzzle: Get 4 people across a bridge in 17 minutes with a lantern'
      },
      {
        filename: 'hanoitower.html',
        path: '/game/hanoitower.html',
        name: 'Tower Of Hanoi',
        emoji: '🏔️',
        description: 'Classic puzzle: Move all disks from one peg to another following the rules'
      }
    ]

    // Try to fetch directory listing, but always have a fallback
    const loadGames = async () => {
      try {
        const response = await fetch('/game/')
        if (!response.ok) throw new Error('Directory listing failed')

        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const links = Array.from(doc.querySelectorAll('a'))
          .map(a => a.href || a.textContent)
          .filter(href => {
            const filename = href.split('/').pop()
            return filename && filename.endsWith('.html') &&
                   filename !== 'index.html' &&
                   filename !== 'README.md' &&
                   !filename.startsWith('?') &&
                   !filename.startsWith('..')
          })
          .map(href => {
            const filename = href.split('/').pop()
            const existing = fallbackGames.find(g => g.filename === filename)
            return existing || {
              filename,
              path: `/game/${filename}`,
              name: filename.replace('.html', '').replace(/([A-Z])/g, ' $1').trim()
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ')
            }
          })

        setGames(links.length > 0 ? links : fallbackGames)
        setLoading(false)
      } catch (error) {
        console.warn('Could not fetch game directory, using fallback list:', error)
        // Always fallback to the hardcoded list
        setGames(fallbackGames)
        setLoading(false)
      }
    }

    // Small delay to ensure component is mounted
    setTimeout(loadGames, 100)
  }, [])

  const openGame = (game) => {
    setPlayingGame(game)
  }

  const closeGame = () => {
    setPlayingGame(null)
  }

  // If a game is being played, show it with header
  if (playingGame) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10000
      }}>
        {/* Header - shows mathx branding */}
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '2px solid #0077B6',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#0077B6',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Σ
            </div>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0077B6'
              }}>
                mathx.nz
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999'
              }}>
                {playingGame.emoji} {playingGame.name}
              </div>
            </div>
          </div>

          <button
            onClick={closeGame}
            style={{
              background: '#0077B6',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0, 119, 182, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#005fa3'
              e.target.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#0077B6'
              e.target.style.transform = 'scale(1)'
            }}
            title="Close game and return"
          >
            ✕
          </button>
        </div>

        {/* Game content in iframe */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <iframe
              src={playingGame.path}
              title={playingGame.name}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '40px',
        position: 'relative'
      }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5em',
            color: '#0077B6',
            margin: '0 0 10px 0',
            fontFamily: 'Poppins, sans-serif'
          }}>
            🧩 Logic Puzzles & Games
          </h1>
          <p style={{
            fontSize: '1.1em',
            color: '#666',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Challenge your mind with interactive games designed to develop problem-solving skills and strategic thinking.
          </p>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No games available</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {games.map((game) => (
              <div
                key={game.filename}
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff'
                  e.currentTarget.style.borderColor = '#0077B6'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 119, 182, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Game Icon/Emoji */}
                <div style={{
                  fontSize: '3em',
                  marginBottom: '12px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {game.emoji || '🎮'}
                </div>

                {/* Game Title */}
                <h3 style={{
                  fontSize: '1.3em',
                  color: '#0077B6',
                  margin: '0 0 10px 0',
                  fontWeight: '600'
                }}>
                  {game.name}
                </h3>

                {/* Game Description */}
                {game.description && (
                  <p style={{
                    fontSize: '0.9em',
                    color: '#666',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5'
                  }}>
                    {game.description}
                  </p>
                )}

                {/* Play Button */}
                <button
                  onClick={() => openGame(game)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: '#0077B6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#005fa3'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#0077B6'}
                >
                  Play Game →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
          color: '#999',
          fontSize: '0.9em'
        }}>
          <p>💡 Click a game to play! Close with the X button to return to learning.</p>
        </div>
      </div>

      {/* Floating Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0077B6',
          border: 'none',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          zIndex: 10001,
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0, 119, 182, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#005fa3'
          e.target.style.transform = 'scale(1.1)'
          e.target.style.boxShadow = '0 6px 16px rgba(0, 119, 182, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#0077B6'
          e.target.style.transform = 'scale(1)'
          e.target.style.boxShadow = '0 4px 12px rgba(0, 119, 182, 0.3)'
        }}
        title="Close and return to learning"
      >
        ✕
      </button>
    </div>
  )
}
