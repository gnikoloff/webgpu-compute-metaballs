export const GET_NORMAL_FROM_MAP_PBR_SHADER_FN = `
  fn getNormalFromMap(uv: vec2<f32>, normal: vec3<f32>, worldPos: vec3<f32>) -> vec3<f32> {
    let tangentNormal = textureSample(normalTexture, mySampler, uv).xyz * 2.0 - 1.0;

    let Q1  = dpdx(worldPos);
    let Q2  = dpdy(worldPos);
    let st1 = dpdx(uv);
    let st2 = dpdy(uv);

    let N   = normalize(normal);
    let T  = normalize(Q1 * st2.x - Q2 * st1.y);
    let B  = -normalize(cross(N, T));
    let TBN = mat3x3<f32>(T, B, N);
    return normalize(TBN * tangentNormal);
  }
`

export const DISTRIBUTION_GGX_PBR_SHADER_FN = `
  fn DistributionGGX(N: vec3<f32>, H: vec3<f32>, roughness: f32) -> f32 {
    let a      = roughness*roughness;
    let a2     = a*a;
    let NdotH  = max(dot(N, H), 0.0);
    let NdotH2 = NdotH*NdotH;

    let num   = a2;
    var denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
    return num / denom;
  }
`

export const GEOMETRY_SMITH_PBR_SHADER_FN = `
  fn GeometrySchlickGGX(NdotV: f32, roughness: f32) -> f32 {
    let r = (roughness + 1.0);
    let k = (r*r) / 8.0;

    let num   = NdotV;
    let denom = NdotV * (1.0 - k) + k;

    return num / denom;
  }

  fn GeometrySmith(N: vec3<f32>, V: vec3<f32>, L: vec3<f32>, roughness: f32) -> f32 {
    let NdotV = max(dot(N, V), 0.0);
    let NdotL = max(dot(N, L), 0.0);
    let ggx2  = GeometrySchlickGGX(NdotV, roughness);
    let ggx1  = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
  }
`

export const FRESNEL_SCHLICK_PBR_SHADER_FN = `
  fn FresnelSchlick(cosTheta: f32, F0: vec3<f32>) -> vec3<f32> {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  } 
`

export const REINHARD_TONEMAPPING_PBR_SHADER_FN = `
  fn reinhard(x: vec3<f32>) -> vec3<f32> {
    return x / (1.0 + x);
  }
`

export const POINT_LIGHT_SHADER_STRUCT = `
  struct PointLight {
    pointToLight: vec3<f32>,
    color: vec3<f32>,
    range: f32,
    intensity: f32,
  };
`

export const DIRECTIONAL_LIGHT_SHADER_STRUCT = `
  struct DirectionalLight {
    direction: vec3<f32>,
    color: vec3<f32>,
  }
`

export const SURFACE_SHADER_STRUCT = `
  struct Surface {
    baseColor: vec4<f32>,
    albedo: vec4<f32>,
    metallic: f32,
    roughness: f32,
    N: vec3<f32>,
    F0: vec3<f32>,
    V: vec3<f32>,
  };
`

export const LIGHT_RADIANCE_PBR_SHADER_FN = `
  fn rangeAttenuation(range : f32, distance : f32) -> f32 {
    if (range <= 0.0) {
        // Negative range means no cutoff
        return 1.0 / pow(distance, 2.0);
    }
    return clamp(1.0 - pow(distance / range, 4.0), 0.0, 1.0) / pow(distance, 2.0);
  }

  fn PointLightRadiance(light : PointLight, surface : Surface) -> vec3<f32> {
    let L = normalize(light.pointToLight);
    let H = normalize(surface.V + L);
    let distance = length(light.pointToLight);

    // cook-torrance brdf
    let NDF = DistributionGGX(surface.N, H, surface.roughness);
    let G = GeometrySmith(surface.N, surface.V, L, surface.roughness);
    let F = FresnelSchlick(max(dot(H, surface.V), 0.0), surface.F0);

    let kD = (vec3(1.0, 1.0, 1.0) - F) * (1.0 - surface.metallic);

    let NdotL = max(dot(surface.N, L), 0.0);

    let numerator = NDF * G * F;
    let denominator = max(4.0 * max(dot(surface.N, surface.V), 0.0) * NdotL, 0.001);
    let specular = numerator / vec3(denominator, denominator, denominator);

    // add to outgoing radiance Lo
    let attenuation = rangeAttenuation(light.range, distance);
    let radiance = light.color * light.intensity * attenuation;
    return (kD * surface.albedo.rgb / vec3(PI, PI, PI) + specular) * radiance * NdotL;
  }

  fn DirectionalLightRadiance(light : DirectionalLight, surface : Surface) -> vec3<f32> {
    let L = normalize(light.direction);
    let H = normalize(surface.V + L);

    // cook-torrance brdf
    let NDF = DistributionGGX(surface.N, H, surface.roughness);
    let G = GeometrySmith(surface.N, surface.V, L, surface.roughness);
    let F = FresnelSchlick(max(dot(H, surface.V), 0.0), surface.F0);

    let kD = (vec3(1.0, 1.0, 1.0) - F) * (1.0 - surface.metallic);

    let NdotL = max(dot(surface.N, L), 0.0);

    let numerator = NDF * G * F;
    let denominator = max(4.0 * max(dot(surface.N, surface.V), 0.0) * NdotL, 0.001);
    let specular = numerator / vec3(denominator, denominator, denominator);

    // add to outgoing radiance Lo
    let radiance = light.color;
    return (kD * surface.albedo.rgb / vec3(PI, PI, PI) + specular) * radiance * NdotL;
  }
`

// see http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
export const LINEAR_TO_SRGB_SHADER_FN = `
  let GAMMA = 2.2;
  fn linearTosRGB(linear: vec3<f32>) -> vec3<f32> {
    let INV_GAMMA = 1.0 / GAMMA;
    return pow(linear, vec3<f32>(INV_GAMMA, INV_GAMMA, INV_GAMMA));
  }
`
