import { SAMPLE_COUNT } from '../constants'
import { Geometry, GeometryUtils, IndexBuffer, Mesh, UniformBuffer, VertexBuffer } from '../lib/hwoa-rang-gpu'
import { LinearizeDepthSnippet } from '../shaders/shared'
import WebGPURenderer from '../webgpu-renderer'

const VERTEX_SHADER_SRC = `
	output.Position = screenprojectionuniforms.matrix *
										screenviewuniforms.matrix *
										model.matrix *
										vec4(input.position, 1.0);
	output.uv = input.uv;
`

const FRAGMENT_SHADER_SRC = `
	let depth: f32 = textureSample(
		shadowDepthTexture,
		depthDebugSampler,
		vec2(input.uv.x, input.uv.y)
	);
	output.Color = vec4(vec3(depth), 1.0);
	// output.Color = vec4(vec3(LinearizeDepth(depth)), 1.0);

	// output.Color = vec4(input.uv, 0.0, 1.0);
`

export default class ShadowMapDebugger extends Mesh {
	public static readonly OUTPUT_SIZE = 256

	private modelUBO: UniformBuffer
	
	constructor(renderer: WebGPURenderer) {
		const geometry = new Geometry()
		const { vertexStride, interleavedArray, indicesArray } =
      GeometryUtils.createInterleavedPlane({
        width: ShadowMapDebugger.OUTPUT_SIZE,
        height: ShadowMapDebugger.OUTPUT_SIZE,
      })
    const vertexBuffer = new VertexBuffer(renderer.device, {
      bindPointIdx: 0,
      typedArray: interleavedArray,
      stride: vertexStride * Float32Array.BYTES_PER_ELEMENT,
    })
      .addAttribute(
        'position',
        0 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT,
        'float32x3',
      )
      .addAttribute(
        'uv',
        3 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT,
        'float32x2',
      )
    const indexBuffer = new IndexBuffer(renderer.device, {
      typedArray: indicesArray,
    })
    geometry
			.addVertexBuffer(vertexBuffer)
			.addIndexBuffer(indexBuffer)

		const modelUBO = new UniformBuffer(renderer.device, {
			name: 'Model',
			uniforms: {
				matrix: {
					type: 'mat4x4<f32>',
					value: null
				}
			},
			debugLabel: 'shadow map debugger model ubo'
		})
		
		super(renderer.device, {
			geometry: geometry,
			ubos: [
				renderer.screenProjectionUBO,
				renderer.screenViewUBO,
				modelUBO,
			],
			samplers: [renderer.depthDebugSampler],
			textures: [renderer.shadowDepthTexture],
			vertexShaderSource: {
				main: VERTEX_SHADER_SRC,
			},
			fragmentShaderSource: {
				head: LinearizeDepthSnippet,
				main: FRAGMENT_SHADER_SRC,
			},

			multisample: {
				count: SAMPLE_COUNT,
			},
			targets: [
				{
					format: 'bgra8unorm',
				},
			],
			// depthStencil: {
      //   format: 'depth24plus',
      //   depthWriteEnabled: true,
      //   depthCompare: 'greater',
      // },
		})
		this.modelUBO = modelUBO
		// this.setPosition({ z: 0.5 }).updateWorldMatrix()
	}
	render(renderPass: GPURenderPassEncoder) {
		super.render(renderPass)
		this.modelUBO.updateUniform('matrix', this.modelMatrix as Float32Array)
	}
}
