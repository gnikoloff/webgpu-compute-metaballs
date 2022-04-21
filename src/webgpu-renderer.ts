import {
  BACKGROUND_COLOR,
  DEPTH_FORMAT,
  SAMPLE_COUNT,
  SHADOW_MAP_SIZE,
} from './constants'
import {
  BindGroup,
  Sampler,
  Texture,
  Uniform,
  UniformBuffer,
} from './lib/hwoa-rang-gpu'

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
	
	depthTexture: Texture
  shadowDepthTexture: Texture
	gbufferDepthTexture: Texture

  projectionUBO!: UniformBuffer
  viewUBO!: UniformBuffer
	screenProjectionUBO!: UniformBuffer
	screenViewUBO: UniformBuffer
  shadowProjectionUBO!: UniformBuffer
  shadowViewUBO!: UniformBuffer

  defaultSampler: Sampler
  depthSampler: Sampler
  depthDebugSampler: Sampler

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

    // HACK: WebGPU does not expose maxAnisotropy (yet?)
    // Let's use a separate WebGL2 context to obtain the max anisotropy supported by the GPU
    const gl = document.createElement('canvas').getContext('webgl2')
    const ext =
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    const maxAnisotropy = ext
      ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      : 1
    this.defaultSampler = new Sampler(
      this.device,
      'defaultSampler',
      'filtering',
      'sampler',
      {
        minFilter: 'linear',
        mipmapFilter: 'linear',
        magFilter: 'linear',
        addressModeU: 'repeat',
        addressModeV: 'repeat',
        maxAnisotropy,
      },
    )

    const projectionUBOUniformDefinition: { [key: string]: Uniform } = {
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
    }
    const viewUBOUniformDefinition: { [key: string]: Uniform } = {
      matrix: {
        type: 'mat4x4<f32>',
      },
      position: {
        type: 'vec3<f32>',
      },
      time: {
        type: 'f32',
      },
    }

    this.projectionUBO = new UniformBuffer(this.device, {
      name: 'ProjectionUniforms',
      uniforms: projectionUBOUniformDefinition,
    })
    this.shadowProjectionUBO = new UniformBuffer(this.device, {
      name: 'ShadowProjectionUniforms',
      uniforms: projectionUBOUniformDefinition,
    })
    this.viewUBO = new UniformBuffer(this.device, {
      name: 'ViewUniforms',
      uniforms: viewUBOUniformDefinition,
    })
    this.shadowViewUBO = new UniformBuffer(this.device, {
      name: 'ShadowViewUniforms',
      uniforms: viewUBOUniformDefinition,
    })
		this.screenProjectionUBO = new UniformBuffer(this.device, {
			name: 'ScreenProjectionUniforms',
			uniforms: {
				matrix: {
					type: 'mat4x4<f32>',
				},
			}
		})
		this.screenViewUBO = new UniformBuffer(this.device, {
			name: 'ScreenViewUniforms',
			uniforms: {
				matrix: {
					type: 'mat4x4<f32>',
				},
			}
		})

    const presentationFormat = this.context.getPreferredFormat(this.adapter)
    this.context.configure({
      device: this.device,
      format: presentationFormat,
    })

    const msaaColorTexture = new Texture(
      this.device,
      'msaaTexture',
      'float',
      '2d',
    ).fromDefinition({
      size: { width: innerWidth * devicePixelRatio, height: innerHeight * devicePixelRatio },
      sampleCount: SAMPLE_COUNT,
      format: presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })

    this.colorAttachment = {
      view: msaaColorTexture.get().createView(),
      resolveTarget: undefined,
      clearValue: {
        r: BACKGROUND_COLOR[0],
        g: BACKGROUND_COLOR[1],
        b: BACKGROUND_COLOR[2],
        a: BACKGROUND_COLOR[3],
      },
      loadOp: 'clear',
      storeOp: 'store',
    }

    this.depthTexture = new Texture(
      this.device,
      'depthTexture',
      'depth',
      '2d',
      'texture_depth_2d',
    ).fromDefinition({
      size: { width: this.outputSize[0] * devicePixelRatio, height: this.outputSize[1] * devicePixelRatio },
      sampleCount: SAMPLE_COUNT,
      format: DEPTH_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })

		this.gbufferDepthTexture = new Texture(this.device, 'gBufferDepth').fromDefinition({
			size: [...this.outputSize, 1],
			format: 'depth24plus',
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		})

    // const depthTexture = this.device.createTexture({
    //   size: { width: this.outputSize[0], height: this.outputSize[1] },
    //   sampleCount: SAMPLE_COUNT,
    //   format: DEPTH_FORMAT,
    //   usage: GPUTextureUsage.RENDER_ATTACHMENT,
    // })

    this.depthAndStencilAttachment = {
      view: this.depthTexture.get().createView(),
      depthLoadOp: 'clear',
      depthStoreOp: 'discard',
    }

    this.shadowDepthTexture = new Texture(
      this.device,
      'shadowDepthTexture',
      'depth',
      '2d',
      'texture_depth_2d',
    ).fromDefinition({
      size: [SHADOW_MAP_SIZE, SHADOW_MAP_SIZE, 1],
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'depth32float',
    })
    this.depthDebugSampler = new Sampler(this.device, 'depthDebugSampler')
    this.depthSampler = new Sampler(
      this.device,
      'depthSampler',
      'comparison',
      'sampler_comparison',
			{
				compare: 'less',
			}
    )

    this.bindGroups.frame = new BindGroup(this.device, 0)
    this.bindGroups.frame.addUBO(this.projectionUBO)
    this.bindGroups.frame.addUBO(this.viewUBO)
    this.bindGroups.frame.init()

    this.bindGroups.shadow = new BindGroup(this.device, 0)
    this.bindGroups.shadow.addUBO(this.shadowProjectionUBO)
    this.bindGroups.shadow.addUBO(this.shadowViewUBO)
    this.bindGroups.shadow.init()

		this.bindGroups.screenOrthoFrame = new BindGroup(this.device, 0)
		this.bindGroups.screenOrthoFrame.addUBO(this.screenProjectionUBO)
		this.bindGroups.screenOrthoFrame.addUBO(this.screenViewUBO)
		this.bindGroups.screenOrthoFrame.init()
  }

  onRender() {
    this.colorAttachment.resolveTarget = this.context
      .getCurrentTexture()
      .createView()
  }
}
