import * as dat from 'dat.gui'

import { IVolumeSettings, QualitySettings } from './protocol'
import { WebGPURenderer } from './webgpu-renderer'
import { PerspectiveCamera } from './camera/perspective-camera'
import { CameraController } from './camera/camera-controller'
import { DeferredPass } from './postfx/deferred-pass'
import { BloomPass } from './postfx/bloom-pass'
import { CopyPass } from './postfx/copy-pass'
import { ResultPass } from './postfx/result-pass'

import { Metaballs } from './meshes/metaballs'
import { BoxOutline } from './meshes/box-outline'
import { Ground } from './meshes/ground'
import { Particles } from './meshes/particles'
import { getChromeVersion } from './helpers/get-chrome-version'
import { SETTINGS } from './settings'
import { PointLights } from './lighting/point-lights'
// import { ShadowDebugger } from './debug/shadow-debugger'

let oldTime = 0
let rAf

document.addEventListener('DOMContentLoaded', initApp)

function initApp() {
  const isChrome = getChromeVersion() > -1
  const hasWebGPU = !!navigator.gpu
  if (!isChrome) {
    showChromeOnlyWarning()
  }
  if (!hasWebGPU) {
    showChromeOnlyWarning(true, false)
  }
  const parser = new URL((window as any).location)
  const qualityParam = parser.searchParams.get('quality')
  const quality = parseInt(qualityParam, 10)
  if (
    quality === QualitySettings.LOW ||
    quality === QualitySettings.MEDIUM ||
    quality === QualitySettings.HIGH
  ) {
    const $qualityChooserWrapper = document.getElementById('quality-chooser')
    $qualityChooserWrapper.parentNode.removeChild($qualityChooserWrapper)
    SETTINGS.quality = quality
    parser.searchParams.delete('quality')

    window.history.pushState({}, '', parser)
    startDemo()
  } else {
    initQualitySelectionUI()
  }
}

function initQualitySelectionUI() {
  const $qualityChooserWrapper = document.getElementById('quality-chooser')
  const $qualityButtonsWrapper = document.getElementById(
    'quality-buttons-wrapper',
  )
  $qualityButtonsWrapper.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.nodeName === 'BUTTON') {
      const qualityAttrib = target.getAttribute('data-quality')
      const quality = parseInt(qualityAttrib) as QualitySettings
      SETTINGS.quality = quality

      startDemo()
      $qualityChooserWrapper.parentNode.removeChild($qualityChooserWrapper)
    }
  })
}

async function startDemo() {
  // initDATGui()
  const adapter = await navigator.gpu?.requestAdapter()

  if (!adapter) {
    //
    return
  }

  const renderer = new WebGPURenderer(adapter)
  renderer.devicePixelRatio = devicePixelRatio
  renderer.outputSize = [
    innerWidth * SETTINGS.qualityLevel.outputScale,
    innerHeight * SETTINGS.qualityLevel.outputScale,
  ]
  document.body.appendChild(renderer.canvas)

  const perspCamera = new PerspectiveCamera(
    (45 * Math.PI) / 180,
    innerWidth / innerHeight,
    0.1,
    100,
  )
    .setPosition({ x: 10, y: 2, z: 16 })
    .lookAt({ x: 0, y: 0, z: 0 })

  new CameraController(perspCamera, renderer.canvas, false, 0.1).lookAt([
    0, 1, 0,
  ])

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
    depth: 80,

    xStep: 0.075,
    yStep: 0.075,
    zStep: 0.075,

    isoLevel: 20,
  }

  const deferredPass = new DeferredPass(renderer)
  const copyPass = new CopyPass(renderer)

  let bloomPass: BloomPass

  if (SETTINGS.qualityLevel.bloomToggle) {
    bloomPass = new BloomPass(renderer, copyPass)
  }
  const resultPass = new ResultPass(renderer, copyPass, bloomPass)

  const metaballs = new Metaballs(renderer, volume, deferredPass.spotLight)
  const ground = new Ground(renderer, deferredPass.spotLight)
  const boxOutline = new BoxOutline(renderer)
  const particles = new Particles(
    renderer,
    deferredPass.pointLights.lightsBuffer,
  )

  const gui = new dat.GUI()
  const settings = SETTINGS.qualityLevel
  gui
    .add(settings, 'pointLightsCount', 0, PointLights.MAX_LIGHTS_COUNT, 1)
    .listen()
    .onChange((v: number) => {
      deferredPass.pointLights.lightsCount = v
    })
  gui
    .add(SETTINGS, 'quality', { Low: 0, Medium: 1, High: 2 })
    .listen()
    .onChange((v: number) => {
      const parser = new URL((window as any).location)
      parser.searchParams.set('quality', v.toString())
      ;(window as any).location = parser.href
    })

  setInterval(() => {
    const commandEncoder = renderer.device.createCommandEncoder()

    // ## Run compute shaders
    const computePass = commandEncoder.beginComputePass()
    metaballs.updateSim(computePass, performance.now() / 1000, 0.0167)
    computePass.end()
  }, 2000)
  setInterval(rearrange, 5000)
  addEventListener('focus', onWindowFocus)
  addEventListener('blur', onWindowBlur)
  rAf = requestAnimationFrame(renderFrame)

  function rearrange() {
    deferredPass.rearrange()
    metaballs.rearrange()
  }

  function onWindowBlur() {
    cancelAnimationFrame(rAf)
  }

  function onWindowFocus() {
    rAf = requestAnimationFrame(renderFrame)
  }

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

    // ## Run compute shaders
    const computePass = commandEncoder.beginComputePass()
    if (SETTINGS.qualityLevel.updateMetaballs) {
      metaballs.updateSim(computePass, time, dt)
    } else {
      if (!metaballs.hasUpdatedAtLeastOnce) {
        metaballs.updateSim(computePass, time, dt)
      }
    }

    deferredPass.updateLightsSim(computePass, time, dt)
    if (bloomPass) {
      bloomPass.updateBloom(computePass)
    }
    computePass.end()

    // ## Render scene from spot light POV
    const spotLightShadowPass = commandEncoder.beginRenderPass({
      ...deferredPass.spotLight.framebufferDescriptor,
      label: 'spot light 0 shadow map render pass',
    })
    metaballs.renderShadow(spotLightShadowPass)
    ground.renderShadow(spotLightShadowPass)
    spotLightShadowPass.end()

    // ## Deferred pass
    const gBufferPass = commandEncoder.beginRenderPass({
      ...deferredPass.framebufferDescriptor,
      label: 'gbuffer',
    })
    metaballs.render(gBufferPass)
    boxOutline.render(gBufferPass)
    ground.render(gBufferPass)
    particles.render(gBufferPass)

    gBufferPass.end()

    // ## Bloom pass
    if (SETTINGS.qualityLevel.bloomToggle) {
      // ## Copy pass
      const copyRenderPass = commandEncoder.beginRenderPass({
        ...copyPass.framebufferDescriptor,
        label: 'copy pass',
      })

      deferredPass.render(copyRenderPass)

      copyRenderPass.end()

      const bloomRenderPass = commandEncoder.beginRenderPass({
        ...bloomPass.framebufferDescriptor,
        label: 'bloom pass',
      })

      bloomPass.render(bloomRenderPass)

      bloomRenderPass.end()

      // ## Final composite pass
      const renderPass = commandEncoder.beginRenderPass({
        label: 'draw default framebuffer',
        colorAttachments: [renderer.colorAttachment],
      })

      resultPass.render(renderPass)

      renderPass.end()
    } else {
      // ## Final composite pass
      const renderPass = commandEncoder.beginRenderPass({
        label: 'draw default framebuffer',
        colorAttachments: [renderer.colorAttachment],
      })

      deferredPass.render(renderPass)

      renderPass.end()
    }

    renderer.device.queue.submit([commandEncoder.finish()])
  }
}

function showChromeOnlyWarning(isChrome = false, hasWebGPU = true) {
  const $warningWrapper = document.getElementById('chrome-warning')
  const $nonChromeMessage = document.getElementById('non-chrome-text')
  const $outdatedChromeMessage = document.getElementById('outdated-chrome-text')

  $warningWrapper.style.setProperty('display', 'block')

  if (!isChrome) {
    $nonChromeMessage.style.removeProperty('display')
    throw new Error('Demo runs on up-to-date chromium browsers only!')
  }
  if (!hasWebGPU) {
    $outdatedChromeMessage.style.removeProperty('display')
    throw new Error('Demo runs on up-to-date chromium browsers only!')
  }
}
