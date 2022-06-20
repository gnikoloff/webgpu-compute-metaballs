import { vec3 } from 'gl-matrix'
import { PerspectiveCamera } from '../camera/perspective-camera'
import { deg2Rad } from '../math/deg-to-rad'
import { ISpotLight } from '../protocol'
import { WebGPURenderer } from '../webgpu-renderer'

export class SpotLight {
  private static readonly SHADOWMAP_SIZE = 512

  private camera: PerspectiveCamera

  private _position: vec3
  private _direction: vec3
  private _color: vec3
  private _cutOff: number
  private _outerCutOff: number
  private _intensity: number

  public lightInfoUBO: GPUBuffer
  public projectionUBO: GPUBuffer
  public viewUBO: GPUBuffer
  public depthTexture: GPUTexture
  public framebufferDescriptor: GPURenderPassDescriptor

  public get position(): vec3 {
    return this._position
  }

  public set position(v: vec3) {
    this._position = v
    this.renderer.device.queue.writeBuffer(
      this.lightInfoUBO,
      0 * Float32Array.BYTES_PER_ELEMENT,
      v as Float32Array,
    )

    this.camera.position = [-v[0] * 15, v[1], -v[2] * 15]
    this.camera.updateViewMatrix()

    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      0 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.viewMatrix as Float32Array,
    )
    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.viewInvMatrix as Float32Array,
    )
  }

  public get direction(): vec3 {
    return this._direction
  }

  public set direction(v: vec3) {
    this._direction = v
    this.renderer.device.queue.writeBuffer(
      this.lightInfoUBO,
      4 * Float32Array.BYTES_PER_ELEMENT,
      v as Float32Array,
    )

    this.camera.lookAtPosition = [v[0], v[1], v[2]]
    this.camera.updateViewMatrix()

    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      0 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.viewMatrix as Float32Array,
    )
    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.viewInvMatrix as Float32Array,
    )
  }

  public get color(): vec3 {
    return this._color
  }

  public set color(v: vec3) {
    this._color = v
    this.renderer.device.queue.writeBuffer(
      this.lightInfoUBO,
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
      this.lightInfoUBO,
      11 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([Math.cos(v)]),
    )
  }

  public get outerCutOff(): number {
    return this._outerCutOff
  }

  public set outerCutOff(v: number) {
    this._outerCutOff = v
    this.renderer.device.queue.writeBuffer(
      this.lightInfoUBO,
      12 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([Math.cos(v)]),
    )

    this.camera.fieldOfView = v
    this.camera.updateProjectionMatrix()

    this.renderer.device.queue.writeBuffer(
      this.projectionUBO,
      0 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.projectionMatrix as Float32Array,
    )
    this.renderer.device.queue.writeBuffer(
      this.projectionUBO,
      16 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.projectionInvMatrix as Float32Array,
    )
  }

  public get intensity(): number {
    return this._intensity
  }

  public set intensity(v: number) {
    this._intensity = v
    this.renderer.device.queue.writeBuffer(
      this.lightInfoUBO,
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
    this.camera = new PerspectiveCamera(deg2Rad(56), 1, 0.1, 120)
    this.camera.updateViewMatrix().updateProjectionMatrix()
    this.depthTexture = renderer.device.createTexture({
      size: {
        width: SpotLight.SHADOWMAP_SIZE,
        height: SpotLight.SHADOWMAP_SIZE,
      },
      format: 'depth32float',
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    })

    this.lightInfoUBO = renderer.device.createBuffer({
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      size:
        4 * Float32Array.BYTES_PER_ELEMENT + // position
        4 * Float32Array.BYTES_PER_ELEMENT + // direction
        3 * Float32Array.BYTES_PER_ELEMENT + // color
        1 * Float32Array.BYTES_PER_ELEMENT + // cutOff
        1 * Float32Array.BYTES_PER_ELEMENT + // outerCutOff
        1 * Float32Array.BYTES_PER_ELEMENT, // intensity,
    })

    this.projectionUBO = renderer.device.createBuffer({
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      size:
        16 * Float32Array.BYTES_PER_ELEMENT + // matrix
        16 * Float32Array.BYTES_PER_ELEMENT + // inverse matrix
        8 * Float32Array.BYTES_PER_ELEMENT + // screen size
        1 * Float32Array.BYTES_PER_ELEMENT + // near
        1 * Float32Array.BYTES_PER_ELEMENT, // far
    })
    this.renderer.device.queue.writeBuffer(
      this.projectionUBO,
      0 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.projectionMatrix as Float32Array,
    )
    this.renderer.device.queue.writeBuffer(
      this.projectionUBO,
      16 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.projectionInvMatrix as Float32Array,
    )
    this.renderer.device.queue.writeBuffer(
      this.projectionUBO,
      32 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([SpotLight.SHADOWMAP_SIZE, SpotLight.SHADOWMAP_SIZE]),
    )
    this.renderer.device.queue.writeBuffer(
      this.projectionUBO,
      40 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([this.camera.near]),
    )
    this.renderer.device.queue.writeBuffer(
      this.projectionUBO,
      41 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([this.camera.near]),
    )

    this.viewUBO = renderer.device.createBuffer({
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      size:
        16 * Float32Array.BYTES_PER_ELEMENT + // matrix
        16 * Float32Array.BYTES_PER_ELEMENT + // inverse matrix
        3 * Float32Array.BYTES_PER_ELEMENT + // camera position
        1 * Float32Array.BYTES_PER_ELEMENT + // time
        1 * Float32Array.BYTES_PER_ELEMENT, // delta time
    })

    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      0 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.viewMatrix as Float32Array,
    )
    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      16 * Float32Array.BYTES_PER_ELEMENT,
      this.camera.viewInvMatrix as Float32Array,
    )
    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      32 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array(this.camera.position),
    )
    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      35 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([0]),
    )
    this.renderer.device.queue.writeBuffer(
      this.viewUBO,
      36 * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array([0]),
    )

    this.position = position
    this.direction = direction
    this.color = color
    this.cutOff = cutOff
    this.outerCutOff = outerCutOff
    this.intensity = intensity

    this.framebufferDescriptor = {
      colorAttachments: [],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    }
  }
}
