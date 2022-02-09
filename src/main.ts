import { DEPTH_FORMAT } from './constants'
import { VolumeSettings } from './interfaces'
import { PerspectiveCamera, CameraController } from './lib/hwoa-rang-gpu'
import MetaballRenderer from './metaball-renderer'
import { ProjectionUniforms, ViewUniforms } from './shaders/metaball'

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
    yMin: 0,
    zMin: -1.75,
    width: 75,
    height: 70,
    depth: 75,
    xStep: 0.05,
    yStep: 0.05,
    zStep: 0.05,
    isoLevel: 80,
  }

  const metaballs = new MetaballRenderer(renderer, volume)

  const gridVertexBuffer = renderer.device.createBuffer({
    label: 'grid vertex buffer',
    size: 4 * 3 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  })
  const gridVertices = new Float32Array(gridVertexBuffer.getMappedRange())
  const gridSize = 10
  gridVertices[0] = -gridSize / 2
  gridVertices[1] = 0
  gridVertices[2] = 0

  gridVertices[3] = gridSize / 2
  gridVertices[4] = 0
  gridVertices[5] = 0

  gridVertices[6] = 0
  gridVertices[7] = 0
  gridVertices[8] = -gridSize / 2

  gridVertices[9] = 0
  gridVertices[10] = 0
  gridVertices[11] = gridSize / 2
  gridVertexBuffer.unmap()

  const gridRenderPipeline = await renderer.device.createRenderPipelineAsync({
    label: 'grid render pipeline',
    layout: renderer.device.createPipelineLayout({
      bindGroupLayouts: [renderer.bindGroupLayouts.frame],
    }),
    vertex: {
      entryPoint: 'main',
      module: renderer.device.createShaderModule({
        label: 'grid vertex shader',
        code: `
          ${ProjectionUniforms}
          ${ViewUniforms}

          struct Inputs {
            @location(0) position: vec3<f32>;
          }

          struct VertexOutput {
            @builtin(position) position: vec4<f32>;
          }

          @stage(vertex)
          fn main(input: Inputs) -> VertexOutput {
            var output: VertexOutput;
            output.position = projection.matrix * view.matrix * vec4<f32>(input.position, 1.0);
            return output;
          }
        `,
      }),
      buffers: [
        {
          arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              format: 'float32x3',
              offset: 0,
              shaderLocation: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: renderer.device.createShaderModule({
        label: 'grid fragment shader',
        code: `
          struct Output {
            @location(0) Color: vec4<f32>;
          }
          @stage(fragment)
          fn main() -> Output {
            var output: Output;
            output.Color = vec4<f32>(1.0, 1.0, 1.0, 1.0);
            return output;
          }
        `,
      }),
      entryPoint: 'main',
      targets: [
        {
          format: renderer.presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'line-list',
    },
    depthStencil: {
      format: DEPTH_FORMAT,
      depthWriteEnabled: true,
      depthCompare: 'less',
    },
    multisample: {
      count: 4,
    },
  })

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

    renderPass.setPipeline(gridRenderPipeline)
    renderPass.setBindGroup(0, renderer.bindGroups.frame)
    renderPass.setVertexBuffer(0, gridVertexBuffer)
    renderPass.draw(4)

    metaballs.render(renderPass)

    renderPass.endPass()

    renderer.device.queue.submit([commandEncoder.finish()])
  }
})()
