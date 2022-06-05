import { ProjectionUniformsStruct, ViewUniformsStruct } from './shared-chunks'

export const GroundVertexShader = `
	${ProjectionUniformsStruct}
	${ViewUniformsStruct}

	struct ModelUniforms {
		matrix: mat4x4<f32>,
	}

	@group(0) @binding(0) var<uniform> projection: ProjectionUniformsStruct;
	@group(0) @binding(1) var<uniform> view: ViewUniformsStruct;
	@group(1) @binding(0) var<uniform> model: ModelUniforms;

	struct Inputs {
		@location(0) position: vec3<f32>,
		@location(1) normal: vec3<f32>,
		@location(2) instanceOffset: vec3<f32>,
	}

	struct Output {
		@location(0) normal: vec3<f32>,
		@builtin(position) position: vec4<f32>,
	}

	@stage(vertex)
	fn main(input: Inputs) -> Output {
		var output: Output;
		let dist = distance(input.instanceOffset.xy, vec2(0.0));
		let offsetX = input.instanceOffset.x;
		let offsetZ = input.instanceOffset.y;
		let scaleY = input.instanceOffset.z;
		let offsetPos = vec3(offsetX, abs(dist) * 0.06 + scaleY * 0.01, offsetZ);
		let scaleMatrix = mat4x4(
			1.0, 0.0, 0.0, 0.0,
			0.0, scaleY, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
		let worldPosition = model.matrix * scaleMatrix *  vec4(input.position + offsetPos, 1.0);
		output.position = projection.matrix *
											view.matrix *
											worldPosition;

		output.normal = input.normal;
		return output;
	}
`

export const GroundFragmentShader = `
	struct Inputs {
		@location(0) normal: vec3<f32>,
	}
	struct Output {
		@location(0) normal: vec4<f32>,	
		@location(1) albedo: vec4<f32>,	
	}

	@stage(fragment)
	fn main(input: Inputs) -> Output {
		var output: Output;
		var normal = normalize(input.normal);
		output.normal = vec4(normal.rgb, 0.0);
		output.albedo = vec4(1.0, 1.0, 1.0, 1.0);
		return output;
	}
`
