import { IVolumeSettings } from './protocol'
import { WebGPURenderer } from './webgpu-renderer'
import { PerspectiveCamera } from './camera/perspective-camera'
import { CameraController } from './camera/camera-controller'
import { DeferredPass } from './postfx/deferred-pass'

import { Metaballs } from './meshes/metaballs'
import { BoxOutline } from './meshes/box-outline'
import { Ground } from './meshes/ground'
import { Particles } from './meshes/particles'
import { ShadowDebugger } from './debug/shadow-debugger'
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
    100,
  )
    .setPosition({ x: 10, y: 5, z: -12 })
    .lookAt({ x: 0, y: 0, z: 0 })

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
    perspCamera.projectionInvMatrix as Float32Array,
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.projectionUBO,
    16 * Float32Array.BYTES_PER_ELEMENT + 16 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array(renderer.outputSize),
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.projectionUBO,
    16 * Float32Array.BYTES_PER_ELEMENT +
      16 * Float32Array.BYTES_PER_ELEMENT +
      8 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array([perspCamera.near]),
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.projectionUBO,
    16 * Float32Array.BYTES_PER_ELEMENT +
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
    perspCamera.viewInvMatrix as Float32Array,
  )
  renderer.device.queue.writeBuffer(
    renderer.ubos.viewUBO,
    16 * Float32Array.BYTES_PER_ELEMENT + 16 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array(perspCamera.position),
  )

  const volume: IVolumeSettings = {
    xMin: -3,
    yMin: -3,
    zMin: -3,

    width: 100,
    height: 100,
    depth: 75,

    xStep: 0.075,
    yStep: 0.075,
    zStep: 0.075,

    isoLevel: 200,
  }

  const deferredPass = new DeferredPass(renderer)
  const metaballs = new Metaballs(renderer, volume, deferredPass.spotLight)
  const ground = new Ground(renderer, deferredPass.spotLight)
  const boxOutline = new BoxOutline(renderer)
  const particles = new Particles(
    renderer,
    deferredPass.pointLights.lightsBuffer,
  )
  const spotLightShadowDebugger = new ShadowDebugger(
    renderer,
    deferredPass.spotLight,
  )

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
      perspCamera.viewInvMatrix as Float32Array,
    )
    renderer.device.queue.writeBuffer(
      renderer.ubos.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT + 16 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array(perspCamera.position),
    )
    renderer.device.queue.writeBuffer(
      renderer.ubos.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT +
        16 * Float32Array.BYTES_PER_ELEMENT +
        3 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([time]),
    )
    renderer.device.queue.writeBuffer(
      renderer.ubos.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT +
        16 * Float32Array.BYTES_PER_ELEMENT +
        3 * Float32Array.BYTES_PER_ELEMENT +
        1 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([dt]),
    )
    
    renderer.onRender()

    const commandEncoder = renderer.device.createCommandEncoder()

    const computePass = commandEncoder.beginComputePass()
    metaballs.updateSim(computePass, time, dt)
    deferredPass.updateLightsSim(computePass, time)
    computePass.end()

    const spotLightShadowPass = commandEncoder.beginRenderPass({
      ...deferredPass.spotLight.framebufferDescriptor,
      label: 'spot light 0 shadow map render pass',
    })

    metaballs.renderShadow(spotLightShadowPass)
    ground.renderShadow(spotLightShadowPass)

    spotLightShadowPass.end()

    const gBufferPass = commandEncoder.beginRenderPass({
      ...deferredPass.framebufferDescriptor,
      label: 'gbuffer',
    })
    metaballs.render(gBufferPass)
    boxOutline.render(gBufferPass)
    ground.render(gBufferPass)
    particles.render(gBufferPass)

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
