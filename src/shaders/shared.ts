export const ProjectionUniforms = `
  struct ProjectionUniforms {
    matrix : mat4x4<f32>;
    outputSize : vec2<f32>;
    zNear : f32;
    zFar : f32;
  };
  @group(0) @binding(0) var<uniform> projection : ProjectionUniforms;
`

export const ViewUniforms = `
  struct ViewUniforms {
    matrix : mat4x4<f32>;
    position : vec3<f32>;
    time : f32;
  };
  @group(0) @binding(1) var<uniform> view : ViewUniforms;
`
