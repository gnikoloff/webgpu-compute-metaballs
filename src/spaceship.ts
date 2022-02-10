import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'

import { SAMPLE_COUNT } from './constants'

import {
  SceneObject,
  Geometry,
  VertexBuffer,
  IndexBuffer,
  Mesh,
  UniformBuffer,
  Texture,
} from './lib/hwoa-rang-gpu'

import WebGPURenderer from './webgpu-renderer'

import gltfModelURL from './assets/SS.gltf'
import {
  SPACESHIP_FRAGMENT_SHADER,
  SPACESHIP_VERTEX_SHADER,
} from './shaders/spaceship'

const attribNameToShaderNames = new Map([
  ['NORMAL', 'normal'],
  ['POSITION', 'position'],
  ['TEXCOORD_0', 'uv'],
])

export default class Spaceship extends SceneObject {
  renderer: WebGPURenderer
  renderPipeline!: GPURenderPipeline
  modelUBO: UniformBuffer

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
      debugLabel: 'spaceship model ubo',
    })

    this.init()
  }

  async init() {
    const gltf = await load(gltfModelURL, GLTFLoader)

    const initNode = (gltfNode, sceneNode: SceneObject) => {
      const children = gltfNode.nodes || gltfNode.children

      let currentNode: SceneObject
      if (gltfNode.mesh) {
        for (const primitive of gltfNode.mesh.primitives) {
          const geometry = new Geometry()
          let bindIdx = 0

          for (const [key, attribute] of Object.entries(primitive.attributes)) {
            const attribName = attribNameToShaderNames.get(key)
            let vertexFormat: GPUVertexFormat = 'float32x2'

            if (attribute.components === 3) {
              vertexFormat = 'float32x3'
            } else if (attribute.components === 4) {
              vertexFormat = 'float32x4'
            }
            const buffer = new VertexBuffer(this.renderer.device, {
              typedArray: attribute.value,
              stride: attribute.bytesPerElement,
              bindPointIdx: bindIdx,
              debugLabel: key,
            }).addAttribute(
              attribName,
              0,
              attribute.bytesPerElement,
              vertexFormat,
            )

            geometry.addVertexBuffer(buffer)
            bindIdx++
          }

          if (primitive.indices) {
            const indexBuffer = new IndexBuffer(this.renderer.device, {
              typedArray: primitive.indices.value,
            })
            geometry.addIndexBuffer(indexBuffer)
          }

          const textures: Texture[] = []
          if (primitive.material) {
            for (const [key, materialProp] of Object.entries(
              primitive.material,
            )) {
              if (!materialProp.texture) {
                continue
              }
              textures.push(
                new Texture(
                  this.renderer.device,
                  key,
                  'float',
                  '2d',
                  'texture_2d<f32>',
                ).fromImageBitmap(materialProp.texture.source.image),
              )
            }
          }

          currentNode = new Mesh(this.renderer.device, {
            geometry,
            ubos: [
              this.renderer.projectionUBO,
              this.renderer.viewUBO,
              this.modelUBO,
            ],
            samplers: [this.renderer.defaultSampler],
            textures,
            vertexShaderSource: {
              main: SPACESHIP_VERTEX_SHADER,
            },
            fragmentShaderSource: {
              main: SPACESHIP_FRAGMENT_SHADER,
            },
            multisample: {
              count: SAMPLE_COUNT,
            },
          })
          currentNode.setParent(sceneNode)
        }
      } else {
        currentNode = new SceneObject()
        currentNode.setParent(sceneNode)
      }

      if (gltfNode.translation) {
        const [x, y, z] = gltfNode.translation
        currentNode.setPosition({ x, y, z })
      }
      if (gltfNode.scale) {
        const [x, y, z] = gltfNode.scale
        currentNode.setScale({ x, y, z })
      }

      if (children && children.length) {
        for (const childNode of children) {
          initNode(childNode, currentNode)
        }
      }
    }

    initNode(gltf.scenes[0], this)
    const sc = 4
    this.setScale({ x: sc, y: sc, z: sc }).updateWorldMatrix()
  }

  update(time: DOMHighResTimeStamp, dt: number): this {
    this.setRotation({ y: time }).updateWorldMatrix()
    return this
  }

  render(renderPass: GPURenderPassEncoder) {
    this.modelUBO.updateUniform('matrix', this.modelMatrix as Float32Array)
    // console.log(this.modelMatrix)
    this.traverse((node) => {
      if (!(node instanceof Mesh)) {
        return
      }
      node.render(renderPass)
    })
  }
}
