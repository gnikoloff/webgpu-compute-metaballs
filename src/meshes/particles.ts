import { DEPTH_FORMAT } from '../constants'
import {
  ParticlesFragmentShader,
  ParticlesVertexShader,
} from '../shaders/particles'
import { WebGPURenderer } from '../webgpu-renderer'
import { SETTINGS } from '../settings'

export class Particles {
  private renderPipeline: GPURenderPipeline

  private bindGroupLayout: GPUBindGroupLayout
  private bindGroup: GPUBindGroup

  constructor(
    private renderer: WebGPURenderer,
    private lightsBuffer: GPUBuffer,
  ) {
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

  private async init() {
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
    renderPass.drawIndexed(6, SETTINGS.qualityLevel.pointLightsCount)
  }
}
