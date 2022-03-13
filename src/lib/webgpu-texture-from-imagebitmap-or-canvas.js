// TextureDescriptor should be the descriptor that the texture was created with.
// This version only works for basic 2D textures.
export function webGPUTextureFromImageBitmapOrCanvas(
  gpuDevice,
  source,
  generateMipmaps = true,
) {
  const textureDescriptor = {
    size: { width: source.width, height: source.height },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  }

  if (generateMipmaps) {
    // Compute how many mip levels are needed for a full chain.
    textureDescriptor.mipLevelCount =
      Math.floor(Math.log2(Math.max(source.width, source.height))) + 1
    // Needed in order to use render passes to generate the mipmaps.
    textureDescriptor.usage |= GPUTextureUsage.RENDER_ATTACHMENT
  }

  const texture = gpuDevice.createTexture(textureDescriptor)

  gpuDevice.queue.copyExternalImageToTexture(
    { source },
    { texture },
    textureDescriptor.size,
  )

  if (generateMipmaps) {
    webGPUGenerateMipmap(gpuDevice, texture, textureDescriptor)
  }

  return texture
}

function webGPUGenerateMipmap(gpuDevice, texture, textureDescriptor) {
  // Create a simple shader that renders a fullscreen textured quad.
  const mipmapShaderModule = gpuDevice.createShaderModule({
    code: `
      var<private> pos : array<vec2<f32>, 4> = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 1.0),
        vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0));

      struct VertexOutput {
        @builtin(position) position : vec4<f32>;
        @location(0) texCoord : vec2<f32>;
      };

      @stage(vertex) fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
        var output : VertexOutput;
        output.texCoord = pos[vertexIndex] * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5);
        output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
        return output;
      }

      @group(0) @binding(0) var imgSampler : sampler;
      @group(0) @binding(1) var img : texture_2d<f32>;

      @stage(fragment) fn fragmentMain(@location(0) texCoord : vec2<f32>) -> @location(0) vec4<f32> {
        return textureSample(img, imgSampler, texCoord);
      }
    `,
  })

  const pipeline = gpuDevice.createRenderPipeline({
    vertex: {
      module: mipmapShaderModule,
      entryPoint: 'vertexMain',
    },
    fragment: {
      module: mipmapShaderModule,
      entryPoint: 'fragmentMain',
      targets: [
        {
          format: textureDescriptor.format, // Make sure to use the same format as the texture
        },
      ],
    },
    primitive: {
      topology: 'triangle-strip',
      stripIndexFormat: 'uint32',
    },
  })

  // We'll ALWAYS be rendering minified here, so that's the only filter mode we need to set.
  const sampler = gpuDevice.createSampler({ minFilter: 'linear' })

  let srcView = texture.createView({
    baseMipLevel: 0,
    mipLevelCount: 1,
  })

  // Loop through each mip level and renders the previous level's contents into it.
  const commandEncoder = gpuDevice.createCommandEncoder({})
  for (let i = 1; i < textureDescriptor.mipLevelCount; ++i) {
    const dstView = texture.createView({
      baseMipLevel: i, // Make sure we're getting the right mip level...
      mipLevelCount: 1, // And only selecting one mip level
    })

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: dstView, // Render pass uses the next mip level as it's render attachment.
          loadValue: [0, 0, 0, 0],
          storeOp: 'store',
        },
      ],
    })

    // Need a separate bind group for each level to ensure
    // we're only sampling from the previous level.
    const bindGroup = gpuDevice.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: sampler,
        },
        {
          binding: 1,
          resource: srcView,
        },
      ],
    })

    // Render
    passEncoder.setPipeline(pipeline)
    passEncoder.setBindGroup(0, bindGroup)
    passEncoder.draw(4)
    passEncoder.endPass()

    // The source texture view for the next iteration of the loop is the
    // destination view for this one.
    srcView = dstView
  }
  gpuDevice.queue.submit([commandEncoder.finish()])
}
