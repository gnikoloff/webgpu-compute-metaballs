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
  DecodeNormals,
  ReconstructWorldPosFromDepth,
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
	${DecodeNormals}
	${ReconstructWorldPosFromDepth}

	@group(0) @binding(0) var<storage, read> lightsBuffer: LightsBuffer;
	@group(0) @binding(1) var<uniform> lightsConfig: LightsConfig;
	@group(0) @binding(2) var normalTexture: texture_2d<f32>;
	@group(0) @binding(3) var diffuseTexture: texture_2d<f32>;
	@group(0) @binding(4) var depthTexture: texture_depth_2d;

	@group(1) @binding(0) var<uniform> projection: ProjectionUniformsStruct;
	@group(1) @binding(1) var<uniform> view: ViewUniformsStruct;
	@group(1) @binding(2) var depthSampler: sampler;

	@group(2) @binding(0) var<uniform> spotLight: SpotLight;
	@group(2) @binding(1) var<uniform> spotLightProjection: ProjectionUniformsStruct;
	@group(2) @binding(2) var<uniform> spotLightView: ViewUniformsStruct;

	@group(3) @binding(0) var spotLightDepthTexture: texture_depth_2d;

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

	@fragment
	fn main(input: Inputs) -> Output {
		// ## Reconstruct world position from depth buffer

		let worldPosition = reconstructWorldPosFromZ(
			input.coords.xy,
			projection.outputSize,
			depthTexture,
			projection.inverseMatrix,
			view.inverseMatrix
		);
		
		let normalRoughnessMatID = textureLoad(
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
		surface.ID = normalRoughnessMatID.w;

		var output: Output;

		// ## Shadow map visibility

		var posFromLight = spotLightProjection.matrix * spotLightView.matrix * vec4(worldPosition.xyz, 1.0);
		posFromLight = vec4(posFromLight.xyz / posFromLight.w, 1.0);
		var shadowPos = vec3(
			posFromLight.xy * vec2(0.5,-0.5) + vec2(0.5, 0.5),
			posFromLight.z
		);

		let projectedDepth = textureSample(spotLightDepthTexture, depthSampler, shadowPos.xy);

		if (surface.ID == 0.0) {

			// ## Shadow mapping visibility

			let inRange =
				shadowPos.x >= 0.0 &&
				shadowPos.x <= 1.0 &&
				shadowPos.y >= 0.0 &&
				shadowPos.y <= 1.0;
			var visibility = 1.0;
			if (inRange && projectedDepth <= posFromLight.z - 0.000009) {
				visibility = 0.0;
			}

			// ## PBR

			surface.albedo = albedo;
			surface.metallic = normalRoughnessMatID.z;
			surface.roughness = albedo.a;
			surface.worldPos = worldPosition;
			surface.N = decodeNormals(normalRoughnessMatID.xy);
			surface.F0 = mix(vec3(0.04), surface.albedo.rgb, vec3(surface.metallic));
			surface.V = normalize(view.position - worldPosition.xyz);

			// output luminance to add to
			var Lo = vec3(0.0);

			// ## Point lighting

			for (var i : u32 = 0u; i < lightsConfig.numLights; i = i + 1u) {
    			let light = lightsBuffer.lights[i];
				var pointLight: PointLight;
				
				// Don't calculate if too far away
				if (distance(light.position.xyz, worldPosition.xyz) > light.range) {
					continue;
				}
				
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

			Lo += SpotLightRadiance(spotLight, surface) * visibility;

			let ambient = vec3(0.09) * albedo.rgb;
			let color = ambient + Lo;
			output.color = vec4(color.rgb, 1.0);			

			// ## Fog

			let fogDensity = 0.085;
			let fogDistance = length(worldPosition.xyz);
			var fogAmount = 1.0 - exp2(-fogDensity * fogDensity * fogDistance * fogDistance * LOG2);
			fogAmount = clamp(fogAmount, 0.0, 1.0);
			let fogColor = vec4(vec3(0.005), 1.0);
			output.color = mix(output.color, fogColor, fogAmount);
			

		} else if (0.1 - surface.ID < 0.01 && surface.ID < 0.1) {
			output.color = vec4(albedo.rgb, 1.0);
		} else {
			output.color = vec4(vec3(0.005), 1.0);
		}
		return output;
	}
`
