import HelperGrid from './helper-grid'
import { VolumeSettings } from './interfaces'
import {
  PerspectiveCamera,
  CameraController,
  SceneObject,
  Mesh,
  Geometry,
  GeometryUtils,
  VertexBuffer,
  IndexBuffer,
	OrthographicCamera,
} from './lib/hwoa-rang-gpu'
import MetaballRenderer from './metaball-renderer'
import GLTFModel from './gltf-model'
import FireEmitter from './fire-emitter'

import WebGPURenderer from './webgpu-renderer'
import { SAMPLE_COUNT, SHADOW_MAP_SIZE } from './constants'

const FIRE_EMITTERS = [
  {
    pos: { x: -2.8, y: 1.9, z: 9.4 },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  },
  {
    pos: { x: 2.6, y: 1.9, z: 9.4 },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  },
  {
    pos: { x: -2.8, y: 1.9, z: -7.5 },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  },
  {
    pos: { x: 2.6, y: 1.9, z: -7.5 },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  },
]

;(async () => {
  let oldTime = 0

  const adapter = await navigator.gpu?.requestAdapter()

  if (!adapter) {
    //
    return
  }

  const opaqueRoot = new SceneObject()
  const transparentRoot = new SceneObject()
  const shadowRoot = new SceneObject()

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    innerWidth / innerHeight,
    0.1,
    40,
  )
    .setPosition({ x: 0, y: 5, z: -13 })
    .lookAt([0, 1, 0])
    .updateViewMatrix()
    .updateProjectionMatrix()

  const shadowCamera = new OrthographicCamera(-50, 50, -50, 50, -200, 200)
    .setPosition({ x: 2, y: 20, z: 0 })
    .lookAt([0, 1, 0])
    .updateViewMatrix()
    .updateProjectionMatrix()

  new CameraController(perspCamera, document.body, true, 0.1).lookAt([0, 1, 0])

  const renderer = new WebGPURenderer(adapter)
  renderer.devicePixelRatio = devicePixelRatio
  renderer.outputSize = [innerWidth, innerHeight]
  document.body.appendChild(renderer.canvas)
  
  await renderer.init()

  renderer.projectionUBO
    .updateUniform('matrix', perspCamera.projectionMatrix as Float32Array)
    .updateUniform('outputSize', new Float32Array([innerWidth, innerHeight]))
    .updateUniform('zNear', new Float32Array([perspCamera.near]))
    .updateUniform('zFar', new Float32Array([perspCamera.far]))
  renderer.shadowProjectionUBO
    .updateUniform('matrix', shadowCamera.projectionMatrix as Float32Array)
    .updateUniform('outputSize', new Float32Array([innerWidth, innerHeight]))
    .updateUniform('zNear', new Float32Array([shadowCamera.near]))
    .updateUniform('zFar', new Float32Array([shadowCamera.far]))

  renderer.viewUBO
    .updateUniform('matrix', perspCamera.viewMatrix as Float32Array)
    .updateUniform('position', new Float32Array(perspCamera.position))
  renderer.shadowViewUBO
    .updateUniform('matrix', shadowCamera.viewMatrix as Float32Array)
    .updateUniform('position', new Float32Array(shadowCamera.position))

  const volume: VolumeSettings = {
    xMin: -1.75,
    yMin: -1.75,
    zMin: -1.75,
    width: 75,
    height: 75,
    depth: 75,
    xStep: 0.05,
    yStep: 0.05,
    zStep: 0.05,
    isoLevel: 80,
  }

  const metaballs = new MetaballRenderer(renderer, volume)
  metaballs.setPosition({ y: 2 })
  const gridHelper = new HelperGrid(renderer)
  const gltfModel = new GLTFModel(renderer)


  opaqueRoot.addChild(gltfModel.opaqueRoot)
  transparentRoot.addChild(gltfModel.transparentRoot)
  shadowRoot.addChild(gltfModel.shadowRoot)
  
  const fireEmitters: FireEmitter[] = []
  for (let i = 0; i < FIRE_EMITTERS.length; i++) {
    const fireEmitter = new FireEmitter(renderer)
		fireEmitter.name = 'fire-emitter-' + i
    const { pos, scale } = FIRE_EMITTERS[i]
    fireEmitter.setPosition(pos).setScale(scale).updateWorldMatrix()
    transparentRoot.addChild(fireEmitter)
    fireEmitters.push(fireEmitter)
  }

  // debug shadow map
  const debugPlaneGeometry = new Geometry()
  {
    const { vertexStride, interleavedArray, indicesArray } =
      GeometryUtils.createInterleavedPlane({
        width: 1,
        height: 1,
      })
    const vertexBuffer = new VertexBuffer(renderer.device, {
      bindPointIdx: 0,
      typedArray: interleavedArray,
      stride: vertexStride * Float32Array.BYTES_PER_ELEMENT,
    })
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
    const indexBuffer = new IndexBuffer(renderer.device, {
      typedArray: indicesArray,
    })
    debugPlaneGeometry.addVertexBuffer(vertexBuffer).addIndexBuffer(indexBuffer)
  }
  const debugShadowMesh = new Mesh(renderer.device, {
    // debugVertexShader: true,
    // debugFragmentShader: true,
    geometry: debugPlaneGeometry,
    ubos: [],
    samplers: [renderer.depthDebugSampler],
    textures: [renderer.shadowDepthTexture],
    vertexShaderSource: {
      main: `
        output.Position = vec4(input.position, 1.0);
        output.uv = input.uv;
      `,
    },
    fragmentShaderSource: {
      head: `
        fn LinearizeDepth(depth: f32) -> f32 {
            let z = depth * 2.0 - 1.0; // Back to NDC 
            let near_plane = 0.1;
            let far_plane = 40.0;
            return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
        }
      `,
      main: `
        let depth: f32 = textureSample(
          shadowDepthTexture,
          depthDebugSampler,
          vec2(input.uv.x, input.uv.y)
        );
        output.Color = vec4(vec3(depth), 1.0);
        // output.Color = vec4(vec3(LinearizeDepth(depth)), 1.0);

        // output.Color = vec4(input.uv, 0.0, 1.0);
      `,
    },

    multisample: {
      count: SAMPLE_COUNT,
    },
    targets: [
      {
        format: 'bgra8unorm',
      },
    ],
  })

  requestAnimationFrame(renderFrame)

  function renderFrame(time: DOMHighResTimeStamp) {
    time /= 1000
    const dt = time - oldTime
    oldTime = time

    requestAnimationFrame(renderFrame)

    renderer.viewUBO
      .updateUniform('matrix', perspCamera.viewMatrix as Float32Array)
      .updateUniform('time', new Float32Array([time]))
      .updateUniform('position', new Float32Array(perspCamera.position))
    renderer.shadowViewUBO
      .updateUniform('matrix', shadowCamera.viewMatrix as Float32Array)
      .updateUniform('time', new Float32Array([time]))
      .updateUniform('position', new Float32Array(shadowCamera.position))

    renderer.onRender()

    const commandEncoder = renderer.device.createCommandEncoder()

    const computePass = commandEncoder.beginComputePass()
    metaballs.updateSim(computePass, time, dt)
    computePass.end()

    const shadowRenderPass = commandEncoder.beginRenderPass({
      label: 'shadow map framebuffer',
      colorAttachments: [],
      depthStencilAttachment: {
        view: renderer.shadowDepthTexture.get().createView(),
        // depthLoadOp: 'load',
        // depthClearValue: 1,
        // depthStoreOp: 'discard',

        depthLoadValue: 1.0,
        depthStoreOp: 'store',
        // stencilLoadValue: 0,
        // stencilStoreOp: 'store',
      },
    })

    shadowRoot.traverse((node) => {
      if (!(node instanceof Mesh)) {
        return
      }
      node.render(shadowRenderPass)
    })

    shadowRenderPass.end()

    const renderPass = commandEncoder.beginRenderPass({
      label: 'draw default framebuffer',
      colorAttachments: [renderer.colorAttachment],
      depthStencilAttachment: renderer.depthAndStencilAttachment,
    })

    gridHelper.render(renderPass)
    metaballs.render(renderPass)

    opaqueRoot.traverse((node) => {
      if (!(node instanceof Mesh)) {
        return
      }
      node.render(renderPass)
    })
    transparentRoot.traverse((node) => {
      if (!(node instanceof Mesh)) {
        return
      }
      node.render(renderPass)
    })

    // debugShadowMesh.render(renderPass)

    renderPass.end()

    renderer.device.queue.submit([commandEncoder.finish()])
  }
})()
