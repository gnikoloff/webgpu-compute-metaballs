import { SHADOW_MAP_SIZE } from '../constants'
import {
  DirectionalLightStruct,
  DistributionGGX,
  FresnelSchlick,
  GeometrySmith,
  LightRadiance,
  LinearToSRGB,
  PointLightStruct,
  ReinhardTonemapping,
  SurfaceShaderStruct,
} from './pbr-chunks'

export const DeferredPassFragmentShader = `

	struct View {
		position: vec3<f32>,
	}

	@group(0) @binding(0) var<uniform> view: View;
	@group(0) @binding(1) var positionTexture: texture_2d<f32>;
	@group(0) @binding(2) var normalTexture: texture_2d<f32>;
	@group(0) @binding(3) var diffuseTexture: texture_2d<f32>;

	struct Inputs {
		@builtin(position) coords: vec4<f32>,
		@location(0) uv: vec2<f32>,
	}
	struct Output {
		@location(0) color: vec4<f32>,
	}

	let PI = ${Math.PI};
	let LOG2 = ${Math.LOG2E};
	
	${PointLightStruct}
	${DirectionalLightStruct}
	${SurfaceShaderStruct}
	${DistributionGGX}
	${GeometrySmith}
	${FresnelSchlick}
	${ReinhardTonemapping}
	${LightRadiance}
	${LinearToSRGB}

	@stage(fragment)
	fn main(input: Inputs) -> Output {
		// Pull data from GBuffer
		let positionMetallic = textureLoad(
			positionTexture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);
		let worldPosition = positionMetallic.xyz;

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
		surface.metallic = positionMetallic.w;
		surface.N = normalMaterialID.xyz;
		surface.roughness = 0.0;
		surface.materialID = normalMaterialID.w;
		surface.F0 = mix(vec3(0.04), albedo.rgb, vec3(surface.metallic));
		surface.V = normalize(view.position - worldPosition);

		var output: Output;

		if (surface.materialID == 0.0) {
			let pointLightPos = vec3(2.6, 2.5, 0.0);

			var pointLight: PointLight;
			pointLight.pointToLight = pointLightPos - worldPosition;
			pointLight.color = vec3(1.0, 0.0, 0.0);
			pointLight.range = 2.0;
			pointLight.intensity = 3.0;

			var pointLight2: PointLight;
			pointLight2.pointToLight = vec3(12.8, 2.5, -0.0) - worldPosition;
			pointLight2.color = vec3(1.0, 0.0, 0.0);
			pointLight2.range = 20.0;
			pointLight2.intensity = 3.0;

			var pointLight3: PointLight;
			pointLight3.pointToLight = vec3(2.6, 2.5, 0.0) - worldPosition;
			pointLight3.color = vec3(1.0, 0.0, 0.0);
			pointLight3.range = 20.0;
			pointLight3.intensity = 3.0;

			var pointLight4: PointLight;
			pointLight4.pointToLight = vec3(-2.8, 2.5, 0.0) - worldPosition;
			pointLight4.color = vec3(1.0, 0.0, 0.0);
			pointLight4.range = 20.0;
			pointLight4.intensity = 3.0;

			var pointLight5: PointLight;
			pointLight5.pointToLight = vec3(2.0, 0.6, 0.0) - worldPosition;
			pointLight5.color = vec3(1.0);
			pointLight5.range = 10.0;
			pointLight5.intensity = 4.0;

			var dirLight: DirectionalLight;
			dirLight.direction = vec3(2.0, 20.0, 0.0);
			dirLight.color = vec3(1.0);

			// output luminance to add to
			var Lo = vec3(0.0);
			Lo = Lo + PointLightRadiance(pointLight, surface);
			Lo = Lo + PointLightRadiance(pointLight2, surface);
			Lo = Lo + PointLightRadiance(pointLight3, surface);
			Lo = Lo + PointLightRadiance(pointLight4, surface);
			Lo = Lo + PointLightRadiance(pointLight5, surface);
			Lo = Lo + DirectionalLightRadiance(dirLight, surface);

			let ambient = vec3(0.01) * albedo.rgb;

			// // let color = (ambient + Lo);
			let color = linearTosRGB(ambient + Lo);
				
			// output.Color = vec4(color.rgb, albedo.a);
			output.color = vec4(color.rgb, 1.0);
			

			let fogDensity = 0.085;
			let fogDistance = length(worldPosition.xyz);
			var fogAmount = 1.0 - exp2(-fogDensity * fogDensity * fogDistance * fogDistance * LOG2);
			fogAmount = clamp(fogAmount, 0.0, 1.0);

			let fogColor = vec4(0.1, 0.1, 0.1, 1.0);
			output.color = mix(output.color, fogColor, fogAmount);

		} else if (surface.materialID == 0.1) {
			output.color = vec4(1.0);
			
		} else {
			output.color = vec4(0.1, 0.1, 0.1, 1.0);
		}
		
		return output;

		
	}
`
