export interface IVolumeSettings {
  xMin: number
  yMin: number
  zMin: number
  xStep: number
  yStep: number
  zStep: number
  width: number
  height: number
  depth: number
  isoLevel: number
}

export interface IMetaballPos {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  speed: number
}

export interface IScreenEffect {
  fragmentShader: string
  bindGroupLayouts?: GPUBindGroupLayout[]
  bindGroups?: GPUBindGroup[]
}