export const SPACESHIP_VERTEX_SHADER = `
  output.Position = projectionuniforms.matrix *
                    viewuniforms.matrix *
                    model.matrix *
                    input.position;

  output.uv = input.uv;
  output.normal = input.normal;
`

export const SPACESHIP_FRAGMENT_SHADER = (
  useNormalTexture: boolean,
  emissiveTexture: boolean,
) => {
  console.log({ emissiveTexture })
  let source = `
    var normal = normalize(input.normal);
  `
  if (useNormalTexture && emissiveTexture) {
    source += `
      // var normalColor = textureSample(normalTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
      // var emissiveColor = textureSample(emissiveTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
      // output.Color = mix(normalColor, emissiveColor, 0.0) + normal;
      output.Color = vec4<f32>(1.0, 0.0, 0.0, 1.0);
    `
    return source
  }
  if (emissiveTexture) {
    source += `
      // var emissiveColor = textureSample(emissiveTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
      // output.Color = emissiveColor;

      output.Color = vec4<f32>(1.0, 0.0, 0.0, 1.0);
    `
    return source
  }
  if (useNormalTexture) {
    source += `
      // var normalColor = textureSample(normalTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
      // output.Color = normalColor + normal;

      output.Color = vec4<f32>(1.0, 0.0, 0.0, 1.0);
    `
    return source
  }

  source += `output.Color = normal;`

  return source
}
