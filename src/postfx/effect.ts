import { WebGPURenderer } from '../webgpu-renderer'
import { EffectVertexShader } from '../shaders/shared-chunks'
import { IScreenEffect } from '../protocol'

export class Effect {
  protected renderPipeline: GPURenderPipeline

  private bindGroups: GPUBindGroup[] = []

  private vertexBuffer: GPUBuffer
  private indexBuffer: GPUBuffer

  constructor(
    protected renderer: WebGPURenderer,
    { fragmentShader, bindGroupLayouts = [], bindGroups = [] }: IScreenEffect,
  ) {
    this.renderer = renderer
    this.bindGroups = bindGroups

    // prettier-ignore
    const interleavedData = new Float32Array([
			// pos   // uv
			-1,  1,  0.0, 1.0,
			-1, -1,  0.0, 0.0,
			 1, -1,  1.0, 1.0,
			 1,  1,  1.0, 0.0,
		])
    // prettier-ignore
    const indices = new Uint16Array([
			3, 2, 1,
			3, 1, 0
    ])
    this.vertexBuffer = renderer.device.createBuffer({
      size: interleavedData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      label: 'fullscreen effect vertex buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.vertexBuffer.getMappedRange()).set(interleavedData)
    this.vertexBuffer.unmap()

    this.indexBuffer = renderer.device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      label: 'fullscreen effect index buffer',
      mappedAtCreation: true,
    })
    new Uint16Array(this.indexBuffer.getMappedRange()).set(indices)
    this.indexBuffer.unmap()

    this.init(fragmentShader, bindGroupLayouts)
  }
  async init(fragmentShader: string, bindGroupLayouts: GPUBindGroupLayout[]) {
    this.renderPipeline = await this.renderer.device.createRenderPipeline({
      label: 'fullscreen effect render pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'fullscreen effect render pipeline layout',
        bindGroupLayouts: [...bindGroupLayouts],
      }),
      primitive: {
        topology: 'triangle-strip',
        stripIndexFormat: 'uint16',
      },
      vertex: {
        entryPoint: 'main',
        buffers: [
          {
            arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 0,
                format: 'float32x2',
                offset: 0 * Float32Array.BYTES_PER_ELEMENT,
              },
              {
                shaderLocation: 1,
                format: 'float32x2',
                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
              },
            ],
          },
        ],
        module: this.renderer.device.createShaderModule({
          code: EffectVertexShader,
        }),
      },
      fragment: {
        entryPoint: 'main',
        module: this.renderer.device.createShaderModule({
          code: fragmentShader,
        }),
        targets: [{ format: this.renderer.presentationFormat }],
      },
    })
  }

  protected preRender(renderPass: GPURenderPassEncoder): void {
    if (!this.renderPipeline) {
      return
    }
    renderPass.setPipeline(this.renderPipeline)
    for (let i = 0; i < this.bindGroups.length; i++) {
      renderPass.setBindGroup(i, this.bindGroups[i])
    }
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16')
  }
}
