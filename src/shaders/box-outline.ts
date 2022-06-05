import { ProjectionUniformsStruct, ViewUniformsStruct } from './shared-chunks'

export const BoxOutlineVertexShader = `
	${ProjectionUniformsStruct}
	${ViewUniformsStruct}

	@group(0) @binding(0) var<uniform> projection : ProjectionUniformsStruct;
  @group(0) @binding(1) var<uniform> view : ViewUniformsStruct;

	struct Inputs {
		@location(0) position: vec3<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
	}

	@stage(vertex)
	fn main(input: Inputs) -> Output {
		var output: Output;
		let worldPosition = vec4<f32>(input.position, 1.0);
		output.position = projection.matrix *
											view.matrix *
											worldPosition;

		return output;
	}
`

export const BoxOutlineFragmentShader = `
	struct Output {
		@location(0) normal: vec4<f32>,	
		@location(1) albedo: vec4<f32>,	
	}
	@stage(fragment)
	fn main() -> Output {
		var output: Output;
		output.normal = vec4(0.0, 0.0, 0.0, 0.1);
		output.albedo = vec4(1.0, 1.0, 1.0, 1.0);
		return output;
	}
`