import { vec3 } from 'gl-matrix'
import { deg2Rad } from '../math/deg-to-rad'
import { ISpotLight } from '../protocol'
import { WebGPURenderer } from '../webgpu-renderer'

export class SpotLights {
  public spotLights: SpotLight[] = []

  public bindGroupLayout!: GPUBindGroupLayout
  public bindGroup!: GPUBindGroup

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
    this.bindGroupLayout = this.renderer.device.createBindGroupLayout({
      label: 'spot lights bind group layout',
      entries: this.spotLights.map((_, i) => ({
        binding: i,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {},
      })),
    })
    this.bindGroup = this.renderer.device.createBindGroup({
      label: 'spot lights bind group',
      layout: this.bindGroupLayout,
      entries: this.spotLights.map((light, i) => ({
        binding: i,
        resource: {
          buffer: light.ubo,
        },
      })),
    })
    return this
  }
}

class SpotLight {
  private _position: vec3
  private _direction: vec3
  private _color: vec3
  private _cutOff: number
  private _outerCutOff: number
  private _intensity: number

  ubo: GPUBuffer

  public get position(): vec3 {
    return this._position
  }

  public set position(v: vec3) {
    this._position = v
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      0 * Float32Array.BYTES_PER_ELEMENT,
      v as Float32Array,
    )
  }

  public get direction(): vec3 {
    return this._direction
  }

  public set direction(v: vec3) {
    this._direction = v
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      4 * Float32Array.BYTES_PER_ELEMENT,
      v as Float32Array,
    )
  }

  public get color(): vec3 {
    return this._color
  }

  public set color(v: vec3) {
    this._color = v
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      8 * Float32Array.BYTES_PER_ELEMENT,
      v as Float32Array,
    )
  }

  public get cutOff(): number {
    return this._cutOff
  }

  public set cutOff(v: number) {
    this._cutOff = v
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      11 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([Math.cos(v)]),
    )
  }

  public get outerCutOff(): number {
    return this._outerCutOff
  }

  public set outerCutOff(v: number) {
    this._cutOff = v
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      12 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([Math.cos(v)]),
    )
  }

  public get intensity(): number {
    return this._intensity
  }

  public set intensity(v: number) {
    this._intensity = v
    this.renderer.device.queue.writeBuffer(
      this.ubo,
      13 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([v]),
    )
  }

  constructor(
    private renderer: WebGPURenderer,
    {
      position,
      direction = vec3.fromValues(0, 0, 0),
      color = vec3.fromValues(1, 1, 1),
      cutOff = deg2Rad(2),
      outerCutOff = deg2Rad(20),
      intensity = 1.0,
    }: ISpotLight,
  ) {
    const uboByteLength =
      4 * Float32Array.BYTES_PER_ELEMENT + // position
      4 * Float32Array.BYTES_PER_ELEMENT + // direction
      3 * Float32Array.BYTES_PER_ELEMENT + // color
      1 * Float32Array.BYTES_PER_ELEMENT + // cutOff
      1 * Float32Array.BYTES_PER_ELEMENT + // outerCutOff
      1 * Float32Array.BYTES_PER_ELEMENT // intensity

    this.ubo = renderer.device.createBuffer({
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      size: uboByteLength,
    })

    this.position = position
    this.direction = direction
    this.color = color
    this.cutOff = cutOff
    this.outerCutOff = outerCutOff
    this.intensity = intensity
  }
}
