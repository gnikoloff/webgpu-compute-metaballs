import { BACKGROUND_COLOR, DEPTH_FORMAT, SAMPLE_COUNT } from './constants'
import { BindGroup, Sampler, UniformBuffer } from './lib/hwoa-rang-gpu'

export default class WebGPURenderer {
  adapter: GPUAdapter

  #outputSize: [number, number] = [512, 512]
  devicePixelRatio = 1
  canvas = document.createElement('canvas')
  context = this.canvas.getContext('webgpu')!

  bindGroups: { [key: string]: BindGroup } = {}

  device!: GPUDevice
  colorAttachment!: GPURenderPassColorAttachment
  depthAndStencilAttachment!: GPURenderPassDepthStencilAttachment

  projectionUBO!: UniformBuffer
  viewUBO!: UniformBuffer
  defaultSampler: Sampler

  get presentationFormat() {
    return this.context.getPreferredFormat(this.adapter)
  }

  set outputSize(size: [number, number]) {
    const [w, h] = size
    this.#outputSize = size
    this.canvas.width = w * devicePixelRatio
    this.canvas.height = h * devicePixelRatio
    this.canvas.style.setProperty('width', `${w}px`)
    this.canvas.style.setProperty('height', `${h}px`)
  }

  get outputSize(): [number, number] {
    return this.#outputSize
  }

  constructor(adapter: GPUAdapter) {
    this.adapter = adapter
  }

  async init() {
    this.device = await this.adapter.requestDevice()

    this.defaultSampler = new Sampler(
      this.device,
      'mySampler',
      'filtering',
      'sampler',
    )

    this.projectionUBO = new UniformBuffer(this.device, {
      name: 'ProjectionUniforms',
      uniforms: {
        matrix: {
          type: 'mat4x4<f32>',
        },
        outputSize: {
          type: 'vec2<f32>',
        },
        zNear: {
          type: 'f32',
        },
        zFar: {
          type: 'f32',
        },
      },
    })
    this.viewUBO = new UniformBuffer(this.device, {
      name: 'ViewUniforms',
      uniforms: {
        matrix: {
          type: 'mat4x4<f32>',
        },
        position: {
          type: 'vec3<f32>',
        },
        time: {
          type: 'f32',
        },
      },
    })

    const presentationFormat = this.context.getPreferredFormat(this.adapter)
    this.context.configure({
      device: this.device,
      format: presentationFormat,
    })

    const msaaColorTexture = this.device.createTexture({
      size: { width: this.outputSize[0], height: this.outputSize[1] },
      sampleCount: SAMPLE_COUNT,
      format: presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })

    this.colorAttachment = {
      view: msaaColorTexture.createView(),
      resolveTarget: undefined,
      clearValue: {
        r: BACKGROUND_COLOR[0],
        g: BACKGROUND_COLOR[1],
        b: BACKGROUND_COLOR[2],
        a: BACKGROUND_COLOR[3],
      },
      loadOp: 'clear',
      storeOp: 'discard',
    }

    const depthTexture = this.device.createTexture({
      size: { width: this.outputSize[0], height: this.outputSize[1] },
      sampleCount: SAMPLE_COUNT,
      format: DEPTH_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    this.depthAndStencilAttachment = {
      view: depthTexture.createView(),
      depthLoadValue: 1,
      depthStoreOp: 'discard',
      // stencilLoadValue: 0,
      // stencilStoreOp: 'discard',

      // view: depthTexture.createView(),
      // // depthLoadValue: 1,
      // depthLoadOp: 'clear',
      // depthStoreOp: 'discard',
      // // depthStoreOp: 'discard',
      // // depthReadOnly: false,
      // // stencilLoadValue: 0,
      // // stencilStoreOp: 'discard',
    }

    this.bindGroups.frame = new BindGroup(this.device, 0)
    this.bindGroups.frame.addUBO(this.projectionUBO)
    this.bindGroups.frame.addUBO(this.viewUBO)
    this.bindGroups.frame.init()
  }

  onRender() {
    this.colorAttachment.resolveTarget = this.context
      .getCurrentTexture()
      .createView()
  }
}
