import HelperGrid from './helper-grid'
import { VolumeSettings } from './interfaces'
import { PerspectiveCamera, CameraController } from './lib/hwoa-rang-gpu'
import MetaballRenderer from './metaball-renderer'
import Spaceship from './spaceship'

import WebGPURenderer from './webgpu-renderer'
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
    20,
  )
    .setPosition({ x: 5, y: 5, z: 5 })
    .lookAt([0, 0, 0])
    .updateViewMatrix()
    .updateProjectionMatrix()

  new CameraController(perspCamera, document.body, false, 0.1).lookAt([
    0, 0.5, 0,
  ])

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
  renderer.viewUBO
    .updateUniform('matrix', perspCamera.viewMatrix as Float32Array)
    .updateUniform('position', new Float32Array(perspCamera.position))

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
  const gridHelper = new HelperGrid(renderer)
  const spaceship = new Spaceship(renderer)

  requestAnimationFrame(renderFrame)

  function renderFrame(time: DOMHighResTimeStamp) {
    time /= 1000
    const dt = time - oldTime
    oldTime = time

    requestAnimationFrame(renderFrame)

    renderer.viewUBO.updateUniform(
      'matrix',
      perspCamera.viewMatrix as Float32Array,
    )
    renderer.viewUBO.updateUniform('time', new Float32Array([time]))

    renderer.onRender()

    const commandEncoder = renderer.device.createCommandEncoder()

    const computePass = commandEncoder.beginComputePass()
    metaballs.updateSim(computePass, time, dt)
    computePass.endPass()

    const renderPass = commandEncoder.beginRenderPass({
      label: 'draw default framebuffer',
      colorAttachments: [renderer.colorAttachment],
      depthStencilAttachment: renderer.depthAndStencilAttachment,
    })

    gridHelper.render(renderPass)
    metaballs.render(renderPass)
    spaceship.update(time).render(renderPass)

    renderPass.endPass()

    renderer.device.queue.submit([commandEncoder.finish()])
  }
})()
