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

import {
  SPACESHIP_FRAGMENT_SHADER,
  SPACESHIP_VERTEX_SHADER,
} from './shaders/spaceship'

import {
  DISTRIBUTION_GGX_PBR_SHADER_FN,
  FRESNEL_SCHLICK_PBR_SHADER_FN,
  GEOMETRY_SMITH_PBR_SHADER_FN,
  GET_NORMAL_FROM_MAP_PBR_SHADER_FN,
  LIGHT_RADIANCE_PBR_SHADER_FN,
  LINEAR_TO_SRGB_SHADER_FN,
  POINT_LIGHT_SHADER_STRUCT,
  REINHARD_TONEMAPPING_PBR_SHADER_FN,
  SURFACE_SHADER_STRUCT,
} from './shaders/pbr'

import gltfModelURL from './assets/sponza/sponza.glb'

const attribNameToShaderNames = new Map([
  ['NORMAL', 'normal'],
  ['POSITION', 'position'],
  ['TANGENT', 'tangent'],
  ['TEXCOORD_0', 'uv'],
])

export default class Spaceship extends SceneObject {
  renderer: WebGPURenderer
  renderPipeline!: GPURenderPipeline
  modelUBO: UniformBuffer

  transparentRoot = new SceneObject()

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

    const initNode = (
      gltfNode,
      sceneNode: SceneObject,
      transparentRootNode: SceneObject,
    ) => {
      const children = gltfNode.nodes || gltfNode.children

      let currentNode: SceneObject
      if (gltfNode.mesh) {
        for (const primitive of gltfNode.mesh.primitives) {
          const geometry = new Geometry()
          let bindIdx = 0

          // console.log(primitive.attribName)
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
              byteLength: Math.ceil(primitive.indices.value.byteLength / 8) * 8,
            })
            geometry.addIndexBuffer(indexBuffer)
          }

          const textures: Texture[] = []
          if (primitive.material) {
            // console.log(primitive.material)
            if (primitive.material.normalTexture) {
              textures.push(
                new Texture(
                  this.renderer.device,
                  'normalTexture',
                  'float',
                  '2d',
                  'texture_2d<f32>',
                ).fromImageBitmap(
                  primitive.material.normalTexture.texture.source.image,
                ),
              )
            }
            if (primitive.material.pbrMetallicRoughness.baseColorTexture) {
              textures.push(
                new Texture(
                  this.renderer.device,
                  'albedoTexture',
                  'float',
                  '2d',
                  'texture_2d<f32>',
                ).fromImageBitmap(
                  primitive.material.pbrMetallicRoughness.baseColorTexture
                    .texture.source.image,
                ),
              )
              if (
                primitive.material.pbrMetallicRoughness.metallicRoughnessTexture
              ) {
                textures.push(
                  new Texture(
                    this.renderer.device,
                    'roughnessTexture',
                    'float',
                    '2d',
                    'texture_2d<f32>',
                  ).fromImageBitmap(
                    primitive.material.pbrMetallicRoughness
                      .metallicRoughnessTexture.texture.source.image,
                  ),
                )
              }
            }
          }

          currentNode = new Mesh(this.renderer.device, {
            geometry,
            ubos: [
              this.renderer.projectionUBO,
              this.renderer.viewUBO,
              this.modelUBO,
            ],
            samplers: [
              this.renderer.defaultSampler,
              this.renderer.noFilterSampler,
            ],
            textures,
            vertexShaderSource: {
              outputs: {
                worldPosition: {
                  format: 'float32x3',
                },
                bitangent: {
                  format: 'float32x3',
                },
              },
              main: SPACESHIP_VERTEX_SHADER({
                useNormalMap: !!primitive.attributes.TANGENT,
              }),
            },
            fragmentShaderSource: {
              inputs: {
                worldPosition: {
                  format: 'float32x3',
                },
                bitangent: {
                  format: 'float32x3',
                },
              },
              head: `
                let PI = ${Math.PI};
                ${POINT_LIGHT_SHADER_STRUCT}
                ${SURFACE_SHADER_STRUCT}
                ${DISTRIBUTION_GGX_PBR_SHADER_FN}
                ${GEOMETRY_SMITH_PBR_SHADER_FN}
                ${FRESNEL_SCHLICK_PBR_SHADER_FN}
                ${REINHARD_TONEMAPPING_PBR_SHADER_FN}
                ${LIGHT_RADIANCE_PBR_SHADER_FN}
                ${LINEAR_TO_SRGB_SHADER_FN}
              `,
              main: SPACESHIP_FRAGMENT_SHADER({
                baseColorFactor:
                  primitive.material.pbrMetallicRoughness.baseColorFactor,
                useNormalMap: !!primitive.attributes.TANGENT,
                useAlbedoTexture:
                  !!primitive.material.pbrMetallicRoughness.baseColorTexture,
                useNormalTexture: !!primitive.material.normalTexture,
                useMetallicRoughnessTexture:
                  !!primitive.material.pbrMetallicRoughness
                    .metallicRoughnessTexture,
              }),
            },
            multisample: {
              count: SAMPLE_COUNT,
            },
          })
          console.log(primitive)
          if (primitive.material.alphaMode === 'MASK') {
            currentNode.setParent(transparentRootNode)
          } else {
            currentNode.setParent(sceneNode)
          }
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
          initNode(childNode, currentNode, transparentRootNode)
        }
      }
    }

    initNode(gltf.scenes[0], this, this.transparentRoot)
    const sc = 0.015
    this.setScale({ x: sc, y: sc, z: sc })
      .setPosition({ z: 0, x: 0.5 })
      .setRotation({ y: Math.PI / 2 })
      .updateWorldMatrix()
  }

  update(time: DOMHighResTimeStamp, dt: number): this {
    // this.setRotation({ y: time }).updateWorldMatrix()
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
    this.transparentRoot.traverse((node) => {
      if (!(node instanceof Mesh)) {
        return
      }
      node.render(renderPass)
    })
  }
}
