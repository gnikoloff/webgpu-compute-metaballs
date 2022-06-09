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

	@group(2) @binding(0) var<uniform> spotLight0: SpotLight;
	@group(2) @binding(1) var<uniform> spotLight1: SpotLight;

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

		// // Shadow mapping
		// let posFromLight = shadowprojectionuniforms.matrix * shadowviewuniforms.matrix * vec4(worldPosition, 1.0);
		// var shadowPos = posFromLight.xyz / posFromLight.w;
		// shadowPos = shadowPos * vec3(0.5, -0.5, 1.0) + vec3(0.5, 0.5, 0.0);

		// // Percentage close filtering
		// var visibility : f32 = 0.0;
		// let oneOverShadowDepthTextureSize = 1.0 / ${SHADOW_MAP_SIZE}.0;
		// for (var y : i32 = -1 ; y <= 1 ; y = y + 1) {
		// 	for (var x : i32 = -1 ; x <= 1 ; x = x + 1) {
		// 		let offset : vec2<f32> = vec2<f32>(
		// 			f32(x) * oneOverShadowDepthTextureSize,
		// 			f32(y) * oneOverShadowDepthTextureSize
		// 		);
		// 		visibility = visibility + textureSampleCompare(
		// 			shadowDepthTexture,
		// 			depthSampler,
		// 			shadowPos.xy + offset,
		// 			shadowPos.z - 0.007
		// 		);
		// 	}
		// }
		// visibility = visibility / 9.0;

		// PBR

		var surface: Surface;
		surface.albedo = albedo;
		surface.metallic = 0.0;
		surface.N = normalMaterialID.xyz;
		surface.roughness = 0.0;
		surface.materialID = normalMaterialID.w;
		surface.F0 = mix(vec3(0.04), albedo.rgb, vec3(surface.metallic));
		surface.V = normalize(view.position - worldPosition.xyz);

		var output: Output;

		if (surface.materialID == 0.0) {
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
			Lo += DirectionalLightRadiance(dirLight, surface);

			// ## Spot lighting

			Lo += SpotLightRadiance(
				spotLight0,
				spotLight0.position - worldPosition.xyz,
				surface
			);
			Lo += SpotLightRadiance(
				spotLight1,
				spotLight1.position - worldPosition.xyz,
				surface
			);

			// Lo += SpotLightRadiance(spotLight1, surface);


			// ## Lighting contribution

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

		} else if (0.1 - surface.materialID < 0.01 && surface.materialID < 0.1) {
			output.color = vec4(albedo.rgb, 1.0);
			
		} else {
			output.color = vec4(0.1, 0.1, 0.1, 1.0);
		}
		
		// output.color = vec4(worldPosition.xyz, 1.0);
		// output.color = vec4(vec3(LinearizeDepth(depth)), 1.0);
		return output;

		
	}
`
