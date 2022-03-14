import { convertNumberArrToWGLSLVec } from '../helpers'

export const SPACESHIP_VERTEX_SHADER = ({
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

//  var normalColor = textureSample(normalTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
//       var emissiveColor = textureSample(emissiveTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
//       output.Color = mix(normalColor, emissiveColor, 0.0) + normal;

export const SPACESHIP_FRAGMENT_SHADER = ({
  baseColorFactor,
  // useNormalMap,
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
    var surface: Surface;
    surface.baseColor = vec4<f32>(${baseColor});
    
  `

  if (useAlbedoTexture) {
    source += `
      surface.albedo = textureSample(albedoTexture, defaultSampler, input.uv);
    `
  } else {
    source += `
      surface.albedo = surface.baseColor;
    `
  }

  if (useMetallicRoughnessTexture) {
    source += `
      surface.metallic = textureSample(roughnessTexture, defaultSampler, input.uv).b;
      surface.roughness = textureSample(roughnessTexture, defaultSampler, input.uv).g;
    `
  } else {
    source += `
      surface.metallic = 0.0;
      surface.roughness = 0.0;
    `
  }

  if (useNormalTexture) {
    source += `
      // surface.N = getNormalFromMap(input.uv, input.normal.xyz, input.worldPosition);
      let tbn = mat3x3<f32>(input.tangent.xyz, input.bitangent, input.normal);
      let N = textureSample(normalTexture, defaultSampler, input.uv).rgb;
      surface.N = normalize(tbn * (2.0 * N - vec3<f32>(1.0, 1.0, 1.0)));
    `
  } else {
    source += `
      surface.N = normalize(input.normal).xyz;
    `
  }

  source += `
    // surface.baseColor = BNA
    surface.F0 = mix(vec3(0.04), surface.albedo.rgb, vec3<f32>(surface.metallic));
    surface.V = normalize(viewuniforms.position - input.worldPosition);

    let pointLightPos = vec3(2.6, 2.5, -7.45);
    // let pointLightPos = vec3(0.0, 4.0, 0.0);

    var pointLight: PointLight;
    pointLight.pointToLight = pointLightPos - input.worldPosition;
    pointLight.color = vec3(1.0, 0.0, 0.0);
    pointLight.range = 5.0;
    pointLight.intensity = 10.0;

    var pointLight2: PointLight;
    pointLight2.pointToLight = vec3(-2.8, 2.5, -7.45) - input.worldPosition;
    pointLight2.color = vec3(1.0, 0.0, 0.0);
    pointLight2.range = 5.0;
    pointLight2.intensity = 10.0;

    var pointLight3: PointLight;
    pointLight3.pointToLight = vec3(2.6, 2.5, 9.4) - input.worldPosition;
    pointLight3.color = vec3(1.0, 0.0, 0.0);
    pointLight3.range = 5.0;
    pointLight3.intensity = 10.0;

    var pointLight4: PointLight;
    pointLight4.pointToLight = vec3(-2.8, 2.5, 9.4) - input.worldPosition;
    pointLight4.color = vec3(1.0, 0.0, 0.0);
    pointLight4.range = 5.0;
    pointLight4.intensity = 10.0;

    var pointLight5: PointLight;
    pointLight5.pointToLight = vec3(0.0, 2.0, 0.0) - input.worldPosition;
    pointLight5.color = vec3(1.0);
    pointLight5.range = 100.0;
    pointLight5.intensity = 20.0;

    var dirLight: DirectionalLight;
    dirLight.direction = vec3(0.0, 10.0, 0.0);
    dirLight.color = vec3(1.0);

    // output luminance to add to
    var Lo = vec3(0.0);
    Lo = Lo + PointLightRadiance(pointLight, surface);
    Lo = Lo + PointLightRadiance(pointLight2, surface);
    Lo = Lo + PointLightRadiance(pointLight3, surface);
    Lo = Lo + PointLightRadiance(pointLight4, surface);
    Lo = Lo + PointLightRadiance(pointLight5, surface);
    Lo = Lo + DirectionalLightRadiance(dirLight, surface);

    // tonemapping
    // Lo = reinhard(Lo);

    // gamma correction
    // Lo = pow(Lo, vec3(1.0/2.2)); 

    let ambient = vec3(0.001) * surface.albedo.rgb;
    let color = linearTosRGB(ambient + Lo);

    output.Color = vec4(color, surface.albedo.a);
  `

  return source
}
