export const SPACESHIP_VERTEX_SHADER = `
  let worldPos = model.matrix * vec4(input.position, 1.0);
  output.Position = projectionuniforms.matrix * viewuniforms.matrix * worldPos;

  output.uv = input.uv;
  output.normal = input.normal;
  output.worldPosition = worldPos.xyz;
`

//  var normalColor = textureSample(normalTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
//       var emissiveColor = textureSample(emissiveTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));
//       output.Color = mix(normalColor, emissiveColor, 0.0) + normal;

export const SPACESHIP_FRAGMENT_SHADER = (
  baseColorFactor: [number, number, number, number],
  useNormalTexture: boolean,
  useMetallicRoughnessTexture: boolean,
) => {
  const baseColor = baseColorFactor
    .map((a) => (Number.isInteger(a) ? `${a}.0` : a))
    .join(', ')
  let source = `
    var surface: Surface;
    surface.baseColor = vec4<f32>(${baseColor});
    surface.albedo = textureSample(albedoTexture, mySampler, input.uv);
  `

  if (useMetallicRoughnessTexture) {
    source += `
      surface.metallic = textureSample(roughnessTexture, noFilterSampler, input.uv).r;
      surface.roughness = textureSample(roughnessTexture, noFilterSampler, input.uv).g;
    `
  } else {
    source += `
      surface.metallic = 0.0;
      surface.roughness = 0.0;
    `
  }

  if (useNormalTexture) {
    source += `
      surface.N = getNormalFromMap(input.uv, input.normal.xyz, input.worldPosition);
    `
  } else {
    source += `
      surface.N = normalize(input.normal).xyz;
    `
  }

  source += `
    // surface.baseColor = BNA
    surface.F0 = mix(vec3(0.04), surface.albedo.rgb, surface.metallic);
    surface.V = normalize(viewuniforms.position - input.worldPosition);

    // let pointLightPos = vec3(sin(viewuniforms.time) * 1.0, 4.0, cos(viewuniforms.time) * 4.0);
    let pointLightPos = vec3(0.0, 4.0, 0.0);

    var pointLight: PointLight;
    pointLight.pointToLight = pointLightPos - input.worldPosition;
    pointLight.color = vec3(1.0);
    pointLight.range = 10.0;
    pointLight.intensity = 20.0;

    var pointLight2: PointLight;
    pointLight2.pointToLight = pointLightPos - input.worldPosition;
    pointLight2.color = vec3(1.0, 0.0, 0.0);
    pointLight2.range = 10.0;
    pointLight2.intensity = 40.0;

    // calculate reflectance at normal incidence, if diaelectric (like plastic) use
    // baseReflectivity of 0.04; if its metal, use the albedo color as baseReflectivity
    

    // output luminance to add to
    var Lo = vec3(0.0);
    Lo = Lo + lightRadiance(pointLight, surface);
    // Lo = Lo + lightRadiance(pointLight2, surface);

    // tonemapping
    // Lo = reinhard(Lo);

    // gamma correction
    // Lo = pow(Lo, vec3(1.0/2.2)); 


    let ambient = vec3(0.1) * surface.albedo.rgb;
    let color = linearTosRGB(ambient + Lo);

    output.Color = vec4(color, surface.albedo.a);
  `

  return source
}
