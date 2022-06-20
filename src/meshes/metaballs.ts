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

  public get isReady(): boolean {
    return (
      this.metaballsCompute.isReady &&
      !!this.renderPipeline &&
      !!this.renderShadowPipeline
    )
  }

  constructor(
    private renderer: WebGPURenderer,
    volume: IVolumeSettings,
    private spotLight: SpotLight,
  ) {
    this.metaballsCompute = new MetaballsCompute(renderer, volume)
    this.init()
  }

  async init() {
    this.renderPipeline = await this.renderer.device.createRenderPipelineAsync({
      label: 'metaball rendering pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'metaball rendering pipeline layout',
        bindGroupLayouts: [this.renderer.bindGroupsLayouts.frame],
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
          bindGroupLayouts: [
            this.spotLight.bindGroupLayout.ubos,
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

  public updateSim(
    computePass: GPUComputePassEncoder,
    time: number,
    timeDelta: number,
  ): this {
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
    renderPass.setVertexBuffer(0, this.metaballsCompute.vertexBuffer)
    renderPass.setVertexBuffer(1, this.metaballsCompute.normalBuffer)
    renderPass.setIndexBuffer(this.metaballsCompute.indexBuffer, 'uint32')
    renderPass.drawIndexed(this.metaballsCompute.indexCount)
    return this
  }
}
