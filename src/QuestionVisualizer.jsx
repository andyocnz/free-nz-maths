import { useEffect, useRef } from 'react'
import { elapsed_minutes } from './mathHelpers.js'

export default function QuestionVisualizer({ question, visualData }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !visualData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw based on visualization type
    switch(visualData.type) {
      case 'triangle':
        drawTriangle(ctx, visualData)
        break
      case 'angles_line':
        drawAnglesOnLine(ctx, visualData)
        break
      case 'vertical_angles':
        drawVerticalAngles(ctx, visualData)
        break
      case 'coordinate_grid':
        drawCoordinateGrid(ctx, visualData)
        break
      case 'bar_chart':
        drawBarChart(ctx, visualData)
        break
      case 'fraction_bar':
        drawFractionBar(ctx, visualData)
        break
      case 'fraction_add':
        drawFractionAddition(ctx, visualData)
        break
      case 'rectangle':
        drawRectangle(ctx, visualData)
        break
      case 'circle':
        drawCircle(ctx, visualData)
        break
      case 'time_line':
        drawTimeLine(ctx, visualData)
        break
      case 'rectangular_prism':
        drawRectangularPrism(ctx, visualData)
        break
      case 'triangular_prism':
        drawTriangularPrism(ctx, visualData)
        break
      default:
        break
    }
  }, [visualData])

  if (!visualData) return null

  return (
    <div style={{ margin: '20px 0' }}>
      <canvas
        ref={canvasRef}
        width={visualData.width || 400}
        height={visualData.height || 300}
        style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}
      />
    </div>
  )
}

// Draw a triangle with labeled sides
function drawTriangle(ctx, data) {
  const { a, b, c } = data
  ctx.strokeStyle = '#2196F3'
  ctx.fillStyle = '#2196F3'
  ctx.lineWidth = 3
  ctx.font = 'bold 16px Arial'

  // Draw triangle
  const x1 = 50, y1 = 250
  const x2 = 350, y2 = 250
  const x3 = 200, y3 = 50

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x3, y3)
  ctx.closePath()
  ctx.stroke()

  // Label sides
  ctx.fillText(`${a} cm`, (x1 + x3) / 2 - 30, (y1 + y3) / 2)
  ctx.fillText(`${b} cm`, (x2 + x3) / 2 + 20, (y2 + y3) / 2)
  ctx.fillText(`${c} cm`, (x1 + x2) / 2, y1 + 25)

  // Draw vertices
  ctx.fillStyle = '#FF5722'
  ctx.beginPath()
  ctx.arc(x1, y1, 5, 0, 2 * Math.PI)
  ctx.arc(x2, y2, 5, 0, 2 * Math.PI)
  ctx.arc(x3, y3, 5, 0, 2 * Math.PI)
  ctx.fill()
}

// Draw angles on a straight line
function drawAnglesOnLine(ctx, data) {
  const { angle1, angle2 } = data

  ctx.strokeStyle = '#2196F3'
  ctx.fillStyle = '#2196F3'
  ctx.lineWidth = 3
  ctx.font = 'bold 16px Arial'

  // Draw the straight line
  ctx.beginPath()
  ctx.moveTo(50, 150)
  ctx.lineTo(350, 150)
  ctx.stroke()

  // Draw the dividing line
  const angle1Rad = (180 - angle1) * Math.PI / 180
  const lineLen = 100
  const divX = 200
  const divY = 150
  const endX = divX + Math.cos(angle1Rad) * lineLen
  const endY = divY - Math.sin(angle1Rad) * lineLen

  ctx.beginPath()
  ctx.moveTo(divX, divY)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  // Draw angle arcs
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 2

  // Left angle
  ctx.beginPath()
  ctx.arc(divX, divY, 40, Math.PI, angle1Rad, true)
  ctx.stroke()
  ctx.fillStyle = '#4CAF50'
  ctx.fillText(`${angle1}°`, divX - 60, divY - 10)

  // Right angle (with "?")
  ctx.strokeStyle = '#FF5722'
  ctx.beginPath()
  ctx.arc(divX, divY, 40, 0, angle1Rad, false)
  ctx.stroke()
  ctx.fillStyle = '#FF5722'
  ctx.fillText(`?`, divX + 50, divY - 10)

  // Add point marker
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(divX, divY, 5, 0, 2 * Math.PI)
  ctx.fill()
}

// Draw vertically opposite angles
function drawVerticalAngles(ctx, data) {
  const { angle } = data

  ctx.strokeStyle = '#2196F3'
  ctx.lineWidth = 3
  ctx.font = 'bold 16px Arial'

  const centerX = 200
  const centerY = 150
  const lineLen = 120

  // Draw two intersecting lines
  ctx.beginPath()
  ctx.moveTo(centerX - lineLen, centerY - lineLen)
  ctx.lineTo(centerX + lineLen, centerY + lineLen)
  ctx.moveTo(centerX - lineLen, centerY + lineLen)
  ctx.lineTo(centerX + lineLen, centerY - lineLen)
  ctx.stroke()

  // Label angles
  ctx.fillStyle = '#4CAF50'
  ctx.fillText(`${angle}°`, centerX + 30, centerY - 30)

  ctx.fillStyle = '#FF5722'
  ctx.fillText(`?`, centerX - 40, centerY + 40)

  // Center point
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI)
  ctx.fill()
}

// Draw coordinate grid
function drawCoordinateGrid(ctx, data) {
  const { x, y, showPoint, points, showLine } = data

  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.font = '12px Arial'
  ctx.fillStyle = '#666'

  const centerX = 200
  const centerY = 150
  const scale = 20

  // Draw grid
  for (let i = -10; i <= 10; i++) {
    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(centerX + i * scale, 50)
    ctx.lineTo(centerX + i * scale, 250)
    ctx.stroke()

    // Horizontal lines
    ctx.beginPath()
    ctx.moveTo(50, centerY + i * scale)
    ctx.lineTo(350, centerY + i * scale)
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2

  // X-axis
  ctx.beginPath()
  ctx.moveTo(50, centerY)
  ctx.lineTo(350, centerY)
  ctx.stroke()

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(centerX, 50)
  ctx.lineTo(centerX, 250)
  ctx.stroke()

  // Label axes
  ctx.fillStyle = '#333'
  ctx.font = 'bold 14px Arial'
  ctx.fillText('x', 360, centerY + 5)
  ctx.fillText('y', centerX + 5, 40)

  // Phase 5: Draw line between two points if specified
  if (showLine && points && points.length === 2) {
    const [p1, p2] = points
    const x1 = centerX + p1[0] * scale
    const y1 = centerY - p1[1] * scale
    const x2 = centerX + p2[0] * scale
    const y2 = centerY - p2[1] * scale

    ctx.strokeStyle = '#FF5722'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Draw points
    ctx.fillStyle = '#FF5722'
    ctx.beginPath()
    ctx.arc(x1, y1, 6, 0, 2 * Math.PI)
    ctx.arc(x2, y2, 6, 0, 2 * Math.PI)
    ctx.fill()

    // Label points
    ctx.fillStyle = '#FF5722'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(`(${p1[0]}, ${p1[1]})`, x1 + 10, y1 - 10)
    ctx.fillText(`(${p2[0]}, ${p2[1]})`, x2 + 10, y2 - 10)
  }
  // Draw single point if specified
  else if (showPoint && x !== undefined && y !== undefined) {
    const pointX = centerX + x * scale
    const pointY = centerY - y * scale

    ctx.fillStyle = '#FF5722'
    ctx.beginPath()
    ctx.arc(pointX, pointY, 6, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = '#FF5722'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(`(${x}, ${y})`, pointX + 10, pointY - 10)
  }

  // Draw scale numbers
  ctx.fillStyle = '#666'
  ctx.font = '10px Arial'
  ctx.fillText('0', centerX + 5, centerY + 15)
  ctx.fillText('5', centerX + 5 * scale + 2, centerY + 15)
  ctx.fillText('-5', centerX - 5 * scale - 8, centerY + 15)
  ctx.fillText('5', centerX + 5, centerY - 5 * scale + 3)
  ctx.fillText('-5', centerX + 5, centerY + 5 * scale + 3)
}

// Draw bar chart for statistics
function drawBarChart(ctx, data) {
  const { numbers } = data

  ctx.font = 'bold 14px Arial'

  const barWidth = 40
  const maxVal = Math.max(...numbers)
  const scale = 200 / maxVal
  const startX = 50
  const baseY = 250

  numbers.forEach((num, i) => {
    const barHeight = num * scale
    const x = startX + i * (barWidth + 20)

    // Draw bar
    ctx.fillStyle = '#4CAF50'
    ctx.fillRect(x, baseY - barHeight, barWidth, barHeight)

    // Draw value
    ctx.fillStyle = '#333'
    ctx.fillText(num.toString(), x + barWidth / 2 - 8, baseY - barHeight - 5)
  })

  // Draw baseline
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, baseY)
  ctx.lineTo(360, baseY)
  ctx.stroke()
}

// Draw fraction visualization
function drawFractionBar(ctx, data) {
  const { numerator, denominator } = data

  ctx.font = 'bold 16px Arial'

  const barWidth = 300
  const barHeight = 60
  const startX = 50
  const startY = 120

  // Draw total bar outline
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.strokeRect(startX, startY, barWidth, barHeight)

  // Fill colored portion
  const filledWidth = (numerator / denominator) * barWidth
  ctx.fillStyle = '#4CAF50'
  ctx.fillRect(startX, startY, filledWidth, barHeight)

  // Draw divisions
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1
  for (let i = 1; i < denominator; i++) {
    const x = startX + (i / denominator) * barWidth
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, startY + barHeight)
    ctx.stroke()
  }

  // Label
  ctx.fillStyle = '#333'
  ctx.fillText(`${numerator}/${denominator}`, startX + barWidth / 2 - 20, startY + barHeight + 30)
}

// Draw fraction addition visualization
function drawFractionAddition(ctx, data) {
  const { num1, den1, num2, den2 } = data

  ctx.font = 'bold 16px Arial'

  const barWidth = 150
  const barHeight = 50
  const startX = 40
  const startY1 = 80
  const startY2 = 160

  // Draw first fraction
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.strokeRect(startX, startY1, barWidth, barHeight)

  const filledWidth1 = (num1 / den1) * barWidth
  ctx.fillStyle = '#4CAF50'
  ctx.fillRect(startX, startY1, filledWidth1, barHeight)

  for (let i = 1; i < den1; i++) {
    const x = startX + (i / den1) * barWidth
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, startY1)
    ctx.lineTo(x, startY1 + barHeight)
    ctx.stroke()
  }

  ctx.fillStyle = '#333'
  ctx.fillText(`${num1}/${den1}`, startX + barWidth / 2 - 15, startY1 + barHeight + 25)

  // Draw "+" symbol
  ctx.font = 'bold 24px Arial'
  ctx.fillText('+', startX + barWidth + 30, startY1 + barHeight / 2 + 60)

  // Draw second fraction
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.strokeRect(startX, startY2, barWidth, barHeight)

  const filledWidth2 = (num2 / den2) * barWidth
  ctx.fillStyle = '#2196F3'
  ctx.fillRect(startX, startY2, filledWidth2, barHeight)

  for (let i = 1; i < den2; i++) {
    const x = startX + (i / den2) * barWidth
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, startY2)
    ctx.lineTo(x, startY2 + barHeight)
    ctx.stroke()
  }

  ctx.font = 'bold 16px Arial'
  ctx.fillStyle = '#333'
  ctx.fillText(`${num2}/${den2}`, startX + barWidth / 2 - 15, startY2 + barHeight + 25)
}

// Draw rectangle with dimensions
function drawRectangle(ctx, data) {
  const { length, width } = data

  ctx.font = 'bold 16px Arial'
  ctx.strokeStyle = '#2196F3'
  ctx.fillStyle = '#2196F3'
  ctx.lineWidth = 3

  const scale = Math.min(250 / Math.max(length, width), 8)
  const rectWidth = width * scale
  const rectLength = length * scale
  const startX = (400 - rectWidth) / 2
  const startY = (300 - rectLength) / 2

  // Draw rectangle
  ctx.strokeRect(startX, startY, rectWidth, rectLength)

  // Fill with light color
  ctx.fillStyle = 'rgba(33, 150, 243, 0.2)'
  ctx.fillRect(startX, startY, rectWidth, rectLength)

  // Draw dimension labels
  ctx.fillStyle = '#2196F3'
  ctx.fillText(`${length} cm`, startX + rectWidth + 15, startY + rectLength / 2)
  ctx.fillText(`${width} cm`, startX + rectWidth / 2 - 20, startY - 10)

  // Draw dimension lines
  ctx.strokeStyle = '#FF5722'
  ctx.lineWidth = 1
  ctx.setLineDash([5, 3])

  // Length line
  ctx.beginPath()
  ctx.moveTo(startX + rectWidth + 5, startY)
  ctx.lineTo(startX + rectWidth + 5, startY + rectLength)
  ctx.stroke()

  // Width line
  ctx.beginPath()
  ctx.moveTo(startX, startY - 5)
  ctx.lineTo(startX + rectWidth, startY - 5)
  ctx.stroke()

  ctx.setLineDash([])
}

// Draw circle with radius
function drawCircle(ctx, data) {
  const { radius } = data

  ctx.font = 'bold 16px Arial'
  ctx.strokeStyle = '#2196F3'
  ctx.fillStyle = '#2196F3'
  ctx.lineWidth = 3

  const centerX = 200
  const centerY = 150
  const scale = Math.min(100 / radius, 8)
  const drawRadius = radius * scale

  // Draw circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, drawRadius, 0, 2 * Math.PI)
  ctx.stroke()

  // Fill with light color
  ctx.fillStyle = 'rgba(33, 150, 243, 0.2)'
  ctx.fill()

  // Draw center point
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI)
  ctx.fill()

  // Draw radius line
  ctx.strokeStyle = '#FF5722'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(centerX, centerY)
  ctx.lineTo(centerX + drawRadius, centerY)
  ctx.stroke()

  // Label radius
  ctx.fillStyle = '#FF5722'
  ctx.fillText(`r = ${radius} cm`, centerX + drawRadius / 2 - 20, centerY - 10)
}

// Draw a rectangular prism (3D box) with labeled dimensions
function drawRectangularPrism(ctx, data) {
  const { l, w, h } = data

  ctx.strokeStyle = '#2196F3'
  ctx.fillStyle = 'rgba(33, 150, 243, 0.12)'
  ctx.lineWidth = 2
  ctx.font = 'bold 14px Arial'

  // Front face (rectangle)
  const x = 80
  const y = 120
  const frontWidth = 140
  const frontHeight = 90

  ctx.beginPath()
  ctx.rect(x, y, frontWidth, frontHeight)
  ctx.stroke()
  ctx.fill()

  // Back face (offset)
  const dx = 60
  const dy = -40
  const bx = x + dx
  const by = y + dy

  ctx.beginPath()
  ctx.rect(bx, by, frontWidth, frontHeight)
  ctx.stroke()

  // Connect corresponding corners
  ctx.beginPath()
  ctx.moveTo(x, y); ctx.lineTo(bx, by)
  ctx.moveTo(x + frontWidth, y); ctx.lineTo(bx + frontWidth, by)
  ctx.moveTo(x, y + frontHeight); ctx.lineTo(bx, by + frontHeight)
  ctx.moveTo(x + frontWidth, y + frontHeight); ctx.lineTo(bx + frontWidth, by + frontHeight)
  ctx.stroke()

  // Label length (front bottom)
  ctx.fillStyle = '#1565C0'
  ctx.fillText(`length = ${l} cm`, x + frontWidth / 2 - 40, y + frontHeight + 24)

  // Label width (front right side)
  ctx.save()
  ctx.translate(x + frontWidth + 24, y + frontHeight / 2 + 30)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(`width = ${w} cm`, 0, 0)
  ctx.restore()

  // Label height (depth arrow)
  ctx.strokeStyle = '#FF5722'
  ctx.fillStyle = '#FF5722'
  const hx1 = x + frontWidth
  const hy1 = y
  const hx2 = hx1 + dx
  const hy2 = hy1 - dy

  ctx.beginPath()
  ctx.moveTo(hx1, hy1)
  ctx.lineTo(hx2, hy2)
  ctx.stroke()

  // Arrow head
  ctx.beginPath()
  ctx.moveTo(hx2, hy2)
  ctx.lineTo(hx2 - 8, hy2 - 4)
  ctx.lineTo(hx2 - 4, hy2 + 8)
  ctx.closePath()
  ctx.fill()

  ctx.fillText(`height = ${h} cm`, hx2 + 8, hy2)
}

// Draw a triangular prism using its base area and height
function drawTriangularPrism(ctx, data) {
  const { baseArea, height } = data

  ctx.clearRect(0, 0, 400, 300)

  ctx.strokeStyle = '#2196F3'
  ctx.fillStyle = 'rgba(33, 150, 243, 0.12)'
  ctx.lineWidth = 2
  ctx.font = 'bold 16px Arial'

  // Base triangle (front face)
  const x1 = 80, y1 = 210
  const x2 = 200, y2 = 210
  const x3 = 120, y3 = 120

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x3, y3)
  ctx.closePath()
  ctx.stroke()
  ctx.fill()

  // Back triangle (shifted)
  const dx = 80, dy = -40
  const bx1 = x1 + dx, by1 = y1 + dy
  const bx2 = x2 + dx, by2 = y2 + dy
  const bx3 = x3 + dx, by3 = y3 + dy

  ctx.beginPath()
  ctx.moveTo(bx1, by1)
  ctx.lineTo(bx2, by2)
  ctx.lineTo(bx3, by3)
  ctx.closePath()
  ctx.stroke()

  // Connect corresponding vertices to form prism
  ctx.beginPath()
  ctx.moveTo(x1, y1); ctx.lineTo(bx1, by1)
  ctx.moveTo(x2, y2); ctx.lineTo(bx2, by2)
  ctx.moveTo(x3, y3); ctx.lineTo(bx3, by3)
  ctx.stroke()

  // Label base area
  ctx.fillStyle = '#1565C0'
  ctx.font = 'bold 14px Arial'
  ctx.fillText(`Base area = ${baseArea} cm²`, x1 - 10, y1 + 30)

  // Draw height arrow along prism length
  ctx.strokeStyle = '#FF5722'
  ctx.fillStyle = '#FF5722'
  const hx1 = (x2 + bx2) / 2
  const hy1 = (y2 + by2) / 2
  const hx2 = hx1 + 40
  const hy2 = hy1

  ctx.beginPath()
  ctx.moveTo(hx1, hy1)
  ctx.lineTo(hx2, hy2)
  ctx.stroke()

  // Arrow head
  ctx.beginPath()
  ctx.moveTo(hx2, hy2)
  ctx.lineTo(hx2 - 8, hy2 - 4)
  ctx.lineTo(hx2 - 8, hy2 + 4)
  ctx.closePath()
  ctx.fill()

  ctx.font = 'bold 14px Arial'
  ctx.fillText(`height = ${height} cm`, hx2 + 8, hy2 + 5)
}

// Phase 5: Draw time line visualization
function drawTimeLine(ctx, v) {
  const duration = elapsed_minutes(v.start, v.end)

  ctx.strokeStyle = '#333'
  ctx.fillStyle = '#333'
  ctx.font = 'bold 20px Arial'
  ctx.lineWidth = 3

  // Draw start and end times
  ctx.fillText(v.start, 60, 80)
  ctx.fillText(v.end, 300, 80)

  // Draw full timeline
  ctx.strokeStyle = '#2196F3'
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(80, 100)
  ctx.lineTo(320, 100)
  ctx.stroke()

  // Draw elapsed portion
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 10
  const progressWidth = Math.min(duration * 1.5, 240)
  ctx.beginPath()
  ctx.moveTo(80, 100)
  ctx.lineTo(80 + progressWidth, 100)
  ctx.stroke()

  // Draw start and end markers
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(80, 100, 8, 0, 2 * Math.PI)
  ctx.arc(320, 100, 8, 0, 2 * Math.PI)
  ctx.fill()

  // Label duration
  ctx.fillStyle = '#4CAF50'
  ctx.font = 'bold 24px Arial'
  ctx.fillText(`${duration} min`, 160, 50)

  // Add description
  ctx.fillStyle = '#666'
  ctx.font = '14px Arial'
  ctx.fillText('Elapsed time', 160, 140)
}
