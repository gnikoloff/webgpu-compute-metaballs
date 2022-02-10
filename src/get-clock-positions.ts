const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!

canvas.width = 400
canvas.height = 200
// document.body.appendChild(canvas)
canvas.setAttribute(
  'style',
  `
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 999;
`,
)

const getClockString = (): string => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  return `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds}`
}

interface Particle {
  x: number
  y: number
}

const getClockPositions = (): Particle[] => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const dateFormatted = getClockString()
  const refFontSize = 32
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${refFontSize}px Helvetica`
  const { width: textWidth } = ctx.measureText(dateFormatted)
  const widthDelta = canvas.width / textWidth
  const fontSize = refFontSize * widthDelta
  // debugger
  ctx.font = `${fontSize}px Helvetica`
  ctx.fillText(dateFormatted, canvas.width / 2, canvas.height / 2)
  const idata = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const buffer32 = new Uint32Array(idata.data.buffer)
  const gridX = 4
  const gridY = 4
  const outPosition: Particle[] = []
  for (let y = 0; y < canvas.height; y += gridY) {
    for (let x = 0; x < canvas.width; x += gridX) {
      if (buffer32[y * canvas.width + x]) {
        outPosition.push({
          x: x - canvas.width / 2,
          y: canvas.height - y - canvas.height / 2,
        })
      }
    }
  }
  return outPosition
}

export default getClockPositions
