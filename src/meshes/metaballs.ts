import { IVolumeSettings } from '../protocol'

import { DEPTH_FORMAT } from '../constants'

import {
  MetaballsFragmentShader,
  MetaballsShadowVertexShader,
  MetaballsVertexShader,
} from '../shaders/metaball'

import { WebGPURenderer } from '../webgpu-renderer'
import { MetaballsCompute } from '../compute/metaballs'
import { SpotLight } from '../lighting/spot-light'

export class Metaballs {
  private metaballsCompute: MetaballsCompute
  private renderPipeline!: GPURenderPipeline
  private renderShadowPipeline!: GPURenderPipeline

  private ubo: GPUBuffer
  private bindGroupLayout: GPUBindGroupLayout
  private bindGroup: GPUBindGroup

  private colorRGB = new Float32Array([1, 1, 1])
  private colorTargetRGB = new Float32Array([...this.colorRGB])
  private roughness = 0.3
  private roughnessTarget = this.roughness
  private metallic = 0.1
  private metallicTarget = this.metallic

  public get isReady(): boolean {
    return (
      this.metaballsCompute.isReady &&
      !!this.renderPipeline &&
      !!this.renderShadowPipeline
    )
  }

  public get hasUpdatedAtLeastOnce(): boolean {
    return this.metaballsCompute.hasCalcedOnce
  }

  constructor(
    private renderer: WebGPURenderer,
    volume: IVolumeSettings,
    private spotLight: SpotLight,
  ) {
    this.metaballsCompute = new MetaballsCompute(renderer, volume)

    this.ubo = this.renderer.device.createBuffer({
      label: 'metaballs ubo',
      mappedAtCreation: true,
      size: 5 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    new Float32Array(this.ubo.getMappedRange()).set(
      new Float32Array([1, 1, 1, 0.3, 0.1]),
    )
    this.ubo.unmap()

    this.bindGroupLayout = this.renderer.device.createBindGroupLayout({
      label: 'metaballs bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    })

    this.bindGroup = this.renderer.device.createBindGroup({
      label: 'metaballs bind group',
      layout: this.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.ubo,
          },
        },
      ],
    })

    this.init()
  }

  private async init() {
    this.renderPipeline = await this.renderer.device.createRenderPipelineAsync({
      label: 'metaball rendering pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'metaball rendering pipeline layout',
        bindGroupLayouts: [
          this.renderer.bindGroupsLayouts.frame,
          this.bindGroupLayout,
        ],
      }),
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
          {
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 1,
                format: 'float32x3',
                offset: 0,
              },
            ],
          },
        ],
        module: this.renderer.device.createShaderModule({
          code: MetaballsVertexShader,
        }),
      },
      fragment: {
        entryPoint: 'main',
        module: this.renderer.device.createShaderModule({
          code: MetaballsFragmentShader,
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
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'none',
      },
      multisample: {
        count: 1,
      },
    })

    this.renderShadowPipeline =
      await this.renderer.device.createRenderPipelineAsync({
        label: 'metaballs shadow rendering pipeline',
        layout: this.renderer.device.createPipelineLayout({
          label: 'metaballs shadow rendering pipeline layout',
          bindGroupLayouts: [this.spotLight.bindGroupLayout.ubos],
        }),
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
            code: MetaballsShadowVertexShader,
          }),
        },
        depthStencil: {
          depthWriteEnabled: true,
          depthCompare: 'less',
          format: 'depth32float',
        },
        primitive: {
          topology: 'triangle-list',
          cullMode: 'none',
        },
        multisample: {
          count: 1,
        },
      })
  }

  public rearrange() {
    this.colorTargetRGB[0] = Math.random()
    this.colorTargetRGB[1] = Math.random()
    this.colorTargetRGB[2] = Math.random()

    this.metallicTarget = 0.08 + Math.random() * 0.92
    this.roughnessTarget = 0.08 + Math.random() * 0.92

    this.metaballsCompute.rearrange()
  }

  public updateSim(
    computePass: GPUComputePassEncoder,
    time: number,
    timeDelta: number,
  ): this {
    const colorSpeed = timeDelta * 2
    this.colorRGB[0] += (this.colorTargetRGB[0] - this.colorRGB[0]) * colorSpeed
    this.colorRGB[1] += (this.colorTargetRGB[1] - this.colorRGB[1]) * colorSpeed
    this.colorRGB[2] += (this.colorTargetRGB[2] - this.colorRGB[2]) * colorSpeed

    const materialSpeed = timeDelta * 3
    this.metallic += (this.metallicTarget - this.metallic) * materialSpeed
    this.roughness += (this.roughnessTarget - this.roughness) * materialSpeed

    this.renderer.device.queue.writeBuffer(
      this.ubo,
      0 * Float32Array.BYTES_PER_ELEMENT,
      this.colorRGB,
    )
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      3 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([this.roughness]),
    )
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      4 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([this.metallic]),
    )

    this.metaballsCompute.updateSim(computePass, time, timeDelta)
    return this
  }

  public renderShadow(renderPass: GPURenderPassEncoder): this {
    if (!this.isReady) {
      return this
    }
    renderPass.setPipeline(this.renderShadowPipeline)
    renderPass.setBindGroup(0, this.spotLight.bindGroup.ubos)
    renderPass.setVertexBuffer(0, this.metaballsCompute.vertexBuffer)
    renderPass.setIndexBuffer(this.metaballsCompute.indexBuffer, 'uint32')
    renderPass.drawIndexed(this.metaballsCompute.indexCount)
    return this
  }

  public render(renderPass: GPURenderPassEncoder): this {
    if (!this.isReady) {
      return this
    }
    renderPass.setPipeline(this.renderPipeline)
    renderPass.setBindGroup(0, this.renderer.bindGroups.frame)
    renderPass.setBindGroup(1, this.bindGroup)
    renderPass.setVertexBuffer(0, this.metaballsCompute.vertexBuffer)
    renderPass.setVertexBuffer(1, this.metaballsCompute.normalBuffer)
    renderPass.setIndexBuffer(this.metaballsCompute.indexBuffer, 'uint32')
    renderPass.drawIndexed(this.metaballsCompute.indexCount)
    return this
  }
}
