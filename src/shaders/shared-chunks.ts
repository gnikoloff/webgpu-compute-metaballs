export const ProjectionUniformsStruct = `
  struct ProjectionUniformsStruct {
    matrix : mat4x4<f32>,
		inverseMatrix: mat4x4<f32>,
    outputSize : vec2<f32>,
    zNear : f32,
    zFar : f32,
  };
`

export const ViewUniformsStruct = `
  struct ViewUniformsStruct {
    matrix: mat4x4<f32>,
		inverseMatrix: mat4x4<f32>,
    position: vec3<f32>,
    time: f32,
		deltaTime: f32,
  };
`

export const InputPointLightStructs = `
	struct InputPointLight {
		position: vec4<f32>,
		velocity: vec4<f32>,
		color: vec3<f32>,
		range: f32,
		intensity: f32,
	}

	struct LightsBuffer {
		lights: array<InputPointLight>,
	}
`

export const PointLightConfigStruct = `
	struct LightsConfig {
		numLights: u32,
	}
`

export const LinearizeDepthSnippet = `
	fn LinearizeDepth(depth: f32) -> f32 {
		let z = depth * 2.0 - 1.0; // Back to NDC 
		let near_plane = 0.1;
		let far_plane = 0.2;
		return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
	}
`

export const EffectVertexShader = `
	struct Inputs {
		@location(0) position: vec2<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
	}

	@stage(vertex)
	fn main(input: Inputs) -> Output {
		var output: Output;
		output.position = vec4(input.position, 0.0, 1.0);

		return output;
	}
`
