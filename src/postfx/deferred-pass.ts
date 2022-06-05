import { WebGPURenderer } from '../webgpu-renderer'
import { Effect } from './effect'
import { PointLightsCompute } from '../compute/point-lights'
import { DeferredPassFragmentShader } from '../shaders/deferred-pass'

export class DeferredPass extends Effect {
  public pointLightsCompute: PointLightsCompute
  public framebufferDescriptor: GPURenderPassDescriptor

  public get isReady(): boolean {
    return this.pointLightsCompute.isReady && !!this.renderPipeline
  }

  constructor(renderer: WebGPURenderer) {
    const pointLightsCompute = new PointLightsCompute(renderer)

    const gBufferTextureNormal = renderer.device.createTexture({
      label: 'gbuffer normal texture',
      size: [...renderer.outputSize, 1],
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba16float',
    })
    const gbufferTextureDiffuse = renderer.device.createTexture({
      label: 'gbuffer diffuse texture',
      size: renderer.outputSize,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'bgra8unorm',
    })

    const bindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'gbuffer bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
          buffer: {
            type: 'read-only-storage',
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'unfilterable-float',
          },
        },
        {
          binding: 3,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        {
          binding: 4,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'depth',
          },
        },
      ],
    })

    const bindGroup = renderer.device.createBindGroup({
      label: 'gbuffer bind group',
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: pointLightsCompute.lightsBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: pointLightsCompute.lightsConfigUniformBuffer,
          },
        },
        {
          binding: 2,
          resource: gBufferTextureNormal.createView(),
        },
        {
          binding: 3,
          resource: gbufferTextureDiffuse.createView(),
        },
        {
          binding: 4,
          resource: renderer.textures.gBufferDepthTexture.createView(),
        },
      ],
    })

    super(renderer, {
      fragmentShader: DeferredPassFragmentShader,
      bindGroupLayouts: [bindGroupLayout, renderer.bindGroupsLayouts.frame],
      bindGroups: [bindGroup, renderer.bindGroups.frame],
    })

    this.framebufferDescriptor = {
      colorAttachments: [
        {
          view: gBufferTextureNormal.createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
        {
          view: gbufferTextureDiffuse.createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: renderer.textures.gBufferDepthTexture.createView(),
        depthLoadOp: 'clear',
        depthClearValue: 1,
        depthStoreOp: 'store',
      },
    }

    this.pointLightsCompute = pointLightsCompute
  }

  updateLightsSim(computePass: GPUComputePassEncoder) {
    this.pointLightsCompute.updateSim(computePass)
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
