import { Texture } from '../lib/hwoa-rang-gpu'
import {
  deferredPassFragmentShader,
  deferredPassVertexShader,
} from '../shaders/deferred-pass'
import {
  DIRECTIONAL_LIGHT_SHADER_STRUCT,
  DISTRIBUTION_GGX_PBR_SHADER_FN,
  FRESNEL_SCHLICK_PBR_SHADER_FN,
  GEOMETRY_SMITH_PBR_SHADER_FN,
  LIGHT_RADIANCE_PBR_SHADER_FN,
  LINEAR_TO_SRGB_SHADER_FN,
  POINT_LIGHT_SHADER_STRUCT,
  REINHARD_TONEMAPPING_PBR_SHADER_FN,
  SURFACE_SHADER_STRUCT,
} from '../shaders/pbr'
import WebGPURenderer from '../webgpu-renderer'
import Effect from './effect'

export default class DeferredPass extends Effect {
  constructor(renderer: WebGPURenderer) {
    const gBufferTexturePosition = new Texture(
      renderer.device,
      'position_texture',
      'unfilterable-float',
    ).fromDefinition({
      size: [...renderer.outputSize, 1],
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba32float',
      // sampleCount: SAMPLE_COUNT,
    })
    const gBufferTextureNormal = new Texture(
      renderer.device,
      'normal_texture',
      'unfilterable-float',
    ).fromDefinition({
      size: [...renderer.outputSize, 1],
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba32float',
      // sampleCount: SAMPLE_COUNT,
    })
    const gBufferTextureDiffuse = new Texture(
      renderer.device,
      'diffuse_texture',
      'unfilterable-float',
    ).fromDefinition({
      size: renderer.outputSize,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'bgra8unorm',
      // sampleCount: SAMPLE_COUNT,
    })
    super(renderer, {
      vertexShaderSource: {
        main: deferredPassVertexShader,
      },
      fragmentShaderSource: {
        head: `
					let PI = ${Math.PI};
					${POINT_LIGHT_SHADER_STRUCT}
					${DIRECTIONAL_LIGHT_SHADER_STRUCT}
					${SURFACE_SHADER_STRUCT}
					${DISTRIBUTION_GGX_PBR_SHADER_FN}
					${GEOMETRY_SMITH_PBR_SHADER_FN}
					${FRESNEL_SCHLICK_PBR_SHADER_FN}
					${REINHARD_TONEMAPPING_PBR_SHADER_FN}
					${LIGHT_RADIANCE_PBR_SHADER_FN}
					${LINEAR_TO_SRGB_SHADER_FN}
				`,
        main: deferredPassFragmentShader,
      },
      samplers: [renderer.depthSampler],
      textures: [
        renderer.shadowDepthTexture,
        gBufferTexturePosition,
        gBufferTextureNormal,
        gBufferTextureDiffuse,
      ],
      ubos: [
        renderer.viewUBO,
        renderer.shadowProjectionUBO,
        renderer.shadowViewUBO,
      ],
    })
    this.framebufferDescriptor = {
      colorAttachments: [
        {
          view: gBufferTexturePosition.get().createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
        {
          view: gBufferTextureNormal.get().createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
        {
          view: gBufferTextureDiffuse.get().createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: renderer.gbufferDepthTexture.get().createView(),

        depthLoadOp: 'clear',
        depthClearValue: 1,
        depthStoreOp: 'store',
      },
    }
    this.updateWorldMatrix()
  }
}
