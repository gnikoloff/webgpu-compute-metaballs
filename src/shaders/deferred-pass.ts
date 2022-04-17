export const deferredPassVertexShader = `
	output.Position = screenprojectionuniforms.matrix *
										screenviewuniforms.matrix *
										model.matrix *
										vec4(input.position, 1.0);
	
	// output.uv = input.uv;
`

export const deferredPassFragmentShader = `
	let position = textureLoad(
    position_texture,
    vec2<i32>(floor(input.coords.xy)),
    0
  ).xyz;

  if (position.z > 10000.0) {
    discard;
  }

  let normal = textureLoad(
    normal_texture,
    vec2<i32>(floor(input.coords.xy)),
    0
  ).xyz;

  let albedo = textureLoad(
    diffuse_texture,
    vec2<i32>(floor(input.coords.xy)),
    0
  ).rgb;

	// output.Color = vec4(1.0, 0.0, 0.0, 1.0);
	output.Color = vec4(albedo, 1.0);
`
