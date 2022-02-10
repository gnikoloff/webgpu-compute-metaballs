import { DEPTH_FORMAT } from './constants'
import { ProjectionUniforms, ViewUniforms } from './shaders/shared'
import WebGPURenderer from './webgpu-renderer'

export default class HelperGrid {
  renderer: WebGPURenderer

  vertexBuffer: GPUBuffer

  renderPipeline!: GPURenderPipeline

  constructor(renderer: WebGPURenderer) {
    this.renderer = renderer

    this.vertexBuffer = renderer.device.createBuffer({
      label: 'grid vertex buffer',
      size: 4 * 3 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    })
    const gridVertices = new Float32Array(this.vertexBuffer.getMappedRange())
    const gridSize = 40
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
    this.vertexBuffer.unmap()

    this.init()
  }

  async init() {
    this.renderPipeline = await this.renderer.device.createRenderPipelineAsync({
      label: 'grid render pipeline',
      layout: this.renderer.device.createPipelineLayout({
        bindGroupLayouts: [this.renderer.bindGroups.frame.getLayout()],
      }),
      vertex: {
        entryPoint: 'main',
        module: this.renderer.device.createShaderModule({
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
        module: this.renderer.device.createShaderModule({
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
            format: this.renderer.presentationFormat,
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
  }

  render(renderPass: GPURenderPassEncoder) {
    if (!this.renderPipeline) {
      return
    }
    renderPass.setPipeline(this.renderPipeline)
    // renderPass.setBindGroup(0, this.renderer.bindGroups.frame)
    this.renderer.bindGroups.frame.bind(renderPass)
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.draw(4)
  }
}
