import { SHADOW_MAP_SIZE } from '../constants'
import { convertNumberArrToWGLSLVec } from '../helpers'

export const makeGLTFModelVertexShader = ({
  useNormalMap,
}: {
  useNormalMap: boolean
}) => `
  let worldPos = model.matrix * vec4(input.position, 1.0);
  output.Position = projectionuniforms.matrix * viewuniforms.matrix * worldPos;

  output.uv = input.uv;
  output.normal = normalize((model.matrix * vec4<f32>(input.normal, 0.0)).xyz);
  output.worldPosition = worldPos.xyz;

  ${
    useNormalMap
      ? `
        output.tangent = normalize((model.matrix * vec4<f32>(input.tangent.xyz, 0.0)));
        output.bitangent = cross(output.normal, output.tangent.xyz) * input.tangent.w;
      `
      : ''
  } 
`

export const gltfModelShadowVertexShader = `
  let worldPos = model.matrix * vec4(input.position, 1.0);
  output.Position = shadowprojectionuniforms.matrix * shadowviewuniforms.matrix * worldPos;
`

export const gltfModelShadowFragmentShader = `
  output.Color = vec4<f32>(1.0);
`

export const makeGLTFModelFragmentShader = ({
  baseColorFactor,
  useAlbedoTexture,
  useNormalTexture,
  useMetallicRoughnessTexture,
}: {
  baseColorFactor: [number, number, number, number]
  useNormalMap: boolean
  useAlbedoTexture: boolean
  useNormalTexture: boolean
  useMetallicRoughnessTexture: boolean
}) => {
  const baseColor = convertNumberArrToWGLSLVec(baseColorFactor)
  let source = `
    let baseColor = vec4<f32>(${baseColor});
  `

  if (useAlbedoTexture) {
    source += `
      let albedo = textureSample(albedoTexture, defaultSampler, input.uv);
    `
  } else {
    source += `
      let albedo = baseColor;
    `
  }

  if (useMetallicRoughnessTexture) {
    source += `
      let metallic = textureSample(roughnessTexture, defaultSampler, input.uv).b;
      let roughness = textureSample(roughnessTexture, defaultSampler, input.uv).g;
    `
  } else {
    source += `
      let metallic = 0.0;
      let roughness = 0.0;
    `
  }

  if (useNormalTexture) {
    source += `
      let tbn = mat3x3<f32>(input.tangent.xyz, input.bitangent, input.normal);
      var N = textureSample(normalTexture, defaultSampler, input.uv).rgb;
      N = normalize(tbn * (2.0 * N - vec3<f32>(1.0, 1.0, 1.0)));
    `
  } else {
    source += `
      let N = normalize(input.normal).xyz;
    `
  }

  source += `
		// hack - this is actually the position + metalic
    output.Color = vec4(input.worldPosition, metallic);
		output.normal = vec4(N, roughness);
		output.albedo = albedo;
  `

  return source
}
