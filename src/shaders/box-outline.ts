import { ProjectionUniformsStruct, ViewUniformsStruct } from './shared-chunks'

export const BoxOutlineVertexShader = `
	${ProjectionUniformsStruct}
	${ViewUniformsStruct}

	@group(0) @binding(0) var<uniform> projection : ProjectionUniformsStruct;
  @group(0) @binding(1) var<uniform> view : ViewUniformsStruct;

	struct Inputs {
		@location(0) position: vec3<f32>,
		@location(1) instanceMat0: vec4<f32>,
		@location(2) instanceMat1: vec4<f32>,
		@location(3) instanceMat2: vec4<f32>,
		@location(4) instanceMat3: vec4<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
		@location(0) localPosition: vec3<f32>,
	}

	@vertex
	fn main(input: Inputs) -> Output {
		var output: Output;

		let instanceMatrix = mat4x4(
			input.instanceMat0,
			input.instanceMat1,
			input.instanceMat2,
			input.instanceMat3,
		);

		let worldPosition = vec4<f32>(input.position, 1.0);
		output.position = projection.matrix *
											view.matrix *
											instanceMatrix *
											worldPosition;

		output.localPosition = input.position;
		return output;
	}
`

export const BoxOutlineFragmentShader = `
	${ProjectionUniformsStruct}
	${ViewUniformsStruct}
	
	struct Input {
		@location(0) localPosition: vec3<f32>,
	}
	struct Output {
		@location(0) normal: vec4<f32>,	
		@location(1) albedo: vec4<f32>,	
	}
	@group(0) @binding(0) var<uniform> projection : ProjectionUniformsStruct;
  	@group(0) @binding(1) var<uniform> view : ViewUniformsStruct;

	@fragment
	fn main(input: Input) -> Output {
		var output: Output;
		let spacing = step(sin(input.localPosition.x * 10.0 + view.time * 2.0), 0.1);
		if (spacing < 0.5) {
			discard;
		}
		output.normal = vec4(0.0, 0.0, 0.0, 0.1);
		output.albedo = vec4(vec3(spacing * 0.5), 0.0);
		return output;
	}
`
