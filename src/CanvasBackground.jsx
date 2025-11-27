import { useEffect } from 'react'

// Landing-page animated background: ported from other_background_design.html
export default function CanvasBackground() {
  useEffect(() => {
    const canvas = document.getElementById('canvas-bg')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight

    const config = {
      particleCount: 60,
      symbolCount: 15,
      connectionDistance: 150,
      mouseDistance: 200,
      color: 'rgba(0, 119, 182, 0.5)',
      lineColor: 'rgba(0, 119, 182, 0.15)'
    }

    const symbols = ['π', '√', '≈', '≠', '∑', 'x', '÷', '+', '≥', '≤', '∫', '∞', 'θ', 'α', 'β']

    let particles = []
    let mathSymbols = []
    const mouse = { x: null, y: null }
    let animationId

    class Particle {
      constructor(isSymbol = false) {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 3 + 1
        this.isSymbol = isSymbol

        if (this.isSymbol) {
          this.text = symbols[Math.floor(Math.random() * symbols.length)]
          this.vx *= 1.5
          this.vy *= 1.5
          this.size = Math.random() * 14 + 10
        }
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Wall bounce
        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1

        // Mouse interaction
        if (mouse.x != null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < config.mouseDistance && distance > 0) {
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (config.mouseDistance - distance) / config.mouseDistance
            const directionX = forceDirectionX * force * (this.isSymbol ? 2 : 1)
            const directionY = forceDirectionY * force * (this.isSymbol ? 2 : 1)
            this.vx -= directionX * 0.05
            this.vy -= directionY * 0.05
          }
        }
      }

      draw() {
        if (this.isSymbol) {
          ctx.font = `${this.size}px 'JetBrains Mono', monospace`
          ctx.fillStyle = 'rgba(0, 119, 182, 0.3)'
          ctx.fillText(this.text, this.x, this.y)
        } else {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
          ctx.fillStyle = config.color
          ctx.fill()
        }
      }
    }

    function initCanvas() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      particles = []
      mathSymbols = []

      // Geometric nodes
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle(false))
      }
      // Math symbols
      for (let i = 0; i < config.symbolCount; i++) {
        mathSymbols.push(new Particle(true))
      }
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height)

      // 1. Draw geometric mesh
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.update()
        p.draw()

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < config.connectionDistance) {
            const opacity = 1 - distance / config.connectionDistance
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 119, 182, ${opacity * 0.25})`
            ctx.lineWidth = 1
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      }

      // 2. Symbols
      for (let i = 0; i < mathSymbols.length; i++) {
        mathSymbols[i].update()
        mathSymbols[i].draw()
      }

      animationId = requestAnimationFrame(animateCanvas)
    }

    function handleResize() {
      initCanvas()
    }

    function handleMouseMove(event) {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    function handleMouseLeave() {
      mouse.x = null
      mouse.y = null
    }

    // Start
    initCanvas()
    animateCanvas()

    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return null
}

