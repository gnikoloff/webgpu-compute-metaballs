import {
  Geometry,
  GeometryUtils,
  IndexBuffer,
  Mesh,
  Sampler,
  ShaderDefinition,
  Texture,
  UniformBuffer,
  VertexBuffer,
} from '../lib/hwoa-rang-gpu'
import WebGPURenderer from '../webgpu-renderer'

interface IEffect {
  vertexShaderSource: ShaderDefinition
  fragmentShaderSource: ShaderDefinition
  textures?: Texture[]
  samplers?: Sampler[]
  ubos?: UniformBuffer[]
}

export default class Effect extends Mesh {
  private modelUBO: UniformBuffer
  public framebufferDescriptor: GPURenderPassDescriptor
  protected passEncoder: GPURenderPassEncoder

  constructor(
    renderer: WebGPURenderer,
    {
      vertexShaderSource,
      fragmentShaderSource,
      textures = [],
      samplers = [],
      ubos = [],
    }: IEffect,
  ) {
    const geometry = new Geometry()
    const { vertexStride, interleavedArray, indicesArray } =
      GeometryUtils.createInterleavedPlane({
        width: innerWidth,
        height: innerHeight,
      })
    const vertexBuffer = new VertexBuffer(renderer.device, {
      bindPointIdx: 0,
      typedArray: interleavedArray,
      stride: vertexStride * Float32Array.BYTES_PER_ELEMENT,
    })
      .addAttribute(
        'position',
        0 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT,
        'float32x3',
      )
      .addAttribute(
        'uv',
        3 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT,
        'float32x2',
      )
    const indexBuffer = new IndexBuffer(renderer.device, {
      typedArray: indicesArray,
    })
    geometry.addVertexBuffer(vertexBuffer).addIndexBuffer(indexBuffer)
    const modelUBO = new UniformBuffer(renderer.device, {
      name: 'Model',
      uniforms: {
        matrix: {
          type: 'mat4x4<f32>',
          value: null,
        },
      },
      debugLabel: 'effect model ubo',
    })
    super(renderer.device, {
      geometry: geometry,
      ubos: [
        ...ubos,
        renderer.screenProjectionUBO,
        renderer.screenViewUBO,
        modelUBO,
      ],
      samplers,
      textures,
      vertexShaderSource,
      fragmentShaderSource,
      // depthStencil: {
      //   format: 'depth24plus',
      //   depthWriteEnabled: true,
      //   depthCompare: 'greater',
      // },
      targets: [
        {
          format: 'bgra8unorm',
        },
      ],
    })
    this.modelUBO = modelUBO
  }
  render(renderPass: GPURenderPassEncoder) {
    super.render(renderPass)

    this.modelUBO.updateUniform('matrix', this.modelMatrix as Float32Array)
  }
}
