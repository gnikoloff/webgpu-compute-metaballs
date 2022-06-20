import { SHADOW_MAP_SIZE } from '../constants'
import {
  PointLightConfigStruct,
  InputPointLightStructs,
  ProjectionUniformsStruct,
  ViewUniformsStruct,
  LinearizeDepthSnippet,
  DirectionalLightStruct,
  DistributionGGX,
  FresnelSchlick,
  GeometrySmith,
  LightRadiance,
  LinearToSRGB,
  PointLightStruct,
  ReinhardTonemapping,
  SurfaceShaderStruct,
  SpotLightStruct,
} from './shared-chunks'

export const DeferredPassFragmentShader = `
	${ProjectionUniformsStruct}
	${ViewUniformsStruct}
	${InputPointLightStructs}
	${PointLightConfigStruct}
	${PointLightStruct}
	${DirectionalLightStruct}
	${SpotLightStruct}
	${SurfaceShaderStruct}

	@group(0) @binding(0) var<storage, read> lightsBuffer: LightsBuffer;
	@group(0) @binding(1) var<uniform> lightsConfig: LightsConfig;
	@group(0) @binding(2) var normalTexture: texture_2d<f32>;
	@group(0) @binding(3) var diffuseTexture: texture_2d<f32>;
	@group(0) @binding(4) var depthTexture: texture_depth_2d;

	@group(1) @binding(0) var<uniform> projection: ProjectionUniformsStruct;
	@group(1) @binding(1) var<uniform> view: ViewUniformsStruct;
	@group(1) @binding(2) var depthSampler: sampler;

	@group(2) @binding(0) var<uniform> spotLight0: SpotLight;
	@group(2) @binding(1) var<uniform> spotLight1: SpotLight;
	@group(2) @binding(2) var spotLight0DepthTexture: texture_depth_2d;

	@group(3) @binding(0) var<uniform> spotLight0Projection: ProjectionUniformsStruct;
	@group(3) @binding(1) var<uniform> spotLight0View: ViewUniformsStruct;



	struct Inputs {
		@builtin(position) coords: vec4<f32>,
	}
	struct Output {
		@location(0) color: vec4<f32>,
	}

	let PI = ${Math.PI};
	let LOG2 = ${Math.LOG2E};
	
	${DistributionGGX}
	${GeometrySmith}
	${FresnelSchlick}
	${ReinhardTonemapping}
	${LightRadiance}
	${LinearToSRGB}
	${LinearizeDepthSnippet}

	@stage(fragment)
	fn main(input: Inputs) -> Output {
		// Reconstruct world position from depth buffer
		let uv = input.coords.xy / projection.outputSize;
		var depth = textureLoad(depthTexture, vec2<i32>(floor(input.coords.xy)), 0);
		let x = uv.x * 2 - 1;
		let y = (1 - uv.y) * 2 - 1;
		let projectedPos = vec4(x, y, depth, 1.0);
		var worldPosition = projection.inverseMatrix * projectedPos;
		worldPosition = vec4(worldPosition.xyz / worldPosition.w, 1.0);
		worldPosition = view.inverseMatrix * worldPosition;

		let normalMaterialID = textureLoad(
			normalTexture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);

		let albedo = textureLoad(
			diffuseTexture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);

		var surface: Surface;
		surface.materialID = normalMaterialID.w;

		var output: Output;

		// Shadow mapping
		var posFromLight = spotLight0Projection.matrix * spotLight0View.matrix * vec4(worldPosition.xyz, 1.0);
		posFromLight = vec4(posFromLight.xyz / posFromLight.w, 1.0);
		var shadowPos = vec3(
			posFromLight.xy * vec2(0.5,-0.5) + vec2(0.5, 0.5),
			posFromLight.z
		);

		let projectedDepth = textureSample(spotLight0DepthTexture, depthSampler, shadowPos.xy);

		if (surface.materialID == 0.0) {
			
			let inRange =
				shadowPos.x >= 0.0 &&
				shadowPos.x <= 1.0 &&
				shadowPos.y >= 0.0 &&
				shadowPos.y <= 1.0;

			var visibility = 1.0;
			if (inRange && projectedDepth <= posFromLight.z - 0.000006) {
				visibility = 0.0;
			}

			// PBR

			surface.albedo = albedo;
			surface.metallic = 0.7;
			surface.N = normalMaterialID.xyz;
			surface.roughness = 0.4;
			surface.F0 = mix(vec3(0.04), albedo.rgb, vec3(surface.metallic));
			surface.V = normalize(view.position - worldPosition.xyz);

			// output luminance to add to
			var Lo = vec3(0.0);

			// ## Point lighting

			for (var i : u32 = 0u; i < lightsConfig.numLights; i = i + 1u) {
    		let light = lightsBuffer.lights[i];
				var pointLight: PointLight;
				pointLight.pointToLight = light.position.xyz - worldPosition.xyz;
				pointLight.color = light.color;
				pointLight.range = light.range;
				pointLight.intensity = light.intensity;
				Lo += PointLightRadiance(pointLight, surface);
			}

			// ## Directional lighting

			var dirLight: DirectionalLight;
			dirLight.direction = vec3(2.0, 20.0, 0.0);
			dirLight.color = vec3(0.1);
			Lo += DirectionalLightRadiance(dirLight, surface) * visibility;

			// ## Spot lighting
			var spotLight: SpotLight;
			spotLight.position = vec3(cos(view.time) * 4.0, 80.0, sin(view.time) * 4.0);
			spotLight.direction = vec3(0.0, 1.0, 0.0);
			spotLight.color = vec3(0.8);
			spotLight.cutOff = cos(2.0 * PI / 180.0);
			spotLight.outerCutOff = cos(4.0 * PI / 180.0);
			spotLight.intensity = 2.0;
			Lo += SpotLightRadiance(
				spotLight0,
				spotLight0.position - worldPosition.xyz,
				surface
			) * visibility;


			let ambient = vec3(0.01) * albedo.rgb;
			let color = linearTosRGB(ambient + Lo);
			output.color = vec4(color.rgb, 1.0);			

			// ## Fog

			let fogDensity = 0.085;
			let fogDistance = length(worldPosition.xyz);
			var fogAmount = 1.0 - exp2(-fogDensity * fogDensity * fogDistance * fogDistance * LOG2);
			fogAmount = clamp(fogAmount, 0.0, 1.0);
			let fogColor = vec4(0.1, 0.1, 0.1, 1.0);
			output.color = mix(output.color, fogColor, fogAmount);
			
			// output.color = vec4(vec3(visibility), 1.0);
			// output.color = vec4(shadowPos, 1.0);
			// let ddd = textureLoad(spotLight0DepthTexture, vec2<i32>(floor(input.coords.xy)), 0);
			// output.color = vec4(vec3(LinearizeDepth(ddd)), 1.0);

		} else if (0.1 - surface.materialID < 0.01 && surface.materialID < 0.1) {
			output.color = vec4(albedo.rgb, 1.0);
		} else {
			output.color = vec4(0.1, 0.1, 0.1, 1.0);
		}
		return output;
	}
`
