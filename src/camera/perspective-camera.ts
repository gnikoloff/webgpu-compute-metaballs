import { ReadonlyVec3, mat4 } from 'gl-matrix'

export class PerspectiveCamera {
  public static UP_VECTOR: ReadonlyVec3 = [0, 1, 0]

  public position: [number, number, number] = [0, 0, 0]
  public lookAtPosition: [number, number, number] = [0, 0, 0]

  public projectionMatrix: mat4 = mat4.create()
  public viewMatrix: mat4 = mat4.create()

  public zoom = 1

  public fieldOfView: number
  public aspect: number
  public near: number
  public far: number

  constructor(fieldOfView: number, aspect: number, near: number, far: number) {
    this.fieldOfView = fieldOfView
    this.aspect = aspect
    this.near = near
    this.far = far

    this.updateProjectionMatrix()
  }

  setPosition({
    x = this.position[0],
    y = this.position[1],
    z = this.position[2],
  }) {
    this.position = [x, y, z]
    return this
  }

  updateViewMatrix(): this {
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      this.lookAtPosition,
      PerspectiveCamera.UP_VECTOR,
    )
    return this
  }

  updateProjectionMatrix(): this {
    mat4.perspective(
      this.projectionMatrix,
      this.fieldOfView,
      this.aspect,
      this.near,
      this.far,
    )
    return this
  }

  lookAt({
    x = this.lookAtPosition[0],
    y = this.lookAtPosition[1],
    z = this.lookAtPosition[2],
  }): this {
    this.lookAtPosition = [x, y, z]
    this.updateViewMatrix()
    return this
  }
}
