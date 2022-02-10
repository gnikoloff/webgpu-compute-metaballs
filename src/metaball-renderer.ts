import { WorkgroupSize } from './lib/hwoa-rang-gpu'
import { MetaballPos, VolumeSettings } from './interfaces'

import {
  DEPTH_FORMAT,
  MAX_METABALLS,
  METABALLS_COMPUTE_WORKGROUP_SIZE,
  SAMPLE_COUNT,
} from './constants'

import getClockPositions from './get-clock-positions'

import {
  MarchingCubesEdgeTable,
  MarchingCubesTriTable,
} from './marching-cubes-tables'

import {
  MarchingCubesComputeSource,
  MetaballFieldComputeSource,
  METABALLS_FRAGMENT_SHADER,
  METABALLS_VERTEX_SHADER,
} from './shaders/metaball'

import WebGPURenderer from './webgpu-renderer'

export default class MetaballRenderer {
  renderer: WebGPURenderer
  volume: VolumeSettings

  tablesBuffer: GPUBuffer
  metaballBuffer: GPUBuffer
  volumeBuffer: GPUBuffer
  vertexBuffer: GPUBuffer
  normalBuffer: GPUBuffer
  indexBuffer: GPUBuffer
  indirectRenderBuffer: GPUBuffer

  computeMetaballsPipeline!: GPUComputePipeline
  computeMarchingCubesPipeline!: GPUComputePipeline
  renderMetaballsPipeline!: GPURenderPipeline

  computeMetaballsBindGroup!: GPUBindGroup
  computeMarchingCubesBindGroup!: GPUBindGroup

  indirectRenderArray: Uint32Array
  metaballArray: ArrayBuffer
  metaballArrayHeader: Uint32Array
  metaballArrayBalls: Float32Array

  numBlob = MAX_METABALLS
  indexCount: number

  clockBallPositions: MetaballPos[] = []
  ballPositions: MetaballPos[] = []

  constructor(renderer: WebGPURenderer, volume: VolumeSettings) {
    this.renderer = renderer
    this.volume = volume

    this.tablesBuffer = this.renderer.device.createBuffer({
      size:
        (MarchingCubesEdgeTable.length + MarchingCubesTriTable.length) *
        Int32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE,
      mappedAtCreation: true,
      label: 'metaballs table buffer',
    })
    const tablesArray = new Int32Array(this.tablesBuffer.getMappedRange())
    tablesArray.set(MarchingCubesEdgeTable)
    tablesArray.set(MarchingCubesTriTable, MarchingCubesEdgeTable.length)
    this.tablesBuffer.unmap()

    const metaballBufferSize =
      Uint32Array.BYTES_PER_ELEMENT * 4 +
      Float32Array.BYTES_PER_ELEMENT * 8 * MAX_METABALLS
    this.metaballArray = new ArrayBuffer(metaballBufferSize)
    this.metaballArrayHeader = new Uint32Array(this.metaballArray, 0, 4)
    this.metaballArrayBalls = new Float32Array(this.metaballArray, 16)
    this.metaballBuffer = this.renderer.device.createBuffer({
      size: metaballBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      label: 'metaballs buffer',
    })

    const volumeElements = volume.width * volume.height * volume.depth
    const volumeBufferSize =
      Float32Array.BYTES_PER_ELEMENT * 12 +
      Uint32Array.BYTES_PER_ELEMENT * 4 +
      Float32Array.BYTES_PER_ELEMENT * volumeElements
    this.volumeBuffer = this.renderer.device.createBuffer({
      size: volumeBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
      label: 'metaballs volume buffer',
    })
    const volumeMappedArray = this.volumeBuffer.getMappedRange()
    const volumeFloat32 = new Float32Array(volumeMappedArray)
    const volumeSize = new Uint32Array(volumeMappedArray, 48, 3)

    volumeFloat32[0] = volume.xMin
    volumeFloat32[1] = volume.yMin
    volumeFloat32[2] = volume.zMin

    volumeFloat32[8] = volume.xStep
    volumeFloat32[9] = volume.yStep
    volumeFloat32[10] = volume.zStep

    volumeSize[0] = volume.width
    volumeSize[1] = volume.height
    volumeSize[2] = volume.depth

    volumeFloat32[15] = volume.isoLevel
    this.volumeBuffer.unmap()

    const marchingCubeCells =
      (volume.width - 1) * (volume.height - 1) * (volume.depth - 1)
    console.log(marchingCubeCells)
    const vertexBufferSize =
      Float32Array.BYTES_PER_ELEMENT * 3 * 12 * marchingCubeCells
    const indexBufferSize =
      Uint32Array.BYTES_PER_ELEMENT * 15 * marchingCubeCells

    this.vertexBuffer = this.renderer.device.createBuffer({
      size: vertexBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
      label: 'metaballs vertex buffer',
    })

    this.normalBuffer = this.renderer.device.createBuffer({
      size: vertexBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
      label: 'metaballs normal buffer',
    })

    this.indexBuffer = this.renderer.device.createBuffer({
      size: indexBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.INDEX,
      label: 'metaballs index buffer',
    })
    this.indexCount = indexBufferSize / Uint32Array.BYTES_PER_ELEMENT

    this.indirectRenderArray = new Uint32Array(9)
    this.indirectRenderArray[0] = 500
    this.indirectRenderBuffer = this.renderer.device.createBuffer({
      size: this.indirectRenderArray.byteLength,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.INDIRECT |
        GPUBufferUsage.COPY_DST,
      label: 'metaballs indirect draw buffer',
    })

    // this.ballPositions = new Array(MAX_METABALLS).fill(null).map((_, i) => ({
    //   x: (Math.random() * 2 - 1) * 3,
    //   y: 0,
    //   z: (Math.random() * 2 - 1) * 3,
    //   speed: Math.random(),
    // }))
    const reshuffleClock = (populateBallPositions = false) => {
      this.clockBallPositions = []
      const clockPositions = getClockPositions()
      for (let i = 0; i < MAX_METABALLS; i++) {
        const clockPos = clockPositions[i]
        if (clockPos) {
          const ball = {
            x: clockPos.x * 0.0075,
            y: clockPos.y * 0.01 + 1,
            z: (Math.random() * 2 - 1) * 0.1,
            speed: 0,
          }
          this.clockBallPositions.push(ball)
        } else {
          const rand =
            this.clockBallPositions[
              Math.floor(Math.random() * this.clockBallPositions.length)
            ]
          this.clockBallPositions.push({
            x: rand.x,
            y: rand.y,
            z: rand.z,
            speed: rand.speed,
          })
        }
      }
      if (populateBallPositions) {
        this.ballPositions = this.clockBallPositions
      }
    }
    reshuffleClock(true)
    setInterval(reshuffleClock, 1000)

    this.init()
  }

  async init() {
    this.computeMetaballsPipeline =
      await this.renderer.device.createComputePipelineAsync({
        compute: {
          module: this.renderer.device.createShaderModule({
            code: MetaballFieldComputeSource,
            label: 'metaballs isosurface compute shader',
          }),
          entryPoint: 'main',
        },
      })

    this.computeMetaballsBindGroup = this.renderer.device.createBindGroup({
      layout: this.computeMetaballsPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.metaballBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.volumeBuffer,
          },
        },
      ],
    })

    this.computeMarchingCubesPipeline =
      await this.renderer.device.createComputePipelineAsync({
        compute: {
          module: this.renderer.device.createShaderModule({
            label: 'marching cubes computer shader',
            code: MarchingCubesComputeSource,
          }),
          entryPoint: 'main',
        },
      })

    this.computeMarchingCubesBindGroup = this.renderer.device.createBindGroup({
      layout: this.computeMarchingCubesPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.tablesBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.volumeBuffer,
          },
        },
        {
          binding: 2,
          resource: {
            buffer: this.vertexBuffer,
          },
        },
        {
          binding: 3,
          resource: {
            buffer: this.normalBuffer,
          },
        },
        {
          binding: 4,
          resource: {
            buffer: this.indexBuffer,
          },
        },
        {
          binding: 5,
          resource: {
            buffer: this.indirectRenderBuffer,
          },
        },
      ],
    })

    this.renderMetaballsPipeline =
      await this.renderer.device.createRenderPipelineAsync({
        label: 'metaball rendering pipeline',
        layout: this.renderer.device.createPipelineLayout({
          bindGroupLayouts: [this.renderer.bindGroups.frame.getLayout()],
        }),
        vertex: {
          entryPoint: 'main',
          buffers: [
            {
              arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
              attributes: [
                {
                  shaderLocation: 0,
                  format: 'float32x3',
                  offset: 0,
                },
              ],
            },
            {
              arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
              attributes: [
                {
                  shaderLocation: 1,
                  format: 'float32x3',
                  offset: 0,
                },
              ],
            },
          ],
          module: this.renderer.device.createShaderModule({
            code: METABALLS_VERTEX_SHADER,
          }),
        },
        fragment: {
          entryPoint: 'main',
          module: this.renderer.device.createShaderModule({
            code: METABALLS_FRAGMENT_SHADER,
          }),
          targets: [
            {
              format: this.renderer.presentationFormat,
            },
          ],
        },
        depthStencil: {
          format: DEPTH_FORMAT,
          depthWriteEnabled: true,
          depthCompare: 'less',
        },
        primitive: {
          topology: 'triangle-list',
          cullMode: 'none',
        },
        multisample: {
          count: SAMPLE_COUNT,
        },
      })
  }

  updateSim(
    computePass: GPUComputePassEncoder,
    time: DOMHighResTimeStamp,
    timeDelta: number,
  ): this {
    const numblobs = MAX_METABALLS
    const subtract = 12
    const strength = (5 / ((Math.sqrt(numblobs) - 1) / 4 + 1)) * 1

    this.metaballArrayHeader[0] = MAX_METABALLS

    const speed = timeDelta * 10

    for (let i = 0; i < MAX_METABALLS; i++) {
      const clockPos = this.clockBallPositions[i]
      const pos = this.ballPositions[i]
      const distX = clockPos.x - pos.x
      pos.x += distX * speed
      pos.y += (clockPos.y - pos.y) * speed

      pos.z += (clockPos.z - pos.z) * speed
      // position.y += timeDelta * position.speed
      // position.x =
      //   Math.cos(time + position.speed + i) * Math.sin(position.y * 0.2) * 3.4
      // position.z =
      //   Math.sin(time + position.speed + i) * Math.sin(position.y * 0.2) * 3.4
      // if (position.y >= 4) {
      //   position.x = 0
      //   position.z = 0
      //   position.y = 0
      // }
    }

    for (let i = 0; i < numblobs; i++) {
      const position = this.ballPositions[i]
      const offset = i * 8
      this.metaballArrayBalls[offset] = position.x
      this.metaballArrayBalls[offset + 1] = position.y
      this.metaballArrayBalls[offset + 2] = position.z
      this.metaballArrayBalls[offset + 3] = Math.sqrt(strength / subtract)
      this.metaballArrayBalls[offset + 4] = strength
      this.metaballArrayBalls[offset + 5] = subtract
    }

    this.renderer.device.queue.writeBuffer(
      this.metaballBuffer,
      0,
      this.metaballArray,
    )
    this.renderer.device.queue.writeBuffer(
      this.indirectRenderBuffer,
      0,
      this.indirectRenderArray,
    )

    const dispatchSize: WorkgroupSize = [
      this.volume.width / METABALLS_COMPUTE_WORKGROUP_SIZE[0],
      this.volume.height / METABALLS_COMPUTE_WORKGROUP_SIZE[1],
      this.volume.depth / METABALLS_COMPUTE_WORKGROUP_SIZE[2],
    ]

    // update metaballs
    if (this.computeMetaballsPipeline) {
      computePass.setPipeline(this.computeMetaballsPipeline)
      computePass.setBindGroup(0, this.computeMetaballsBindGroup)
      computePass.dispatch(...dispatchSize)
    }

    // update marching cubes
    if (this.computeMarchingCubesPipeline) {
      computePass.setPipeline(this.computeMarchingCubesPipeline)
      computePass.setBindGroup(0, this.computeMarchingCubesBindGroup)
      computePass.dispatch(...dispatchSize)
    }
    return this
  }

  render(renderPass: GPURenderPassEncoder): this {
    if (!this.renderMetaballsPipeline) {
      return this
    }
    renderPass.setPipeline(this.renderMetaballsPipeline)
    // renderPass.setBindGroup(0, this.renderer.bindGroups.frame)
    this.renderer.bindGroups.frame.bind(renderPass)
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.setVertexBuffer(1, this.normalBuffer)
    renderPass.setIndexBuffer(this.indexBuffer, 'uint32')
    renderPass.drawIndexed(this.indexCount)
    return this
  }
}
