import { BACKGROUND_COLOR, DEPTH_FORMAT, SAMPLE_COUNT } from './constants'
import UBOBuffer from './ubo-buffer'

export default class WebGPURenderer {
  adapter: GPUAdapter

  #outputSize: [number, number] = [512, 512]
  devicePixelRatio = 1
  canvas = document.createElement('canvas')
  context = this.canvas.getContext('webgpu')!

  bindGroupLayouts: { [key: string]: GPUBindGroupLayout } = {}
  bindGroups: { [key: string]: GPUBindGroup } = {}

  device!: GPUDevice
  colorAttachment!: GPURenderPassColorAttachment
  depthAndStencilAttachment!: GPURenderPassDepthStencilAttachment

  projectionUBO!: UBOBuffer
  viewUBO!: UBOBuffer

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

    this.projectionUBO = new UBOBuffer(this.device, {
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
    })
    this.viewUBO = new UBOBuffer(this.device, {
      matrix: {
        type: 'mat4x4<f32>',
      },
      position: {
        type: 'vec3<f32>',
      },
      time: {
        type: 'f32',
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
      loadValue: {
        r: BACKGROUND_COLOR[0],
        g: BACKGROUND_COLOR[1],
        b: BACKGROUND_COLOR[2],
        a: BACKGROUND_COLOR[3],
      },
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
      stencilLoadValue: 0,
      stencilStoreOp: 'discard',
    }

    this.bindGroupLayouts.frame = this.device.createBindGroupLayout({
      label: 'frame-bind-group-layout',
      entries: [
        {
          binding: 0, // projection uniforms
          visibility:
            GPUShaderStage.VERTEX |
            GPUShaderStage.FRAGMENT |
            GPUShaderStage.COMPUTE,
          buffer: {},
        },
        {
          binding: 1, // view uniforms
          visibility:
            GPUShaderStage.VERTEX |
            GPUShaderStage.FRAGMENT |
            GPUShaderStage.COMPUTE,
          buffer: {},
        },
      ],
    })

    this.bindGroups.frame = this.device.createBindGroup({
      label: 'frame-bind-group',
      layout: this.bindGroupLayouts.frame,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.projectionUBO.buffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.viewUBO.buffer,
          },
        },
      ],
    })
  }

  onRender() {
    this.colorAttachment.resolveTarget = this.context
      .getCurrentTexture()
      .createView()
  }
}
