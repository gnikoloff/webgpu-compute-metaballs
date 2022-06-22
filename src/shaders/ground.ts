import {
  GBufferEncode,
  ProjectionUniformsStruct,
  ViewUniformsStruct,
} from './shared-chunks'

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
		@location(3) metallic: f32,
		@location(4) roughness: f32,
	}

	struct Output {
		@location(0) normal: vec3<f32>,
		@location(1) metallic: f32,
		@location(2) roughness: f32,
		@builtin(position) position: vec4<f32>,
	}

	@vertex
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
		let worldPosition = model.matrix * scaleMatrix * vec4(input.position + offsetPos, 1.0);
		output.position = projection.matrix *
											view.matrix *
											worldPosition;

		output.normal = input.normal;
		output.metallic = input.metallic;
		output.roughness = input.roughness;
		return output;
	}
`

export const GroundFragmentShader = `
	${GBufferEncode}

	struct Inputs {
		@location(0) normal: vec3<f32>,
		@location(1) metallic: f32,
		@location(2) roughness: f32,
	}
	
	@fragment
	fn main(input: Inputs) -> Output {
		let normal = normalize(input.normal);
		let albedo = vec3(1.0);
		let metallic = input.metallic;
		let roughness = input.roughness;
		let ID = 0.0;

		return encodeGBufferOutput(
			normal,
			albedo,
			metallic,
			roughness,
			ID
		);
	}
`

export const GroundShadowVertexShader = `
	${ProjectionUniformsStruct}
	${ViewUniformsStruct}

	struct ModelUniforms {
		matrix: mat4x4<f32>,
	}

	@group(0) @binding(1) var<uniform> projection: ProjectionUniformsStruct;
	@group(0) @binding(2) var<uniform> view: ViewUniformsStruct;
	@group(1) @binding(0) var<uniform> model: ModelUniforms;

	struct Inputs {
		@location(0) position: vec3<f32>,
		@location(1) instanceOffset: vec3<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
	}

	@vertex
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
		let worldPosition = model.matrix * scaleMatrix * vec4(input.position + offsetPos, 1.0);
		output.position = projection.matrix *
											view.matrix *
											worldPosition;

		return output;
	}
`
