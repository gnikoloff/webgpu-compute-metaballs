import { alignUniformsToStd140Layout } from './lib/hwoa-rang-gpu'
import { Uniform, UniformDefinition } from './lib/hwoa-rang-gpu'

export default class UBOBuffer {
  device: GPUDevice
  byteLength: number
  uniforms: {
    [key: string]: UniformDefinition
  }
  buffer: GPUBuffer

  constructor(device: GPUDevice, uniforms: { [key: string]: Uniform }) {
    this.device = device
    const [byteLength, alignedUniforms] = alignUniformsToStd140Layout(uniforms)
    this.byteLength = byteLength
    this.uniforms = alignedUniforms
    this.buffer = device.createBuffer({
      size: byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    })
    for (const uniform of Object.values(alignedUniforms)) {
      if (!uniform.value) {
        continue
      }
      device.queue.writeBuffer(this.buffer, uniform.byteOffset, uniform.value)
    }
  }

  updateUniform(key: string, value: ArrayBuffer | SharedArrayBuffer): this {
    const uniform = this.uniforms[key]
    if (!uniform) {
      console.error(`can't find uniform!`)
      return this
    }
    uniform.value = value
    this.device.queue.writeBuffer(
      this.buffer,
      uniform.byteOffset,
      uniform.value,
    )
    return this
  }
}
