export const SPACESHIP_VERTEX_SHADER = `
  output.Position = projectionuniforms.matrix *
                    viewuniforms.matrix *
                    model.matrix *
                    input.position;

  output.uv = input.uv;
  output.normal = input.normal;
`

export const SPACESHIP_FRAGMENT_SHADER = `
  // var normal = normalize(input.normal);
  output.Color = textureSample(normalTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));;
`
