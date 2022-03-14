import HelperGrid from './helper-grid'
import { VolumeSettings } from './interfaces'
import { PerspectiveCamera, CameraController } from './lib/hwoa-rang-gpu'
import MetaballRenderer from './metaball-renderer'
import GLTFModel from './gltf-model'
import FireEmitter from './fire-emitter'

import WebGPURenderer from './webgpu-renderer'

const FIRE_EMITTERS = [
  {
    pos: { x: 2.6, y: 1.9, z: -7.5 },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  },
  {
    pos: { x: -2.8, y: 1.9, z: -7.5 },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  },
  {
    pos: { x: 2.6, y: 1.9, z: 9.4 },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  },
  {
    pos: { x: -2.8, y: 1.9, z: 9.4 },
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
  metaballs.setPosition({ y: 2 })
  const gridHelper = new HelperGrid(renderer)
  const gltfModel = new GLTFModel(renderer)
  const fireEmitters: FireEmitter[] = []
  for (let i = 0; i < FIRE_EMITTERS.length; i++) {
    const fireEmitter = new FireEmitter(renderer)
    const { pos, scale } = FIRE_EMITTERS[i]
    fireEmitter.setPosition(pos).setScale(scale).updateWorldMatrix()
    fireEmitters.push(fireEmitter)
  }

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
    renderer.viewUBO
      .updateUniform('time', new Float32Array([time]))
      .updateUniform('position', new Float32Array(perspCamera.position))

    renderer.onRender()

    const commandEncoder = renderer.device.createCommandEncoder()

    const computePass = commandEncoder.beginComputePass()
    metaballs.updateSim(computePass, time, dt)
    computePass.end()

    const renderPass = commandEncoder.beginRenderPass({
      label: 'draw default framebuffer',
      colorAttachments: [renderer.colorAttachment],
      depthStencilAttachment: renderer.depthAndStencilAttachment,
    })

    gridHelper.render(renderPass)
    metaballs.render(renderPass)
    gltfModel.update(time, 0).render(renderPass)
    fireEmitters.forEach((fireEmitter) => fireEmitter.render(renderPass))

    renderPass.end()

    renderer.device.queue.submit([commandEncoder.finish()])
  }
})()
