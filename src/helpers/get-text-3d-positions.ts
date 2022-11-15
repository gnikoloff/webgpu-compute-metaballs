export const getText3DPositions = (text: string, offsetY = 0): Float32Array => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = 512
  canvas.height = 512
  canvas.setAttribute(
    'style',
    `
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    z-index: 999;
  `,
  )
  // document.body.appendChild(canvas)

  ctx.fillStyle = 'white'
  ctx.font =
    '400 120px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + offsetY)

  const idata = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const buffer = new Uint32Array(idata.data.buffer)
  const grid = 10

  const positions = []

  for (let y = 0; y < canvas.height; y += grid) {
    for (let x = 0; x < canvas.width; x += grid) {
      if (buffer[y * canvas.width + x]) {
        positions.push(
          (x - canvas.width / 2) / canvas.width,
          (canvas.height - y - canvas.height / 2) / canvas.height,
          0,
        )
      }
    }
  }

  return new Float32Array(positions)
}
