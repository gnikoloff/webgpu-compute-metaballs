export const CopyPassFragmentShader = `
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
    output.color = vec4(albedo.rgb, 1.0);
    return output;
  }
`
