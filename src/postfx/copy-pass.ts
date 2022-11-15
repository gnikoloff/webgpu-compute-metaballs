import { WebGPURenderer } from '../webgpu-renderer'
import { Effect } from './effect'
import { PointLights } from '../lighting/point-lights'
import { SpotLight } from '../lighting/spot-light'
import { CopyPassFragmentShader } from '../shaders/copy-pass'

export class CopyPass extends Effect {
  public pointLights: PointLights
  public spotLight: SpotLight
  public framebufferDescriptor: GPURenderPassDescriptor

  public copyTexture: GPUTexture

  private get isReady(): boolean {
    return !!this.renderPipeline
  }

  constructor(renderer: WebGPURenderer) {
    const copyTexture = renderer.device.createTexture({
      label: 'copy pass texture',
      size: renderer.outputSize,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba16float',
    })

    const bindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'copy pass bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'float' },
        },
      ],
    })

    const bindGroup = renderer.device.createBindGroup({
      label: 'copy pass bind group',
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: copyTexture.createView(),
        },
      ],
    })

    super(renderer, {
      fragmentShader: CopyPassFragmentShader,
      bindGroupLayouts: [bindGroupLayout, renderer.bindGroupsLayouts.frame],
      bindGroups: [bindGroup, renderer.bindGroups.frame],
      presentationFormat: 'rgba16float',
      label: 'copy pass effect',
    })

    this.copyTexture = copyTexture

    this.framebufferDescriptor = {
      colorAttachments: [
        {
          view: this.copyTexture.createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }
  }

  public render(renderPass: GPURenderPassEncoder): void {
    if (!this.isReady) {
      return
    }

    this.preRender(renderPass)
    renderPass.setBindGroup(1, this.renderer.bindGroups.frame)
    renderPass.drawIndexed(6)
  }
}
