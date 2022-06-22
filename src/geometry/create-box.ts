export const createCube = ({ dimensions = [1, 1, 1] } = {}) => {
  let position = [-dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2]
  let x = position[0]
  let y = position[1]
  let z = position[2]
  let width = dimensions[0]
  let height = dimensions[1]
  let depth = dimensions[2]

  let fbl = { x: x, y: y, z: z + depth }
  let fbr = { x: x + width, y: y, z: z + depth }
  let ftl = { x: x, y: y + height, z: z + depth }
  let ftr = { x: x + width, y: y + height, z: z + depth }
  let bbl = { x: x, y: y, z: z }
  let bbr = { x: x + width, y: y, z: z }
  let btl = { x: x, y: y + height, z: z }
  let btr = { x: x + width, y: y + height, z: z }

  let positions = new Float32Array([
    //front
    fbl.x,
    fbl.y,
    fbl.z,
    fbr.x,
    fbr.y,
    fbr.z,
    ftl.x,
    ftl.y,
    ftl.z,
    ftl.x,
    ftl.y,
    ftl.z,
    fbr.x,
    fbr.y,
    fbr.z,
    ftr.x,
    ftr.y,
    ftr.z,

    //right
    fbr.x,
    fbr.y,
    fbr.z,
    bbr.x,
    bbr.y,
    bbr.z,
    ftr.x,
    ftr.y,
    ftr.z,
    ftr.x,
    ftr.y,
    ftr.z,
    bbr.x,
    bbr.y,
    bbr.z,
    btr.x,
    btr.y,
    btr.z,

    //back
    fbr.x,
    bbr.y,
    bbr.z,
    bbl.x,
    bbl.y,
    bbl.z,
    btr.x,
    btr.y,
    btr.z,
    btr.x,
    btr.y,
    btr.z,
    bbl.x,
    bbl.y,
    bbl.z,
    btl.x,
    btl.y,
    btl.z,

    //left
    bbl.x,
    bbl.y,
    bbl.z,
    fbl.x,
    fbl.y,
    fbl.z,
    btl.x,
    btl.y,
    btl.z,
    btl.x,
    btl.y,
    btl.z,
    fbl.x,
    fbl.y,
    fbl.z,
    ftl.x,
    ftl.y,
    ftl.z,

    //top
    ftl.x,
    ftl.y,
    ftl.z,
    ftr.x,
    ftr.y,
    ftr.z,
    btl.x,
    btl.y,
    btl.z,
    btl.x,
    btl.y,
    btl.z,
    ftr.x,
    ftr.y,
    ftr.z,
    btr.x,
    btr.y,
    btr.z,

    //bottom
    bbl.x,
    bbl.y,
    bbl.z,
    bbr.x,
    bbr.y,
    bbr.z,
    fbl.x,
    fbl.y,
    fbl.z,
    fbl.x,
    fbl.y,
    fbl.z,
    bbr.x,
    bbr.y,
    bbr.z,
    fbr.x,
    fbr.y,
    fbr.z,
  ])

  let uvs = new Float32Array([
    //front
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    //right
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    //back
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    //left
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    //top
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

    //bottom
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,
  ])

  let normals = new Float32Array([
    // front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    // right
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    // back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

    // left
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

    // top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

    // bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
  ])

  return {
    positions,
    normals,
    uvs,
  }
}
