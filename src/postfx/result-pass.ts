import { WebGPURenderer } from '../webgpu-renderer'
import { Effect } from './effect'
import { PointLights } from '../lighting/point-lights'
import { SpotLight } from '../lighting/spot-light'
import { ResultPassFragmentShader } from '../shaders/result-pass'
import { CopyPass } from './copy-pass'
import { BloomPass } from './bloom-pass'

export class ResultPass extends Effect {
  public pointLights: PointLights
  public spotLight: SpotLight
  public framebufferDescriptor: GPURenderPassDescriptor

  public copyTexture: GPUTexture

  private get isReady(): boolean {
    return !!this.renderPipeline
  }

  constructor(
    renderer: WebGPURenderer,
    copyPass: CopyPass,
    bloomPass?: BloomPass,
  ) {
    const bindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'result pass bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'float' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'float' },
        },
      ],
    })

    const emptyTex = renderer.device
      .createTexture({
        size: [1, 1],
        dimension: '2d',
        format: 'bgra8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING,
      })
      .createView()

    const bindGroup = renderer.device.createBindGroup({
      label: 'result pass bind group',
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: copyPass.copyTexture.createView(),
        },
        {
          binding: 1,
          resource: bloomPass
            ? bloomPass.blurTextures[1].createView()
            : emptyTex,
        },
      ],
    })

    super(renderer, {
      fragmentShader: ResultPassFragmentShader,
      bindGroupLayouts: [bindGroupLayout, renderer.bindGroupsLayouts.frame],
      bindGroups: [bindGroup, renderer.bindGroups.frame],
      label: 'result pass effect',
    })
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
