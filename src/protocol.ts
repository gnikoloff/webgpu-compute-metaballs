import { vec3 } from 'gl-matrix'

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
  presentationFormat?: GPUTextureFormat
  label?: string
}

export interface ISpotLight {
  position: vec3
  direction?: vec3
  color?: vec3
  cutOff?: number
  outerCutOff?: number
  intensity?: number
}

export enum QualitySettings {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export interface QualityOption {
  bloomToggle: boolean
  shadowRes: number
  pointLightsCount: number
  outputScale: number
}
