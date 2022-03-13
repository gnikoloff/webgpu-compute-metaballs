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
  const baseColor = baseColorFactor
    .map((a) => (Number.isInteger(a) ? `${a}.0` : a))
    .join(', ')
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

    let pointLightPos = vec3(sin(viewuniforms.time) * 1.0, 4.0, cos(viewuniforms.time) * 4.0);
    // let pointLightPos = vec3(0.0, 4.0, 0.0);

    var pointLight: PointLight;
    pointLight.pointToLight = pointLightPos - input.worldPosition;
    pointLight.color = vec3(1.0);
    pointLight.range = 10.0;
    pointLight.intensity = 40.0;


    // output luminance to add to
    var Lo = vec3(0.0);
    Lo = Lo + lightRadiance(pointLight, surface);
    // Lo = Lo + lightRadiance(pointLight2, surface);

    // tonemapping
    // Lo = reinhard(Lo);

    // gamma correction
    // Lo = pow(Lo, vec3(1.0/2.2)); 

    let ambient = vec3(0.01) * surface.albedo.rgb;
    let color = linearTosRGB(ambient + Lo);

    output.Color = vec4(color, surface.albedo.a);
  `

  return source
}
