import { WebGPURenderer } from '../webgpu-renderer'
import { Effect } from './effect'
import { PointLights } from '../lighting/point-lights'
import { SpotLight } from '../lighting/spot-light'
import { DeferredPassFragmentShader } from '../shaders/deferred-pass'
import { vec3 } from 'gl-matrix'
import { deg2Rad } from '../helpers/deg-to-rad'

export class DeferredPass extends Effect {
  public pointLights: PointLights
  public spotLight: SpotLight
  public framebufferDescriptor: GPURenderPassDescriptor

  private spotLightTarget = vec3.fromValues(0, 80, 0)
  private spotLightColorTarget = vec3.fromValues(1, 1, 1)

  public get isReady(): boolean {
    return this.pointLights.isReady && !!this.renderPipeline
  }

  constructor(renderer: WebGPURenderer) {
    const pointLights = new PointLights(renderer)
    const spotLight = new SpotLight(renderer, {
      position: vec3.fromValues(10, 40, 1),
      direction: vec3.fromValues(0, 1.0, 0),
      color: vec3.fromValues(1, 1, 1),
      cutOff: deg2Rad(1),
      outerCutOff: deg2Rad(4),
      intensity: 8,
    })

    const gBufferTextureNormal = renderer.device.createTexture({
      label: 'gbuffer normal texture',
      size: [...renderer.outputSize, 1],
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'rgba16float',
    })
    const gbufferTextureDiffuse = renderer.device.createTexture({
      label: 'gbuffer diffuse texture',
      size: renderer.outputSize,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      format: 'bgra8unorm',
    })

    const bindGroupLayout = renderer.device.createBindGroupLayout({
      label: 'gbuffer bind group layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
          buffer: {
            type: 'read-only-storage',
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'unfilterable-float',
          },
        },
        {
          binding: 3,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        {
          binding: 4,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'depth',
          },
        },
      ],
    })

    const bindGroup = renderer.device.createBindGroup({
      label: 'gbuffer bind group',
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: pointLights.lightsBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: pointLights.lightsConfigUniformBuffer,
          },
        },
        {
          binding: 2,
          resource: gBufferTextureNormal.createView(),
        },
        {
          binding: 3,
          resource: gbufferTextureDiffuse.createView(),
        },
        {
          binding: 4,
          resource: renderer.textures.depthTexture.createView(),
        },
      ],
    })

    super(renderer, {
      fragmentShader: DeferredPassFragmentShader,
      bindGroupLayouts: [
        bindGroupLayout,
        renderer.bindGroupsLayouts.frame,
        spotLight.bindGroupLayout.ubos,
        spotLight.bindGroupLayout.depthTexture,
      ],
      bindGroups: [
        bindGroup,
        renderer.bindGroups.frame,
        spotLight.bindGroup.ubos,
        spotLight.bindGroup.depthTexture,
      ],
      presentationFormat: 'rgba16float',
    })

    this.framebufferDescriptor = {
      colorAttachments: [
        {
          view: gBufferTextureNormal.createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
        {
          view: gbufferTextureDiffuse.createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: renderer.textures.depthTexture.createView(),
        depthLoadOp: 'clear',
        depthClearValue: 1,
        depthStoreOp: 'store',
      },
    }

    this.pointLights = pointLights
    this.spotLight = spotLight
  }

  public rearrange() {
    this.spotLightTarget[0] = (Math.random() * 2 - 1) * 3
    this.spotLightTarget[2] = (Math.random() * 2 - 1) * 3
    this.spotLightColorTarget[0] = Math.random()
    this.spotLightColorTarget[1] = Math.random()
    this.spotLightColorTarget[2] = Math.random()
  }

  updateLightsSim(
    computePass: GPUComputePassEncoder,
    _time: DOMHighResTimeStamp,
    tiemDelta: number,
  ) {
    this.pointLights.updateSim(computePass)
    const spotLight = this.spotLight
    const speed = tiemDelta * 2
    spotLight.position = vec3.fromValues(
      spotLight.position[0] +
        (this.spotLightTarget[0] - spotLight.position[0]) * speed,
      spotLight.position[1] +
        (this.spotLightTarget[1] - spotLight.position[1]) * speed,
      spotLight.position[2] +
        (this.spotLightTarget[2] - spotLight.position[2]) * speed,
    )

    this.spotLight.color = vec3.fromValues(
      (this.spotLightColorTarget[0] - this.spotLight.color[0]) * speed * 4,
      (this.spotLightColorTarget[1] - this.spotLight.color[1]) * speed * 4,
      (this.spotLightColorTarget[2] - this.spotLight.color[2]) * speed * 4,
    )
    // this.spotLights.get(0).direction = vec3.fromValues(
    //   Math.cos(-time) * 0.1,
    //   1,
    //   Math.sin(-time) * 0.1,
    // )
    // this.spotLights.get(0).direction = vec3.fromValues(
    //   Math.cos(time) * 0.3,
    //   0.1,
    //   Math.sin(time) * 0.3,
    // )
    // this.spotLights.get(1).position = vec3.fromValues(
    //   Math.cos(time + Math.PI) * 4,
    //   20,
    //   Math.sin(time + Math.PI) * 4,
    // )
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
