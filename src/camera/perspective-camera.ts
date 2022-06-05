import { ReadonlyVec3, mat4 } from 'gl-matrix'

export class PerspectiveCamera {
  public static UP_VECTOR: ReadonlyVec3 = [0, 1, 0]

  public position: [number, number, number] = [0, 0, 0]
  public lookAtPosition: [number, number, number] = [0, 0, 0]

  public projectionMatrix = mat4.create()
  public projectionInvMatrix = mat4.create()
  public viewMatrix = mat4.create()
  public viewInvMatrix = mat4.create()

  public zoom = 1

  constructor(
    public fieldOfView: number,
    public aspect: number,
    public near: number,
    public far: number,
  ) {
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
    mat4.invert(this.viewInvMatrix, this.viewMatrix)
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
    mat4.invert(this.projectionInvMatrix, this.projectionMatrix)
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
