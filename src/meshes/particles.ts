import { PointLightsCompute } from '../compute/point-lights'
import { DEPTH_FORMAT } from '../constants'
import {
  ParticlesFragmentShader,
  ParticlesVertexShader,
} from '../shaders/particles'
import { WebGPURenderer } from '../webgpu-renderer'

export class Particles {
  private renderPipeline: GPURenderPipeline
  private vertexBuffer: GPUBuffer
  private indexBuffer: GPUBuffer

  private bindGroupLayout: GPUBindGroupLayout
  private bindGroup: GPUBindGroup

  private instanceCount = PointLightsCompute.MAX_LIGHTS_COUNT

  constructor(
    private renderer: WebGPURenderer,
    private lightsBuffer: GPUBuffer,
  ) {
    // prettier-ignore
    const vertexData = new Float32Array([
			-1,  1,
			-1, -1,
			 1, -1,
			 1,  1,
		])
    // prettier-ignore
    const indices = new Uint16Array([
			3, 2, 1,
			3, 1, 0
    ])

    this.vertexBuffer = renderer.device.createBuffer({
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      label: 'particles vertex buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData)
    this.vertexBuffer.unmap()

    this.indexBuffer = renderer.device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      label: 'particles index buffer',
      mappedAtCreation: true,
    })
    new Uint16Array(this.indexBuffer.getMappedRange()).set(indices)
    this.indexBuffer.unmap()

    this.bindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'particles bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
          buffer: {
            type: 'read-only-storage',
          },
        },
      ],
    })
    this.bindGroup = renderer.device.createBindGroup({
      label: 'particles bind group',
      layout: this.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.lightsBuffer,
          },
        },
      ],
    })

    this.init()
  }

  async init() {
    this.renderPipeline = await this.renderer.device.createRenderPipelineAsync({
      label: 'particles render pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'particles render pipeline layout',
        bindGroupLayouts: [
          this.renderer.bindGroupsLayouts.frame,
          this.bindGroupLayout,
        ],
      }),
      primitive: {
        topology: 'triangle-strip',
        stripIndexFormat: 'uint16',
      },
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
      vertex: {
        entryPoint: 'main',
        buffers: [
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 0,
                format: 'float32x2',
                offset: 0,
              },
            ],
          },
        ],
        module: this.renderer.device.createShaderModule({
          code: ParticlesVertexShader,
        }),
      },
      fragment: {
        entryPoint: 'main',
        module: this.renderer.device.createShaderModule({
          code: ParticlesFragmentShader,
        }),
        targets: [
          // normal + material id
          { format: 'rgba16float' },
          // albedo
          {
            format: 'bgra8unorm',
          },
        ],
      },
    })
  }

  public render(renderPass: GPURenderPassEncoder): void {
    if (!this.renderPipeline) {
      return
    }
    renderPass.setPipeline(this.renderPipeline)
    renderPass.setBindGroup(0, this.renderer.bindGroups.frame)
    renderPass.setBindGroup(1, this.bindGroup)

    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16')

    renderPass.drawIndexed(6, this.instanceCount)
  }
}
