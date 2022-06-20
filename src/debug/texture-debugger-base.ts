import { EffectVertexShader } from '../shaders/shared-chunks'
import { WebGPURenderer } from '../webgpu-renderer'

export class TextureDebuggerBase {
  protected renderPipeline: GPURenderPipeline
  protected bindGroupLayouts: { [key: string]: GPUBindGroupLayout } = {}
  protected bindGroups: { [key: string]: GPUBindGroup } = {}

  private vertexBuffer: GPUBuffer
  private indexBuffer: GPUBuffer

  constructor(protected renderer: WebGPURenderer) {
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
      label: 'texture debugger vertex buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData)
    this.vertexBuffer.unmap()

    this.indexBuffer = renderer.device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      label: 'texture debugger index buffer',
      mappedAtCreation: true,
    })
    new Uint16Array(this.indexBuffer.getMappedRange()).set(indices)
    this.indexBuffer.unmap()
  }

  async init(fragmentShader: string) {
    const bindGroupLayouts = []
    for (const bindGroupLayout of Object.values(this.bindGroupLayouts)) {
      bindGroupLayouts.push(bindGroupLayout)
    }
    this.renderPipeline = await this.renderer.device.createRenderPipeline({
      label: 'texture debugger render pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'texture debugger render pipeline layout',
        bindGroupLayouts,
      }),
      primitive: {
        topology: 'triangle-strip',
        stripIndexFormat: 'uint16',
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
                offset: 0 * Float32Array.BYTES_PER_ELEMENT,
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
    let i = 0
    for (const bindGroup of Object.values(this.bindGroups)) {
      renderPass.setBindGroup(i, bindGroup)
      i++
    }
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16')
  }
}
