export const FIRE_EMITTER_VERTEX = `
  let startPos = vec4(vec3(input.position, 0.0) + input.instanceStartOffset, 1.0);
  var endPos = startPos;
  endPos.y = endPos.y + input.instanceY;
  let mixFactor = modf(viewuniforms.time + input.instanceOffset).fract;
  let maxScale = 0.5;
  let scaleMat = mat4x4(
    maxScale - mixFactor * maxScale, 0.0, 0.0, 0.0,
    0.0, maxScale - mixFactor * maxScale, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
  let translateMat = mat4x4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    sin(mixFactor * 10.0), mixFactor * input.instanceY, cos(mixFactor * 10.0), 1.0
  );
  let worldPos = model.matrix * translateMat * scaleMat * startPos;
  
  output.position = input.position;
  output.Position = projectionuniforms.matrix * viewuniforms.matrix * worldPos;
`

export const FIRE_EMITTER_FRAGMENT = `
  let dist = distance(input.position, vec2(0.0)) * 2.0;
  if (dist > 0.8) {
    discard;
  } else {
    output.Color = vec4(1.0, 0.0, 0.0, 1.0 - dist);
  }
`
