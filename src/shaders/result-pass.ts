export const ResultPassFragmentShader = `
  @group(0) @binding(0) var copyTexture: texture_2d<f32>;
  @group(0) @binding(1) var bloomTexture: texture_2d<f32>;

  struct Inputs {
    @builtin(position) coords: vec4<f32>,
  }
  struct Output {
    @location(0) color: vec4<f32>,
  }

  @fragment
  fn main(input: Inputs) -> Output {
    var output: Output;
    var hdrColor = textureLoad(
			copyTexture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);
    let bloomColor = textureLoad(
			bloomTexture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);

    hdrColor += bloomColor;

    let gamma = 2.2;

    var result = vec3(1.0) - exp(-hdrColor.rgb * 1.0);
    // result = pow(result, vec3(1.0 / gamma));

    output.color = vec4(result, 1.0);
    // output.color = vec4(bloomColor.rgba);
    return output;
  }
`
