import { IndexBuffer, VertexBuffer, Geometry, Mesh, GeometryUtils } from "./lib/hwoa-rang-gpu"

(async() => {
  const canvas = document.createElement('canvas')
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio
  canvas.style.setProperty('width', `${innerWidth}px`)
  canvas.style.setProperty('height', `${innerHeight}px`)
  document.body.appendChild(canvas)

  const adapter = await navigator.gpu?.requestAdapter()

  if (!adapter) {
    // 
    return
  }

  const device = await adapter?.requestDevice()
  const context = canvas.getContext('webgpu')

  if (!context) {
    //
    return
  }

  const presentationFormat = context?.getPreferredFormat(adapter)
  const primitiveType = 'triangle-list'

  context.configure({
    device,
    format: presentationFormat
  })

  const { vertices, indices } = GeometryUtils.createPlane({
    width: 4,
    height: 4
  })
  const geometry = new Geometry(device)

  const indexBuffer = new IndexBuffer(device, indices)
  const vertexBuffer = new VertexBuffer(device, 0, vertices, 3 * Float32Array.BYTES_PER_ELEMENT)

  const floorMesh = new Mesh(device, {
    // geometry: floorGeometry,
    vertexShaderSource: {
      main: `
        output.Position = transform.projectionMatrix *
                          transform.viewMatrix *
                          transform.modelMatrix *
                          input.position
      `
    },
    fragmentShaderSource: {
      main: `
        output.Color = vec4<f32>(1.0, 0.0, 0.0, 1.0);
      `
    }
  })

  floorMesh
    .setRotation({ x: -Math.PI / 2 })
    .setPosition({ y: -23 })

})()