import { vec4 } from 'gl-matrix'
import { UpdatePointLightsComputeShader } from '../shaders/point-lights'
import { WebGPURenderer } from '../webgpu-renderer'

export class PointLightsCompute {
  private static readonly MAX_LIGHTS_COUNT = 50

  private lightsBufferComputeBindGroupLayout: GPUBindGroupLayout
  private lightsBufferComputeBindGroup: GPUBindGroup
  private updateComputePipeline: GPUComputePipeline

  public lightsBuffer: GPUBuffer
  public lightsConfigUniformBuffer: GPUBuffer

  public get isReady(): boolean {
    return !!this.updateComputePipeline
  }

  constructor(private renderer: WebGPURenderer) {
    const lightsDataStride = 12
    const lightsBufferByteSize =
      lightsDataStride *
      PointLightsCompute.MAX_LIGHTS_COUNT *
      Float32Array.BYTES_PER_ELEMENT
    this.lightsBuffer = renderer.device.createBuffer({
      size: lightsBufferByteSize,
      usage: GPUBufferUsage.STORAGE,
      mappedAtCreation: true,
    })

    const lightsData = new Float32Array(this.lightsBuffer.getMappedRange())
    const tmpVec4 = vec4.create()
    for (let i = 0; i < PointLightsCompute.MAX_LIGHTS_COUNT; i++) {
      const offset = lightsDataStride * i
      // position
      tmpVec4[0] = (Math.random() * 2 - 1) * 20
      tmpVec4[1] = -2
      tmpVec4[2] = (Math.random() * 2 - 1) * 20
      lightsData.set(tmpVec4, offset)
      // velocity
      tmpVec4[0] = Math.random() * 2
      tmpVec4[1] = Math.random() * 2
      tmpVec4[2] = Math.random() * 2
      lightsData.set(tmpVec4, offset + 4)
      // color
      tmpVec4[0] = Math.random() * 2
      tmpVec4[1] = Math.random() * 2
      tmpVec4[2] = Math.random() * 2
      // radius
      tmpVec4[3] = 20
      lightsData.set(tmpVec4, offset + 8)
    }
    this.lightsBuffer.unmap()

    this.lightsConfigUniformBuffer = renderer.device.createBuffer({
      size: Uint32Array.BYTES_PER_ELEMENT,
      mappedAtCreation: true,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    const lightsConfigArr = new Uint32Array(
      this.lightsConfigUniformBuffer.getMappedRange(),
    )
    lightsConfigArr[0] = PointLightsCompute.MAX_LIGHTS_COUNT
    this.lightsConfigUniformBuffer.unmap()

    this.lightsBufferComputeBindGroupLayout =
      this.renderer.device.createBindGroupLayout({
        label: 'lights update compute bind group layout',
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {
              type: 'storage',
            },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {},
          },
        ],
      })
    this.lightsBufferComputeBindGroup = this.renderer.device.createBindGroup({
      layout: this.lightsBufferComputeBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.lightsBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.lightsConfigUniformBuffer,
          },
        },
      ],
    })

    this.init()
  }

  async init() {
    this.updateComputePipeline =
      await this.renderer.device.createComputePipelineAsync({
        label: 'point light update compute pipeline',
        layout: this.renderer.device.createPipelineLayout({
          label: 'point light update compute pipeline layout',
          bindGroupLayouts: [
            this.lightsBufferComputeBindGroupLayout,
            this.renderer.bindGroupsLayouts.frame,
          ],
        }),
        compute: {
          module: this.renderer.device.createShaderModule({
            code: UpdatePointLightsComputeShader,
          }),
          entryPoint: 'main',
        },
      })
  }

  updateSim(computePass: GPUComputePassEncoder): this {
    if (!this.isReady) {
      return this
    }
    computePass.setPipeline(this.updateComputePipeline)
    computePass.setBindGroup(0, this.lightsBufferComputeBindGroup)
    computePass.setBindGroup(1, this.renderer.bindGroups.frame)
    computePass.dispatchWorkgroups(
      Math.ceil(PointLightsCompute.MAX_LIGHTS_COUNT / 64),
    )
    return this
  }
}
