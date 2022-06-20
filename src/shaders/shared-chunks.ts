export const ProjectionUniformsStruct = `
  struct ProjectionUniformsStruct {
    matrix : mat4x4<f32>,
		inverseMatrix: mat4x4<f32>,
    outputSize : vec2<f32>,
    zNear : f32,
    zFar : f32,
  };
`

export const ViewUniformsStruct = `
  struct ViewUniformsStruct {
    matrix: mat4x4<f32>,
		inverseMatrix: mat4x4<f32>,
    position: vec3<f32>,
    time: f32,
		deltaTime: f32,
  };
`

export const InputPointLightStructs = `
	struct InputPointLight {
		position: vec4<f32>,
		velocity: vec4<f32>,
		color: vec3<f32>,
		range: f32,
		intensity: f32,
	}

	struct LightsBuffer {
		lights: array<InputPointLight>,
	}
`

export const PointLightConfigStruct = `
	struct LightsConfig {
		numLights: u32,
	}
`

export const PointLightStruct = `
  struct PointLight {
    pointToLight: vec3<f32>,
    color: vec3<f32>,
    range: f32,
    intensity: f32,
  }
`

export const DirectionalLightStruct = `
  struct DirectionalLight {
    direction: vec3<f32>,
    color: vec3<f32>,
  }
`

export const SpotLightStruct = `
	struct SpotLight {
		position: vec3<f32>,
		direction: vec3<f32>,
		color: vec3<f32>,
		cutOff: f32,
		outerCutOff: f32,
		intensity: f32,
	}
`

export const SurfaceShaderStruct = `
  struct Surface {
    baseColor: vec4<f32>,
    albedo: vec4<f32>,
    metallic: f32,
    roughness: f32,
		materialID: f32,
    N: vec3<f32>,
    F0: vec3<f32>,
    V: vec3<f32>,
  };
`

export const LinearizeDepthSnippet = `
	fn LinearizeDepth(depth: f32) -> f32 {
		let z = depth * 2.0 - 1.0; // Back to NDC 
		let near_plane = 0.001;
		let far_plane = 0.4;
		return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
	}
`

export const EffectVertexShader = `
	struct Inputs {
		@location(0) position: vec2<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
	}

	@vertex
	fn main(input: Inputs) -> Output {
		var output: Output;
		output.position = vec4(input.position, 0.0, 1.0);

		return output;
	}
`

export const GetNormalFromMap = `
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

export const DistributionGGX = `
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

export const GeometrySmith = `
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

export const FresnelSchlick = `
  fn FresnelSchlick(cosTheta: f32, F0: vec3<f32>) -> vec3<f32> {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  } 
`

export const ReinhardTonemapping = `
  fn reinhard(x: vec3<f32>) -> vec3<f32> {
    return x / (1.0 + x);
  }
`

export const LightRadiance = `
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

	fn SpotLightRadiance(light: SpotLight, pointToLight: vec3<f32>, surface: Surface) -> vec3<f32> {
    let L = normalize(pointToLight);
    let H = normalize(surface.V + L);
    
    // spotlight (soft edges)
    let theta = dot(L, normalize(light.direction)); 
		let attenuation = smoothstep(light.outerCutOff, light.cutOff, theta);

    // cook-torrance brdf
    let NDF = DistributionGGX(surface.N, H, surface.roughness);
    let G = GeometrySmith(surface.N, surface.V, L, surface.roughness);
    let F = FresnelSchlick(max(dot(H, surface.V), 0.0), surface.F0);

    let kD = (vec3(1.0, 1.0, 1.0) - F) * (1.0 - surface.metallic);

    let NdotL = max(dot(surface.N, L), 0.0);

    let numerator = NDF * G * F;
    let denominator = max(4.0 * max(dot(surface.N, surface.V), 0.0) * NdotL, 0.001);
    let specular = numerator / denominator;

    // add to outgoing radiance Lo
		let radiance = light.color * light.intensity * attenuation;
    
		return (kD * surface.albedo.rgb / vec3(PI, PI, PI) + specular) * radiance * NdotL;
	}

  fn DirectionalLightRadiance(light: DirectionalLight, surface : Surface) -> vec3<f32> {
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
export const LinearToSRGB = `
  let GAMMA = 2.2;
  fn linearTosRGB(linear: vec3<f32>) -> vec3<f32> {
    let INV_GAMMA = 1.0 / GAMMA;
    return pow(linear, vec3<f32>(INV_GAMMA, INV_GAMMA, INV_GAMMA));
  }
`
