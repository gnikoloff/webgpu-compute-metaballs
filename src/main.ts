import { castNumberToWGLSLFloat, convertNumberArrToWGLSLVec } from './helpers'
import {
  IndexBuffer,
  VertexBuffer,
  Geometry,
  Mesh,
  GeometryUtils,
  PerspectiveCamera,
  Texture,
  CameraController,
  Sampler,
} from './lib/hwoa-rang-gpu'

import { makeFloorTexture } from './make-floor-texture'

const SAMPLE_COUNT = 4
const FLOOR_SIZE = 10
const FLOOR_TEXTURE_SIZE = 1024
const FOG_NEAR = 0.1
const FOG_FAR = 10
const BACKGROUND_COLOR = [0.1, 0.1, 0.1, 1.0]

// Need WebGL to obtain GPU max anisotropy levels
// WebGPU currently does not provide a way to get it
const _c = document.createElement('canvas')
const __gl = _c.getContext('webgl2')!
const anisotropyExt =
  __gl.getExtension('EXT_texture_filter_anisotropic') ||
  __gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
  __gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')

const MAX_ANISOTROPY = __gl.getParameter(
  anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
)

;(async () => {
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

  const presentationFormat = context.getPreferredFormat(adapter)
  // const primitiveType = 'triangle-list'
  // const presentationSize = [canvas.width, canvas.height]

  context.configure({
    device,
    format: presentationFormat,
  })

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    20,
  )
    .setPosition({ x: 0.81, y: 0.31, z: 3.91 })
    .lookAt([0, 0, 0])
    .updateViewMatrix()

  new CameraController(perspCamera, document.body, false, 0.1).lookAt([
    0, 0.5, 0,
  ])

  const textureDepth = new Texture(device, 'texture_depth').fromDefinition({
    size: [canvas.width, canvas.height, 1],
    sampleCount: SAMPLE_COUNT,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  const renderTexture = new Texture(device, 'render_texture').fromDefinition({
    size: [canvas.width, canvas.height],
    sampleCount: SAMPLE_COUNT,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  const floorTextureBitmap: ImageBitmap = await createImageBitmap(
    makeFloorTexture(FLOOR_TEXTURE_SIZE),
    {
      resizeWidth: FLOOR_TEXTURE_SIZE,
      resizeHeight: FLOOR_TEXTURE_SIZE,
    },
  )

  const floorTexture = new Texture(device, 'floor_texture').fromImageBitmap(
    floorTextureBitmap,
  )
  const sampler = new Sampler(device, 'my_sampler', 'filtering', 'sampler', {
    maxAnisotropy: MAX_ANISOTROPY,
    minFilter: 'linear',
    magFilter: 'linear',
    mipmapFilter: 'linear',
  })

  const {
    // width,
    // height,
    vertexCount,
    vertexStride,
    interleavedArray,
    indicesArray,
  } = GeometryUtils.createInterleavedPlane({
    width: FLOOR_SIZE,
    height: FLOOR_SIZE,
  })

  const indexBuffer = new IndexBuffer(device, indicesArray)
  const interleavedBuffer = new VertexBuffer(
    device,
    0,
    interleavedArray,
    vertexStride * Float32Array.BYTES_PER_ELEMENT,
  )
    .addAttribute(
      'position',
      0 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
      'float32x3',
    )
    .addAttribute(
      'uv',
      3 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT,
      'float32x2',
    )

  const floorGeometry = new Geometry(device)
  floorGeometry.addIndexBuffer(indexBuffer).addVertexBuffer(interleavedBuffer)

  console.log(interleavedBuffer)

  const floorMesh = new Mesh(device, {
    geometry: floorGeometry,
    uniforms: {},
    multisample: {
      count: SAMPLE_COUNT,
    },
    textures: [floorTexture],
    samplers: [sampler],
    vertexShaderSource: {
      main: `
        var worldPosition: vec4<f32> = transform.modelMatrix *
                                       input.position;

        output.Position = transform.projectionMatrix *
                          transform.viewMatrix *
                          worldPosition;
        

        output.position = worldPosition;
        output.uv = input.uv;
      `,
    },
    fragmentShaderSource: {
      head: `
        let FLOOR_SIZE_HALF: f32 = ${castNumberToWGLSLFloat(FLOOR_SIZE * 0.5)};
        let FOG_NEAR: f32 = ${castNumberToWGLSLFloat(FOG_NEAR)};
        let FOG_FAR: f32 = ${castNumberToWGLSLFloat(FOG_FAR)};
        let BACKGROUND_COLOR = ${convertNumberArrToWGLSLVec(BACKGROUND_COLOR)};
      `,
      main: `
        output.Color = textureSample(floor_texture, my_sampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));

        var distanceCenterNorm: f32 = clamp(distance(vec4<f32>(0.0), input.position) / FLOOR_SIZE_HALF, 0.0, 1.0);
        output.Color = mix(output.Color, BACKGROUND_COLOR, distanceCenterNorm);

        var fogDepth: f32 = -input.position.z;
        var fogAmount: f32 = smoothStep(FOG_NEAR, FOG_FAR, fogDepth);
        output.Color = mix(output.Color, BACKGROUND_COLOR, fogAmount);
      `,
    },
  })

  floorMesh.setRotation({ x: -Math.PI / 2 }).updateWorldMatrix()

  requestAnimationFrame(renderFrame)

  function renderFrame() {
    requestAnimationFrame(renderFrame)

    const commandEncoder = device.createCommandEncoder()
    // const textureView = context?.getCurrentTexture().createView()
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: renderTexture.get().createView(),
          resolveTarget: context?.getCurrentTexture().createView(),
          loadValue: BACKGROUND_COLOR,
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: textureDepth.get().createView(),
        depthLoadValue: 1,
        depthStoreOp: 'store',
        stencilLoadValue: 0,
        stencilStoreOp: 'store',
      },
    })

    floorMesh.render(renderPass, perspCamera)

    renderPass.endPass()
    device.queue.submit([commandEncoder.finish()])
  }
})()
