import { mat4 } from 'gl-matrix'
import { SAMPLE_COUNT } from './constants'
import {
  VertexBuffer,
  UniformBuffer,
  Geometry,
  SceneObject,
  Mesh,
  IndexBuffer,
} from './lib/hwoa-rang-gpu/'
import {
  FIRE_EMITTER_FRAGMENT,
  FIRE_EMITTER_VERTEX,
} from './shaders/fire-emitter'
import WebGPURenderer from './webgpu-renderer'

const INSTANCE_COUNT = 2000

export default class FireEmitter extends SceneObject {
  renderer: WebGPURenderer
  renderPipeline!: GPURenderPipeline
  modelUBO: UniformBuffer
  mesh: Mesh

  constructor(renderer: WebGPURenderer) {
    super()
    this.renderer = renderer
    this.modelUBO = new UniformBuffer(this.renderer.device, {
      name: 'Model',
      uniforms: {
        matrix: {
          type: 'mat4x4<f32>',
          value: this.worldMatrix as Float32Array,
        },
      },
      debugLabel: 'fire emitter model ubo',
    })

    const vertices = new Float32Array([
      -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
    ])
    const indices = new Uint32Array([0, 1, 2, 1, 3, 2])
    const vertexBuffer = new VertexBuffer(this.renderer.device, {
      typedArray: vertices,
      bindPointIdx: 0,
      stride: 2 * Float32Array.BYTES_PER_ELEMENT,
      debugLabel: 'fire emitter vertex buffer',
    }).addAttribute(
      'position',
      0,
      2 * Float32Array.BYTES_PER_ELEMENT,
      'float32x2',
    )
    
    const indexBuffer = new IndexBuffer(this.renderer.device, {
      typedArray: indices,
      byteLength: Math.ceil(indices.byteLength / 8) * 8,
    })
    const geometry = new Geometry()
    geometry.instanceCount = INSTANCE_COUNT
    geometry
      .addVertexBuffer(vertexBuffer)
      .addIndexBuffer(indexBuffer)
    this.mesh = new Mesh(this.renderer.device, {
      geometry,
      ubos: [this.renderer.projectionUBO, this.renderer.viewUBO, this.modelUBO],
      vertexShaderSource: {
        main: FIRE_EMITTER_VERTEX,
      },
      fragmentShaderSource: {
        main: FIRE_EMITTER_FRAGMENT,
      },
      multisample: {
        count: SAMPLE_COUNT,
      },
      targets: [
        {
          format: 'bgra8unorm',
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
            alpha: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
          },
        },
      ],
      primitiveType: 'triangle-list',
    })
    this.mesh.setParent(this)

    // this.updateWorldMatrix()

    // console.log(this.modelMatrix)
  }
  updateWorldMatrix(parentWorldMatrix?: mat4): this {
    super.updateWorldMatrix(parentWorldMatrix)
    this.modelUBO.updateUniform('matrix', this.modelMatrix as Float32Array)
    return this
  }
}
