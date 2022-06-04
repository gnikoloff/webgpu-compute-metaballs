import { mat4 } from 'gl-matrix'
import { DEPTH_FORMAT } from '../constants'
import { BoxIndices, BoxInterleavedData } from '../geometry-helper-data'
import { GroundFragmentShader, GroundVertexShader } from '../shaders/ground'
import { WebGPURenderer } from '../webgpu-renderer'

export class Ground {
  private static readonly WORLD_Y = -7.5
  private static readonly WIDTH = 100
  private static readonly HEIGHT = 100
  private static readonly COUNT = 100
  private static readonly SPACING = 0

  private renderPipeline: GPURenderPipeline
  private modelBindGroupLayout: GPUBindGroupLayout
  private modelBindGroup: GPUBindGroup
  private vertexBuffer: GPUBuffer
  private indexBuffer: GPUBuffer
  private instanceBuffer: GPUBuffer
  private uniformBuffer: GPUBuffer

  private instanceCount = 0
  private readonly modelMatrix = mat4.create()

  constructor(private renderer: WebGPURenderer) {
    this.vertexBuffer = renderer.device.createBuffer({
      size: BoxInterleavedData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      label: 'ground interleaved buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.vertexBuffer.getMappedRange()).set(BoxInterleavedData)
    this.vertexBuffer.unmap()

    this.indexBuffer = renderer.device.createBuffer({
      size: BoxIndices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      label: 'ground index buffer',
      mappedAtCreation: true,
    })
    new Uint16Array(this.indexBuffer.getMappedRange()).set(BoxIndices)
    this.indexBuffer.unmap()

    const instanceOffsets = new Float32Array(Ground.WIDTH * Ground.HEIGHT * 3)

    const spacingX = Ground.WIDTH / Ground.COUNT + Ground.SPACING
    const spacingY = Ground.HEIGHT / Ground.COUNT + Ground.SPACING

    for (let x = 0, i = 0; x < Ground.COUNT; x++) {
      for (let y = 0; y < Ground.COUNT; y++) {
        const xPos = x * spacingX
        const yPos = y * spacingY
        instanceOffsets[i * 3 + 0] = xPos - Ground.WIDTH / 2
        instanceOffsets[i * 3 + 1] = yPos - Ground.HEIGHT / 2
        instanceOffsets[i * 3 + 2] = Math.random() * 3 + 1
        i++
      }
    }
    this.instanceCount = instanceOffsets.length / 3

    this.instanceBuffer = renderer.device.createBuffer({
      size: instanceOffsets.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      label: 'ground instance buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.instanceBuffer.getMappedRange()).set(instanceOffsets)
    this.instanceBuffer.unmap()

    mat4.translate(this.modelMatrix, this.modelMatrix, [0, Ground.WORLD_Y, 0])
    this.uniformBuffer = renderer.device.createBuffer({
      size: 16 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'ground uniform buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.uniformBuffer.getMappedRange()).set(this.modelMatrix)
    this.uniformBuffer.unmap()

    this.modelBindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'ground bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    })

    this.modelBindGroup = renderer.device.createBindGroup({
      label: 'ground bind group',
      layout: this.modelBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer },
        },
      ],
    })

    this.init()
  }

  async init() {
    this.renderPipeline = await this.renderer.device.createRenderPipelineAsync({
      label: 'ground render pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'ground render pipeline layout',
        bindGroupLayouts: [
          this.renderer.bindGroupsLayouts.frame,
          this.modelBindGroupLayout,
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
            arrayStride: 6 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 0,
                format: 'float32x3',
                offset: 0 * Float32Array.BYTES_PER_ELEMENT,
              },
              {
                shaderLocation: 1,
                format: 'float32x3',
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
              },
            ],
          },
          {
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            stepMode: 'instance',
            attributes: [
              {
                shaderLocation: 2,
                format: 'float32x3',
                offset: 0,
              },
            ],
          },
        ],
        module: this.renderer.device.createShaderModule({
          code: GroundVertexShader,
        }),
      },
      fragment: {
        entryPoint: 'main',
        module: this.renderer.device.createShaderModule({
          code: GroundFragmentShader,
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
    renderPass.setBindGroup(1, this.modelBindGroup)
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.setVertexBuffer(1, this.instanceBuffer)
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16')
    renderPass.drawIndexed(36, this.instanceCount)
  }
}
