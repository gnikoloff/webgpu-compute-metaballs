import { IVolumeSettings } from './protocol'
import MetaballRenderer from './metaball-renderer'

import WebGPURenderer from './webgpu-renderer'

import { PerspectiveCamera } from './lib/camera/perspective-camera'
import { OrthographicCamera } from './lib/camera/orthographic-camera'
import { CameraController } from './lib/camera/camera-controller'
import { Effect } from './postfx/effect'
import { DeferredPass } from './postfx/deferred-pass'
;(async () => {
  let oldTime = 0

  const adapter = await navigator.gpu?.requestAdapter()

  if (!adapter) {
    //
    return
  }

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    innerWidth / innerHeight,
    0.1,
    40,
  )
    .setPosition({ x: 0, y: 5, z: -4 })
    .lookAt({ x: 0, y: 1, z: 0 })

  // const shadowCamera = new OrthographicCamera(-50, 50, -50, 50, -100, 100)
  //   .setPosition({ x: -4.1, y: 40, z: 0 })
  //   .lookAt({ x: 0, y: 0, z: 0 })

  // const screenOrthoCamera = new OrthographicCamera(-2, 2, 2, -2, 0, 2)
  //   .setPosition({ x: 0, y: 0, z: 1 })
  //   .lookAt({ x: 0, y: 0, z: 0 })
  //   .updateViewMatrix()

  // console.log(screenOrthoCamera)

  new CameraController(perspCamera, document.body, true, 0.1).lookAt([0, 1, 0])

  console.log(perspCamera)

  const renderer = new WebGPURenderer(adapter)
  renderer.devicePixelRatio = devicePixelRatio
  renderer.outputSize = [innerWidth, innerHeight]
  document.body.appendChild(renderer.canvas)

  await renderer.init()

  renderer.device.queue.writeBuffer(
    renderer.ubos.projectionUBO,
    0,
    perspCamera.projectionMatrix as Float32Array,
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.projectionUBO,
    16 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array([innerWidth, innerHeight]),
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.projectionUBO,
    16 * Float32Array.BYTES_PER_ELEMENT + 8 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array([perspCamera.near]),
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.projectionUBO,
    16 * Float32Array.BYTES_PER_ELEMENT +
      8 * Float32Array.BYTES_PER_ELEMENT +
      1 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array([perspCamera.far]),
  )

  renderer.device.queue.writeBuffer(
    renderer.ubos.viewUBO,
    0 * Float32Array.BYTES_PER_ELEMENT,
    perspCamera.viewMatrix as Float32Array,
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.viewUBO,
    16 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array(perspCamera.position),
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.viewUBO,
    16 * Float32Array.BYTES_PER_ELEMENT + 4 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array([0]),
  )

  // renderer.device.queue.writeBuffer(
  //   renderer.ubos.screenProjectionUBO,
  //   0 * Float32Array.BYTES_PER_ELEMENT,
  //   screenOrthoCamera.projectionMatrix as Float32Array,
  // )

  // renderer.device.queue.writeBuffer(
  //   renderer.ubos.screenViewUBO,
  //   0 * Float32Array.BYTES_PER_ELEMENT,
  //   screenOrthoCamera.viewMatrix as Float32Array,
  // )

  const volume: IVolumeSettings = {
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

  // const gridHelper = new HelperGrid(renderer)
  // const gltfModel = new GLTFModel(renderer)

  // debug shadow map
  // const debugShadowMesh = new ShadowMapDebugger(renderer)
  //   .setPosition({
  //     x: innerWidth / 2 - ShadowMapDebugger.OUTPUT_SIZE / 2,
  //     y: -innerHeight / 2 + ShadowMapDebugger.OUTPUT_SIZE / 2,
  //   })
  //   .updateWorldMatrix()

  // GBuffer
  // const deferredPass = new DeferredPass(renderer)

  const deferredPass = new DeferredPass(renderer)

  requestAnimationFrame(renderFrame)

  function renderFrame(time: DOMHighResTimeStamp) {
    time /= 1000
    const dt = time - oldTime
    oldTime = time

    requestAnimationFrame(renderFrame)

    renderer.device.queue.writeBuffer(
      renderer.ubos.viewUBO,
      0 * Float32Array.BYTES_PER_ELEMENT,
      perspCamera.viewMatrix as Float32Array,
    )
    renderer.device.queue.writeBuffer(
      renderer.ubos.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array(perspCamera.position),
    )
    renderer.device.queue.writeBuffer(
      renderer.ubos.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT + 4 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([0]),
    )

    // renderer.device.queue.writeBuffer(
    //   renderer.ubos.screenProjectionUBO,
    //   0 * Float32Array.BYTES_PER_ELEMENT,
    //   screenOrthoCamera.projectionMatrix as Float32Array,
    // )
    renderer.onRender()

    const commandEncoder = renderer.device.createCommandEncoder()

    const computePass = commandEncoder.beginComputePass()
    metaballs.updateSim(computePass, time, dt)
    computePass.end()

    // const shadowRenderPass = commandEncoder.beginRenderPass({
    //   label: 'shadow map framebuffer',
    //   colorAttachments: [],
    //   depthStencilAttachment: {
    //     view: renderer.shadowDepthTexture.createView(),
    //     depthLoadOp: 'clear',
    //     depthStoreOp: 'store',
    //   },
    // })

    // shadowRenderPass.end()

    const gBufferPass = commandEncoder.beginRenderPass({
      ...deferredPass.framebufferDescriptor,
      label: 'gbuffer',
    })
    metaballs.render(gBufferPass)

    gBufferPass.end()

    const renderPass = commandEncoder.beginRenderPass({
      label: 'draw default framebuffer',
      colorAttachments: [renderer.colorAttachment],
    })

    deferredPass.render(renderPass)

    renderPass.end()

    renderer.device.queue.submit([commandEncoder.finish()])
  }
})()
