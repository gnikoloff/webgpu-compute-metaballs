export const BloomPassFragmentShader = `
  @group(0) @binding(0) var texture: texture_2d<f32>;

  struct Inputs {
    @builtin(position) coords: vec4<f32>,
  }
  struct Output {
    @location(0) color: vec4<f32>,
  }

  @stage(fragment)
  fn main(input: Inputs) -> Output {
    var output: Output;
    let albedo = textureLoad(
			texture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);
    let brightness = dot(albedo.rgb, vec3(0.2126, 0.7152, 0.0722));
    if (brightness > 1.0) {
      output.color = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
      output.color = vec4(0.0, 0.0, 0.0, 1.0);
    }
    return output;
  }
`
