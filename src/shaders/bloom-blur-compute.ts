// Shamelessly lifted off https://austin-eng.com/webgpu-samples/samples/imageBlur#main.ts
export const BloomBlurCompute = `
  struct Params {
    filterDim : u32,
    blockDim : u32,
  };

  struct Flip {
    value : u32,
  };

  @group(0) @binding(0) var samp: sampler;
  @group(0) @binding(1) var<uniform> params: Params;
  @group(1) @binding(0) var inputTex: texture_2d<f32>;
  @group(1) @binding(1) var outputTex: texture_storage_2d<rgba8unorm, write>;
  @group(1) @binding(2) var<uniform> flip : Flip;

  var<workgroup> tile : array<array<vec3<f32>, 128>, 4>;

  @compute @workgroup_size(32, 1, 1)
  fn main(
    @builtin(workgroup_id) WorkGroupID : vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID : vec3<u32>
  ) {
    let filterOffset : u32 = (params.filterDim - 1u) / 2u;
    let dims = vec2<i32>(textureDimensions(inputTex, 0));

    let baseIndex = vec2<i32>(
      WorkGroupID.xy * vec2<u32>(params.blockDim, 4u) +
      LocalInvocationID.xy * vec2<u32>(4u, 1u)
    ) - vec2<i32>(i32(filterOffset), 0);

    for (var r : u32 = 0u; r < 4u; r = r + 1u) {
      for (var c : u32 = 0u; c < 4u; c = c + 1u) {
        var loadIndex = baseIndex + vec2<i32>(i32(c), i32(r));
        if (flip.value != 0u) {
          loadIndex = loadIndex.yx;
        }

        tile[r][4u * LocalInvocationID.x + c] =
          textureSampleLevel(inputTex, samp,
            (vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims), 0.0).rgb;
      }
    }

    workgroupBarrier();

    for (var r : u32 = 0u; r < 4u; r = r + 1u) {
      for (var c : u32 = 0u; c < 4u; c = c + 1u) {
        var writeIndex = baseIndex + vec2<i32>(i32(c), i32(r));
        if (flip.value != 0u) {
          writeIndex = writeIndex.yx;
        }

        let center : u32 = 4u * LocalInvocationID.x + c;
        if (center >= filterOffset &&
            center < 128u - filterOffset &&
            all(writeIndex < dims)) {
          var acc : vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
          for (var f : u32 = 0u; f < params.filterDim; f = f + 1u) {
            var i : u32 = center + f - filterOffset;
            acc = acc + (1.0 / f32(params.filterDim)) * tile[r][i];
          }
          textureStore(outputTex, writeIndex, vec4<f32>(acc, 1.0));
        }
      }
    }
  }
`
