import { WebGPURenderer } from '../webgpu-renderer'
import { Effect } from './effect'
import { PointLights } from '../lighting/point-lights'
import { SpotLight } from '../lighting/spot-light'
import { CopyPass } from './copy-pass'
import { BloomPassFragmentShader } from '../shaders/bloom-pass'
import { BloomBlurCompute } from '../shaders/bloom-blur-compute'

export class BloomPass extends Effect {
  private static readonly TILE_DIM = 128
  private static readonly BATCH = [4, 4]
  private static readonly FILTER_SIZE = 20
  private static readonly ITERATIONS = 4

  public pointLights: PointLights
  public spotLight: SpotLight
  public framebufferDescriptor: GPURenderPassDescriptor

  public bloomTexture: GPUTexture
  public inputTexture: GPUTexture
  public blurTextures: GPUTexture[]

  private blurPipeline!: GPUComputePipeline

  private blurConstantsBindGroupLayout: GPUBindGroupLayout
  private blurComputeConstantsBindGroup: GPUBindGroup

  private blurComputeBindGroupLayout: GPUBindGroupLayout
  private blurComputeBindGroup0: GPUBindGroup
  private blurComputeBindGroup1: GPUBindGroup
  private blurComputeBindGroup2: GPUBindGroup

  private sampler: GPUSampler
  private blockDim = 0

  private get isReady(): boolean {
    return !!this.renderPipeline && !!this.blurPipeline
  }

  constructor(renderer: WebGPURenderer, copyPass: CopyPass) {
    const bloomTexture = renderer.device.createTexture({
      label: 'bloom texture',
      size: renderer.outputSize,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba16float',
    })

    const bindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'bloom pass bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'float' },
        },
      ],
    })

    const blurTextures = [0, 1].map((_) =>
      renderer.device.createTexture({
        size: {
          width: renderer.outputSize[0],
          height: renderer.outputSize[1],
        },
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.STORAGE_BINDING |
          GPUTextureUsage.TEXTURE_BINDING,
      }),
    )

    const bindGroup = renderer.device.createBindGroup({
      label: 'gbuffer bind group',
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: copyPass.copyTexture.createView(),
        },
      ],
    })

    super(renderer, {
      fragmentShader: BloomPassFragmentShader,
      bindGroupLayouts: [bindGroupLayout, renderer.bindGroupsLayouts.frame],
      bindGroups: [bindGroup, renderer.bindGroups.frame],
      label: 'bloom pass effect',
      presentationFormat: 'rgba16float',
    })

    this.bloomTexture = bloomTexture
    this.inputTexture = copyPass.copyTexture
    this.blurTextures = blurTextures

    this.framebufferDescriptor = {
      colorAttachments: [
        {
          view: this.bloomTexture.createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }

    const blurParamsBuffer = this.renderer.device.createBuffer({
      label: 'blur params buffer',
      size: 2 * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
      mappedAtCreation: true,
    })
    {
      this.blockDim = BloomPass.TILE_DIM - (BloomPass.FILTER_SIZE - 1)
      new Uint32Array(blurParamsBuffer.getMappedRange()).set(
        new Uint32Array([BloomPass.FILTER_SIZE, this.blockDim]),
      )
    }
    blurParamsBuffer.unmap()

    this.sampler = this.renderer.device.createSampler({
      label: 'bloom sampler',
      minFilter: 'linear',
      magFilter: 'linear',
    })

    this.blurConstantsBindGroupLayout =
      this.renderer.device.createBindGroupLayout({
        label: 'blur constants bind group layout',
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            sampler: {
              type: 'filtering',
            },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {},
          },
        ],
      })

    this.blurComputeConstantsBindGroup = this.renderer.device.createBindGroup({
      label: 'blur constants bind group',
      layout: this.blurConstantsBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.sampler,
        },
        {
          binding: 1,
          resource: {
            buffer: blurParamsBuffer,
          },
        },
      ],
    })

    this.blurComputeBindGroupLayout =
      this.renderer.device.createBindGroupLayout({
        label: 'blur compute bind group layout',
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            texture: {
              sampleType: 'float',
            },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: {
              access: 'write-only',
              format: 'rgba8unorm',
            },
          },
          {
            binding: 2,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {},
          },
        ],
      })

    this.initComputePipeline()
  }

  private async initComputePipeline() {
    this.blurPipeline = await this.renderer.device.createComputePipelineAsync({
      label: 'bloom pass blur pipeline',
      layout: this.renderer.device.createPipelineLayout({
        label: 'bloom pass blur pipeline layout',
        bindGroupLayouts: [
          this.blurConstantsBindGroupLayout,
          this.blurComputeBindGroupLayout,
        ],
      }),
      compute: {
        module: this.renderer.device.createShaderModule({
          code: BloomBlurCompute,
        }),
        entryPoint: 'main',
      },
    })

    // horizontal flip
    const buffer0 = (() => {
      const buffer = this.renderer.device.createBuffer({
        size: 4,
        mappedAtCreation: true,
        usage: GPUBufferUsage.UNIFORM,
      })
      new Uint32Array(buffer.getMappedRange())[0] = 0
      buffer.unmap()
      return buffer
    })()

    // vertical flip
    const buffer1 = (() => {
      const buffer = this.renderer.device.createBuffer({
        size: 4,
        mappedAtCreation: true,
        usage: GPUBufferUsage.UNIFORM,
      })
      new Uint32Array(buffer.getMappedRange())[0] = 1
      buffer.unmap()
      return buffer
    })()

    this.blurComputeBindGroup0 = this.renderer.device.createBindGroup({
      label: 'blur compute bind group 0',
      layout: this.blurComputeBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.bloomTexture.createView(),
        },
        {
          binding: 1,
          resource: this.blurTextures[0].createView(),
        },
        {
          binding: 2,
          resource: {
            buffer: buffer0,
          },
        },
      ],
    })

    this.blurComputeBindGroup1 = this.renderer.device.createBindGroup({
      label: 'blur compute bind group 1',
      layout: this.blurComputeBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.blurTextures[0].createView(),
        },
        {
          binding: 1,
          resource: this.blurTextures[1].createView(),
        },
        {
          binding: 2,
          resource: {
            buffer: buffer1,
          },
        },
      ],
    })

    this.blurComputeBindGroup2 = this.renderer.device.createBindGroup({
      label: 'blur compute bind group 2',
      layout: this.blurComputeBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.blurTextures[1].createView(),
        },
        {
          binding: 1,
          resource: this.blurTextures[0].createView(),
        },
        {
          binding: 2,
          resource: {
            buffer: buffer0,
          },
        },
      ],
    })
  }

  public updateBloom(computePass: GPUComputePassEncoder): void {
    if (!this.isReady) {
      return
    }
    const renderer = this.renderer
    const blockDim = this.blockDim
    const batch = BloomPass.BATCH
    const srcWidth = renderer.outputSize[0] * 0.2
    const srcHeight = renderer.outputSize[1] * 0.2
    computePass.setPipeline(this.blurPipeline)
    computePass.setBindGroup(0, this.blurComputeConstantsBindGroup)
    computePass.setBindGroup(1, this.blurComputeBindGroup0)
    computePass.dispatchWorkgroups(
      Math.ceil(srcWidth / blockDim),
      Math.ceil(srcHeight / batch[1]),
    )
    computePass.setBindGroup(1, this.blurComputeBindGroup1)
    computePass.dispatchWorkgroups(
      Math.ceil(srcHeight / blockDim),
      Math.ceil(srcWidth / batch[1]),
    )
    for (let i = 0; i < BloomPass.ITERATIONS - 1; ++i) {
      computePass.setBindGroup(1, this.blurComputeBindGroup2)
      computePass.dispatchWorkgroups(
        Math.ceil(srcWidth / blockDim),
        Math.ceil(srcHeight / batch[1]),
      )
      computePass.setBindGroup(1, this.blurComputeBindGroup1)
      computePass.dispatchWorkgroups(
        Math.ceil(srcHeight / blockDim),
        Math.ceil(srcWidth / batch[1]),
      )
    }
  }

  public render(renderPass: GPURenderPassEncoder): void {
    if (!this.isReady) {
      return
    }

    this.preRender(renderPass)
    renderPass.setBindGroup(1, this.renderer.bindGroups.frame)
    renderPass.drawIndexed(6)
  }
}
