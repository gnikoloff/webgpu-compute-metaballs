import { SpotLight } from '../lighting/spot-light'
import { LinearizeDepthSnippet } from '../shaders/shared-chunks'
import { WebGPURenderer } from '../webgpu-renderer'
import { TextureDebuggerBase } from './texture-debugger-base'

export class ShadowDebugger extends TextureDebuggerBase {
  constructor(renderer: WebGPURenderer, light: SpotLight) {
    super(renderer)
    this.bindGroupLayouts.texture = renderer.device.createBindGroupLayout({
      label: 'shadow debugger bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'depth',
          },
        },
      ],
    })
    this.bindGroups.texture = renderer.device.createBindGroup({
      label: 'shadow debugger bind group',
      layout: this.bindGroupLayouts.texture,
      entries: [
        {
          binding: 0,
          resource: light.depthTexture.createView(),
        },
      ],
    })
    const fragmentShader = `
			@group(0) @binding(0) var depthTexture: texture_depth_2d;

			struct Inputs {
				@builtin(position) coords: vec4<f32>,
			}
			struct Output {
				@location(0) color: vec4<f32>,	
			}

			${LinearizeDepthSnippet}

			@fragment
			fn main(input: Inputs) -> Output {
				var depth = textureLoad(depthTexture, vec2<i32>(floor(input.coords.xy)), 0);
				var output: Output;
				output.color = vec4(vec3(LinearizeDepth(depth)), 1.0);
				// output.color = vec4(vec2(input.coords.xy) / vec2(1000.0), 0.0, 1.0);
				return output;
			}
		`
    this.init(fragmentShader)
  }
  render(renderPass: GPURenderPassEncoder) {
    if (!this.renderPipeline) {
      return
    }
    this.preRender(renderPass)
    renderPass.drawIndexed(6)
  }
}
