export const castNumberToWGLSLFloat = (v: number): string =>
  Number.isInteger(v) ? `${v}.0` : v.toString()

export const convertNumberArrToWGLSLVec = (arr: number[]): string => {
  if (arr.length < 2 && arr.length > 4) {
    throw new Error('Only vec2, vec3, vec4 supported')
  }
  let vecWGLSLType = 'vec2'
  if (arr.length === 3) {
    vecWGLSLType = 'vec3'
  } else if (arr.length === 4) {
    vecWGLSLType = 'vec4'
  }

  return `${vecWGLSLType}(${arr.map(castNumberToWGLSLFloat).join(', ')})`
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
