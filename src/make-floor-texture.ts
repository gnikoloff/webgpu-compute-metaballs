const STEPS_IN_DIRECTION_COUNT = 6
const IDEAL_WIDTH = 2048
const FONT_FAMILY = 'Helvetica'

export const makeFloorTexture = (size = 2048): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')!
  canvas.width = size
  canvas.height = size

  // canvas.setAttribute(
  //   'style',
  //   `
  //   position: fixed;
  //   bottom: 0;
  //   right: 0;
  //   max-width: 320px;
  // `,
  // )
  // document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'red'

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const refFontSize = 72
  const widthDelta = size / IDEAL_WIDTH
  ctx.font = `${refFontSize * widthDelta}px ${FONT_FAMILY}`
  ctx.fillText('0', canvas.width / 2, canvas.height / 2)
  drawRuler(canvas, size, 0)
  drawRuler(canvas, size, -90)
  drawRuler(canvas, size, -180)
  drawRuler(canvas, size, -270)
  return canvas
}

function drawRuler(
  canvas: HTMLCanvasElement,
  size: number,
  rotateAngle: number,
) {
  const ctx = canvas.getContext('2d')!
  const step = size / 2 / STEPS_IN_DIRECTION_COUNT
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.scale(-1, -1)
  ctx.rotate((rotateAngle * Math.PI) / 180)
  for (let i = 1; i < STEPS_IN_DIRECTION_COUNT; i++) {
    ctx.fillText(i.toString(), i * step, 0)
  }
  ctx.restore()
}
