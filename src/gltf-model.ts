import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf/dist/esm/gltf-loader'

import { webGPUTextureFromImageBitmapOrCanvas } from './lib/webgpu-texture-from-imagebitmap-or-canvas'

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
  MAKE_GLTF_MODEL_FRAGMENT_SHADER,
  MAKE_GLTF_MODEL_VERTEX_SHADER,
  SHADOW_FRAGMENT_SHADER,
  SHADOW_VERTEX_SHADER,
} from './shaders/gltf-model'

import {
  DIRECTIONAL_LIGHT_SHADER_STRUCT,
  DISTRIBUTION_GGX_PBR_SHADER_FN,
  FRESNEL_SCHLICK_PBR_SHADER_FN,
  GEOMETRY_SMITH_PBR_SHADER_FN,
  LIGHT_RADIANCE_PBR_SHADER_FN,
  LINEAR_TO_SRGB_SHADER_FN,
  POINT_LIGHT_SHADER_STRUCT,
  REINHARD_TONEMAPPING_PBR_SHADER_FN,
  SURFACE_SHADER_STRUCT,
} from './shaders/pbr'

import gltfModelURL from './assets/sponza/sponza-compressed.glb'
import { mat4 } from 'gl-matrix'

const attribNameToShaderNames = new Map([
  ['NORMAL', 'normal'],
  ['POSITION', 'position'],
  ['TANGENT', 'tangent'],
  ['TEXCOORD_0', 'uv'],
])

export default class GLTFModel extends SceneObject {
  renderer: WebGPURenderer
  renderPipeline!: GPURenderPipeline
  modelUBO: UniformBuffer

  opaqueRoot = new SceneObject()
  transparentRoot = new SceneObject()
  shadowRoot = new SceneObject()

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
      debugLabel: 'gltf model model ubo',
    })

    this.init()
  }

  async init() {
    const gltf = await load(gltfModelURL, GLTFLoader)

    const initNode = (
      gltfNode,
      sceneNode: SceneObject,
      transparentRootNode: SceneObject,
      shadowParentNode: SceneObject,
    ) => {
      const children = gltfNode.nodes || gltfNode.children

      let currentNode: SceneObject
      let shadowNode: SceneObject

			// console.log(gltfNode)

      if (gltfNode.mesh) {
        // console.log(gltfNode.mesh)
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
              const mipmappedTexture = webGPUTextureFromImageBitmapOrCanvas(
                this.renderer.device,
                primitive.material.pbrMetallicRoughness.baseColorTexture.texture
                  .source.image,
                true,
              )
              // console.log(mipmappedTexture)
              textures.push(
                new Texture(
                  this.renderer.device,
                  'albedoTexture',
                  'float',
                  '2d',
                  'texture_2d<f32>',
                ).fromTexture(mipmappedTexture),
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

          shadowNode = new Mesh(this.renderer.device, {
            // debugVertexShader: true,
            // debugFragmentShader: true,
            geometry,
            ubos: [
              this.renderer.shadowProjectionUBO,
              this.renderer.shadowViewUBO,
              this.modelUBO,
            ],
            vertexShaderSource: {
              main: SHADOW_VERTEX_SHADER,
            },
            fragmentShaderSource: {
              main: SHADOW_FRAGMENT_SHADER,
            },
            targets: [],
            depthStencil: {
              depthWriteEnabled: true,
              depthCompare: 'less',
              format: 'depth32float',
            },
          })
          shadowNode.setParent(shadowParentNode)
					// console.log(primitive.material)
          currentNode = new Mesh(this.renderer.device, {
            geometry,
            ubos: [
              this.renderer.projectionUBO,
              this.renderer.viewUBO,
              this.renderer.shadowProjectionUBO,
              this.renderer.shadowViewUBO,
              this.modelUBO,
            ],
            samplers: [
              this.renderer.defaultSampler,
              this.renderer.depthSampler,
            ],
            textures: [...textures, this.renderer.shadowDepthTexture],
            vertexShaderSource: {
              outputs: {
                worldPosition: {
                  format: 'float32x3',
                },
                bitangent: {
                  format: 'float32x3',
                },
                shadowPos: {
                  format: 'float32x4',
                },
              },
              main: MAKE_GLTF_MODEL_VERTEX_SHADER({
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
                shadowPos: {
                  format: 'float32x4',
                },
              },
              head: `
                let PI = ${Math.PI};
                ${POINT_LIGHT_SHADER_STRUCT}
                ${DIRECTIONAL_LIGHT_SHADER_STRUCT}
                ${SURFACE_SHADER_STRUCT}
                ${DISTRIBUTION_GGX_PBR_SHADER_FN}
                ${GEOMETRY_SMITH_PBR_SHADER_FN}
                ${FRESNEL_SCHLICK_PBR_SHADER_FN}
                ${REINHARD_TONEMAPPING_PBR_SHADER_FN}
                ${LIGHT_RADIANCE_PBR_SHADER_FN}
                ${LINEAR_TO_SRGB_SHADER_FN}
              `,
              main: MAKE_GLTF_MODEL_FRAGMENT_SHADER({
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
          })
          if (primitive.material.alphaMode === 'MASK') {
            currentNode.setParent(transparentRootNode)
          } else {
            currentNode.setParent(sceneNode)
          }
        }
      } else {
        currentNode = new SceneObject()
        currentNode.setParent(sceneNode)

        shadowNode = new SceneObject()
        shadowNode.setParent(shadowParentNode)
      }

      if (gltfNode.translation) {
        const [x, y, z] = gltfNode.translation
        currentNode.setPosition({ x, y, z })
        shadowNode.setPosition({ x, y, z })
      }
      if (gltfNode.scale) {
        const [x, y, z] = gltfNode.scale
        currentNode.setScale({ x, y, z })
        shadowNode.setScale({ x, y, z })
      }

      if (children && children.length) {
        for (const childNode of children) {
          initNode(
            childNode,
            currentNode,
            transparentRootNode,
            shadowParentNode,
          )
        }
      }
    }

    initNode(
      gltf.scenes[0],
      this.opaqueRoot,
      this.transparentRoot,
      this.shadowRoot,
    )
    const sc = 0.015
    this.setScale({ x: sc, y: sc, z: sc })
      .setPosition({ z: 0, x: 0.5 })
      .setRotation({ y: Math.PI / 2 })
      .updateWorldMatrix()

    this.transparentRoot.copyFromMatrix(this.worldMatrix).updateWorldMatrix()
    this.opaqueRoot.copyFromMatrix(this.worldMatrix).updateWorldMatrix()
    this.shadowRoot.copyFromMatrix(this.worldMatrix).updateWorldMatrix()
  }

  updateWorldMatrix(parentWorldMatrix?: mat4): this {
    super.updateWorldMatrix(parentWorldMatrix)
    this.modelUBO.updateUniform('matrix', this.modelMatrix as Float32Array)
    return this
  }
}
