import {
  PointLightConfigStruct,
  InputPointLightStructs,
  ViewUniformsStruct,
} from './shared-chunks'

export const UpdatePointLightsComputeShader = `
	${ViewUniformsStruct}
	${InputPointLightStructs}
	${PointLightConfigStruct}

	@group(0) @binding(0) var<storage, read_write> lightsBuffer: LightsBuffer;
	@group(0) @binding(1) var<uniform> config: LightsConfig;

	@group(1) @binding(1) var<uniform> view: ViewUniformsStruct;

	let PI = ${Math.PI};

	@compute @workgroup_size(64, 1, 1)
	fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
		var index = GlobalInvocationID.x;
		if (index >= config.numLights) {
			return;
		}

		lightsBuffer.lights[index].position.x += lightsBuffer.lights[index].velocity.x * view.deltaTime;
		lightsBuffer.lights[index].position.z += lightsBuffer.lights[index].velocity.z * view.deltaTime;
		
		let size = 30.0;
		let halfSize = size / 2.0;
		
		if (lightsBuffer.lights[index].position.x < -halfSize) {
			lightsBuffer.lights[index].position.x = -halfSize;
			lightsBuffer.lights[index].velocity.x *= -1.0;
		} else if (lightsBuffer.lights[index].position.x > halfSize) {
			lightsBuffer.lights[index].position.x = halfSize;
			lightsBuffer.lights[index].velocity.x *= -1.0;
		}

		if (lightsBuffer.lights[index].position.z < -halfSize) {
			lightsBuffer.lights[index].position.z = -halfSize;
			lightsBuffer.lights[index].velocity.z *= -1.0;
		} else if (lightsBuffer.lights[index].position.z > halfSize) {
			lightsBuffer.lights[index].position.z = halfSize;
			lightsBuffer.lights[index].velocity.z *= -1.0;
		}
	}


`
