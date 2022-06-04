import { DEPTH_FORMAT } from '../constants'
import {
  BoxOutlineFragmentShader,
  BoxOutlineVertexShader,
} from '../shaders/box-outline'
import { WebGPURenderer } from '../webgpu-renderer'

export class BoxOutline {
  private vertexBuffer: GPUBuffer
  private indexBuffer: GPUBuffer

  private renderPipeline: GPURenderPipeline

  constructor(private renderer: WebGPURenderer) {
    // prettier-ignore
    const vertices = new Float32Array([
			-1, -1, -1,
			 1, -1, -1,
			 1,  1, -1,
			-1,  1, -1,
			-1, -1, -1,
			-1, -1,  1,
			-1,  1,  1,
			-1,  1, -1,
			-1,  1,  1,
			 1,  1,  1,
			 1,  1, -1,
			 1,  1,  1,
			 1, -1,  1,
			-1, -1,  1,
			 1, -1,  1,
			 1, -1, -1,
		].map(a => a * 2.5))
    const indices = new Uint16Array([...new Array(16).fill(0).map((_, i) => i)])

    this.vertexBuffer = renderer.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      label: 'box outline vertex buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices)
    this.vertexBuffer.unmap()

    this.indexBuffer = renderer.device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      label: 'box outline index buffer',
      mappedAtCreation: true,
    })
    new Uint16Array(this.indexBuffer.getMappedRange()).set(indices)
    this.indexBuffer.unmap()

    this.init()
  }

  async init() {
    this.renderPipeline = await this.renderer.device.createRenderPipelineAsync({
      label: 'box outline render pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'box outline render pipeline layout',
        bindGroupLayouts: [this.renderer.bindGroupsLayouts.frame],
      }),
      primitive: {
        topology: 'line-strip',
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
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 0,
                format: 'float32x3',
                offset: 0,
              },
            ],
          },
        ],
        module: this.renderer.device.createShaderModule({
          code: BoxOutlineVertexShader,
        }),
      },
      fragment: {
        entryPoint: 'main',
        module: this.renderer.device.createShaderModule({
          code: BoxOutlineFragmentShader,
        }),
        targets: [
          { format: 'rgba32float' },
          // normal
          { format: 'rgba32float' },
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
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16')
    renderPass.drawIndexed(16)
  }
}
