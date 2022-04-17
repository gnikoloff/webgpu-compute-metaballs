export const FIRE_EMITTER_VERTEX = `
  let startPos = vec4(input.position.xy, 0.0, 1.0);
  var endPos = startPos;
  endPos.y = endPos.y + 5.0;
	let mixFactor = viewuniforms.time * 0.1;
  // let mixFactor = modf(viewuniforms.time * 0.1).fract;
  let maxScale = 5.0;
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
    sin(mixFactor * 10.0), mixFactor, cos(mixFactor * 10.0), 1.0
  );
  let worldPos = model.matrix * translateMat * startPos;
  
  output.position = input.position;
  output.Position = projectionuniforms.matrix * viewuniforms.matrix * worldPos;
`

export const FIRE_EMITTER_FRAGMENT = `
  let dist = distance(input.position, vec2(0.0)) * 2.0;
  output.Color = vec4(1.0, 1.0, 1.0, clamp(1.0 - dist, 0.0, 1.0));
`
