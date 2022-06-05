import { MAX_METABALLS, METABALLS_COMPUTE_WORKGROUP_SIZE } from '../constants'
import {
  MarchingCubesEdgeTable,
  MarchingCubesTriTable,
} from '../geometry-helper-data'
import { IMetaballPos, IVolumeSettings } from '../protocol'
import {
  MarchingCubesComputeSource,
  MetaballFieldComputeSource,
} from '../shaders/metaball'
import { WebGPURenderer } from '../webgpu-renderer'

export class MetaballsCompute {
  private readonly ballPositions: IMetaballPos[] = []

  private tablesBuffer: GPUBuffer
  private metaballBuffer: GPUBuffer
  private volumeBuffer: GPUBuffer
  private indirectRenderBuffer: GPUBuffer

  private computeMetaballsPipeline!: GPUComputePipeline
  private computeMarchingCubesPipeline!: GPUComputePipeline

  private computeMetaballsBindGroup!: GPUBindGroup
  private computeMarchingCubesBindGroup!: GPUBindGroup

  private indirectRenderArray: Uint32Array
  private metaballArray: ArrayBuffer
  private metaballArrayHeader: Uint32Array
  private metaballArrayBalls: Float32Array

  public vertexBuffer: GPUBuffer
  public normalBuffer: GPUBuffer
  public indexBuffer: GPUBuffer

  public indexCount: number

  public get isReady(): boolean {
    return (
      !!this.computeMarchingCubesPipeline && !!this.computeMetaballsPipeline
    )
  }

  constructor(
    private renderer: WebGPURenderer,
    private volume: IVolumeSettings,
  ) {
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

    this.ballPositions = new Array(MAX_METABALLS).fill(null).map((_) => ({
      x: (Math.random() * 2 - 1) * volume.xMin,
      y: (Math.random() * 2 - 1) * volume.yMin,
      z: (Math.random() * 2 - 1) * volume.zMin,
      vx: (Math.random() * 2 - 1) * 1,
      vy: (Math.random() * 2 - 1) * 1,
      vz: (Math.random() * 2 - 1) * 1,
      speed: Math.random() * 2 + 0.3,
    }))

    // this.modelBindGroup.addUBO(this.modelUBO)
    // this.modelBindGroup.init()

    this.init()
  }

  async init() {
    this.computeMetaballsPipeline =
      await this.renderer.device.createComputePipelineAsync({
        layout: 'auto',
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
        layout: 'auto',
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
  }

  updateSim(
    computePass: GPUComputePassEncoder,
    time: DOMHighResTimeStamp,
    timeDelta: number,
  ): this {
    if (!this.isReady) {
      return this
    }
    const numblobs = MAX_METABALLS
    const subtract = 10
    const strength = 10

    this.metaballArrayHeader[0] = MAX_METABALLS

    const speed = timeDelta * 0.014

    const checkCollision = (ballA, i: number) => {
      for (
        let ballB, dx, dy, dist, min_dist, j = i + 1;
        j < MAX_METABALLS;
        j++
      ) {
        ballB = this.ballPositions[j]
        dx = ballB.x - ballA.x
        dy = ballB.y - ballA.y
        dist = Math.sqrt(dx * dx + dy * dy)
        min_dist = 1

        let spring = 0.01
        if (dist < min_dist) {
          var tx = ballA.x + (dx / dist) * min_dist,
            ty = ballA.y + (dy / dist) * min_dist,
            ax = (tx - ballB.x) * spring,
            ay = (ty - ballB.y) * spring
          ballA.vx -= ax
          ballA.vy -= ay
          ballB.vx += ax
          ballB.vy += ay
        }
      }
    }

    for (let i = 0; i < MAX_METABALLS; i++) {
      const pos = this.ballPositions[i]

      pos.vx += -pos.x * pos.speed * 0.1
      pos.vy += -pos.y * pos.speed * 0.1
      pos.vz += -pos.z * pos.speed * 0.1

      checkCollision(pos, i)

      pos.x += pos.vx * speed
      pos.y += pos.vy * speed
      pos.z += pos.vz * speed

      const padding = 0.8
      const width = Math.abs(this.volume.xMin) - padding
      const height = Math.abs(this.volume.yMin) - padding
      const depth = Math.abs(this.volume.zMin) - padding

      if (pos.x > width) {
        pos.x = width
        pos.vx *= -1
      } else if (pos.x < -width) {
        pos.x = -width
        pos.vx *= -1
      }

      if (pos.y > height) {
        pos.y = height
        pos.vy *= -1
      } else if (pos.y < -height) {
        pos.y = -height
        pos.vy *= -1
      }

      if (pos.z > depth) {
        pos.z = depth
        pos.vz *= -1
      } else if (pos.z < -depth) {
        pos.z = -depth
        pos.vz *= -1
      }
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

    const dispatchSize: [number, number, number] = [
      this.volume.width / METABALLS_COMPUTE_WORKGROUP_SIZE[0],
      this.volume.height / METABALLS_COMPUTE_WORKGROUP_SIZE[1],
      this.volume.depth / METABALLS_COMPUTE_WORKGROUP_SIZE[2],
    ]

    // update metaballs
    if (this.computeMetaballsPipeline) {
      computePass.setPipeline(this.computeMetaballsPipeline)
      computePass.setBindGroup(0, this.computeMetaballsBindGroup)
      computePass.dispatchWorkgroups(...dispatchSize)
    }

    // update marching cubes
    if (this.computeMarchingCubesPipeline) {
      computePass.setPipeline(this.computeMarchingCubesPipeline)
      computePass.setBindGroup(0, this.computeMarchingCubesBindGroup)
      computePass.dispatchWorkgroups(...dispatchSize)
    }

    return this
  }
}
