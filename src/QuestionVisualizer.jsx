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
      case 'composite_rect_tri':
        drawCompositeRectTriangle(ctx, visualData)
        break;
      case 'net':
        drawNet(ctx, visualData)
        break;
      case 'stem_and_leaf':
        drawStemAndLeaf(ctx, visualData);
        break;
      case 'histogram':
        drawHistogram(ctx, visualData);
        break;
      case 'venn_diagram_two':
        drawVennDiagramTwo(ctx, visualData);
        break;
      case 'box_plot':
        drawBoxPlot(ctx, visualData);
        break;
      case 'scatter_plot':
        drawScatterPlot(ctx, visualData);
        break;
      case 'car_on_road':
        drawCarOnRoad(ctx, visualData);
        break;
      case 'parallel_transversal':
        drawParallelTransversal(ctx, visualData);
        break;
      default:
        break
    }
  }, [visualData])

  if (!visualData) return null

  return (
    <div style={{ margin: '20px 0' }}>
      <canvas
        ref={canvasRef}
        width={visualData.canvasWidth || visualData.width || 400}
        height={visualData.canvasHeight || visualData.height || 300}
        style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}
      />
    </div>
  )
}

// Draw a simple scatter plot with optional trend line/arrow
function drawScatterPlot(ctx, data) {
  const points = data.points || []
  const width = data.width || 360
  const height = data.height || 240
  const margin = 40
  const left = 20, top = 20
  const plotW = width - margin
  const plotH = height - margin

  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  // axes
  ctx.beginPath()
  ctx.moveTo(left + margin, top)
  ctx.lineTo(left + margin, top + plotH)
  ctx.lineTo(left + margin + plotW, top + plotH)
  ctx.stroke()

  // compute ranges
  const xs = points.map(p => p[0])
  const ys = points.map(p => p[1])
  const xmin = Math.min(...xs, 0)
  const xmax = Math.max(...xs, 10)
  const ymin = Math.min(...ys, 0)
  const ymax = Math.max(...ys, 10)

  const scaleX = plotW / Math.max(1, (xmax - xmin))
  const scaleY = plotH / Math.max(1, (ymax - ymin))

  // draw points
  ctx.fillStyle = '#FF5722'
  points.forEach(p => {
    const x = left + margin + (p[0] - xmin) * scaleX
    const y = top + plotH - (p[1] - ymin) * scaleY
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })

  // optional trend arrow: draw simple line from min to max
  if (data.trend) {
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 2
    const x1 = left + margin + (xmin - xmin) * scaleX
    const y1 = top + plotH - (ymin - ymin) * scaleY
    const x2 = left + margin + (xmax - xmin) * scaleX
    const y2 = top + plotH - (ymax - ymin) * scaleY
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    // arrowhead
    const ang = Math.atan2(y2 - y1, x2 - x1)
    const ah = 8
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - ah * Math.cos(ang - 0.4), y2 - ah * Math.sin(ang - 0.4))
    ctx.lineTo(x2 - ah * Math.cos(ang + 0.4), y2 - ah * Math.sin(ang + 0.4))
    ctx.closePath()
    ctx.fillStyle = '#4CAF50'
    ctx.fill()
  }
}

// Draw a small car on a road for speed/distance visualizations
function drawCarOnRoad(ctx, data) {
  const width = data.width || 360
  const height = data.height || 200

  // simple sky and ground to make scene feel less flat
  ctx.fillStyle = '#E3F2FD'
  ctx.fillRect(0, 0, width, height / 2)
  ctx.fillStyle = '#C8E6C9'
  ctx.fillRect(0, height / 2, width, height / 2)

  // road
  ctx.fillStyle = '#666'
  ctx.fillRect(20, height / 2 - 20, width - 40, 40)
  // lane divider
  ctx.strokeStyle = '#fff'
  ctx.setLineDash([10, 10])
  ctx.beginPath()
  ctx.moveTo(30, height / 2)
  ctx.lineTo(width - 30, height / 2)
  ctx.stroke()
  ctx.setLineDash([])

  // car body base
  const cx = 80
  const cy = height / 2 - 16
  ctx.fillStyle = '#1976D2'
  ctx.fillRect(cx, cy + 8, 80, 26)

  // car roof / cabin
  ctx.beginPath()
  ctx.moveTo(cx + 16, cy + 8)
  ctx.lineTo(cx + 36, cy - 8)
  ctx.lineTo(cx + 66, cy - 8)
  ctx.lineTo(cx + 80, cy + 8)
  ctx.closePath()
  ctx.fill()

  // windows
  ctx.fillStyle = '#BBDEFB'
  ctx.fillRect(cx + 30, cy, 22, 12)
  ctx.fillRect(cx + 56, cy, 18, 12)

  // wheels with hubs
  ctx.fillStyle = '#000'
  ctx.beginPath(); ctx.arc(cx + 20, cy + 34, 7, 0, 2*Math.PI); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 60, cy + 34, 7, 0, 2*Math.PI); ctx.fill();
  ctx.fillStyle = '#757575'
  ctx.beginPath(); ctx.arc(cx + 20, cy + 34, 3, 0, 2*Math.PI); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 60, cy + 34, 3, 0, 2*Math.PI); ctx.fill();

  // subtle motion lines behind car
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 10, cy + 20)
  ctx.lineTo(cx - 30, cy + 20)
  ctx.moveTo(cx - 8, cy + 26)
  ctx.lineTo(cx - 26, cy + 26)
  ctx.stroke()

  // label speed if provided (only when explicitly allowed)
  if (data.speed !== undefined && data.showSpeed !== false) {
    ctx.fillStyle = '#000'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(`${data.speed} km/h`, cx + 100, cy + 16)
  }
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

// Helper: normalize angle to [0, 2PI)
function normalizeAngle(a) {
  const twoPi = 2 * Math.PI
  let v = a % twoPi
  if (v < 0) v += twoPi
  return v
}

// Helper: compute midpoint angle along an arc from start->end respecting direction
function arcMidpoint(start, end, anticlockwise) {
  const twoPi = 2 * Math.PI
  const s = normalizeAngle(start)
  const e = normalizeAngle(end)
  if (anticlockwise) {
    const delta = (e - s + twoPi) % twoPi
    return normalizeAngle(s + delta / 2)
  } else {
    const delta = (s - e + twoPi) % twoPi
    return normalizeAngle(s - delta / 2)
  }
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
  const radius = 40
  // left arc: start=Math.PI, end=angle1Rad, anticlockwise=true
  ctx.arc(divX, divY, radius, Math.PI, angle1Rad, true)
  ctx.stroke()
  ctx.fillStyle = '#4CAF50'
  // place label at middle of arc using robust midpoint
  const leftMid = arcMidpoint(Math.PI, angle1Rad, true)
  const fontSize = (ctx.font && parseInt(ctx.font, 10)) || 16
  const offset = radius + Math.max(12, Math.round(fontSize * 0.9))
  const lx = divX + Math.cos(leftMid) * offset
  const ly = divY - Math.sin(leftMid) * offset
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${angle1}°`, lx, ly)
  ctx.restore()

  // Right angle (with "?°")
  ctx.strokeStyle = '#FF5722'
  ctx.beginPath()
  ctx.arc(divX, divY, radius, 0, angle1Rad, false)
  ctx.stroke()
  ctx.fillStyle = '#FF5722'
  // place unknown label at middle of right arc using robust midpoint
  const rightMid = arcMidpoint(0, angle1Rad, false)
  const rx = divX + Math.cos(rightMid) * offset
  const ry = divY - Math.sin(rightMid) * offset
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('?°', rx, ry)
  ctx.restore()

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
  // Label angles using arc bisectors for accurate placement
  const aTR = normalizeAngle(Math.atan2(centerY - (centerY - lineLen), (centerX + lineLen) - centerX)) // top-right
  const aTL = normalizeAngle(Math.atan2(centerY - (centerY - lineLen), (centerX - lineLen) - centerX)) // top-left
  const aBL = normalizeAngle(Math.atan2(centerY - (centerY + lineLen), (centerX - lineLen) - centerX)) // bottom-left
  const aBR = normalizeAngle(Math.atan2(centerY - (centerY + lineLen), (centerX + lineLen) - centerX)) // bottom-right

  const radius = 36
  const fontSize = (ctx.font && parseInt(ctx.font, 10)) || 16
  const offset = radius + Math.max(12, Math.round(fontSize * 0.9))

  // top, left, bottom, right mid angles (small arcs between the rays)
  const topMid = arcMidpoint(aTR, aTL, true)
  const leftMid = arcMidpoint(aTL, aBL, true)
  const bottomMid = arcMidpoint(aBL, aBR, true)
  const rightMid = arcMidpoint(aBR, aTR, true)

  // compute positions (note canvas Y axis is downward so use centerY - sin)
  const topX = centerX + Math.cos(topMid) * offset
  const topY = centerY - Math.sin(topMid) * offset
  const leftX = centerX + Math.cos(leftMid) * offset
  const leftY = centerY - Math.sin(leftMid) * offset
  const bottomX = centerX + Math.cos(bottomMid) * offset
  const bottomY = centerY - Math.sin(bottomMid) * offset
  const rightX = centerX + Math.cos(rightMid) * offset
  const rightY = centerY - Math.sin(rightMid) * offset

  // place the known angle in the top quadrant and the unknown in the opposite quadrant (bottom)
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#4CAF50'
  ctx.fillText(`${angle}°`, topX, topY)
  ctx.fillStyle = '#FF5722'
  // opposite of top is bottom
  ctx.fillText('?°', bottomX, bottomY)
  ctx.restore()

  // Center point
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI)
  ctx.fill()
}

// Draw coordinate grid (auto-scaled so all points fit)
function drawCoordinateGrid(ctx, data) {
  const { x, y, showPoint, points, showLine } = data

  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.font = '12px Arial'
  ctx.fillStyle = '#666'

  const centerX = 200
  const centerY = 150

  // Determine max coordinate we need to show
  let maxCoord = 5
  if (points && points.length === 2) {
    const flat = points.flat()
    maxCoord = Math.max(
      ...flat.map(v => Math.abs(v)),
      5
    )
  } else if (showPoint && x !== undefined && y !== undefined) {
    maxCoord = Math.max(Math.abs(x), Math.abs(y), 5)
  }

  const tickRange = Math.ceil(maxCoord)
  const maxTicks = Math.max(tickRange, 5)

  // Compute scale so ±maxTicks fits inside the drawing area
  const usableWidth = 300  // roughly 50..350
  const usableHeight = 200 // roughly 50..250
  const scale = Math.min(
    usableWidth / (2 * maxTicks),
    usableHeight / (2 * maxTicks)
  )

  // Draw grid
  for (let i = -maxTicks; i <= maxTicks; i++) {
    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(centerX + i * scale, centerY - maxTicks * scale)
    ctx.lineTo(centerX + i * scale, centerY + maxTicks * scale)
    ctx.stroke()

    // Horizontal lines
    ctx.beginPath()
    ctx.moveTo(centerX - maxTicks * scale, centerY + i * scale)
    ctx.lineTo(centerX + maxTicks * scale, centerY + i * scale)
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2

  // X-axis
  ctx.beginPath()
  ctx.moveTo(centerX - maxTicks * scale, centerY)
  ctx.lineTo(centerX + maxTicks * scale, centerY)
  ctx.stroke()

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - maxTicks * scale)
  ctx.lineTo(centerX, centerY + maxTicks * scale)
  ctx.stroke()

  // Label axes
  ctx.fillStyle = '#333'
  ctx.font = 'bold 14px Arial'
  ctx.fillText('x', centerX + maxTicks * scale + 10, centerY + 5)
  ctx.fillText('y', centerX + 5, centerY - maxTicks * scale - 10)

  // Draw line and points if specified
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
    ctx.fillText(`(${p1[0]}, ${p1[1]})`, x1 + 8, y1 - 8)
    ctx.fillText(`(${p2[0]}, ${p2[1]})`, x2 + 8, y2 - 8)
  }
  // Single point
  else if (showPoint && x !== undefined && y !== undefined) {
    const pointX = centerX + x * scale
    const pointY = centerY - y * scale

    ctx.fillStyle = '#FF5722'
    ctx.beginPath()
    ctx.arc(pointX, pointY, 6, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = '#FF5722'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(`(${x}, ${y})`, pointX + 8, pointY - 8)
  }
  // Single point provided in points array
  else if (showPoint && points && points.length === 1) {
    const p = points[0]
    const px = Number(p[0])
    const py = Number(p[1])
    if (!Number.isNaN(px) && !Number.isNaN(py)) {
      const pointX = centerX + px * scale
      const pointY = centerY - py * scale

      ctx.fillStyle = '#FF5722'
      ctx.beginPath()
      ctx.arc(pointX, pointY, 6, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = '#FF5722'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(`(${px}, ${py})`, pointX + 8, pointY - 8)
    }
  }
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
  const hx2 = bx + frontWidth
  const hy2 = by

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

  // Place label near the middle of the depth arrow
  const midX = (hx1 + hx2) / 2
  const midY = (hy1 + hy2) / 2
  ctx.fillText(`height = ${h} cm`, midX + 10, midY - 5)
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
  ctx.fillText(`Base area = ${baseArea} cmÂ²`, x1 - 10, y1 + 30)

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

// Draw composite shape: rectangle + triangle on top
function drawCompositeRectTriangle(ctx, data) {
  const { rectL, rectW, triB, triH } = data

  ctx.clearRect(0, 0, 400, 300)
  ctx.lineWidth = 2
  ctx.font = 'bold 14px Arial'

  // Scale so the full composite shape fits nicely
  const maxWidth = Math.max(rectL, triB)
  const maxHeight = rectW + triH
  const scale = Math.min(260 / maxWidth, 180 / maxHeight)

  const rectWidthPx = rectL * scale
  const rectHeightPx = rectW * scale
  const triBasePx = triB * scale
  const triHeightPx = triH * scale

  // Position rectangle near bottom centre
  const rectX = (400 - rectWidthPx) / 2
  const rectY = 260 - rectHeightPx
  const rectBottom = rectY + rectHeightPx
  const rectTop = rectY

  // Draw rectangle
  ctx.fillStyle = 'rgba(251, 191, 36, 0.25)'
  ctx.strokeStyle = '#f59e0b'
  ctx.beginPath()
  ctx.rect(rectX, rectY, rectWidthPx, rectHeightPx)
  ctx.fill()
  ctx.stroke()

  // Triangle on top, centred
  const baseStart = rectX + (rectWidthPx - triBasePx) / 2
  const baseEnd = baseStart + triBasePx
  const apexX = baseStart + triBasePx / 2
  const apexY = rectTop - triHeightPx

  ctx.fillStyle = 'rgba(248, 113, 113, 0.25)'
  ctx.strokeStyle = '#e11d48'
  ctx.beginPath()
  ctx.moveTo(baseStart, rectTop)
  ctx.lineTo(baseEnd, rectTop)
  ctx.lineTo(apexX, apexY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Dimension styling
  ctx.strokeStyle = '#05668d'
  ctx.fillStyle = '#05668d'
  ctx.lineWidth = 1.5

  // Rectangle length (bottom)
  const yDimBottom = rectBottom + 18
  ctx.beginPath()
  ctx.moveTo(rectX, yDimBottom)
  ctx.lineTo(rectX + rectWidthPx, yDimBottom)
  ctx.stroke()
  ctx.fillText(`${rectL} cm`, rectX + rectWidthPx / 2 - 18, yDimBottom + 14)

  // Rectangle width (left side)
  const xDimLeft = rectX - 18
  ctx.beginPath()
  ctx.moveTo(xDimLeft, rectTop)
  ctx.lineTo(xDimLeft, rectBottom)
  ctx.stroke()
  ctx.save()
  ctx.translate(xDimLeft - 8, (rectTop + rectBottom) / 2 + 10)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(`${rectW} cm`, 0, 0)
  ctx.restore()

  // Triangle base (top)
  const yDimTriBase = rectTop - 10
  ctx.beginPath()
  ctx.moveTo(baseStart, yDimTriBase)
  ctx.lineTo(baseEnd, yDimTriBase)
  ctx.stroke()
  ctx.fillText(`${triB} cm`, baseStart + triBasePx / 2 - 20, yDimTriBase - 4)

  // Triangle height (vertical from apex)
  const baseMidX = apexX
  ctx.beginPath()
  ctx.moveTo(baseMidX, apexY)
  ctx.lineTo(baseMidX, rectTop)
  ctx.stroke()
  ctx.fillText(`${triH} cm`, baseMidX + 6, apexY + (rectTop - apexY) / 2)

  // Labels for shapes (no area values)
  ctx.fillStyle = '#0b1220'
  ctx.font = '12px Arial'
  ctx.fillText('Rectangle', rectX + 8, rectBottom - 10)
  ctx.fillText('Triangle', apexX + 8, apexY + 4)

  // Simple legend box naming parts (no calculations)
  const legendX = 260
  const legendY = 40
  const legendW = 120
  const legendH = 56

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.rect(legendX, legendY, legendW, legendH)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#0b1220'
  ctx.font = '12px Arial'
  ctx.fillText('Composite shape', legendX + 10, legendY + 16)
  ctx.fillText('â€¢ Rectangle part', legendX + 10, legendY + 32)
  ctx.fillText('â€¢ Triangle part', legendX + 10, legendY + 48)
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
  // Show placeholder instead of actual duration so the visualizer doesn't reveal the answer
  ctx.fillText(`?° min`, 160, 50)

  // Add description
  ctx.fillStyle = '#666'
  ctx.font = '14px Arial'
  ctx.fillText('Elapsed time', 160, 140)
}









// --- Phase 7: New drawing functions ---
function drawStemAndLeaf(ctx, data) {
  const { stems, leaves, key } = data;
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#333';
  
  let y = 50;
  const stemX = 150;
  const leafX = 180;

  ctx.fillText('Stem', stemX - 50, y);
  ctx.fillText('Leaf', leafX + 20, y);
  y += 20;
  
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(stemX + 25, y-10);
  ctx.lineTo(stemX + 25, y + stems.length * 25);
  ctx.stroke();

  stems.forEach(stem => {
    ctx.textAlign = 'right';
    ctx.fillText(stem, stemX, y + 20);
    ctx.textAlign = 'left';
    const leafString = (leaves[stem] || []).join('   ');
    ctx.fillText(leafString, leafX, y + 20);
    y += 25;
  });
  
  y += 30;
  ctx.font = 'italic 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Key: ${key}`, 200, y);
}

function drawHistogram(ctx, data) {
    const { bins, values } = data;
    ctx.font = 'bold 12px Arial';
    const barWidth = 300 / bins.length;
    const maxVal = Math.max(...values);
    const scale = maxVal > 0 ? 180 / maxVal : 1;
    const startX = 50;
    const baseY = 250;

    bins.forEach((bin, i) => {
        const barHeight = values[i] * scale;
        const x = startX + i * barWidth;
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(x, baseY - barHeight, barWidth, barHeight);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, baseY - barHeight, barWidth, barHeight);

        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(values[i].toString(), x + barWidth / 2, baseY - barHeight - 5);
        ctx.fillText(bin, x + barWidth / 2, baseY + 15);
    });

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    ctx.lineTo(startX + 300, baseY);
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillText('Frequency', startX - 45, baseY - 180);
}

function drawVennDiagramTwo(ctx, data) {
    const { labelA, labelB, valA, valB, valOverlap } = data;
    const x1 = 150, y1 = 150, r1 = 80;
    const x2 = 250, y2 = 150, r2 = 80;

    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#2196F3'; // Blue
    ctx.beginPath();
    ctx.arc(x1, y1, r1, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#F44336'; // Red
    ctx.beginPath();
    ctx.arc(x2, y2, r2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x1, y1, r1, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x2, y2, r2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    
    ctx.fillText(labelA, x1, y1 - r1 - 10);
    ctx.fillText(labelB, x2, y2 - r2 - 10);
    
    ctx.fillText(valA.toString(), x1 - r1/2, y1);
    ctx.fillText(valB.toString(), x2 + r2/2, y2);
    ctx.fillText(valOverlap.toString(), (x1+x2)/2, y1);
}

function drawBoxPlot(ctx, data) {
    const { min, q1, median, q3, max, label } = data;
    const y = 150;
    const totalRange = max - min;
    const scale = totalRange > 0 ? 300 / totalRange : 1;
    const startX = 50;
    
    const minX = startX;
    const q1X = startX + (q1 - min) * scale;
    const medianX = startX + (median - min) * scale;
    const q3X = startX + (q3 - min) * scale;
    const maxX = startX + (max - min) * scale;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Box
    ctx.strokeRect(q1X, y - 40, q3X - q1X, 80);
    
    // Median line
    ctx.beginPath();
    ctx.moveTo(medianX, y - 40);
    ctx.lineTo(medianX, y + 40);
    ctx.stroke();
    
    // Whiskers
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(q1X, y);
    ctx.moveTo(q3X, y);
    ctx.lineTo(maxX, y);
    ctx.stroke();

    // Min/Max lines
    ctx.beginPath();
    ctx.moveTo(minX, y - 20);
    ctx.lineTo(minX, y + 20);
    ctx.moveTo(maxX, y - 20);
    ctx.lineTo(maxX, y + 20);
    ctx.stroke();

    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.fillText(min, minX, y + 60);
    ctx.fillText(q1, q1X, y + 60);
    ctx.fillText(median, medianX, y + 60);
    ctx.fillText(q3, q3X, y + 60);
    ctx.fillText(max, maxX, y + 60);
    ctx.fillText(label, 200, 50);
}

// Draw a simple net visualization (supports cube and other nets)
function drawNet(ctx, data) {
  const { shape_type } = data
  ctx.clearRect(0, 0, 400, 300)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.font = '14px Arial'

  if (shape_type === 'cube') {
    // Draw a common cube net: cross shape (4 in a row + one above)
    const size = 50
    const startX = 140
    const startY = 80

    // center row: four squares
    for (let i = -1; i <= 2; i++) {
      const x = startX + i * size
      const y = startY
      ctx.strokeRect(x, y, size, size)
    }

    // square above the second square
    ctx.strokeRect(startX + size * 0, startY - size, size, size)

  } else {
    // Additional supported nets
    if (shape_type === 'rectangular_prism') {
      // Draw a simple rectangular prism net: three rectangles in a row with one attached above and one below the middle
      const w = 60, h = 40
      const startX = 100, startY = 100
      // center row of three
      for (let i = 0; i < 3; i++) ctx.strokeRect(startX + i * w, startY, w, h)
      // top and bottom attached to middle
      ctx.strokeRect(startX + w, startY - h, w, h)
      ctx.strokeRect(startX + w, startY + h, w, h)
    } else if (shape_type === 'triangular_prism') {
      // Draw triangular prism net: triangle - rectangle - rectangle - triangle
      const rectW = 70, rectH = 40
      const startX = 60, startY = 120
      // left triangle
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(startX + 30, startY - 40)
      ctx.lineTo(startX + 30, startY + 40)
      ctx.closePath()
      ctx.stroke()
      // three rectangles in a row
      for (let i = 0; i < 3; i++) ctx.strokeRect(startX + 30 + i * rectW, startY - rectH / 2, rectW, rectH)
      // right triangle
      const tx = startX + 30 + 3 * rectW
      ctx.beginPath()
      ctx.moveTo(tx + rectW, startY - 40)
      ctx.lineTo(tx + rectW + 30, startY)
      ctx.lineTo(tx + rectW, startY + 40)
      ctx.closePath()
      ctx.stroke()
    } else if (shape_type === 'square_pyramid') {
      // Draw square base with 4 triangular faces around
      const size = 60
      const cx = 200, cy = 140
      // square base
      ctx.strokeRect(cx - size/2, cy - size/2, size, size)
      // four triangles
      // top
      ctx.beginPath()
      ctx.moveTo(cx - size/2, cy - size/2)
      ctx.lineTo(cx + size/2, cy - size/2)
      ctx.lineTo(cx, cy - size/2 - 50)
      ctx.closePath()
      ctx.stroke()
      // bottom
      ctx.beginPath()
      ctx.moveTo(cx - size/2, cy + size/2)
      ctx.lineTo(cx + size/2, cy + size/2)
      ctx.lineTo(cx, cy + size/2 + 50)
      ctx.closePath()
      ctx.stroke()
      // left
      ctx.beginPath()
      ctx.moveTo(cx - size/2, cy - size/2)
      ctx.lineTo(cx - size/2, cy + size/2)
      ctx.lineTo(cx - size/2 - 50, cy)
      ctx.closePath()
      ctx.stroke()
      // right
      ctx.beginPath()
      ctx.moveTo(cx + size/2, cy - size/2)
      ctx.lineTo(cx + size/2, cy + size/2)
      ctx.lineTo(cx + size/2 + 50, cy)
      ctx.closePath()
      ctx.stroke()
    } else if (shape_type === 'tetrahedron') {
      // Draw net of a tetrahedron: central triangle with three triangles attached
      const cx = 200, cy = 140
      const s = 50
      // central triangle
      ctx.beginPath()
      ctx.moveTo(cx, cy - s)
      ctx.lineTo(cx - s, cy + s)
      ctx.lineTo(cx + s, cy + s)
      ctx.closePath()
      ctx.stroke()
      // top attached (upwards)
      ctx.beginPath()
      ctx.moveTo(cx, cy - s)
      ctx.lineTo(cx - s/1.5, cy - s - 40)
      ctx.lineTo(cx + s/1.5, cy - s - 40)
      ctx.closePath()
      ctx.stroke()
      // left attached
      ctx.beginPath()
      ctx.moveTo(cx - s, cy + s)
      ctx.lineTo(cx - s - 40, cy + s + 30)
      ctx.lineTo(cx - s + 20, cy + s + 10)
      ctx.closePath()
      ctx.stroke()
      // right attached
      ctx.beginPath()
      ctx.moveTo(cx + s, cy + s)
      ctx.lineTo(cx + s + 40, cy + s + 30)
      ctx.lineTo(cx + s - 20, cy + s + 10)
      ctx.closePath()
      ctx.stroke()
    } else {
      ctx.fillText('Net visualization not available', 120, 140)
    }
  }
}

// Draw two parallel horizontal lines cut by a transversal and mark alternate interior angles
function drawParallelTransversal(ctx, data) {
  const width = data.width || 360
  const height = data.height || 300

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = '#2196F3'
  ctx.lineWidth = 6

  const left = 40
  const right = width - 40
  const topY = 110
  const bottomY = 190

  // draw two parallel lines
  ctx.beginPath()
  ctx.moveTo(left, topY)
  ctx.lineTo(right, topY)
  ctx.moveTo(left, bottomY)
  ctx.lineTo(right, bottomY)
  ctx.stroke()

  // draw transversal (slanted) passing through both lines
  const tx1 = left + 40
  const ty1 = topY - 40
  const tx2 = right - 40
  const ty2 = bottomY + 40
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(tx1, ty1)
  ctx.lineTo(tx2, ty2)
  ctx.stroke()

  // compute intersections approximate (top intersection near where transversal crosses top line)
  // For our simple line coords, get intersection points by projecting
  const topIx = tx1 + (topY - ty1) * (tx2 - tx1) / (ty2 - ty1)
  const topIy = topY
  const botIx = tx1 + (bottomY - ty1) * (tx2 - tx1) / (ty2 - ty1)
  const botIy = bottomY

  // draw small dot at intersections
  ctx.fillStyle = '#111'
  ctx.beginPath(); ctx.arc(topIx, topIy, 5, 0, 2*Math.PI); ctx.fill();
  ctx.beginPath(); ctx.arc(botIx, botIy, 5, 0, 2*Math.PI); ctx.fill();

  // compute transversal direction and place known angle and target properly
  const ang = Math.atan2(ty2 - ty1, tx2 - tx1) // radians
  const radius = 28

  // Build unit vectors
  const tUnit = { x: Math.cos(ang), y: Math.sin(ang) }
  const pUnit = { x: 1, y: 0 } // parallel lines are horizontal
  const perpToTrans = { x: -tUnit.y, y: tUnit.x }
  const centerY = (topY + bottomY) / 2
  const offsetDist = radius + 18

  function makeSectors(interX, interY) {
    const combos = [ [1,1], [1,-1], [-1,1], [-1,-1] ]
    return combos.map(c => {
      const dx = c[0]*pUnit.x + c[1]*tUnit.x
      const dy = c[0]*pUnit.y + c[1]*tUnit.y
      const len = Math.hypot(dx, dy) || 1
      const dir = { x: dx/len, y: dy/len }
      const labelX = interX + dir.x * offsetDist
      const labelY = interY + dir.y * offsetDist
      const isInterior = (dir.y * (centerY - interY)) > 0 // points toward the strip between lines
      const side = (dir.x * perpToTrans.x + dir.y * perpToTrans.y) > 0 // left/right relative to transversal
      return { dir, labelX, labelY, isInterior, side }
    })
  }

  const topSectors = makeSectors(topIx, topIy)
  const botSectors = makeSectors(botIx, botIy)

  // Choose given sector: use provided data.givenIntersection/givenSectorIndex if present, else random
  const givenIntersectionIndex = typeof data.givenIntersection !== 'undefined' ? (data.givenIntersection === 'top' ? 0 : 1) : (Math.random() < 0.5 ? 0 : 1)
  const givenSectors = givenIntersectionIndex === 0 ? topSectors : botSectors
  const givenSectorIndex = typeof data.givenSectorIndex !== 'undefined' ? data.givenSectorIndex : Math.floor(Math.random() * 4)
  const givenSector = givenSectors[givenSectorIndex]
  const known = Number.isFinite(Number(data.angle)) ? data.angle : 60

  // Draw given arc at its intersection
  const givenInterX = givenIntersectionIndex === 0 ? topIx : botIx
  const givenInterY = givenIntersectionIndex === 0 ? topIy : botIy
  ctx.strokeStyle = '#2E7D32'
  ctx.lineWidth = 3
  const gMid = Math.atan2(givenSector.dir.y, givenSector.dir.x)
  ctx.beginPath()
  ctx.arc(givenInterX, givenInterY, radius, gMid - 0.5, gMid + 0.5, false)
  ctx.stroke()
  ctx.fillStyle = '#2E7D32'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${known}°`, givenSector.labelX, givenSector.labelY)

  // Compute target sector according to relation
  const relation = (data.relation || data.relationType || 'corresponding')
  let targetSector = null
  let targetInterX = topIx, targetInterY = topIy

  function findMatchingSector(sectors, wantInterior, wantSide) {
    for (const s of sectors) {
      if (s.isInterior === wantInterior && s.side === wantSide) return s
    }
    return sectors.find(s => s.isInterior === wantInterior) || sectors[0]
  }

  if (relation === 'vertical') {
    const sectors = givenIntersectionIndex === 0 ? topSectors : botSectors
    const wantInterior = !givenSector.isInterior
    const wantSide = !givenSector.side
    targetSector = findMatchingSector(sectors, wantInterior, wantSide)
    targetInterX = givenInterX; targetInterY = givenInterY
  } else {
    const otherSectors = givenIntersectionIndex === 0 ? botSectors : topSectors
    if (relation === 'corresponding') {
      targetSector = findMatchingSector(otherSectors, givenSector.isInterior, givenSector.side)
    } else if (relation === 'alternate_interior') {
      targetSector = findMatchingSector(otherSectors, true, !givenSector.side)
    } else if (relation === 'alternate_exterior') {
      targetSector = findMatchingSector(otherSectors, false, !givenSector.side)
    } else if (relation === 'consecutive_interior' || relation === 'same_side_interior') {
      targetSector = findMatchingSector(otherSectors, true, givenSector.side)
    } else {
      targetSector = findMatchingSector(otherSectors, givenSector.isInterior, givenSector.side)
    }
    targetInterX = givenIntersectionIndex === 0 ? botIx : topIx
    targetInterY = givenIntersectionIndex === 0 ? botIy : topIy
  }

  // Draw target arc and place question mark
  if (targetSector) {
    ctx.strokeStyle = '#c62828'
    ctx.lineWidth = 3
    const tMid = Math.atan2(targetSector.dir.y, targetSector.dir.x)
    ctx.beginPath()
    ctx.arc(targetInterX, targetInterY, radius, tMid - 0.5, tMid + 0.5, false)
    ctx.stroke()
    ctx.fillStyle = '#c62828'
    ctx.fillText('?°', targetSector.labelX, targetSector.labelY)
  }

  // titles
  ctx.fillStyle = '#333'
  ctx.font = '14px Arial'
  ctx.fillText('Two parallel lines cut by a transversal', width / 2, 40)

  // legend explaining colours for students
  ctx.font = '12px Arial'
  ctx.fillStyle = '#2E7D32'
  ctx.fillRect(width - 140, height - 70, 10, 10)
  ctx.fillStyle = '#333'
  ctx.fillText('Given angle', width - 120, height - 61)
  ctx.fillStyle = '#c62828'
  ctx.fillRect(width - 140, height - 50, 10, 10)
  ctx.fillStyle = '#333'
  ctx.fillText('Find this angle', width - 120, height - 41)
}





















