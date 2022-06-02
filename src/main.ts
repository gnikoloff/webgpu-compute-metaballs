import HelperGrid from './debug/helper-grid'
import { VolumeSettings } from './interfaces'
import {
  PerspectiveCamera,
  CameraController,
  SceneObject,
  Mesh,
  OrthographicCamera,
} from './lib/hwoa-rang-gpu'
import MetaballRenderer from './metaball-renderer'

import WebGPURenderer from './webgpu-renderer'
import ShadowMapDebugger from './debug/shadow-map-debugger'
import DeferredPass from './postfx/deferred-pass'
;(async () => {
  let oldTime = 0

  const adapter = await navigator.gpu?.requestAdapter()

  if (!adapter) {
    //
    return
  }

  const shadowRoot = new SceneObject()

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    innerWidth / innerHeight,
    0.1,
    40,
  )
    .setPosition({ x: 0, y: 5, z: -4 })
    .lookAt({ x: 0, y: 1, z: 0 })

  const shadowCamera = new OrthographicCamera(-50, 50, -50, 50, -100, 100)
    .setPosition({ x: -4.1, y: 40, z: 0 })
    .lookAt([0, 0, 0])

  const screenOrthoCamera = new OrthographicCamera(
    -innerWidth / 2,
    innerWidth / 2,
    innerHeight / 2,
    -innerHeight / 2,
    0,
    2,
  )
    .setPosition({ x: 0, y: 0, z: 1 })
    .lookAt([0, 0, 0])
    .updateViewMatrix()

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

  renderer.screenProjectionUBO.updateUniform(
    'matrix',
    screenOrthoCamera.projectionMatrix as Float32Array,
  )
  renderer.screenViewUBO.updateUniform(
    'matrix',
    screenOrthoCamera.viewMatrix as Float32Array,
  )

  const volume: VolumeSettings = {
    xMin: -3,
    yMin: -3,
    zMin: -3,

    width: 100,
    height: 100,
    depth: 75,

    xStep: 0.1,
    yStep: 0.1,
    zStep: 0.1,

    isoLevel: 200,
  }

  const metaballs = new MetaballRenderer(renderer, volume)
  metaballs.setPosition({ y: 2 })
  const gridHelper = new HelperGrid(renderer)
  // const gltfModel = new GLTFModel(renderer)

  // debug shadow map
  const debugShadowMesh = new ShadowMapDebugger(renderer)
    .setPosition({
      x: innerWidth / 2 - ShadowMapDebugger.OUTPUT_SIZE / 2,
      y: -innerHeight / 2 + ShadowMapDebugger.OUTPUT_SIZE / 2,
    })
    .updateWorldMatrix()

  // GBuffer
  const deferredPass = new DeferredPass(renderer)

  requestAnimationFrame(renderFrame)

  function renderFrame(time: DOMHighResTimeStamp) {
    time /= 1000
    const dt = time - oldTime
    oldTime = time

    requestAnimationFrame(renderFrame)

    // shadowCamera.setPosition({z: time}).updateViewMatrix()

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
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    })

    shadowRenderPass.end()

    const gBufferPass = commandEncoder.beginRenderPass({
      ...deferredPass.framebufferDescriptor,
      label: 'gbuffer',
    })
    metaballs.render(gBufferPass)

    gBufferPass.end()

    const renderPass = commandEncoder.beginRenderPass({
      label: 'draw default framebuffer',
      colorAttachments: [renderer.colorAttachment],
      depthStencilAttachment: renderer.depthAndStencilAttachment,
    })

    deferredPass.render(renderPass)
    debugShadowMesh.render(renderPass)
    // gridHelper.render(renderPass)

    renderPass.end()

    renderer.device.queue.submit([commandEncoder.finish()])
  }
})()
