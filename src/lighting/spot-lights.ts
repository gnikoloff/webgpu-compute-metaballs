import { ISpotLight } from '../protocol'
import { WebGPURenderer } from '../webgpu-renderer'
import { SpotLight } from './spot-light'

export class SpotLights {
  public spotLights: SpotLight[] = []

  public bindGroupLayouts: { [key: string]: GPUBindGroupLayout } = {}
  public bindGroups: { [key: string]: GPUBindGroup } = {}

  constructor(private renderer: WebGPURenderer) {}

  public get(i: number) {
    if (i < 0 || i >= this.spotLights.length) {
      throw new Error(`SpotLight index out of range: ${i}`)
    }
    return this.spotLights[i]
  }

  public add(lightProps: ISpotLight): this {
    const light = new SpotLight(this.renderer, lightProps)
    this.spotLights.push(light)
    return this
  }

  public init(): this {
    this.bindGroupLayouts.lights = this.renderer.device.createBindGroupLayout({
      label: 'spot lights bind group layout',
      entries: [
        ...this.spotLights.map((_, i) => ({
          binding: i,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {},
        })),
        {
          binding: 2,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'depth',
          },
        },
      ],
    })
    this.bindGroups.lights = this.renderer.device.createBindGroup({
      label: 'spot lights bind group',
      layout: this.bindGroupLayouts.lights,
      entries: [
        ...this.spotLights.map((light, i) => ({
          binding: i,
          resource: {
            buffer: light.lightInfoUBO,
          },
        })),
        { binding: 2, resource: this.spotLights[0].depthTexture.createView() },
      ],
    })

    this.bindGroupLayouts.cameraProjections =
      this.renderer.device.createBindGroupLayout({
        label: 'spotLight0 camera bind group layout',
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
          },
          {
            binding: 1,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
          },
        ],
      })

    this.bindGroups.spotLight0Camera = this.renderer.device.createBindGroup({
      label: 'spot lights projections bind group',
      layout: this.bindGroupLayouts.cameraProjections,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.spotLights[0].projectionUBO,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.spotLights[0].viewUBO,
          },
        },
      ],
    })
    this.bindGroups.spotLight1Camera = this.renderer.device.createBindGroup({
      label: 'spot lights projections bind group',
      layout: this.bindGroupLayouts.cameraProjections,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.spotLights[1].projectionUBO,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.spotLights[1].viewUBO,
          },
        },
        // { binding: 2, resource: this.spotLights[1].depthTexture.createView() },
      ],
    })

    // this.bindGroupLayouts.view = this.renderer.device.createBindGroupLayout({
    //   label: 'spot lights views bind group layout',
    //   entries: this.spotLights.map((_, i) => ({
    //     binding: i,
    //     visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    //     buffer: {},
    //   })),
    // })

    // this.bindGroups.view = this.renderer.device.createBindGroup({
    //   label: 'spot lights views bind group',
    //   layout: this.bindGroupLayouts.view,
    //   entries: this.spotLights.map((light, i) => ({
    //     binding: i,
    //     resource: {
    //       buffer: light.viewUBO,
    //     },
    //   })),
    // })

    return this
  }
}
