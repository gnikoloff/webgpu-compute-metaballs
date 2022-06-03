import { WebGPURenderer } from '../webgpu-renderer'
import { Effect } from './effect'
import { DeferredPassFragmentShader } from '../shaders/deferred-pass'

export class DeferredPass extends Effect {
  public framebufferDescriptor: GPURenderPassDescriptor

  constructor(renderer: WebGPURenderer) {
    const gBufferTexturePos = renderer.device.createTexture({
      label: 'gbuffer position texture',
      size: [...renderer.outputSize, 1],
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba32float',
    })
    const gBufferTextureNormal = renderer.device.createTexture({
      label: 'gbuffer normal texture',
      size: [...renderer.outputSize, 1],
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba32float',
    })
    const gbufferTextureDiffuse = renderer.device.createTexture({
      label: 'gbuffer diffuse texture',
      size: renderer.outputSize,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'bgra8unorm',
    })

    const bindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'gbuffer textures bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {},
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'unfilterable-float',
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
      ],
    })

    const bindGroup = renderer.device.createBindGroup({
      label: 'gbuffer textures bind group',
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: renderer.ubos.viewUBO,
          },
        },
        {
          binding: 1,
          resource: gBufferTexturePos.createView(),
        },
        {
          binding: 2,
          resource: gBufferTextureNormal.createView(),
        },
        {
          binding: 3,
          resource: gbufferTextureDiffuse.createView(),
        },
      ],
    })

    super(renderer, {
      fragmentShader: DeferredPassFragmentShader,
      bindGroupLayouts: [bindGroupLayout],
      bindGroups: [bindGroup],
    })

    this.framebufferDescriptor = {
      colorAttachments: [
        {
          view: gBufferTexturePos.createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
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
        view: renderer.textures.gbufferDepthTexture.createView(),
        depthLoadOp: 'clear',
        depthClearValue: 1,
        depthStoreOp: 'store',
      },
    }
  }

  public render(renderPass: GPURenderPassEncoder): void {
    if (!this.renderPipeline) {
      return
    }
    this.preRender(renderPass)
    renderPass.drawIndexed(6)
  }
}
