import {
  InputPointLightStructs,
  ProjectionUniformsStruct,
  ViewUniformsStruct,
} from './shared-chunks'

export const ParticlesVertexShader = `
	${ProjectionUniformsStruct}
	${ViewUniformsStruct}
	${InputPointLightStructs}

	@group(0) @binding(0) var<uniform> projection: ProjectionUniformsStruct;
  @group(0) @binding(1) var<uniform> view: ViewUniformsStruct;

	@group(1) @binding(0) var<storage, read> lightsBuffer: LightsBuffer;

	struct Inputs {
		@builtin(vertex_index) vertexIndex: u32,
		@builtin(instance_index) instanceIndex: u32,
		@location(0) position: vec2<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
		@location(0) color: vec3<f32>,
		@location(1) uv: vec2<f32>,
	}

	var<private> normalisedPosition: array<vec2<f32>, 4> = array<vec2<f32>, 4>(
		vec2<f32>(-1.0, 1.0),
		vec2<f32>(-1.0, -1.0),
		vec2<f32>(1.0, -1.0),
		vec2<f32>(1.0, 1.0)
	);

	@vertex
	fn main(input: Inputs) -> Output {
		var output: Output;		

		let sc = lightsBuffer.lights[input.instanceIndex].intensity * 0.01;
		let scaleMatrix = mat4x4(
			sc,  0.0, 0.0, 0.0,
			0.0, sc,  0.0, 0.0,
			0.0, 0.0, sc,  0.0,
			0.0, 0.0, 0.0, 1.0,
		);

		let instancePosition = lightsBuffer.lights[input.instanceIndex].position;
		var worldPosition = vec4(input.position, 0.0, 1.0);
		worldPosition = scaleMatrix * worldPosition;

		worldPosition += vec4(instancePosition.xyz, 0.0);

		var viewMatrix = view.matrix;
		
		output.position = projection.matrix *
											viewMatrix *
											worldPosition;

		let instanceColor = lightsBuffer.lights[input.instanceIndex].color;
		output.color = instanceColor;
		output.uv = normalisedPosition[input.vertexIndex] * vec2(0.5, -0.5) + vec2(0.5);
		return output;
	}
`

export const ParticlesFragmentShader = `
	struct Input {
		@location(0) color: vec3<f32>,
		@location(1) uv: vec2<f32>,
	}

	struct Output {
		@location(0) normal: vec4<f32>,	
		@location(1) albedo: vec4<f32>,	
	}

	@fragment
	fn main(input: Input) -> Output {
		let dist = distance(input.uv, vec2(0.5), );
		if (dist > 0.5) {
			discard;
		}
		var output: Output;
		output.normal = vec4(0.0, 0.0, 0.0, 0.1);
		output.albedo = vec4(input.color, 1.0);
		return output;
	}
`
