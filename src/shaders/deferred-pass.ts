import { SHADOW_MAP_SIZE } from "../constants"

export const deferredPassVertexShader = `
	output.Position = screenprojectionuniforms.matrix *
										screenviewuniforms.matrix *
										model.matrix *
										vec4(input.position, 1.0);
	
	// output.uv = input.uv;
`

export const deferredPassFragmentShader = `
	// Pull data from GBuffer
	let positionMetallic = textureLoad(
    position_texture,
    vec2<i32>(floor(input.coords.xy)),
    0
  );
	let worldPosition = positionMetallic.xyz;

  if (worldPosition.z > 10000.0) {
    discard;
  }

  let normalRoughness = textureLoad(
    normal_texture,
    vec2<i32>(floor(input.coords.xy)),
    0
  );

  let albedo = textureLoad(
    diffuse_texture,
    vec2<i32>(floor(input.coords.xy)),
    0
  );

	// Shadow mapping
	let posFromLight = shadowprojectionuniforms.matrix * shadowviewuniforms.matrix * vec4(worldPosition, 1.0);
	var shadowPos = posFromLight.xyz / posFromLight.w;
	shadowPos = shadowPos * vec3(0.5, -0.5, 1.0) + vec3(0.5, 0.5, 0.0);

	// Percentage close filtering
	var visibility : f32 = 0.0;
	let oneOverShadowDepthTextureSize = 1.0 / ${SHADOW_MAP_SIZE}.0;
	for (var y : i32 = -1 ; y <= 1 ; y = y + 1) {
		for (var x : i32 = -1 ; x <= 1 ; x = x + 1) {
			let offset : vec2<f32> = vec2<f32>(
				f32(x) * oneOverShadowDepthTextureSize,
				f32(y) * oneOverShadowDepthTextureSize
			);
			visibility = visibility + textureSampleCompare(
				shadowDepthTexture,
				depthSampler,
				shadowPos.xy + offset,
				shadowPos.z - 0.007
			);
		}
	}
	visibility = visibility / 9.0;

	// PBR

	var surface: Surface;
	surface.albedo = albedo;
	surface.metallic = positionMetallic.w;
	surface.N = normalRoughness.xyz;
	surface.roughness = normalRoughness.w;
	surface.F0 = mix(vec3(0.04), albedo.rgb, vec3(surface.metallic));
	surface.V = normalize(viewuniforms.position - worldPosition);

	let pointLightPos = vec3(2.6, 2.5, -7.45);

	var pointLight: PointLight;
	pointLight.pointToLight = pointLightPos - worldPosition;
	pointLight.color = vec3(1.0, 0.0, 0.0);
	pointLight.range = 2.0;
	pointLight.intensity = 3.0;

	var pointLight2: PointLight;
	pointLight2.pointToLight = vec3(-2.8, 2.5, -7.45) - worldPosition;
	pointLight2.color = vec3(1.0, 0.0, 0.0);
	pointLight2.range = 2.0;
	pointLight2.intensity = 3.0;

	var pointLight3: PointLight;
	pointLight3.pointToLight = vec3(2.6, 2.5, 9.4) - worldPosition;
	pointLight3.color = vec3(1.0, 0.0, 0.0);
	pointLight3.range = 2.0;
	pointLight3.intensity = 3.0;

	var pointLight4: PointLight;
	pointLight4.pointToLight = vec3(-2.8, 2.5, 9.4) - worldPosition;
	pointLight4.color = vec3(1.0, 0.0, 0.0);
	pointLight4.range = 2.0;
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

	let ambient = vec3(0.01) * surface.albedo.rgb;

	// let color = (ambient + Lo);
	let color = linearTosRGB(ambient + Lo);
		
	// output.Color = vec4(1.0, 0.0, 0.0, 1.0);
	output.Color = vec4(color, albedo.a);
`
