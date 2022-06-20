import { mat4, vec3 } from 'gl-matrix'
import { DEPTH_FORMAT } from '../constants'
import {
  BoxOutlineFragmentShader,
  BoxOutlineVertexShader,
} from '../shaders/box-outline'
import { WebGPURenderer } from '../webgpu-renderer'

export class BoxOutline {
  private static readonly RADIUS = 2.5
  private static readonly SIDE_COUNT = 13

  private vertexBuffer: GPUBuffer
  private indexBuffer: GPUBuffer
  private instanceBuffer: GPUBuffer

  private renderPipeline: GPURenderPipeline

  constructor(private renderer: WebGPURenderer) {
    // prettier-ignore
    const vertices = new Float32Array([
			-BoxOutline.RADIUS, 0, 0,
			 BoxOutline.RADIUS, 0, 0,
		])
    const indices = new Uint16Array([...new Array(16).fill(0).map((_, i) => i)])

    this.vertexBuffer = renderer.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      label: 'box outline vertex buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices)
    this.vertexBuffer.unmap()

    this.indexBuffer = renderer.device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      label: 'box outline index buffer',
      mappedAtCreation: true,
    })
    new Uint16Array(this.indexBuffer.getMappedRange()).set(indices)
    this.indexBuffer.unmap()

    const instanceMatrices = new Float32Array(BoxOutline.SIDE_COUNT * 16)

    const instanceMatrix = mat4.create()
    // top ring
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(0, BoxOutline.RADIUS, BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 0, 0),
    )
    instanceMatrices.set(instanceMatrix, 0 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(BoxOutline.RADIUS, BoxOutline.RADIUS, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 1, 0),
    )
    instanceMatrices.set(instanceMatrix, 1 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(-BoxOutline.RADIUS, BoxOutline.RADIUS, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, -1, 0),
    )
    instanceMatrices.set(instanceMatrix, 2 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(0, BoxOutline.RADIUS, -BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI,
      vec3.fromValues(0, 1, 0),
    )
    instanceMatrices.set(instanceMatrix, 3 * 16)
    //bottom ring
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(0, -BoxOutline.RADIUS, BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 0, 0),
    )
    instanceMatrices.set(instanceMatrix, 4 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(BoxOutline.RADIUS, -BoxOutline.RADIUS, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 1, 0),
    )
    instanceMatrices.set(instanceMatrix, 5 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(-BoxOutline.RADIUS, -BoxOutline.RADIUS, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, -1, 0),
    )
    instanceMatrices.set(instanceMatrix, 6 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(0, -BoxOutline.RADIUS, -BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI,
      vec3.fromValues(0, 1, 0),
    )
    instanceMatrices.set(instanceMatrix, 7 * 16)
    // sides

    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(BoxOutline.RADIUS, 0, BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI,
      vec3.fromValues(0, 1, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 0, 1),
    )
    instanceMatrices.set(instanceMatrix, 9 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(-BoxOutline.RADIUS, 0, BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI,
      vec3.fromValues(0, 1, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 0, 1),
    )
    instanceMatrices.set(instanceMatrix, 10 * 16)

    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(-BoxOutline.RADIUS, 0, -BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI,
      vec3.fromValues(0, 1, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 0, 1),
    )
    instanceMatrices.set(instanceMatrix, 11 * 16)
    mat4.identity(instanceMatrix)
    mat4.translate(
      instanceMatrix,
      instanceMatrix,
      vec3.fromValues(BoxOutline.RADIUS, 0, -BoxOutline.RADIUS),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI,
      vec3.fromValues(0, 1, 0),
    )
    mat4.rotate(
      instanceMatrix,
      instanceMatrix,
      Math.PI / 2,
      vec3.fromValues(0, 0, 1),
    )
    instanceMatrices.set(instanceMatrix, 12 * 16)

    this.instanceBuffer = renderer.device.createBuffer({
      size: instanceMatrices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      label: 'box outline instance matrices buffer',
      mappedAtCreation: true,
    })
    new Float32Array(this.instanceBuffer.getMappedRange()).set(instanceMatrices)
    this.instanceBuffer.unmap()

    this.init()
  }

  async init() {
    this.renderPipeline = await this.renderer.device.createRenderPipelineAsync({
      label: 'box outline render pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'box outline render pipeline layout',
        bindGroupLayouts: [this.renderer.bindGroupsLayouts.frame],
      }),
      primitive: {
        topology: 'line-strip',
        stripIndexFormat: 'uint16',
      },
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
      vertex: {
        entryPoint: 'main',
        buffers: [
          {
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 0,
                format: 'float32x3',
                offset: 0,
              },
            ],
          },
          {
            arrayStride: 16 * Float32Array.BYTES_PER_ELEMENT,
            stepMode: 'instance',
            attributes: [
              {
                shaderLocation: 1,
                format: 'float32x4',
                offset: 0 * Float32Array.BYTES_PER_ELEMENT,
              },
              {
                shaderLocation: 2,
                format: 'float32x4',
                offset: 4 * Float32Array.BYTES_PER_ELEMENT,
              },
              {
                shaderLocation: 3,
                format: 'float32x4',
                offset: 8 * Float32Array.BYTES_PER_ELEMENT,
              },
              {
                shaderLocation: 4,
                format: 'float32x4',
                offset: 12 * Float32Array.BYTES_PER_ELEMENT,
              },
            ],
          },
        ],
        module: this.renderer.device.createShaderModule({
          code: BoxOutlineVertexShader,
        }),
      },
      fragment: {
        entryPoint: 'main',
        module: this.renderer.device.createShaderModule({
          code: BoxOutlineFragmentShader,
        }),
        targets: [
          // normal + material id
          { format: 'rgba16float' },
          // albedo
          {
            format: 'bgra8unorm',
          },
        ],
      },
    })
  }

  public render(renderPass: GPURenderPassEncoder): void {
    if (!this.renderPipeline) {
      return
    }
    renderPass.setPipeline(this.renderPipeline)
    renderPass.setBindGroup(0, this.renderer.bindGroups.frame)
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.setVertexBuffer(1, this.instanceBuffer)
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16')
    renderPass.drawIndexed(2, BoxOutline.SIDE_COUNT)
  }
}
