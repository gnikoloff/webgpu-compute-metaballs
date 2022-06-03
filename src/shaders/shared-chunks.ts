export const ProjectionUniforms = `
  struct ProjectionUniforms {
    matrix : mat4x4<f32>,
    outputSize : vec2<f32>,
    zNear : f32,
    zFar : f32,
  };
  @group(0) @binding(0) var<uniform> projection : ProjectionUniforms;
`

export const ViewUniforms = `
  struct ViewUniforms {
    matrix : mat4x4<f32>,
    position : vec3<f32>,
    time : f32,
  };
  @group(0) @binding(1) var<uniform> view : ViewUniforms;
`

export const LinearizeDepthSnippet = `
	fn LinearizeDepth(depth: f32) -> f32 {
		let z = depth * 2.0 - 1.0; // Back to NDC 
		let near_plane = 0.1;
		let far_plane = 40.0;
		return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
	}
`

export const EffectVertexShader = `
	struct Inputs {
		@location(0) position: vec2<f32>,
		@location(1) uv: vec2<f32>,
	}

	struct Output {
		@location(0) uv: vec2<f32>,
		@builtin(position) position: vec4<f32>,
	}

	@stage(vertex)
	fn main(input: Inputs) -> Output {
		var output: Output;
		output.position = vec4(input.position, 0.0, 1.0);
		output.uv = input.uv;

		return output;
	}
`
