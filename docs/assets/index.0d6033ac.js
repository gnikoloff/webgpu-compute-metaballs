var _e=Object.defineProperty,Le=Object.defineProperties;var Me=Object.getOwnPropertyDescriptors;var fe=Object.getOwnPropertySymbols;var we=Object.prototype.hasOwnProperty,Ae=Object.prototype.propertyIsEnumerable;var ie=(s,e,i)=>e in s?_e(s,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):s[e]=i,Y=(s,e)=>{for(var i in e||(e={}))we.call(e,i)&&ie(s,i,e[i]);if(fe)for(var i of fe(e))Ae.call(e,i)&&ie(s,i,e[i]);return s},V=(s,e)=>Le(s,Me(e));var t=(s,e,i)=>(ie(s,typeof e!="symbol"?e+"":e,i),i),he=(s,e,i)=>{if(!e.has(s))throw TypeError("Cannot "+i)};var pe=(s,e,i)=>(he(s,e,"read from private field"),i?i.call(s):e.get(s)),ge=(s,e,i)=>{if(e.has(s))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(s):e.set(s,i)},me=(s,e,i,o)=>(he(s,e,"write to private field"),o?o.call(s,i):e.set(s,i),i);import{c as O,l as Ge,i as be,p as Ue,a as F,s as Re,n as Ie,b as ve,d as Oe,f as c,t as x,r as y,e as S,G as Fe}from"./vendor.f90b6438.js";const Ne=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function i(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerpolicy&&(r.referrerPolicy=a.referrerpolicy),a.crossorigin==="use-credentials"?r.credentials="include":a.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(a){if(a.ep)return;a.ep=!0;const r=i(a);fetch(a.href,r)}};Ne();var L;(function(s){s[s.LOW=0]="LOW",s[s.MEDIUM=1]="MEDIUM",s[s.HIGH=2]="HIGH"})(L||(L={}));const H=256,k="depth24plus",P=[4,4,4],$=[.1,.1,.1,1];var X;class Ce{constructor(e){t(this,"adapter");ge(this,X,[512,512]);t(this,"devicePixelRatio",1);t(this,"canvas",document.createElement("canvas"));t(this,"context",this.canvas.getContext("webgpu"));t(this,"bindGroupsLayouts",{});t(this,"bindGroups",{});t(this,"ubos",{});t(this,"textures",{});t(this,"device");t(this,"colorAttachment");t(this,"depthAndStencilAttachment");t(this,"defaultSampler");this.adapter=e}get presentationFormat(){var e,i;return((e=navigator.gpu)==null?void 0:e.getPreferredCanvasFormat)?(i=navigator.gpu)==null?void 0:i.getPreferredCanvasFormat():"bgra8unorm"}set outputSize(e){const[i,o]=e;me(this,X,e),this.canvas.width=i,this.canvas.height=o;const a=innerWidth/i;this.canvas.style.setProperty("width",`${i*a}px`),this.canvas.style.setProperty("height",`${o*a}px`)}get outputSize(){return pe(this,X)}async init(){this.device=await this.adapter.requestDevice();const e=document.createElement("canvas").getContext("webgl2"),i=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),o=i?e.getParameter(i.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1;this.defaultSampler=this.device.createSampler({minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"repeat",addressModeV:"repeat",maxAnisotropy:o});const a=16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+8*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT;this.ubos.projectionUBO=this.device.createBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:a});const r=16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+4*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT;this.ubos.viewUBO=this.device.createBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:r});const l=16*Float32Array.BYTES_PER_ELEMENT;this.ubos.screenProjectionUBO=this.device.createBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:l});const n=16*Float32Array.BYTES_PER_ELEMENT;this.ubos.screenViewUBO=this.device.createBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:n});const u=this.presentationFormat;this.context.configure({device:this.device,format:u}),this.colorAttachment={view:null,resolveTarget:void 0,clearValue:{r:$[0],g:$[1],b:$[2],a:$[3]},loadOp:"clear",storeOp:"store"},this.textures.depthTexture=this.device.createTexture({size:{width:this.outputSize[0],height:this.outputSize[1]},format:k,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),this.depthAndStencilAttachment={view:this.textures.depthTexture.createView(),depthLoadOp:"clear",depthStoreOp:"discard"},this.bindGroupsLayouts.frame=this.device.createBindGroupLayout({label:"frame bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT|GPUShaderStage.COMPUTE,buffer:{}},{binding:1,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT|GPUShaderStage.COMPUTE,buffer:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}}]}),this.bindGroups.frame=this.device.createBindGroup({label:"frame bind group",layout:this.bindGroupsLayouts.frame,entries:[{binding:0,resource:{buffer:this.ubos.projectionUBO}},{binding:1,resource:{buffer:this.ubos.viewUBO}},{binding:2,resource:this.device.createSampler({})}]})}onRender(){this.colorAttachment.view=this.context.getCurrentTexture().createView()}}X=new WeakMap;const ue=class{constructor(e,i,o,a){t(this,"position",[0,0,0]);t(this,"lookAtPosition",[0,0,0]);t(this,"projectionMatrix",O());t(this,"projectionInvMatrix",O());t(this,"viewMatrix",O());t(this,"viewInvMatrix",O());t(this,"zoom",1);this.fieldOfView=e,this.aspect=i,this.near=o,this.far=a,this.updateProjectionMatrix()}setPosition({x:e=this.position[0],y:i=this.position[1],z:o=this.position[2]}){return this.position=[e,i,o],this}updateViewMatrix(){return Ge(this.viewMatrix,this.position,this.lookAtPosition,ue.UP_VECTOR),be(this.viewInvMatrix,this.viewMatrix),this}updateProjectionMatrix(){return Ue(this.projectionMatrix,this.fieldOfView,this.aspect,this.near,this.far),be(this.projectionInvMatrix,this.projectionMatrix),this}lookAt({x:e=this.lookAtPosition[0],y:i=this.lookAtPosition[1],z:o=this.lookAtPosition[2]}){return this.lookAtPosition=[e,i,o],this.updateViewMatrix(),this}};let W=ue;t(W,"UP_VECTOR",[0,1,0]);const Ee=(s,e,i)=>Math.min(Math.max(s,e),i);class N{constructor(){t(this,"value",0);t(this,"damping");this.damping=.5}addForce(e){this.value+=e}update(){return this.value*this.value>1e-6?this.value*=this.damping:this.stop(),this.value}stop(){this.value=0}}class De{constructor(e,i=document.body,o=!1,a=1){t(this,"camera");t(this,"domElement");t(this,"target",F());t(this,"minDistance",0);t(this,"maxDistance",1/0);t(this,"isEnabled",!0);t(this,"isDamping");t(this,"dampingFactor");t(this,"isZoom");t(this,"zoomSpeed");t(this,"isRotate");t(this,"rotateSpeed");t(this,"isPan");t(this,"keyPanSpeed");t(this,"enableKeys");t(this,"keys");t(this,"originTarget");t(this,"originPosition");t(this,"targetXDampedAction",new N);t(this,"targetYDampedAction",new N);t(this,"targetZDampedAction",new N);t(this,"targetThetaDampedAction",new N);t(this,"targetPhiDampedAction",new N);t(this,"targetRadiusDampedAction",new N);t(this,"_isShiftDown",!1);t(this,"_rotateStart",{x:9999,y:9999});t(this,"_rotateEnd",{x:9999,y:9999});t(this,"_roatteDelta",{x:9999,y:9999});t(this,"_spherical");t(this,"_zoomDistanceEnd",0);t(this,"_zoomDistance",0);t(this,"state","");t(this,"loopId",0);t(this,"_panStart",{x:0,y:0});t(this,"_panDelta",{x:0,y:0});t(this,"_panEnd",{x:0,y:0});t(this,"_paused",!1);t(this,"_isDebug",!1);t(this,"_outputEl");t(this,"mouseWheelForce",1);this.mouseWheelForce=a,e||console.error("camera is undefined"),this.camera=e,this.domElement=i,this.isDamping=!1,this.dampingFactor=.25,this.isZoom=!0,this.zoomSpeed=1,this.isRotate=!0,this.rotateSpeed=1,this.isPan=!0,this.keyPanSpeed=7,this.enableKeys=!0,this.keys={LEFT:"37",UP:"38",RIGHT:"39",BOTTOM:"40",SHIFT:"16"},this.originTarget=F(),this.originPosition=F(),this.originPosition[0]=e.position[0],this.originPosition[1]=e.position[0],this.originPosition[2]=e.position[0];const r=this.camera.position[0],l=this.camera.position[1],n=this.camera.position[2],u=Math.sqrt(r*r+l*l+n*n),d=Math.atan2(this.camera.position[0],this.camera.position[2]),f=Math.acos(Ee(this.camera.position[1]/u,-1,1));this._spherical={radius:u,theta:d,phi:f},this._bindEvens(),this.setEventHandler(),this.startTick(),this._isDebug=o,o&&(this._outputEl=document.createElement("div"),this._outputEl.setAttribute("style",`
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999;
      font-family: monospace;
      font-size: 14px;
      user-select: none;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      padding: 3px 6px;
    `),document.body.appendChild(this._outputEl))}lookAt([e,i,o]){return Re(this.target,e,i,o),this}setEventHandler(){this.domElement.addEventListener("contextmenu",this._contextMenuHandler,!1),this.domElement.addEventListener("mousedown",this._mouseDownHandler,!1),this.domElement.addEventListener("wheel",this._mouseWheelHandler,!1),this.domElement.addEventListener("touchstart",this._touchStartHandler,!1),this.domElement.addEventListener("touchmove",this._touchMoveHandler,!1),window.addEventListener("keydown",this._onKeyDownHandler,!1),window.addEventListener("keyup",this._onKeyUpHandler,!1)}removeEventHandler(){this.domElement.removeEventListener("contextmenu",this._contextMenuHandler,!1),this.domElement.removeEventListener("mousedown",this._mouseDownHandler,!1),this.domElement.removeEventListener("wheel",this._mouseWheelHandler,!1),this.domElement.removeEventListener("mousemove",this._mouseMoveHandler,!1),window.removeEventListener("mouseup",this._mouseUpHandler,!1),this.domElement.removeEventListener("touchstart",this._touchStartHandler,!1),this.domElement.removeEventListener("touchmove",this._touchMoveHandler,!1),window.removeEventListener("keydown",this._onKeyDownHandler,!1),window.removeEventListener("keydown",this._onKeyUpHandler,!1)}startTick(){this.loopId=requestAnimationFrame(this.tick)}pause(){this._paused=!0}start(){this._paused=!1}tick(){if(!this._paused&&(this.updateDampedAction(),this.updateCamera(),this._isDebug)){const e=Math.round(this.camera.position[0]*100)/100,i=Math.round(this.camera.position[1]*100)/100,o=Math.round(this.camera.position[2]*100)/100;this._outputEl.textContent=`x: ${e} y: ${i} z: ${o}`}this.loopId=requestAnimationFrame(this.tick)}updateDampedAction(){this.target[0]+=this.targetXDampedAction.update(),this.target[1]+=this.targetYDampedAction.update(),this.target[2]+=this.targetZDampedAction.update(),this._spherical.theta+=this.targetThetaDampedAction.update(),this._spherical.phi+=this.targetPhiDampedAction.update(),this._spherical.radius+=this.targetRadiusDampedAction.update()}updateCamera(){const e=this._spherical,i=Math.sin(e.phi)*e.radius;this.camera.position[0]=i*Math.sin(e.theta)+this.target[0],this.camera.position[1]=Math.cos(e.phi)*e.radius+this.target[1],this.camera.position[2]=i*Math.cos(e.theta)+this.target[2],this.camera.lookAtPosition[0]=this.target[0],this.camera.lookAtPosition[1]=this.target[1],this.camera.lookAtPosition[2]=this.target[2],this.camera.updateViewMatrix()}_bindEvens(){this.tick=this.tick.bind(this),this._contextMenuHandler=this._contextMenuHandler.bind(this),this._mouseDownHandler=this._mouseDownHandler.bind(this),this._mouseWheelHandler=this._mouseWheelHandler.bind(this),this._mouseMoveHandler=this._mouseMoveHandler.bind(this),this._mouseUpHandler=this._mouseUpHandler.bind(this),this._touchStartHandler=this._touchStartHandler.bind(this),this._touchMoveHandler=this._touchMoveHandler.bind(this),this._onKeyDownHandler=this._onKeyDownHandler.bind(this),this._onKeyUpHandler=this._onKeyUpHandler.bind(this)}_contextMenuHandler(e){!this.isEnabled||e.preventDefault()}_mouseDownHandler(e){!this.isEnabled||(e.button===0?(this.state="rotate",this._rotateStart={x:e.clientX,y:e.clientY}):(this.state="pan",this._panStart={x:e.clientX,y:e.clientY}),this.domElement.addEventListener("mousemove",this._mouseMoveHandler,!1),window.addEventListener("mouseup",this._mouseUpHandler,!1))}_mouseUpHandler(){this.domElement.removeEventListener("mousemove",this._mouseMoveHandler,!1),window.removeEventListener("mouseup",this._mouseUpHandler,!1)}_mouseMoveHandler(e){!this.isEnabled||(this.state==="rotate"?(this._rotateEnd={x:e.clientX,y:e.clientY},this._roatteDelta={x:this._rotateEnd.x-this._rotateStart.x,y:this._rotateEnd.y-this._rotateStart.y},this._updateRotateHandler(),this._rotateStart={x:this._rotateEnd.x,y:this._rotateEnd.y}):this.state==="pan"&&(this._panEnd={x:e.clientX,y:e.clientY},this._panDelta={x:-.5*(this._panEnd.x-this._panStart.x),y:.5*(this._panEnd.y-this._panStart.y)},this._updatePanHandler(),this._panStart={x:this._panEnd.x,y:this._panEnd.y}))}_mouseWheelHandler(e){const i=this.mouseWheelForce;e.deltaY>0?this.targetRadiusDampedAction.addForce(i):this.targetRadiusDampedAction.addForce(-i)}_touchStartHandler(e){let i,o;switch(e.touches.length){case 1:this.state="rotate",this._rotateStart={x:e.touches[0].clientX,y:e.touches[0].clientY};break;case 2:this.state="zoom",i=e.touches[1].clientX-e.touches[0].clientX,o=e.touches[1].clientY-e.touches[0].clientY,this._zoomDistance=Math.sqrt(i*i+o*o);break;case 3:this.state="pan",this._panStart={x:(e.touches[0].clientX+e.touches[1].clientX+e.touches[2].clientX)/3,y:(e.touches[0].clientY+e.touches[1].clientY+e.touches[2].clientY)/3};break}}_touchMoveHandler(e){let i,o,a;switch(e.preventDefault(),e.touches.length){case 1:if(this.state!=="rotate")return;this._rotateEnd={x:e.touches[0].clientX,y:e.touches[0].clientY},this._roatteDelta={x:(this._rotateEnd.x-this._rotateStart.x)*.5,y:(this._rotateEnd.y-this._rotateStart.y)*.5},this._updateRotateHandler(),this._rotateStart={x:this._rotateEnd.x,y:this._rotateEnd.y};break;case 2:if(this.state!=="zoom")return;i=e.touches[1].clientX-e.touches[0].clientX,o=e.touches[1].clientY-e.touches[0].clientY,this._zoomDistanceEnd=Math.sqrt(i*i+o*o),a=this._zoomDistanceEnd-this._zoomDistance,a*=1.5;let r=this._spherical.radius-a;r=Ee(r,this.minDistance,this.maxDistance),this._zoomDistance=this._zoomDistanceEnd,this._spherical.radius=r;break;case 3:this._panEnd={x:(e.touches[0].clientX+e.touches[1].clientX+e.touches[2].clientX)/3,y:(e.touches[0].clientY+e.touches[1].clientY+e.touches[2].clientY)/3},this._panDelta={x:this._panEnd.x-this._panStart.x,y:this._panEnd.y-this._panStart.y},this._panDelta.x*=-1,this._updatePanHandler(),this._panStart={x:this._panEnd.x,y:this._panEnd.y};break}}_onKeyDownHandler(e){let i=0,o=0;switch(e.key){case this.keys.SHIFT:this._isShiftDown=!0;break;case this.keys.LEFT:i=-10;break;case this.keys.RIGHT:i=10;break;case this.keys.UP:o=10;break;case this.keys.BOTTOM:o=-10;break}this._isShiftDown?(this._roatteDelta={x:-i,y:o},this._updateRotateHandler()):(this._panDelta={x:i,y:o},this._updatePanHandler())}_onKeyUpHandler(e){switch(e.key){case this.keys.SHIFT:this._isShiftDown=!1;break}}_updatePanHandler(){const e=F(),i=F(),o=F();o[0]=this.target[0]-this.camera.position[0],o[1]=this.target[1]-this.camera.position[1],o[2]=this.target[2]-this.camera.position[2],Ie(o,o),ve(e,o,[0,1,0]),ve(i,e,o);const a=Math.max(this._spherical.radius/2e3,.001);this.targetXDampedAction.addForce((e[0]*this._panDelta.x+i[0]*this._panDelta.y)*a),this.targetYDampedAction.addForce((e[1]*this._panDelta.x+i[1]*this._panDelta.y)*a),this.targetZDampedAction.addForce((e[2]*this._panDelta.x+i[2]*this._panDelta.y)*a)}_updateRotateHandler(){this.targetThetaDampedAction.addForce(-this._roatteDelta.x/this.domElement.clientWidth),this.targetPhiDampedAction.addForce(-this._roatteDelta.y/this.domElement.clientHeight)}}const M=`
  struct ProjectionUniformsStruct {
    matrix : mat4x4<f32>,
		inverseMatrix: mat4x4<f32>,
    outputSize : vec2<f32>,
    zNear : f32,
    zFar : f32,
  };
`,_=`
  struct ViewUniformsStruct {
    matrix: mat4x4<f32>,
		inverseMatrix: mat4x4<f32>,
    position: vec3<f32>,
    time: f32,
		deltaTime: f32,
  };
`,re=`
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
`,ye=`
	struct LightsConfig {
		numLights: u32,
	}
`,ze=`
  struct PointLight {
    pointToLight: vec3<f32>,
    color: vec3<f32>,
    range: f32,
    intensity: f32,
  }
`,Ye=`
  struct DirectionalLight {
    direction: vec3<f32>,
    color: vec3<f32>,
  }
`,Ve=`
	struct SpotLight {
		position: vec3<f32>,
		direction: vec3<f32>,
		color: vec3<f32>,
		cutOff: f32,
		outerCutOff: f32,
		intensity: f32,
	}
`,He=`
  struct Surface {
    albedo: vec4<f32>,
    metallic: f32,
    roughness: f32,
    worldPos: vec4<f32>,
		ID: f32,
    N: vec3<f32>,
    F0: vec3<f32>,
    V: vec3<f32>,
  };
`,ke=`
	fn LinearizeDepth(depth: f32) -> f32 {
		let z = depth * 2.0 - 1.0; // Back to NDC 
		let near_plane = 0.001;
		let far_plane = 0.4;
		return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
	}
`,qe=`
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
`,Xe=`
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
`,je=`
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
`,$e=`
  fn FresnelSchlick(cosTheta: f32, F0: vec3<f32>) -> vec3<f32> {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  } 
`,We=`
  fn reinhard(x: vec3<f32>) -> vec3<f32> {
    return x / (1.0 + x);
  }
`,Ze=`
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

	fn SpotLightRadiance(light: SpotLight, surface: Surface) -> vec3<f32> {
    let L = normalize(light.position - surface.worldPos.xyz);
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
`,Ke=`
  fn reconstructWorldPosFromZ(
    coords: vec2<f32>,
    size: vec2<f32>,
    depthTexture: texture_depth_2d,
    projInverse: mat4x4<f32>,
    viewInverse: mat4x4<f32>
  ) -> vec4<f32> {
    let uv = coords.xy / projection.outputSize;
    var depth = textureLoad(depthTexture, vec2<i32>(floor(coords)), 0);
		let x = uv.x * 2 - 1;
		let y = (1 - uv.y) * 2 - 1;
		let projectedPos = vec4(x, y, depth, 1.0);
		var worldPosition = projInverse * projectedPos;
		worldPosition = vec4(worldPosition.xyz / worldPosition.w, 1.0);
		worldPosition = viewInverse * worldPosition;
    return worldPosition;
  }
`,xe=`
  let GAMMA = 2.2;
  fn linearTosRGB(linear: vec3<f32>) -> vec3<f32> {
    let INV_GAMMA = 1.0 / GAMMA;
    return pow(linear, vec3<f32>(INV_GAMMA, INV_GAMMA, INV_GAMMA));
  }
`,Je=`
  fn encodeNormals(n: vec3<f32>) -> vec2<f32> {
    let p = sqrt(n.z * 8 + 8);
    return vec2(n.xy / p + 0.5);
  }
`,Qe=`
  fn decodeNormals(enc: vec2<f32>) -> vec3<f32> {
    let fenc = enc * 4 - 2;
    let f = dot(fenc, fenc);
    let g = sqrt(1-f/4);
    return vec3(fenc*g, 1-f/2);
  }
`,et=`
  struct Output {
    @location(0) GBuffer_OUT0: vec4<f32>,	// RG: Normal, B: Metallic, A: Mesh ID
    @location(1) GBuffer_OUT1: vec4<f32>,	// RGB: Albedo, A: Roughness
  }
`,oe=`
  ${et}
  ${Je}
  
  fn encodeGBufferOutput(
    normal: vec3<f32>,
    albedo: vec3<f32>,
    metallic: f32,
    roughness: f32,
    ID: f32
  ) -> Output {
    var output: Output;
    output.GBuffer_OUT0 = vec4(encodeNormals(normal), metallic, ID);
    output.GBuffer_OUT1 = vec4(albedo, roughness);
    return output;
  }
`;class Z{constructor(e,{fragmentShader:i,bindGroupLayouts:o=[],bindGroups:a=[],label:r="fullscreen effect vertex buffer",presentationFormat:l=e.presentationFormat}){t(this,"renderPipeline");t(this,"bindGroups",[]);t(this,"vertexBuffer");t(this,"indexBuffer");t(this,"presentationFormat");this.renderer=e,this.bindGroups=a,this.presentationFormat=l;const n=new Float32Array([-1,1,-1,-1,1,-1,1,1]),u=new Uint16Array([3,2,1,3,1,0]);this.vertexBuffer=e.device.createBuffer({size:n.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0}),new Float32Array(this.vertexBuffer.getMappedRange()).set(n),this.vertexBuffer.unmap(),this.indexBuffer=e.device.createBuffer({size:u.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,label:"fullscreen effect index buffer",mappedAtCreation:!0}),new Uint16Array(this.indexBuffer.getMappedRange()).set(u),this.indexBuffer.unmap(),this.init(i,o,r)}async init(e,i,o){this.renderPipeline=await this.renderer.device.createRenderPipeline({label:o,layout:this.renderer.device.createPipelineLayout({label:`${o} layout`,bindGroupLayouts:[...i]}),primitive:{topology:"triangle-strip",stripIndexFormat:"uint16"},vertex:{entryPoint:"main",buffers:[{arrayStride:2*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x2",offset:0*Float32Array.BYTES_PER_ELEMENT}]}],module:this.renderer.device.createShaderModule({code:qe})},fragment:{entryPoint:"main",module:this.renderer.device.createShaderModule({code:e}),targets:[{format:this.presentationFormat}]}})}preRender(e){if(!!this.renderPipeline){e.setPipeline(this.renderPipeline);for(let i=0;i<this.bindGroups.length;i++)e.setBindGroup(i,this.bindGroups[i]);e.setVertexBuffer(0,this.vertexBuffer),e.setIndexBuffer(this.indexBuffer,"uint16")}}}const tt=new Map([[L.LOW,{bloomToggle:!1,shadowRes:128,pointLightsCount:16,outputScale:.5}],[L.MEDIUM,{bloomToggle:!0,shadowRes:256,pointLightsCount:32,outputScale:1}],[L.HIGH,{bloomToggle:!0,shadowRes:512,pointLightsCount:128,outputScale:1}]]);let ae;const B={get qualityLevel(){return tt.get(ae)},get quality(){return ae},set quality(s){ae=s}},it=`
	${_}
	${re}
	${ye}

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
		
		let size = 42.0;
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


`,ee=class{constructor(e){t(this,"lightsBufferComputeBindGroupLayout");t(this,"lightsBufferComputeBindGroup");t(this,"updateComputePipeline");t(this,"lightsBuffer");t(this,"lightsConfigUniformBuffer");this.renderer=e;const i=16,o=i*ee.MAX_LIGHTS_COUNT*Float32Array.BYTES_PER_ELEMENT;this.lightsBuffer=e.device.createBuffer({size:o,usage:GPUBufferUsage.STORAGE,mappedAtCreation:!0});const a=new Float32Array(this.lightsBuffer.getMappedRange()),r=Oe();for(let n=0;n<ee.MAX_LIGHTS_COUNT;n++){const u=i*n,d=(Math.random()*2-1)*20,f=-2,h=(Math.random()*2-1)*20,g=Math.random()*4-2,m=Math.random()*4-2,b=Math.random()*4-2,E=Math.random(),D=Math.random(),w=Math.random(),R=5+Math.random()*3,T=10+Math.random()*10;r[0]=d,r[1]=f,r[2]=h,a.set(r,u),r[0]=g,r[1]=m,r[2]=b,a.set(r,u+4),r[0]=E,r[1]=D,r[2]=w,r[3]=R,a.set(r,u+8),a.set([T],u+12)}this.lightsBuffer.unmap(),this.lightsConfigUniformBuffer=e.device.createBuffer({size:Uint32Array.BYTES_PER_ELEMENT,mappedAtCreation:!0,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const l=new Uint32Array(this.lightsConfigUniformBuffer.getMappedRange());l[0]=B.qualityLevel.pointLightsCount,this.lightsConfigUniformBuffer.unmap(),this.lightsBufferComputeBindGroupLayout=this.renderer.device.createBindGroupLayout({label:"lights update compute bind group layout",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{}}]}),this.lightsBufferComputeBindGroup=this.renderer.device.createBindGroup({layout:this.lightsBufferComputeBindGroupLayout,entries:[{binding:0,resource:{buffer:this.lightsBuffer}},{binding:1,resource:{buffer:this.lightsConfigUniformBuffer}}]}),this.init()}get isReady(){return!!this.updateComputePipeline}set lightsCount(e){this.renderer.device.queue.writeBuffer(this.lightsConfigUniformBuffer,0,new Uint32Array([e]))}async init(){this.updateComputePipeline=await this.renderer.device.createComputePipelineAsync({label:"point light update compute pipeline",layout:this.renderer.device.createPipelineLayout({label:"point light update compute pipeline layout",bindGroupLayouts:[this.lightsBufferComputeBindGroupLayout,this.renderer.bindGroupsLayouts.frame]}),compute:{module:this.renderer.device.createShaderModule({code:it}),entryPoint:"main"}})}updateSim(e){return this.isReady?(e.setPipeline(this.updateComputePipeline),e.setBindGroup(0,this.lightsBufferComputeBindGroup),e.setBindGroup(1,this.renderer.bindGroups.frame),e.dispatchWorkgroups(Math.ceil(B.qualityLevel.pointLightsCount/64)),this):this}};let K=ee;t(K,"MAX_LIGHTS_COUNT",256);const q=s=>s*Math.PI/180;class rt{constructor(e,{position:i,direction:o=c(0,0,0),color:a=c(1,1,1),cutOff:r=q(2),outerCutOff:l=q(20),intensity:n=1}){t(this,"camera");t(this,"_position");t(this,"_direction");t(this,"_color");t(this,"_cutOff");t(this,"_outerCutOff");t(this,"_intensity");t(this,"lightInfoUBO");t(this,"projectionUBO");t(this,"viewUBO");t(this,"depthTexture");t(this,"framebufferDescriptor");t(this,"bindGroupLayout",{});t(this,"bindGroup",{});this.renderer=e,this.camera=new W(q(56),1,.1,120),this.camera.updateViewMatrix().updateProjectionMatrix(),this.depthTexture=e.device.createTexture({label:"spot light depth texture",size:{width:B.qualityLevel.shadowRes,height:B.qualityLevel.shadowRes},format:"depth32float",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),this.lightInfoUBO=e.device.createBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:4*Float32Array.BYTES_PER_ELEMENT+4*Float32Array.BYTES_PER_ELEMENT+3*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT}),this.projectionUBO=e.device.createBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+8*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT}),this.renderer.device.queue.writeBuffer(this.projectionUBO,0*Float32Array.BYTES_PER_ELEMENT,this.camera.projectionMatrix),this.renderer.device.queue.writeBuffer(this.projectionUBO,16*Float32Array.BYTES_PER_ELEMENT,this.camera.projectionInvMatrix),this.renderer.device.queue.writeBuffer(this.projectionUBO,32*Float32Array.BYTES_PER_ELEMENT,new Float32Array([B.qualityLevel.shadowRes,B.qualityLevel.shadowRes])),this.renderer.device.queue.writeBuffer(this.projectionUBO,40*Float32Array.BYTES_PER_ELEMENT,new Float32Array([this.camera.near])),this.renderer.device.queue.writeBuffer(this.projectionUBO,41*Float32Array.BYTES_PER_ELEMENT,new Float32Array([this.camera.near])),this.viewUBO=e.device.createBuffer({usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,size:16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+3*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT}),this.renderer.device.queue.writeBuffer(this.viewUBO,0*Float32Array.BYTES_PER_ELEMENT,this.camera.viewMatrix),this.renderer.device.queue.writeBuffer(this.viewUBO,16*Float32Array.BYTES_PER_ELEMENT,this.camera.viewInvMatrix),this.renderer.device.queue.writeBuffer(this.viewUBO,32*Float32Array.BYTES_PER_ELEMENT,new Float32Array(this.camera.position)),this.renderer.device.queue.writeBuffer(this.viewUBO,35*Float32Array.BYTES_PER_ELEMENT,new Float32Array([0])),this.renderer.device.queue.writeBuffer(this.viewUBO,36*Float32Array.BYTES_PER_ELEMENT,new Float32Array([0])),this.position=i,this.direction=o,this.color=a,this.cutOff=r,this.outerCutOff=l,this.intensity=n,this.framebufferDescriptor={colorAttachments:[],depthStencilAttachment:{view:this.depthTexture.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},this.bindGroupLayout.ubos=this.renderer.device.createBindGroupLayout({label:"spot light ubos bind group layout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{}},{binding:1,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{}},{binding:2,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{}}]}),this.bindGroupLayout.depthTexture=this.renderer.device.createBindGroupLayout({label:"spot light depth texture bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,texture:{sampleType:"depth"}}]}),this.bindGroup.ubos=this.renderer.device.createBindGroup({label:"spot light ubos bind group",layout:this.bindGroupLayout.ubos,entries:[{binding:0,resource:{buffer:this.lightInfoUBO}},{binding:1,resource:{buffer:this.projectionUBO}},{binding:2,resource:{buffer:this.viewUBO}}]}),this.bindGroup.depthTexture=this.renderer.device.createBindGroup({label:"spot light depth texture bind group",layout:this.bindGroupLayout.depthTexture,entries:[{binding:0,resource:this.depthTexture.createView()}]})}get position(){return this._position}set position(e){this._position=e,this.renderer.device.queue.writeBuffer(this.lightInfoUBO,0*Float32Array.BYTES_PER_ELEMENT,e),this.camera.position=[-e[0]*15,e[1],-e[2]*15],this.camera.updateViewMatrix(),this.renderer.device.queue.writeBuffer(this.viewUBO,0*Float32Array.BYTES_PER_ELEMENT,this.camera.viewMatrix),this.renderer.device.queue.writeBuffer(this.viewUBO,16*Float32Array.BYTES_PER_ELEMENT,this.camera.viewInvMatrix)}get direction(){return this._direction}set direction(e){this._direction=e,this.renderer.device.queue.writeBuffer(this.lightInfoUBO,4*Float32Array.BYTES_PER_ELEMENT,e),this.camera.lookAtPosition=[e[0],e[1],e[2]],this.camera.updateViewMatrix(),this.renderer.device.queue.writeBuffer(this.viewUBO,0*Float32Array.BYTES_PER_ELEMENT,this.camera.viewMatrix),this.renderer.device.queue.writeBuffer(this.viewUBO,16*Float32Array.BYTES_PER_ELEMENT,this.camera.viewInvMatrix)}get color(){return this._color}set color(e){this._color=e,this.renderer.device.queue.writeBuffer(this.lightInfoUBO,8*Float32Array.BYTES_PER_ELEMENT,e)}get cutOff(){return this._cutOff}set cutOff(e){this._cutOff=e,this.renderer.device.queue.writeBuffer(this.lightInfoUBO,11*Float32Array.BYTES_PER_ELEMENT,new Float32Array([Math.cos(e)]))}get outerCutOff(){return this._outerCutOff}set outerCutOff(e){this._outerCutOff=e,this.renderer.device.queue.writeBuffer(this.lightInfoUBO,12*Float32Array.BYTES_PER_ELEMENT,new Float32Array([Math.cos(e)])),this.camera.fieldOfView=e*1.5,this.camera.updateProjectionMatrix(),this.renderer.device.queue.writeBuffer(this.projectionUBO,0*Float32Array.BYTES_PER_ELEMENT,this.camera.projectionMatrix),this.renderer.device.queue.writeBuffer(this.projectionUBO,16*Float32Array.BYTES_PER_ELEMENT,this.camera.projectionInvMatrix)}get intensity(){return this._intensity}set intensity(e){this._intensity=e,this.renderer.device.queue.writeBuffer(this.lightInfoUBO,13*Float32Array.BYTES_PER_ELEMENT,new Float32Array([e]))}}const ot=`
	${M}
	${_}
	${re}
	${ye}
	${ze}
	${Ye}
	${Ve}
	${He}
	${Qe}
	${Ke}

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
	
	${Xe}
	${je}
	${$e}
	${We}
	${Ze}
	${xe}
	${ke}

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

			let ambient = vec3(0.01) * albedo.rgb;
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
`;class at extends Z{constructor(e){const i=new K(e),o=new rt(e,{position:c(0,80,1),direction:c(0,1,0),color:c(1,1,1),cutOff:q(1),outerCutOff:q(4),intensity:8}),a=e.device.createTexture({label:"gbuffer normal texture",size:[...e.outputSize,1],usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,format:"rgba16float"}),r=e.device.createTexture({label:"gbuffer diffuse texture",size:e.outputSize,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,format:"bgra8unorm"}),l=e.device.createBindGroupLayout({label:"gbuffer bind group layout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT|GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:1,visibility:GPUShaderStage.FRAGMENT|GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"unfilterable-float"}},{binding:3,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:4,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"depth"}}]}),n=e.device.createBindGroup({label:"gbuffer bind group",layout:l,entries:[{binding:0,resource:{buffer:i.lightsBuffer}},{binding:1,resource:{buffer:i.lightsConfigUniformBuffer}},{binding:2,resource:a.createView()},{binding:3,resource:r.createView()},{binding:4,resource:e.textures.depthTexture.createView()}]});super(e,{fragmentShader:ot,bindGroupLayouts:[l,e.bindGroupsLayouts.frame,o.bindGroupLayout.ubos,o.bindGroupLayout.depthTexture],bindGroups:[n,e.bindGroups.frame,o.bindGroup.ubos,o.bindGroup.depthTexture],presentationFormat:"rgba16float"});t(this,"pointLights");t(this,"spotLight");t(this,"framebufferDescriptor");t(this,"spotLightTarget",c(0,80,0));t(this,"spotLightColorTarget",c(1,1,1));this.framebufferDescriptor={colorAttachments:[{view:a.createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"},{view:r.createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:e.textures.depthTexture.createView(),depthLoadOp:"clear",depthClearValue:1,depthStoreOp:"store"}},this.pointLights=i,this.spotLight=o}get isReady(){return this.pointLights.isReady&&!!this.renderPipeline}rearrange(){this.spotLightTarget[0]=(Math.random()*2-1)*3,this.spotLightTarget[2]=(Math.random()*2-1)*3,this.spotLightColorTarget[0]=Math.random(),this.spotLightColorTarget[1]=Math.random(),this.spotLightColorTarget[2]=Math.random()}updateLightsSim(e,i,o){this.pointLights.updateSim(e);const a=this.spotLight,r=o*2;a.position=c(a.position[0]+(this.spotLightTarget[0]-a.position[0])*r,a.position[1]+(this.spotLightTarget[1]-a.position[1])*r,a.position[2]+(this.spotLightTarget[2]-a.position[2])*r),this.spotLight.color=c((this.spotLightColorTarget[0]-this.spotLight.color[0])*r*4,(this.spotLightColorTarget[1]-this.spotLight.color[1])*r*4,(this.spotLightColorTarget[2]-this.spotLight.color[2])*r*4)}render(e){!this.isReady||(this.preRender(e),e.setBindGroup(1,this.renderer.bindGroups.frame),e.drawIndexed(6))}}const nt=`
  @group(0) @binding(0) var texture: texture_2d<f32>;

  struct Inputs {
    @builtin(position) coords: vec4<f32>,
  }
  struct Output {
    @location(0) color: vec4<f32>,
  }

  @fragment
  fn main(input: Inputs) -> Output {
    var output: Output;
    let albedo = textureLoad(
			texture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);
    let brightness = dot(albedo.rgb, vec3(0.2126, 0.7152, 0.0722));
    if (brightness > 1.0) {
      output.color = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
      output.color = vec4(0.0, 0.0, 0.0, 1.0);
    }
    return output;
  }
`,st=`
  struct Params {
    filterDim : u32,
    blockDim : u32,
  };

  struct Flip {
    value : u32,
  };

  @group(0) @binding(0) var samp: sampler;
  @group(0) @binding(1) var<uniform> params: Params;
  @group(1) @binding(0) var inputTex: texture_2d<f32>;
  @group(1) @binding(1) var outputTex: texture_storage_2d<rgba8unorm, write>;
  @group(1) @binding(2) var<uniform> flip : Flip;

  var<workgroup> tile : array<array<vec3<f32>, 128>, 4>;

  @compute @workgroup_size(32, 1, 1)
  fn main(
    @builtin(workgroup_id) WorkGroupID : vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID : vec3<u32>
  ) {
    let filterOffset : u32 = (params.filterDim - 1u) / 2u;
    let dims : vec2<i32> = textureDimensions(inputTex, 0);

    let baseIndex = vec2<i32>(
      WorkGroupID.xy * vec2<u32>(params.blockDim, 4u) +
      LocalInvocationID.xy * vec2<u32>(4u, 1u)
    ) - vec2<i32>(i32(filterOffset), 0);

    for (var r : u32 = 0u; r < 4u; r = r + 1u) {
      for (var c : u32 = 0u; c < 4u; c = c + 1u) {
        var loadIndex = baseIndex + vec2<i32>(i32(c), i32(r));
        if (flip.value != 0u) {
          loadIndex = loadIndex.yx;
        }

        tile[r][4u * LocalInvocationID.x + c] =
          textureSampleLevel(inputTex, samp,
            (vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims), 0.0).rgb;
      }
    }

    workgroupBarrier();

    for (var r : u32 = 0u; r < 4u; r = r + 1u) {
      for (var c : u32 = 0u; c < 4u; c = c + 1u) {
        var writeIndex = baseIndex + vec2<i32>(i32(c), i32(r));
        if (flip.value != 0u) {
          writeIndex = writeIndex.yx;
        }

        let center : u32 = 4u * LocalInvocationID.x + c;
        if (center >= filterOffset &&
            center < 128u - filterOffset &&
            all(writeIndex < dims)) {
          var acc : vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
          for (var f : u32 = 0u; f < params.filterDim; f = f + 1u) {
            var i : u32 = center + f - filterOffset;
            acc = acc + (1.0 / f32(params.filterDim)) * tile[r][i];
          }
          textureStore(outputTex, writeIndex, vec4<f32>(acc, 1.0));
        }
      }
    }
  }
`,U=class extends Z{constructor(e,i){const o=e.device.createTexture({label:"bloom texture",size:e.outputSize,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,format:"rgba16float"}),a=e.device.createBindGroupLayout({label:"bloom pass bind group layout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float"}}]}),r=[0,1].map(u=>e.device.createTexture({size:{width:e.outputSize[0],height:e.outputSize[1]},format:"rgba8unorm",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.TEXTURE_BINDING})),l=e.device.createBindGroup({label:"gbuffer bind group",layout:a,entries:[{binding:0,resource:i.copyTexture.createView()}]});super(e,{fragmentShader:nt,bindGroupLayouts:[a,e.bindGroupsLayouts.frame],bindGroups:[l,e.bindGroups.frame],label:"bloom pass effect",presentationFormat:"rgba16float"});t(this,"pointLights");t(this,"spotLight");t(this,"framebufferDescriptor");t(this,"bloomTexture");t(this,"inputTexture");t(this,"blurTextures");t(this,"blurPipeline");t(this,"blurConstantsBindGroupLayout");t(this,"blurComputeConstantsBindGroup");t(this,"blurComputeBindGroupLayout");t(this,"blurComputeBindGroup0");t(this,"blurComputeBindGroup1");t(this,"blurComputeBindGroup2");t(this,"sampler");t(this,"blockDim",0);this.bloomTexture=o,this.inputTexture=i.copyTexture,this.blurTextures=r,this.framebufferDescriptor={colorAttachments:[{view:this.bloomTexture.createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]};const n=this.renderer.device.createBuffer({label:"blur params buffer",size:2*Uint32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM,mappedAtCreation:!0});this.blockDim=U.TILE_DIM-(U.FILTER_SIZE-1),new Uint32Array(n.getMappedRange()).set(new Uint32Array([U.FILTER_SIZE,this.blockDim])),n.unmap(),this.sampler=this.renderer.device.createSampler({label:"bloom sampler",minFilter:"linear",magFilter:"linear"}),this.blurConstantsBindGroupLayout=this.renderer.device.createBindGroupLayout({label:"blur constants bind group layout",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,sampler:{type:"filtering"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{}}]}),this.blurComputeConstantsBindGroup=this.renderer.device.createBindGroup({label:"blur constants bind group",layout:this.blurConstantsBindGroupLayout,entries:[{binding:0,resource:this.sampler},{binding:1,resource:{buffer:n}}]}),this.blurComputeBindGroupLayout=this.renderer.device.createBindGroupLayout({label:"blur compute bind group layout",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,texture:{sampleType:"float"}},{binding:1,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:"write-only",format:"rgba8unorm"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{}}]}),this.initComputePipeline()}get isReady(){return!!this.renderPipeline&&!!this.blurPipeline}async initComputePipeline(){this.blurPipeline=await this.renderer.device.createComputePipelineAsync({label:"bloom pass blur pipeline",layout:this.renderer.device.createPipelineLayout({label:"bloom pass blur pipeline layout",bindGroupLayouts:[this.blurConstantsBindGroupLayout,this.blurComputeBindGroupLayout]}),compute:{module:this.renderer.device.createShaderModule({code:st}),entryPoint:"main"}});const e=(()=>{const o=this.renderer.device.createBuffer({size:4,mappedAtCreation:!0,usage:GPUBufferUsage.UNIFORM});return new Uint32Array(o.getMappedRange())[0]=0,o.unmap(),o})(),i=(()=>{const o=this.renderer.device.createBuffer({size:4,mappedAtCreation:!0,usage:GPUBufferUsage.UNIFORM});return new Uint32Array(o.getMappedRange())[0]=1,o.unmap(),o})();this.blurComputeBindGroup0=this.renderer.device.createBindGroup({label:"blur compute bind group 0",layout:this.blurComputeBindGroupLayout,entries:[{binding:0,resource:this.bloomTexture.createView()},{binding:1,resource:this.blurTextures[0].createView()},{binding:2,resource:{buffer:e}}]}),this.blurComputeBindGroup1=this.renderer.device.createBindGroup({label:"blur compute bind group 1",layout:this.blurComputeBindGroupLayout,entries:[{binding:0,resource:this.blurTextures[0].createView()},{binding:1,resource:this.blurTextures[1].createView()},{binding:2,resource:{buffer:i}}]}),this.blurComputeBindGroup2=this.renderer.device.createBindGroup({label:"blur compute bind group 2",layout:this.blurComputeBindGroupLayout,entries:[{binding:0,resource:this.blurTextures[1].createView()},{binding:1,resource:this.blurTextures[0].createView()},{binding:2,resource:{buffer:e}}]})}updateBloom(e){if(!this.isReady)return;const i=this.renderer,o=this.blockDim,a=U.BATCH,r=i.outputSize[0],l=i.outputSize[1];e.setPipeline(this.blurPipeline),e.setBindGroup(0,this.blurComputeConstantsBindGroup),e.setBindGroup(1,this.blurComputeBindGroup0),e.dispatchWorkgroups(Math.ceil(r/o),Math.ceil(l/a[1])),e.setBindGroup(1,this.blurComputeBindGroup1),e.dispatchWorkgroups(Math.ceil(l/o),Math.ceil(r/a[1]));for(let n=0;n<U.ITERATIONS-1;++n)e.setBindGroup(1,this.blurComputeBindGroup2),e.dispatchWorkgroups(Math.ceil(r/o),Math.ceil(l/a[1])),e.setBindGroup(1,this.blurComputeBindGroup1),e.dispatchWorkgroups(Math.ceil(l/o),Math.ceil(r/a[1]))}render(e){!this.isReady||(this.preRender(e),e.setBindGroup(1,this.renderer.bindGroups.frame),e.drawIndexed(6))}};let C=U;t(C,"TILE_DIM",128),t(C,"BATCH",[4,4]),t(C,"FILTER_SIZE",10),t(C,"ITERATIONS",2);const ut=`
  @group(0) @binding(0) var texture: texture_2d<f32>;

  struct Inputs {
    @builtin(position) coords: vec4<f32>,
  }
  struct Output {
    @location(0) color: vec4<f32>,
  }

  @fragment
  fn main(input: Inputs) -> Output {
    var output: Output;
    let albedo = textureLoad(
			texture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);
    output.color = vec4(albedo.rgb, 1.0);
    return output;
  }
`;class lt extends Z{constructor(e){const i=e.device.createTexture({label:"copy pass texture",size:e.outputSize,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING,format:"rgba16float"}),o=e.device.createBindGroupLayout({label:"copy pass bind group layout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float"}}]}),a=e.device.createBindGroup({label:"copy pass bind group",layout:o,entries:[{binding:0,resource:i.createView()}]});super(e,{fragmentShader:ut,bindGroupLayouts:[o,e.bindGroupsLayouts.frame],bindGroups:[a,e.bindGroups.frame],presentationFormat:"rgba16float",label:"copy pass effect"});t(this,"pointLights");t(this,"spotLight");t(this,"framebufferDescriptor");t(this,"copyTexture");this.copyTexture=i,this.framebufferDescriptor={colorAttachments:[{view:this.copyTexture.createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]}}get isReady(){return!!this.renderPipeline}render(e){!this.isReady||(this.preRender(e),e.setBindGroup(1,this.renderer.bindGroups.frame),e.drawIndexed(6))}}const ct=`
  ${xe}
  @group(0) @binding(0) var copyTexture: texture_2d<f32>;
  @group(0) @binding(1) var bloomTexture: texture_2d<f32>;

  struct Inputs {
    @builtin(position) coords: vec4<f32>,
  }
  struct Output {
    @location(0) color: vec4<f32>,
  }

  @fragment
  fn main(input: Inputs) -> Output {
    var output: Output;
    var hdrColor = textureLoad(
			copyTexture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);
    let bloomColor = textureLoad(
			bloomTexture,
			vec2<i32>(floor(input.coords.xy)),
			0
		);

    hdrColor += bloomColor;


    var result = vec3(1.0) - exp(-hdrColor.rgb * 1.0);
    result = linearTosRGB(result);

    output.color = vec4(result, 1.0);
    // output.color = vec4(bloomColor.rgba);
    return output;
  }
`;class dt extends Z{constructor(e,i,o){const a=e.device.createBindGroupLayout({label:"result pass bind group layout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"float"}}]}),r=e.device.createBindGroup({label:"result pass bind group",layout:a,entries:[{binding:0,resource:i.copyTexture.createView()},{binding:1,resource:o.blurTextures[1].createView()}]});super(e,{fragmentShader:ct,bindGroupLayouts:[a,e.bindGroupsLayouts.frame],bindGroups:[r,e.bindGroups.frame],label:"result pass effect"});t(this,"pointLights");t(this,"spotLight");t(this,"framebufferDescriptor");t(this,"copyTexture")}get isReady(){return!!this.renderPipeline}render(e){!this.isReady||(this.preRender(e),e.setBindGroup(1,this.renderer.bindGroups.frame),e.drawIndexed(6))}}const J=new Uint16Array([0,265,515,778,1030,1295,1541,1804,2060,2309,2575,2822,3082,3331,3593,3840,400,153,915,666,1430,1183,1941,1692,2460,2197,2975,2710,3482,3219,3993,3728,560,825,51,314,1590,1855,1077,1340,2620,2869,2111,2358,3642,3891,3129,3376,928,681,419,170,1958,1711,1445,1196,2988,2725,2479,2214,4010,3747,3497,3232,1120,1385,1635,1898,102,367,613,876,3180,3429,3695,3942,2154,2403,2665,2912,1520,1273,2035,1786,502,255,1013,764,3580,3317,4095,3830,2554,2291,3065,2800,1616,1881,1107,1370,598,863,85,348,3676,3925,3167,3414,2650,2899,2137,2384,1984,1737,1475,1226,966,719,453,204,4044,3781,3535,3270,3018,2755,2505,2240,2240,2505,2755,3018,3270,3535,3781,4044,204,453,719,966,1226,1475,1737,1984,2384,2137,2899,2650,3414,3167,3925,3676,348,85,863,598,1370,1107,1881,1616,2800,3065,2291,2554,3830,4095,3317,3580,764,1013,255,502,1786,2035,1273,1520,2912,2665,2403,2154,3942,3695,3429,3180,876,613,367,102,1898,1635,1385,1120,3232,3497,3747,4010,2214,2479,2725,2988,1196,1445,1711,1958,170,419,681,928,3376,3129,3891,3642,2358,2111,2869,2620,1340,1077,1855,1590,314,51,825,560,3728,3993,3219,3482,2710,2975,2197,2460,1692,1941,1183,1430,666,915,153,400,3840,3593,3331,3082,2822,2575,2309,2060,1804,1541,1295,1030,778,515,265,0]),ne=new Int8Array([0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,8,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,1,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,1,8,3,9,8,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,0,8,3,1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,9,2,10,0,2,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,2,8,3,2,10,8,10,9,8,-1,-1,-1,-1,-1,-1,3,3,11,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,0,11,2,8,11,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,1,9,0,2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,1,11,2,1,9,11,9,8,11,-1,-1,-1,-1,-1,-1,6,3,10,1,11,10,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,0,10,1,0,8,10,8,11,10,-1,-1,-1,-1,-1,-1,9,3,9,0,3,11,9,11,10,9,-1,-1,-1,-1,-1,-1,6,9,8,10,10,8,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,4,3,0,7,3,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,0,1,9,8,4,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,4,1,9,4,7,1,7,3,1,-1,-1,-1,-1,-1,-1,6,1,2,10,8,4,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,3,4,7,3,0,4,1,2,10,-1,-1,-1,-1,-1,-1,9,9,2,10,9,0,2,8,4,7,-1,-1,-1,-1,-1,-1,12,2,10,9,2,9,7,2,7,3,7,9,4,-1,-1,-1,6,8,4,7,3,11,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,11,4,7,11,2,4,2,0,4,-1,-1,-1,-1,-1,-1,9,9,0,1,8,4,7,2,3,11,-1,-1,-1,-1,-1,-1,12,4,7,11,9,4,11,9,11,2,9,2,1,-1,-1,-1,9,3,10,1,3,11,10,7,8,4,-1,-1,-1,-1,-1,-1,12,1,11,10,1,4,11,1,0,4,7,11,4,-1,-1,-1,12,4,7,8,9,0,11,9,11,10,11,0,3,-1,-1,-1,9,4,7,11,4,11,9,9,11,10,-1,-1,-1,-1,-1,-1,3,9,5,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,9,5,4,0,8,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,0,5,4,1,5,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,8,5,4,8,3,5,3,1,5,-1,-1,-1,-1,-1,-1,6,1,2,10,9,5,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,3,0,8,1,2,10,4,9,5,-1,-1,-1,-1,-1,-1,9,5,2,10,5,4,2,4,0,2,-1,-1,-1,-1,-1,-1,12,2,10,5,3,2,5,3,5,4,3,4,8,-1,-1,-1,6,9,5,4,2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,0,11,2,0,8,11,4,9,5,-1,-1,-1,-1,-1,-1,9,0,5,4,0,1,5,2,3,11,-1,-1,-1,-1,-1,-1,12,2,1,5,2,5,8,2,8,11,4,8,5,-1,-1,-1,9,10,3,11,10,1,3,9,5,4,-1,-1,-1,-1,-1,-1,12,4,9,5,0,8,1,8,10,1,8,11,10,-1,-1,-1,12,5,4,0,5,0,11,5,11,10,11,0,3,-1,-1,-1,9,5,4,8,5,8,10,10,8,11,-1,-1,-1,-1,-1,-1,6,9,7,8,5,7,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,9,3,0,9,5,3,5,7,3,-1,-1,-1,-1,-1,-1,9,0,7,8,0,1,7,1,5,7,-1,-1,-1,-1,-1,-1,6,1,5,3,3,5,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,9,7,8,9,5,7,10,1,2,-1,-1,-1,-1,-1,-1,12,10,1,2,9,5,0,5,3,0,5,7,3,-1,-1,-1,12,8,0,2,8,2,5,8,5,7,10,5,2,-1,-1,-1,9,2,10,5,2,5,3,3,5,7,-1,-1,-1,-1,-1,-1,9,7,9,5,7,8,9,3,11,2,-1,-1,-1,-1,-1,-1,12,9,5,7,9,7,2,9,2,0,2,7,11,-1,-1,-1,12,2,3,11,0,1,8,1,7,8,1,5,7,-1,-1,-1,9,11,2,1,11,1,7,7,1,5,-1,-1,-1,-1,-1,-1,12,9,5,8,8,5,7,10,1,3,10,3,11,-1,-1,-1,15,5,7,0,5,0,9,7,11,0,1,0,10,11,10,0,15,11,10,0,11,0,3,10,5,0,8,0,7,5,7,0,6,11,10,5,7,11,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,10,6,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,0,8,3,5,10,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,9,0,1,5,10,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,1,8,3,1,9,8,5,10,6,-1,-1,-1,-1,-1,-1,6,1,6,5,2,6,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,1,6,5,1,2,6,3,0,8,-1,-1,-1,-1,-1,-1,9,9,6,5,9,0,6,0,2,6,-1,-1,-1,-1,-1,-1,12,5,9,8,5,8,2,5,2,6,3,2,8,-1,-1,-1,6,2,3,11,10,6,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,11,0,8,11,2,0,10,6,5,-1,-1,-1,-1,-1,-1,9,0,1,9,2,3,11,5,10,6,-1,-1,-1,-1,-1,-1,12,5,10,6,1,9,2,9,11,2,9,8,11,-1,-1,-1,9,6,3,11,6,5,3,5,1,3,-1,-1,-1,-1,-1,-1,12,0,8,11,0,11,5,0,5,1,5,11,6,-1,-1,-1,12,3,11,6,0,3,6,0,6,5,0,5,9,-1,-1,-1,9,6,5,9,6,9,11,11,9,8,-1,-1,-1,-1,-1,-1,6,5,10,6,4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,4,3,0,4,7,3,6,5,10,-1,-1,-1,-1,-1,-1,9,1,9,0,5,10,6,8,4,7,-1,-1,-1,-1,-1,-1,12,10,6,5,1,9,7,1,7,3,7,9,4,-1,-1,-1,9,6,1,2,6,5,1,4,7,8,-1,-1,-1,-1,-1,-1,12,1,2,5,5,2,6,3,0,4,3,4,7,-1,-1,-1,12,8,4,7,9,0,5,0,6,5,0,2,6,-1,-1,-1,15,7,3,9,7,9,4,3,2,9,5,9,6,2,6,9,9,3,11,2,7,8,4,10,6,5,-1,-1,-1,-1,-1,-1,12,5,10,6,4,7,2,4,2,0,2,7,11,-1,-1,-1,12,0,1,9,4,7,8,2,3,11,5,10,6,-1,-1,-1,15,9,2,1,9,11,2,9,4,11,7,11,4,5,10,6,12,8,4,7,3,11,5,3,5,1,5,11,6,-1,-1,-1,15,5,1,11,5,11,6,1,0,11,7,11,4,0,4,11,15,0,5,9,0,6,5,0,3,6,11,6,3,8,4,7,12,6,5,9,6,9,11,4,7,9,7,11,9,-1,-1,-1,6,10,4,9,6,4,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,4,10,6,4,9,10,0,8,3,-1,-1,-1,-1,-1,-1,9,10,0,1,10,6,0,6,4,0,-1,-1,-1,-1,-1,-1,12,8,3,1,8,1,6,8,6,4,6,1,10,-1,-1,-1,9,1,4,9,1,2,4,2,6,4,-1,-1,-1,-1,-1,-1,12,3,0,8,1,2,9,2,4,9,2,6,4,-1,-1,-1,6,0,2,4,4,2,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,8,3,2,8,2,4,4,2,6,-1,-1,-1,-1,-1,-1,9,10,4,9,10,6,4,11,2,3,-1,-1,-1,-1,-1,-1,12,0,8,2,2,8,11,4,9,10,4,10,6,-1,-1,-1,12,3,11,2,0,1,6,0,6,4,6,1,10,-1,-1,-1,15,6,4,1,6,1,10,4,8,1,2,1,11,8,11,1,12,9,6,4,9,3,6,9,1,3,11,6,3,-1,-1,-1,15,8,11,1,8,1,0,11,6,1,9,1,4,6,4,1,9,3,11,6,3,6,0,0,6,4,-1,-1,-1,-1,-1,-1,6,6,4,8,11,6,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,7,10,6,7,8,10,8,9,10,-1,-1,-1,-1,-1,-1,12,0,7,3,0,10,7,0,9,10,6,7,10,-1,-1,-1,12,10,6,7,1,10,7,1,7,8,1,8,0,-1,-1,-1,9,10,6,7,10,7,1,1,7,3,-1,-1,-1,-1,-1,-1,12,1,2,6,1,6,8,1,8,9,8,6,7,-1,-1,-1,15,2,6,9,2,9,1,6,7,9,0,9,3,7,3,9,9,7,8,0,7,0,6,6,0,2,-1,-1,-1,-1,-1,-1,6,7,3,2,6,7,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,2,3,11,10,6,8,10,8,9,8,6,7,-1,-1,-1,15,2,0,7,2,7,11,0,9,7,6,7,10,9,10,7,15,1,8,0,1,7,8,1,10,7,6,7,10,2,3,11,12,11,2,1,11,1,7,10,6,1,6,7,1,-1,-1,-1,15,8,9,6,8,6,7,9,1,6,11,6,3,1,3,6,6,0,9,1,11,6,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,7,8,0,7,0,6,3,11,0,11,6,0,-1,-1,-1,3,7,11,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,7,6,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,3,0,8,11,7,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,0,1,9,11,7,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,8,1,9,8,3,1,11,7,6,-1,-1,-1,-1,-1,-1,6,10,1,2,6,11,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,1,2,10,3,0,8,6,11,7,-1,-1,-1,-1,-1,-1,9,2,9,0,2,10,9,6,11,7,-1,-1,-1,-1,-1,-1,12,6,11,7,2,10,3,10,8,3,10,9,8,-1,-1,-1,6,7,2,3,6,2,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,7,0,8,7,6,0,6,2,0,-1,-1,-1,-1,-1,-1,9,2,7,6,2,3,7,0,1,9,-1,-1,-1,-1,-1,-1,12,1,6,2,1,8,6,1,9,8,8,7,6,-1,-1,-1,9,10,7,6,10,1,7,1,3,7,-1,-1,-1,-1,-1,-1,12,10,7,6,1,7,10,1,8,7,1,0,8,-1,-1,-1,12,0,3,7,0,7,10,0,10,9,6,10,7,-1,-1,-1,9,7,6,10,7,10,8,8,10,9,-1,-1,-1,-1,-1,-1,6,6,8,4,11,8,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,3,6,11,3,0,6,0,4,6,-1,-1,-1,-1,-1,-1,9,8,6,11,8,4,6,9,0,1,-1,-1,-1,-1,-1,-1,12,9,4,6,9,6,3,9,3,1,11,3,6,-1,-1,-1,9,6,8,4,6,11,8,2,10,1,-1,-1,-1,-1,-1,-1,12,1,2,10,3,0,11,0,6,11,0,4,6,-1,-1,-1,12,4,11,8,4,6,11,0,2,9,2,10,9,-1,-1,-1,15,10,9,3,10,3,2,9,4,3,11,3,6,4,6,3,9,8,2,3,8,4,2,4,6,2,-1,-1,-1,-1,-1,-1,6,0,4,2,4,6,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,1,9,0,2,3,4,2,4,6,4,3,8,-1,-1,-1,9,1,9,4,1,4,2,2,4,6,-1,-1,-1,-1,-1,-1,12,8,1,3,8,6,1,8,4,6,6,10,1,-1,-1,-1,9,10,1,0,10,0,6,6,0,4,-1,-1,-1,-1,-1,-1,15,4,6,3,4,3,8,6,10,3,0,3,9,10,9,3,6,10,9,4,6,10,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,4,9,5,7,6,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,0,8,3,4,9,5,11,7,6,-1,-1,-1,-1,-1,-1,9,5,0,1,5,4,0,7,6,11,-1,-1,-1,-1,-1,-1,12,11,7,6,8,3,4,3,5,4,3,1,5,-1,-1,-1,9,9,5,4,10,1,2,7,6,11,-1,-1,-1,-1,-1,-1,12,6,11,7,1,2,10,0,8,3,4,9,5,-1,-1,-1,12,7,6,11,5,4,10,4,2,10,4,0,2,-1,-1,-1,15,3,4,8,3,5,4,3,2,5,10,5,2,11,7,6,9,7,2,3,7,6,2,5,4,9,-1,-1,-1,-1,-1,-1,12,9,5,4,0,8,6,0,6,2,6,8,7,-1,-1,-1,12,3,6,2,3,7,6,1,5,0,5,4,0,-1,-1,-1,15,6,2,8,6,8,7,2,1,8,4,8,5,1,5,8,12,9,5,4,10,1,6,1,7,6,1,3,7,-1,-1,-1,15,1,6,10,1,7,6,1,0,7,8,7,0,9,5,4,15,4,0,10,4,10,5,0,3,10,6,10,7,3,7,10,12,7,6,10,7,10,8,5,4,10,4,8,10,-1,-1,-1,9,6,9,5,6,11,9,11,8,9,-1,-1,-1,-1,-1,-1,12,3,6,11,0,6,3,0,5,6,0,9,5,-1,-1,-1,12,0,11,8,0,5,11,0,1,5,5,6,11,-1,-1,-1,9,6,11,3,6,3,5,5,3,1,-1,-1,-1,-1,-1,-1,12,1,2,10,9,5,11,9,11,8,11,5,6,-1,-1,-1,15,0,11,3,0,6,11,0,9,6,5,6,9,1,2,10,15,11,8,5,11,5,6,8,0,5,10,5,2,0,2,5,12,6,11,3,6,3,5,2,10,3,10,5,3,-1,-1,-1,12,5,8,9,5,2,8,5,6,2,3,8,2,-1,-1,-1,9,9,5,6,9,6,0,0,6,2,-1,-1,-1,-1,-1,-1,15,1,5,8,1,8,0,5,6,8,3,8,2,6,2,8,6,1,5,6,2,1,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,15,1,3,6,1,6,10,3,8,6,5,6,9,8,9,6,12,10,1,0,10,0,6,9,5,0,5,6,0,-1,-1,-1,6,0,3,8,5,6,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,10,5,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,11,5,10,7,5,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,11,5,10,11,7,5,8,3,0,-1,-1,-1,-1,-1,-1,9,5,11,7,5,10,11,1,9,0,-1,-1,-1,-1,-1,-1,12,10,7,5,10,11,7,9,8,1,8,3,1,-1,-1,-1,9,11,1,2,11,7,1,7,5,1,-1,-1,-1,-1,-1,-1,12,0,8,3,1,2,7,1,7,5,7,2,11,-1,-1,-1,12,9,7,5,9,2,7,9,0,2,2,11,7,-1,-1,-1,15,7,5,2,7,2,11,5,9,2,3,2,8,9,8,2,9,2,5,10,2,3,5,3,7,5,-1,-1,-1,-1,-1,-1,12,8,2,0,8,5,2,8,7,5,10,2,5,-1,-1,-1,12,9,0,1,5,10,3,5,3,7,3,10,2,-1,-1,-1,15,9,8,2,9,2,1,8,7,2,10,2,5,7,5,2,6,1,3,5,3,7,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,0,8,7,0,7,1,1,7,5,-1,-1,-1,-1,-1,-1,9,9,0,3,9,3,5,5,3,7,-1,-1,-1,-1,-1,-1,6,9,8,7,5,9,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,5,8,4,5,10,8,10,11,8,-1,-1,-1,-1,-1,-1,12,5,0,4,5,11,0,5,10,11,11,3,0,-1,-1,-1,12,0,1,9,8,4,10,8,10,11,10,4,5,-1,-1,-1,15,10,11,4,10,4,5,11,3,4,9,4,1,3,1,4,12,2,5,1,2,8,5,2,11,8,4,5,8,-1,-1,-1,15,0,4,11,0,11,3,4,5,11,2,11,1,5,1,11,15,0,2,5,0,5,9,2,11,5,4,5,8,11,8,5,6,9,4,5,2,11,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,2,5,10,3,5,2,3,4,5,3,8,4,-1,-1,-1,9,5,10,2,5,2,4,4,2,0,-1,-1,-1,-1,-1,-1,15,3,10,2,3,5,10,3,8,5,4,5,8,0,1,9,12,5,10,2,5,2,4,1,9,2,9,4,2,-1,-1,-1,9,8,4,5,8,5,3,3,5,1,-1,-1,-1,-1,-1,-1,6,0,4,5,1,0,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,8,4,5,8,5,3,9,0,5,0,3,5,-1,-1,-1,3,9,4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,4,11,7,4,9,11,9,10,11,-1,-1,-1,-1,-1,-1,12,0,8,3,4,9,7,9,11,7,9,10,11,-1,-1,-1,12,1,10,11,1,11,4,1,4,0,7,4,11,-1,-1,-1,15,3,1,4,3,4,8,1,10,4,7,4,11,10,11,4,12,4,11,7,9,11,4,9,2,11,9,1,2,-1,-1,-1,15,9,7,4,9,11,7,9,1,11,2,11,1,0,8,3,9,11,7,4,11,4,2,2,4,0,-1,-1,-1,-1,-1,-1,12,11,7,4,11,4,2,8,3,4,3,2,4,-1,-1,-1,12,2,9,10,2,7,9,2,3,7,7,4,9,-1,-1,-1,15,9,10,7,9,7,4,10,2,7,8,7,0,2,0,7,15,3,7,10,3,10,2,7,4,10,1,10,0,4,0,10,6,1,10,2,8,7,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,4,9,1,4,1,7,7,1,3,-1,-1,-1,-1,-1,-1,12,4,9,1,4,1,7,0,8,1,8,7,1,-1,-1,-1,6,4,0,3,7,4,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,4,8,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,9,10,8,10,11,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,3,0,9,3,9,11,11,9,10,-1,-1,-1,-1,-1,-1,9,0,1,10,0,10,8,8,10,11,-1,-1,-1,-1,-1,-1,6,3,1,10,11,3,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,1,2,11,1,11,9,9,11,8,-1,-1,-1,-1,-1,-1,12,3,0,9,3,9,11,1,2,9,2,11,9,-1,-1,-1,6,0,2,11,8,0,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,3,2,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,2,3,8,2,8,10,10,8,9,-1,-1,-1,-1,-1,-1,6,9,10,2,0,9,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,2,3,8,2,8,10,0,1,8,1,10,8,-1,-1,-1,3,1,10,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,6,1,3,8,9,1,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,9,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,3,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]),Be=`
  struct IsosurfaceVolume {
    min: vec3<f32>,
    max: vec3<f32>,
    step: vec3<f32>,
    size: vec3<u32>,
    threshold: f32,
    values: array<f32>,
  };
`,ft=`
  struct Metaball {
    position: vec3<f32>,
    radius: f32,
    strength: f32,
    subtract: f32,
  };

  struct MetaballList {
    ballCount: u32,
    balls: array<Metaball>,
  };
  @group(0) @binding(0) var<storage> metaballs : MetaballList;

  ${Be}
  @group(0) @binding(1) var<storage, read_write> volume : IsosurfaceVolume;

  fn positionAt(index : vec3<u32>) -> vec3<f32> {
    return volume.min + (volume.step * vec3<f32>(index.xyz));
  }

  fn surfaceFunc(position : vec3<f32>) -> f32 {
    var result = 0.0;
    for (var i = 0u; i < metaballs.ballCount; i = i + 1u) {
      let ball = metaballs.balls[i];
      let dist = distance(position, ball.position);
      let val = ball.strength / (0.000001 + (dist * dist)) - ball.subtract;
      if (val > 0.0) {
        result = result + val;
      }
    }
    return result;
  }

  @compute @workgroup_size(${P[0]}, ${P[1]}, ${P[2]})
  fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let position = positionAt(global_id);
    let valueIndex = global_id.x +
                    (global_id.y * volume.size.x) +
                    (global_id.z * volume.size.x * volume.size.y);

    volume.values[valueIndex] = surfaceFunc(position);
  }
`,ht=`
  struct Tables {
    edges: array<u32, ${J.length}>,
    tris: array<i32, ${ne.length}>,
  };
  @group(0) @binding(0) var<storage> tables : Tables;

  ${Be}
  @group(0) @binding(1) var<storage, write> volume : IsosurfaceVolume;

  // Output buffers
  struct PositionBuffer {
    values : array<f32>,
  };
  @group(0) @binding(2) var<storage, write> positionsOut : PositionBuffer;

  struct NormalBuffer {
    values : array<f32>,
  };
  @group(0) @binding(3) var<storage, write> normalsOut : NormalBuffer;

  struct IndexBuffer {
    tris : array<u32>,
  };
  @group(0) @binding(4) var<storage, write> indicesOut : IndexBuffer;

  struct DrawIndirectArgs {
    vc : u32,
    vertexCount : atomic<u32>, // Actually instance count, treated as vertex count for point cloud rendering.
    firstVertex : u32,
    firstInstance : u32,

    indexCount : atomic<u32>,
    indexedInstanceCount : u32,
    indexedFirstIndex : u32,
    indexedBaseVertex : u32,
    indexedFirstInstance : u32,
  };
  @group(0) @binding(5) var<storage, read_write> drawOut : DrawIndirectArgs;

  // Data fetchers
  fn valueAt(index : vec3<u32>) -> f32 {
    // Don't index outside of the volume bounds.
    if (any(index >= volume.size)) { return 0.0; }

    let valueIndex = index.x +
                    (index.y * volume.size.x) +
                    (index.z * volume.size.x * volume.size.y);
    return volume.values[valueIndex];
  }

  fn positionAt(index : vec3<u32>) -> vec3<f32> {
    return volume.min + (volume.step * vec3<f32>(index.xyz));
  }

  fn normalAt(index : vec3<u32>) -> vec3<f32> {
    return vec3<f32>(
      valueAt(index - vec3<u32>(1u, 0u, 0u)) - valueAt(index + vec3<u32>(1u, 0u, 0u)),
      valueAt(index - vec3<u32>(0u, 1u, 0u)) - valueAt(index + vec3<u32>(0u, 1u, 0u)),
      valueAt(index - vec3<u32>(0u, 0u, 1u)) - valueAt(index + vec3<u32>(0u, 0u, 1u))
    );
  }

  // Vertex interpolation
  var<private> positions : array<vec3<f32>, 12>;
  var<private> normals : array<vec3<f32>, 12>;
  var<private> indices : array<u32, 12>;
  var<private> cubeVerts : u32 = 0u;

  fn interpX(index : u32, i : vec3<u32>, va : f32, vb : f32) {
    let mu = (volume.threshold - va) / (vb - va);
    positions[cubeVerts] = positionAt(i) + vec3<f32>(volume.step.x * mu, 0.0, 0.0);

    let na = normalAt(i);
    let nb = normalAt(i + vec3<u32>(1u, 0u, 0u));
    normals[cubeVerts] = mix(na, nb, vec3<f32>(mu, mu, mu));

    indices[index] = cubeVerts;
    cubeVerts = cubeVerts + 1u;
  }

  fn interpY(index : u32, i : vec3<u32>, va : f32, vb : f32) {
    let mu = (volume.threshold - va) / (vb - va);
    positions[cubeVerts] = positionAt(i) + vec3<f32>(0.0, volume.step.y * mu, 0.0);

    let na = normalAt(i);
    let nb = normalAt(i + vec3<u32>(0u, 1u, 0u));
    normals[cubeVerts] = mix(na, nb, vec3<f32>(mu, mu, mu));

    indices[index] = cubeVerts;
    cubeVerts = cubeVerts + 1u;
  }

  fn interpZ(index : u32, i : vec3<u32>, va : f32, vb : f32) {
    let mu = (volume.threshold - va) / (vb - va);
    positions[cubeVerts] = positionAt(i) + vec3<f32>(0.0, 0.0, volume.step.z * mu);

    let na = normalAt(i);
    let nb = normalAt(i + vec3<u32>(0u, 0u, 1u));
    normals[cubeVerts] = mix(na, nb, vec3<f32>(mu, mu, mu));

    indices[index] = cubeVerts;
    cubeVerts = cubeVerts + 1u;
  }

  @compute @workgroup_size(${P[0]}, ${P[1]}, ${P[2]})
  fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    
    let i0 = global_id;
    let i1 = global_id + vec3<u32>(1u, 0u, 0u);
    let i2 = global_id + vec3<u32>(1u, 1u, 0u);
    let i3 = global_id + vec3<u32>(0u, 1u, 0u);
    let i4 = global_id + vec3<u32>(0u, 0u, 1u);
    let i5 = global_id + vec3<u32>(1u, 0u, 1u);
    let i6 = global_id + vec3<u32>(1u, 1u, 1u);
    let i7 = global_id + vec3<u32>(0u, 1u, 1u);

    let v0 = valueAt(i0);
    let v1 = valueAt(i1);
    let v2 = valueAt(i2);
    let v3 = valueAt(i3);
    let v4 = valueAt(i4);
    let v5 = valueAt(i5);
    let v6 = valueAt(i6);
    let v7 = valueAt(i7);

    var cubeIndex = 0u;
    if (v0 < volume.threshold) { cubeIndex = cubeIndex | 1u; }
    if (v1 < volume.threshold) { cubeIndex = cubeIndex | 2u; }
    if (v2 < volume.threshold) { cubeIndex = cubeIndex | 4u; }
    if (v3 < volume.threshold) { cubeIndex = cubeIndex | 8u; }
    if (v4 < volume.threshold) { cubeIndex = cubeIndex | 16u; }
    if (v5 < volume.threshold) { cubeIndex = cubeIndex | 32u; }
    if (v6 < volume.threshold) { cubeIndex = cubeIndex | 64u; }
    if (v7 < volume.threshold) { cubeIndex = cubeIndex | 128u; }

    let edges = tables.edges[cubeIndex];

    // Once we have atomics we can early-terminate here if edges == 0
    //if (edges == 0u) { return; }

    if ((edges & 1u) != 0u) { interpX(0u, i0, v0, v1); }
    if ((edges & 2u) != 0u) { interpY(1u, i1, v1, v2); }
    if ((edges & 4u) != 0u) { interpX(2u, i3, v3, v2); }
    if ((edges & 8u) != 0u) { interpY(3u, i0, v0, v3); }
    if ((edges & 16u) != 0u) { interpX(4u, i4, v4, v5); }
    if ((edges & 32u) != 0u) { interpY(5u, i5, v5, v6); }
    if ((edges & 64u) != 0u) { interpX(6u, i7, v7, v6); }
    if ((edges & 128u) != 0u) { interpY(7u, i4, v4, v7); }
    if ((edges & 256u) != 0u) { interpZ(8u, i0, v0, v4); }
    if ((edges & 512u) != 0u) { interpZ(9u, i1, v1, v5); }
    if ((edges & 1024u) != 0u) { interpZ(10u, i2, v2, v6); }
    if ((edges & 2048u) != 0u) { interpZ(11u, i3, v3, v7); }

    let triTableOffset = (cubeIndex << 4u) + 1u;
    let indexCount = u32(tables.tris[triTableOffset - 1u]);

    // In an ideal world this offset is tracked as an atomic.
    var firstVertex = atomicAdd(&drawOut.vertexCount, cubeVerts);

    // Instead we have to pad the vertex/index buffers with the maximum possible number of values
    // and create degenerate triangles to fill the empty space, which is a waste of GPU cycles.
    let bufferOffset = (global_id.x +
                        global_id.y * volume.size.x +
                        global_id.z * volume.size.x * volume.size.y);
    let firstIndex = bufferOffset * 15u;
    //firstVertex = bufferOffset*12u;

    // Copy positions to output buffer
    for (var i = 0u; i < cubeVerts; i = i + 1u) {
      positionsOut.values[firstVertex*3u + i*3u] = positions[i].x;
      positionsOut.values[firstVertex*3u + i*3u + 1u] = positions[i].y;
      positionsOut.values[firstVertex*3u + i*3u + 2u] = positions[i].z;

      normalsOut.values[firstVertex*3u + i*3u] = normals[i].x;
      normalsOut.values[firstVertex*3u + i*3u + 1u] = normals[i].y;
      normalsOut.values[firstVertex*3u + i*3u + 2u] = normals[i].z;
    }

    // Write out the indices
    for (var i = 0u; i < indexCount; i = i + 1u) {
      let index = tables.tris[triTableOffset + i];
      indicesOut.tris[firstIndex + i] = firstVertex + indices[index];
    }

    // Write out degenerate triangles whenever we don't have a real index in order to keep our
    // stride constant. Again, this can go away once we have atomics.
    for (var i = indexCount; i < 15u; i = i + 1u) {
      indicesOut.tris[firstIndex + i] = firstVertex;
    }
  }
`,pt=`
    ${M}
    ${_}

		@group(0) @binding(0) var<uniform> projection : ProjectionUniformsStruct;
		@group(0) @binding(1) var<uniform> view : ViewUniformsStruct;

    struct Inputs {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>,
    }
    
    struct Output {
      @location(0) normal: vec3<f32>,
      @builtin(position) position: vec4<f32>,
    }

    @vertex
    fn main(input: Inputs) -> Output {
      var output: Output;
      output.position = projection.matrix *
                        view.matrix *
                        vec4(input.position, 1.0);

      output.normal = input.normal;
      return output;
    }
`,gt=`
    ${oe}

    struct Uniforms {
      color: vec3<f32>,
      roughness: f32,
      metallic: f32,
    }

    @group(1) @binding(0) var<uniform> ubo: Uniforms;

    struct Inputs {
      @location(0) normal: vec3<f32>,
    }
		
    @fragment
    fn main(input: Inputs) -> Output {
			let normal = normalize(input.normal);
      let albedo = ubo.color;
      let metallic = ubo.metallic;
      let roughness = ubo.roughness;
			let ID = 0.0;
			return encodeGBufferOutput(
        normal,
        albedo,
        metallic,
        roughness,
        ID
      );
    }
`,mt=`
    ${M}
    ${_}

		@group(0) @binding(1) var<uniform> projection: ProjectionUniformsStruct;
		@group(0) @binding(2) var<uniform> view: ViewUniformsStruct;

    struct Inputs {
      @location(0) position: vec3<f32>,
    }
    
    struct Output {
      @builtin(position) position: vec4<f32>,
    }

    @vertex
    fn main(input: Inputs) -> Output {
      var output: Output;
      output.position = projection.matrix *
                        view.matrix *
                        vec4(input.position, 1.0);

      return output;
    }
`;class bt{constructor(e,i){t(this,"ballPositions",[]);t(this,"tablesBuffer");t(this,"metaballBuffer");t(this,"volumeBuffer");t(this,"indirectRenderBuffer");t(this,"computeMetaballsPipeline");t(this,"computeMarchingCubesPipeline");t(this,"computeMetaballsBindGroup");t(this,"computeMarchingCubesBindGroup");t(this,"indirectRenderArray");t(this,"metaballArray");t(this,"metaballArrayHeader");t(this,"metaballArrayBalls");t(this,"vertexBuffer");t(this,"normalBuffer");t(this,"indexBuffer");t(this,"indexCount");t(this,"strength",1);t(this,"strengthTarget",this.strength);t(this,"subtract",1);t(this,"subtractTarget",this.subtract);this.renderer=e,this.volume=i,this.volume=i,this.tablesBuffer=this.renderer.device.createBuffer({size:(J.length+ne.length)*Int32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE,mappedAtCreation:!0,label:"metaballs table buffer"});const o=new Int32Array(this.tablesBuffer.getMappedRange());o.set(J),o.set(ne,J.length),this.tablesBuffer.unmap();const a=Uint32Array.BYTES_PER_ELEMENT*4+Float32Array.BYTES_PER_ELEMENT*8*H;this.metaballArray=new ArrayBuffer(a),this.metaballArrayHeader=new Uint32Array(this.metaballArray,0,4),this.metaballArrayBalls=new Float32Array(this.metaballArray,16),this.metaballBuffer=this.renderer.device.createBuffer({size:a,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,label:"metaballs buffer"});const r=i.width*i.height*i.depth,l=Float32Array.BYTES_PER_ELEMENT*12+Uint32Array.BYTES_PER_ELEMENT*4+Float32Array.BYTES_PER_ELEMENT*r;this.volumeBuffer=this.renderer.device.createBuffer({size:l,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,mappedAtCreation:!0,label:"metaballs volume buffer"});const n=this.volumeBuffer.getMappedRange(),u=new Float32Array(n),d=new Uint32Array(n,48,3);u[0]=i.xMin,u[1]=i.yMin,u[2]=i.zMin,u[8]=i.xStep,u[9]=i.yStep,u[10]=i.zStep,d[0]=i.width,d[1]=i.height,d[2]=i.depth,u[15]=i.isoLevel,this.volumeBuffer.unmap();const f=(i.width-1)*(i.height-1)*(i.depth-1),h=Float32Array.BYTES_PER_ELEMENT*3*12*f,g=Uint32Array.BYTES_PER_ELEMENT*15*f;this.vertexBuffer=this.renderer.device.createBuffer({size:h,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.VERTEX,label:"metaballs vertex buffer"}),this.normalBuffer=this.renderer.device.createBuffer({size:h,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.VERTEX,label:"metaballs normal buffer"}),this.indexBuffer=this.renderer.device.createBuffer({size:g,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.INDEX,label:"metaballs index buffer"}),this.indexCount=g/Uint32Array.BYTES_PER_ELEMENT,this.indirectRenderArray=new Uint32Array(9),this.indirectRenderArray[0]=500,this.indirectRenderBuffer=this.renderer.device.createBuffer({size:this.indirectRenderArray.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.INDIRECT|GPUBufferUsage.COPY_DST,label:"metaballs indirect draw buffer"}),this.ballPositions=new Array(H).fill(null).map(m=>({x:(Math.random()*2-1)*i.xMin,y:(Math.random()*2-1)*i.yMin,z:(Math.random()*2-1)*i.zMin,vx:Math.random()*1e3,vy:(Math.random()*2-1)*10,vz:Math.random()*1e3,speed:Math.random()*2+.3})),this.init()}get isReady(){return!!this.computeMarchingCubesPipeline&&!!this.computeMetaballsPipeline}async init(){this.computeMetaballsPipeline=await this.renderer.device.createComputePipelineAsync({layout:"auto",compute:{module:this.renderer.device.createShaderModule({code:ft,label:"metaballs isosurface compute shader"}),entryPoint:"main"}}),this.computeMetaballsBindGroup=this.renderer.device.createBindGroup({layout:this.computeMetaballsPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.metaballBuffer}},{binding:1,resource:{buffer:this.volumeBuffer}}]}),this.computeMarchingCubesPipeline=await this.renderer.device.createComputePipelineAsync({layout:"auto",compute:{module:this.renderer.device.createShaderModule({label:"marching cubes computer shader",code:ht}),entryPoint:"main"}}),this.computeMarchingCubesBindGroup=this.renderer.device.createBindGroup({layout:this.computeMarchingCubesPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.tablesBuffer}},{binding:1,resource:{buffer:this.volumeBuffer}},{binding:2,resource:{buffer:this.vertexBuffer}},{binding:3,resource:{buffer:this.normalBuffer}},{binding:4,resource:{buffer:this.indexBuffer}},{binding:5,resource:{buffer:this.indirectRenderBuffer}}]})}rearrange(){this.subtractTarget=3+Math.random()*3,this.strengthTarget=3+Math.random()*3}updateSim(e,i,o){if(!this.isReady)return this;this.subtract+=(this.subtractTarget-this.subtract)*o*4,this.strength+=(this.strengthTarget-this.strength)*o*4;const a=H;this.metaballArrayHeader[0]=H;for(let l=0;l<H;l++){const n=this.ballPositions[l];n.vx+=-n.x*n.speed*20,n.vy+=-n.y*n.speed*20,n.vz+=-n.z*n.speed*20,n.x+=n.vx*n.speed*o*1e-4,n.y+=n.vy*n.speed*o*1e-4,n.z+=n.vz*n.speed*o*1e-4;const u=.9,d=Math.abs(this.volume.xMin)-u,f=Math.abs(this.volume.yMin)-u,h=Math.abs(this.volume.zMin)-u;n.x>d?(n.x=d,n.vx*=-1):n.x<-d&&(n.x=-d,n.vx*=-1),n.y>f?(n.y=f,n.vy*=-1):n.y<-f&&(n.y=-f,n.vy*=-1),n.z>h?(n.z=h,n.vz*=-1):n.z<-h&&(n.z=-h,n.vz*=-1)}for(let l=0;l<a;l++){const n=this.ballPositions[l],u=l*8;this.metaballArrayBalls[u]=n.x,this.metaballArrayBalls[u+1]=n.y,this.metaballArrayBalls[u+2]=n.z,this.metaballArrayBalls[u+3]=Math.sqrt(this.strength/this.subtract),this.metaballArrayBalls[u+4]=this.strength,this.metaballArrayBalls[u+5]=this.subtract}this.renderer.device.queue.writeBuffer(this.metaballBuffer,0,this.metaballArray),this.renderer.device.queue.writeBuffer(this.indirectRenderBuffer,0,this.indirectRenderArray);const r=[this.volume.width/P[0],this.volume.height/P[1],this.volume.depth/P[2]];return this.computeMetaballsPipeline&&(e.setPipeline(this.computeMetaballsPipeline),e.setBindGroup(0,this.computeMetaballsBindGroup),e.dispatchWorkgroups(...r)),this.computeMarchingCubesPipeline&&(e.setPipeline(this.computeMarchingCubesPipeline),e.setBindGroup(0,this.computeMarchingCubesBindGroup),e.dispatchWorkgroups(...r)),this}}class vt{constructor(e,i,o){t(this,"metaballsCompute");t(this,"renderPipeline");t(this,"renderShadowPipeline");t(this,"ubo");t(this,"bindGroupLayout");t(this,"bindGroup");t(this,"colorRGB",new Float32Array([1,1,1]));t(this,"colorTargetRGB",new Float32Array([...this.colorRGB]));t(this,"roughness",.3);t(this,"roughnessTarget",this.roughness);t(this,"metallic",.1);t(this,"metallicTarget",this.metallic);this.renderer=e,this.spotLight=o,this.metaballsCompute=new bt(e,i),this.ubo=this.renderer.device.createBuffer({label:"metaballs ubo",mappedAtCreation:!0,size:5*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),new Float32Array(this.ubo.getMappedRange()).set(new Float32Array([1,1,1,.3,.1])),this.ubo.unmap(),this.bindGroupLayout=this.renderer.device.createBindGroupLayout({label:"metaballs bind group layout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{}}]}),this.bindGroup=this.renderer.device.createBindGroup({label:"metaballs bind group",layout:this.bindGroupLayout,entries:[{binding:0,resource:{buffer:this.ubo}}]}),this.init()}get isReady(){return this.metaballsCompute.isReady&&!!this.renderPipeline&&!!this.renderShadowPipeline}async init(){this.renderPipeline=await this.renderer.device.createRenderPipelineAsync({label:"metaball rendering pipeline",layout:this.renderer.device.createPipelineLayout({label:"metaball rendering pipeline layout",bindGroupLayouts:[this.renderer.bindGroupsLayouts.frame,this.bindGroupLayout]}),vertex:{entryPoint:"main",buffers:[{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x3",offset:0}]},{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:1,format:"float32x3",offset:0}]}],module:this.renderer.device.createShaderModule({code:pt})},fragment:{entryPoint:"main",module:this.renderer.device.createShaderModule({code:gt}),targets:[{format:"rgba16float"},{format:"bgra8unorm"}]},depthStencil:{format:k,depthWriteEnabled:!0,depthCompare:"less"},primitive:{topology:"triangle-list",cullMode:"none"},multisample:{count:1}}),this.renderShadowPipeline=await this.renderer.device.createRenderPipelineAsync({label:"metaballs shadow rendering pipeline",layout:this.renderer.device.createPipelineLayout({label:"metaballs shadow rendering pipeline layout",bindGroupLayouts:[this.spotLight.bindGroupLayout.ubos]}),vertex:{entryPoint:"main",buffers:[{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x3",offset:0}]}],module:this.renderer.device.createShaderModule({code:mt})},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth32float"},primitive:{topology:"triangle-list",cullMode:"none"},multisample:{count:1}})}rearrange(){this.colorTargetRGB[0]=Math.random(),this.colorTargetRGB[1]=Math.random(),this.colorTargetRGB[2]=Math.random(),this.metallicTarget=.08+Math.random()*.92,this.roughnessTarget=.08+Math.random()*.92,this.metaballsCompute.rearrange()}updateSim(e,i,o){const a=o*2;this.colorRGB[0]+=(this.colorTargetRGB[0]-this.colorRGB[0])*a,this.colorRGB[1]+=(this.colorTargetRGB[1]-this.colorRGB[1])*a,this.colorRGB[2]+=(this.colorTargetRGB[2]-this.colorRGB[2])*a;const r=o*3;return this.metallic+=(this.metallicTarget-this.metallic)*r,this.roughness+=(this.roughnessTarget-this.roughness)*r,this.renderer.device.queue.writeBuffer(this.ubo,0*Float32Array.BYTES_PER_ELEMENT,this.colorRGB),this.renderer.device.queue.writeBuffer(this.ubo,3*Float32Array.BYTES_PER_ELEMENT,new Float32Array([this.roughness])),this.renderer.device.queue.writeBuffer(this.ubo,4*Float32Array.BYTES_PER_ELEMENT,new Float32Array([this.metallic])),this.metaballsCompute.updateSim(e,i,o),this}renderShadow(e){return this.isReady?(e.setPipeline(this.renderShadowPipeline),e.setBindGroup(0,this.spotLight.bindGroup.ubos),e.setVertexBuffer(0,this.metaballsCompute.vertexBuffer),e.setIndexBuffer(this.metaballsCompute.indexBuffer,"uint32"),e.drawIndexed(this.metaballsCompute.indexCount),this):this}render(e){return this.isReady?(e.setPipeline(this.renderPipeline),e.setBindGroup(0,this.renderer.bindGroups.frame),e.setBindGroup(1,this.bindGroup),e.setVertexBuffer(0,this.metaballsCompute.vertexBuffer),e.setVertexBuffer(1,this.metaballsCompute.normalBuffer),e.setIndexBuffer(this.metaballsCompute.indexBuffer,"uint32"),e.drawIndexed(this.metaballsCompute.indexCount),this):this}}const Et=`
	${M}
	${_}

	@group(0) @binding(0) var<uniform> projection : ProjectionUniformsStruct;
  @group(0) @binding(1) var<uniform> view : ViewUniformsStruct;

	struct Inputs {
		@location(0) position: vec3<f32>,
		@location(1) instanceMat0: vec4<f32>,
		@location(2) instanceMat1: vec4<f32>,
		@location(3) instanceMat2: vec4<f32>,
		@location(4) instanceMat3: vec4<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
		@location(0) localPosition: vec3<f32>,
	}

	@vertex
	fn main(input: Inputs) -> Output {
		var output: Output;

		let instanceMatrix = mat4x4(
			input.instanceMat0,
			input.instanceMat1,
			input.instanceMat2,
			input.instanceMat3,
		);

		let worldPosition = vec4<f32>(input.position, 1.0);
		output.position = projection.matrix *
											view.matrix *
											instanceMatrix *
											worldPosition;

		output.localPosition = input.position;
		return output;
	}
`,yt=`
	${M}
	${_}
	${oe}
	
	struct Input {
		@location(0) localPosition: vec3<f32>,
	}
	@group(0) @binding(0) var<uniform> projection : ProjectionUniformsStruct;
	@group(0) @binding(1) var<uniform> view : ViewUniformsStruct;

	@fragment
	fn main(input: Input) -> Output {
		var output: Output;
		let spacing = step(sin(input.localPosition.x * 10.0 + view.time * 2.0), 0.1);
		if (spacing < 0.5) {
			discard;
		}
		let normal = vec3(0.0);
		let albedo = vec3(1.0);
		let metallic = 0.0;
		let roughness = 0.0;
		let ID = 0.1;
		return encodeGBufferOutput(
			normal,
			albedo,
			metallic,
			roughness,
			ID
		);
	}
`,p=class{constructor(e){t(this,"vertexBuffer");t(this,"indexBuffer");t(this,"instanceBuffer");t(this,"renderPipeline");this.renderer=e;const i=new Float32Array([-p.RADIUS,0,0,p.RADIUS,0,0]),o=new Uint16Array([...new Array(16).fill(0).map((l,n)=>n)]);this.vertexBuffer=e.device.createBuffer({size:i.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,label:"box outline vertex buffer",mappedAtCreation:!0}),new Float32Array(this.vertexBuffer.getMappedRange()).set(i),this.vertexBuffer.unmap(),this.indexBuffer=e.device.createBuffer({size:o.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,label:"box outline index buffer",mappedAtCreation:!0}),new Uint16Array(this.indexBuffer.getMappedRange()).set(o),this.indexBuffer.unmap();const a=new Float32Array(p.SIDE_COUNT*16),r=O();x(r,r,c(0,p.RADIUS,p.RADIUS)),y(r,r,Math.PI/2,c(0,0,0)),a.set(r,0*16),S(r),x(r,r,c(p.RADIUS,p.RADIUS,0)),y(r,r,Math.PI/2,c(0,1,0)),a.set(r,1*16),S(r),x(r,r,c(-p.RADIUS,p.RADIUS,0)),y(r,r,Math.PI/2,c(0,-1,0)),a.set(r,2*16),S(r),x(r,r,c(0,p.RADIUS,-p.RADIUS)),y(r,r,Math.PI,c(0,1,0)),a.set(r,3*16),S(r),x(r,r,c(0,-p.RADIUS,p.RADIUS)),y(r,r,Math.PI/2,c(0,0,0)),a.set(r,4*16),S(r),x(r,r,c(p.RADIUS,-p.RADIUS,0)),y(r,r,Math.PI/2,c(0,1,0)),a.set(r,5*16),S(r),x(r,r,c(-p.RADIUS,-p.RADIUS,0)),y(r,r,Math.PI/2,c(0,-1,0)),a.set(r,6*16),S(r),x(r,r,c(0,-p.RADIUS,-p.RADIUS)),y(r,r,Math.PI,c(0,1,0)),a.set(r,7*16),S(r),x(r,r,c(p.RADIUS,0,p.RADIUS)),y(r,r,Math.PI,c(0,1,0)),y(r,r,Math.PI/2,c(0,0,1)),a.set(r,9*16),S(r),x(r,r,c(-p.RADIUS,0,p.RADIUS)),y(r,r,Math.PI,c(0,1,0)),y(r,r,Math.PI/2,c(0,0,1)),a.set(r,10*16),S(r),x(r,r,c(-p.RADIUS,0,-p.RADIUS)),y(r,r,Math.PI,c(0,1,0)),y(r,r,Math.PI/2,c(0,0,1)),a.set(r,11*16),S(r),x(r,r,c(p.RADIUS,0,-p.RADIUS)),y(r,r,Math.PI,c(0,1,0)),y(r,r,Math.PI/2,c(0,0,1)),a.set(r,12*16),this.instanceBuffer=e.device.createBuffer({size:a.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,label:"box outline instance matrices buffer",mappedAtCreation:!0}),new Float32Array(this.instanceBuffer.getMappedRange()).set(a),this.instanceBuffer.unmap(),this.init()}async init(){this.renderPipeline=await this.renderer.device.createRenderPipelineAsync({label:"box outline render pipeline",layout:this.renderer.device.createPipelineLayout({label:"box outline render pipeline layout",bindGroupLayouts:[this.renderer.bindGroupsLayouts.frame]}),primitive:{topology:"line-strip",stripIndexFormat:"uint16"},depthStencil:{format:k,depthWriteEnabled:!0,depthCompare:"less"},vertex:{entryPoint:"main",buffers:[{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x3",offset:0}]},{arrayStride:16*Float32Array.BYTES_PER_ELEMENT,stepMode:"instance",attributes:[{shaderLocation:1,format:"float32x4",offset:0*Float32Array.BYTES_PER_ELEMENT},{shaderLocation:2,format:"float32x4",offset:4*Float32Array.BYTES_PER_ELEMENT},{shaderLocation:3,format:"float32x4",offset:8*Float32Array.BYTES_PER_ELEMENT},{shaderLocation:4,format:"float32x4",offset:12*Float32Array.BYTES_PER_ELEMENT}]}],module:this.renderer.device.createShaderModule({code:Et})},fragment:{entryPoint:"main",module:this.renderer.device.createShaderModule({code:yt}),targets:[{format:"rgba16float"},{format:"bgra8unorm"}]}})}render(e){!this.renderPipeline||(e.setPipeline(this.renderPipeline),e.setBindGroup(0,this.renderer.bindGroups.frame),e.setVertexBuffer(0,this.vertexBuffer),e.setVertexBuffer(1,this.instanceBuffer),e.setIndexBuffer(this.indexBuffer,"uint16"),e.drawIndexed(2,p.SIDE_COUNT))}};let Q=p;t(Q,"RADIUS",2.5),t(Q,"SIDE_COUNT",13);const xt=({dimensions:s=[1,1,1]}={})=>{let e=[-s[0]/2,-s[1]/2,-s[2]/2],i=e[0],o=e[1],a=e[2],r=s[0],l=s[1],n=s[2],u={x:i,y:o,z:a+n},d={x:i+r,y:o,z:a+n},f={x:i,y:o+l,z:a+n},h={x:i+r,y:o+l,z:a+n},g={x:i,y:o,z:a},m={x:i+r,y:o,z:a},b={x:i,y:o+l,z:a},E={x:i+r,y:o+l,z:a},D=new Float32Array([u.x,u.y,u.z,d.x,d.y,d.z,f.x,f.y,f.z,f.x,f.y,f.z,d.x,d.y,d.z,h.x,h.y,h.z,d.x,d.y,d.z,m.x,m.y,m.z,h.x,h.y,h.z,h.x,h.y,h.z,m.x,m.y,m.z,E.x,E.y,E.z,d.x,m.y,m.z,g.x,g.y,g.z,E.x,E.y,E.z,E.x,E.y,E.z,g.x,g.y,g.z,b.x,b.y,b.z,g.x,g.y,g.z,u.x,u.y,u.z,b.x,b.y,b.z,b.x,b.y,b.z,u.x,u.y,u.z,f.x,f.y,f.z,f.x,f.y,f.z,h.x,h.y,h.z,b.x,b.y,b.z,b.x,b.y,b.z,h.x,h.y,h.z,E.x,E.y,E.z,g.x,g.y,g.z,m.x,m.y,m.z,u.x,u.y,u.z,u.x,u.y,u.z,m.x,m.y,m.z,d.x,d.y,d.z]),w=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1]),R=new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0]);return{positions:D,normals:R,uvs:w}},Bt=`
	${M}
	${_}

	struct ModelUniforms {
		matrix: mat4x4<f32>,
	}

	@group(0) @binding(0) var<uniform> projection: ProjectionUniformsStruct;
	@group(0) @binding(1) var<uniform> view: ViewUniformsStruct;
	@group(1) @binding(0) var<uniform> model: ModelUniforms;

	struct Inputs {
		@location(0) position: vec3<f32>,
		@location(1) normal: vec3<f32>,
		@location(2) instanceOffset: vec3<f32>,
		@location(3) metallic: f32,
		@location(4) roughness: f32,
	}

	struct Output {
		@location(0) normal: vec3<f32>,
		@location(1) metallic: f32,
		@location(2) roughness: f32,
		@builtin(position) position: vec4<f32>,
	}

	@vertex
	fn main(input: Inputs) -> Output {
		var output: Output;
		let dist = distance(input.instanceOffset.xy, vec2(0.0));
		let offsetX = input.instanceOffset.x;
		let offsetZ = input.instanceOffset.y;
		let scaleY = input.instanceOffset.z;
		let offsetPos = vec3(offsetX, abs(dist) * 0.06 + scaleY * 0.01, offsetZ);
		let scaleMatrix = mat4x4(
			1.0, 0.0, 0.0, 0.0,
			0.0, scaleY, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
		let worldPosition = model.matrix * scaleMatrix * vec4(input.position + offsetPos, 1.0);
		output.position = projection.matrix *
											view.matrix *
											worldPosition;

		output.normal = input.normal;
		output.metallic = input.metallic;
		output.roughness = input.roughness;
		return output;
	}
`,Tt=`
	${oe}

	struct Inputs {
		@location(0) normal: vec3<f32>,
		@location(1) metallic: f32,
		@location(2) roughness: f32,
	}
	
	@fragment
	fn main(input: Inputs) -> Output {
		let normal = normalize(input.normal);
		let albedo = vec3(1.0);
		let metallic = 1.0;
		let roughness = input.roughness;
		let ID = 0.0;

		

		return encodeGBufferOutput(
			normal,
			albedo,
			metallic,
			roughness,
			ID
		);
	}
`,St=`
	${M}
	${_}

	struct ModelUniforms {
		matrix: mat4x4<f32>,
	}

	@group(0) @binding(1) var<uniform> projection: ProjectionUniformsStruct;
	@group(0) @binding(2) var<uniform> view: ViewUniformsStruct;
	@group(1) @binding(0) var<uniform> model: ModelUniforms;

	struct Inputs {
		@location(0) position: vec3<f32>,
		@location(1) instanceOffset: vec3<f32>,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
	}

	@vertex
	fn main(input: Inputs) -> Output {
		var output: Output;
		let dist = distance(input.instanceOffset.xy, vec2(0.0));
		let offsetX = input.instanceOffset.x;
		let offsetZ = input.instanceOffset.y;
		let scaleY = input.instanceOffset.z;
		let offsetPos = vec3(offsetX, abs(dist) * 0.06 + scaleY * 0.01, offsetZ);
		let scaleMatrix = mat4x4(
			1.0, 0.0, 0.0, 0.0,
			0.0, scaleY, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
		let worldPosition = model.matrix * scaleMatrix * vec4(input.position + offsetPos, 1.0);
		output.position = projection.matrix *
											view.matrix *
											worldPosition;

		return output;
	}
`,v=class{constructor(e,i){t(this,"renderPipeline");t(this,"renderShadowPipeline");t(this,"modelBindGroupLayout");t(this,"modelBindGroup");t(this,"vertexBuffer");t(this,"normalBuffer");t(this,"instanceOffsetsBuffer");t(this,"instanceMaterialBuffer");t(this,"uniformBuffer");t(this,"instanceCount",0);t(this,"modelMatrix",O());this.renderer=e,this.spotLight=i;const{positions:o,normals:a}=xt();this.vertexBuffer=e.device.createBuffer({size:o.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,label:"ground vertex buffer",mappedAtCreation:!0}),new Float32Array(this.vertexBuffer.getMappedRange()).set(o),this.vertexBuffer.unmap(),this.normalBuffer=e.device.createBuffer({size:a.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,label:"ground normal buffer",mappedAtCreation:!0}),new Float32Array(this.normalBuffer.getMappedRange()).set(a),this.normalBuffer.unmap();const r=new Float32Array(v.WIDTH*v.HEIGHT*3),l=new Float32Array(v.WIDTH*v.HEIGHT*2),n=v.WIDTH/v.COUNT+v.SPACING,u=v.HEIGHT/v.COUNT+v.SPACING;for(let d=0,f=0;d<v.COUNT;d++)for(let h=0;h<v.COUNT;h++){const g=d*n,m=h*u;r[f*3+0]=g-v.WIDTH/2,r[f*3+1]=m-v.HEIGHT/2,r[f*3+2]=Math.random()*3+1,l[f*2+0]=1,l[f*2+1]=.5,f++}this.instanceCount=r.length/3,this.instanceOffsetsBuffer=e.device.createBuffer({size:r.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,label:"ground instance xyz buffer",mappedAtCreation:!0}),new Float32Array(this.instanceOffsetsBuffer.getMappedRange()).set(r),this.instanceOffsetsBuffer.unmap(),this.instanceMaterialBuffer=e.device.createBuffer({size:l.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,label:"ground instance material buffer",mappedAtCreation:!0}),new Float32Array(this.instanceMaterialBuffer.getMappedRange()).set(l),this.instanceMaterialBuffer.unmap(),x(this.modelMatrix,this.modelMatrix,[0,v.WORLD_Y,0]),this.uniformBuffer=e.device.createBuffer({size:16*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,label:"ground uniform buffer",mappedAtCreation:!0}),new Float32Array(this.uniformBuffer.getMappedRange()).set(this.modelMatrix),this.uniformBuffer.unmap(),this.modelBindGroupLayout=e.device.createBindGroupLayout({label:"ground bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{}}]}),this.modelBindGroup=e.device.createBindGroup({label:"ground bind group",layout:this.modelBindGroupLayout,entries:[{binding:0,resource:{buffer:this.uniformBuffer}}]}),this.init()}async init(){this.renderPipeline=await this.renderer.device.createRenderPipelineAsync({label:"ground render pipeline",layout:this.renderer.device.createPipelineLayout({label:"ground render pipeline layout",bindGroupLayouts:[this.renderer.bindGroupsLayouts.frame,this.modelBindGroupLayout]}),primitive:{topology:"triangle-list"},depthStencil:{format:k,depthWriteEnabled:!0,depthCompare:"less"},vertex:{entryPoint:"main",buffers:[{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x3",offset:0*Float32Array.BYTES_PER_ELEMENT}]},{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:1,format:"float32x3",offset:0*Float32Array.BYTES_PER_ELEMENT}]},{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,stepMode:"instance",attributes:[{shaderLocation:2,format:"float32x3",offset:0}]},{arrayStride:2*Float32Array.BYTES_PER_ELEMENT,stepMode:"instance",attributes:[{shaderLocation:3,format:"float32",offset:0*Float32Array.BYTES_PER_ELEMENT},{shaderLocation:4,format:"float32",offset:1*Float32Array.BYTES_PER_ELEMENT}]}],module:this.renderer.device.createShaderModule({code:Bt})},fragment:{entryPoint:"main",module:this.renderer.device.createShaderModule({code:Tt}),targets:[{format:"rgba16float"},{format:"bgra8unorm"}]}}),this.renderShadowPipeline=await this.renderer.device.createRenderPipelineAsync({label:"ground shadow rendering pipeline",layout:this.renderer.device.createPipelineLayout({label:"ground shadow rendering pipeline layout",bindGroupLayouts:[this.spotLight.bindGroupLayout.ubos,this.modelBindGroupLayout]}),vertex:{entryPoint:"main",buffers:[{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x3",offset:0}]},{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,stepMode:"instance",attributes:[{shaderLocation:1,format:"float32x3",offset:0}]}],module:this.renderer.device.createShaderModule({code:St})},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth32float"},primitive:{topology:"triangle-list"},multisample:{count:1}})}renderShadow(e){return this.renderShadowPipeline?(e.setPipeline(this.renderShadowPipeline),e.setBindGroup(0,this.spotLight.bindGroup.ubos),e.setBindGroup(1,this.modelBindGroup),e.setVertexBuffer(0,this.vertexBuffer),e.setVertexBuffer(1,this.instanceOffsetsBuffer),e.draw(36,this.instanceCount),this):this}render(e){!this.renderPipeline||(e.setPipeline(this.renderPipeline),e.setBindGroup(0,this.renderer.bindGroups.frame),e.setBindGroup(1,this.modelBindGroup),e.setVertexBuffer(0,this.vertexBuffer),e.setVertexBuffer(1,this.normalBuffer),e.setVertexBuffer(2,this.instanceOffsetsBuffer),e.setVertexBuffer(3,this.instanceMaterialBuffer),e.draw(36,this.instanceCount))}};let G=v;t(G,"WORLD_Y",-7.5),t(G,"WIDTH",100),t(G,"HEIGHT",100),t(G,"COUNT",100),t(G,"SPACING",0);const Pt=`
	${M}
	${_}
	${re}

	@group(0) @binding(0) var<uniform> projection: ProjectionUniformsStruct;
  @group(0) @binding(1) var<uniform> view: ViewUniformsStruct;

	@group(1) @binding(0) var<storage, read> lightsBuffer: LightsBuffer;

	struct Inputs {
		@builtin(vertex_index) vertexIndex: u32,
		@builtin(instance_index) instanceIndex: u32,
	}

	struct Output {
		@builtin(position) position: vec4<f32>,
		@location(0) color: vec3<f32>,
		@location(1) uv: vec2<f32>,
	}

	var<private> normalisedPosition: array<vec2<f32>, 4> = array<vec2<f32>, 4>(
		vec2<f32>(-1.0, -1.0),
		vec2<f32>(1.0, -1.0),
		vec2<f32>(-1.0, 1.0),
		vec2<f32>(1.0, 1.0)
	);

	@vertex
	fn main(input: Inputs) -> Output {
		var output: Output;

		let inputPosition = normalisedPosition[input.vertexIndex];

		let sc = clamp(lightsBuffer.lights[input.instanceIndex].intensity * 0.01, 0.01, 0.1);
		let scaleMatrix = mat4x4(
			sc,  0.0, 0.0, 0.0,
			0.0, sc,  0.0, 0.0,
			0.0, 0.0, sc,  0.0,
			0.0, 0.0, 0.0, 1.0,
		);

		let instancePosition = lightsBuffer.lights[input.instanceIndex].position;
		var worldPosition = vec4(instancePosition.xyz, 0.0);

		var viewMatrix = view.matrix;
		
		output.position = projection.matrix *
											(
												viewMatrix *
												(worldPosition +
												vec4(0.0, 0.0, 0.0, 1.0)) +
												scaleMatrix * vec4(inputPosition, 0.0, 0.0)
											);

		// gl_Position = gl_ProjectionMatrix 
		// * (gl_ModelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) 
		// + vec4(gl_Vertex.x, gl_Vertex.y, 0.0, 0.0));


		let instanceColor = lightsBuffer.lights[input.instanceIndex].color;
		output.color = instanceColor;
		output.uv = inputPosition * vec2(0.5, -0.5) + vec2(0.5);
		return output;
	}
`,_t=`
	struct Input {
		@location(0) color: vec3<f32>,
		@location(1) uv: vec2<f32>,
	}

	struct Output {
		@location(0) normal: vec4<f32>,	
		@location(1) albedo: vec4<f32>,	
	}

	@fragment
	fn main(input: Input) -> Output {
		let dist = distance(input.uv, vec2(0.5), );
		if (dist > 0.5) {
			discard;
		}
		var output: Output;
		output.normal = vec4(0.0, 0.0, 0.0, 0.1);
		output.albedo = vec4(input.color, 1.0);
		return output;
	}
`;class Lt{constructor(e,i){t(this,"renderPipeline");t(this,"bindGroupLayout");t(this,"bindGroup");this.renderer=e,this.lightsBuffer=i,this.bindGroupLayout=e.device.createBindGroupLayout({label:"particles bind group layout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}}]}),this.bindGroup=e.device.createBindGroup({label:"particles bind group",layout:this.bindGroupLayout,entries:[{binding:0,resource:{buffer:this.lightsBuffer}}]}),this.init()}async init(){this.renderPipeline=await this.renderer.device.createRenderPipelineAsync({label:"particles render pipeline",layout:this.renderer.device.createPipelineLayout({label:"particles render pipeline layout",bindGroupLayouts:[this.renderer.bindGroupsLayouts.frame,this.bindGroupLayout]}),primitive:{topology:"triangle-strip",stripIndexFormat:"uint16"},depthStencil:{format:k,depthWriteEnabled:!0,depthCompare:"less"},vertex:{entryPoint:"main",module:this.renderer.device.createShaderModule({code:Pt})},fragment:{entryPoint:"main",module:this.renderer.device.createShaderModule({code:_t}),targets:[{format:"rgba16float"},{format:"bgra8unorm"}]}})}render(e){!this.renderPipeline||(e.setPipeline(this.renderPipeline),e.setBindGroup(0,this.renderer.bindGroups.frame),e.setBindGroup(1,this.bindGroup),e.drawIndexed(6,B.qualityLevel.pointLightsCount))}}const Mt=()=>{var s=navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);return s?parseInt(s[2],10):-1};let Te=0,se;document.addEventListener("DOMContentLoaded",wt);function wt(){const s=Mt()>-1,e=!!navigator.gpu;s||Pe(),e||Pe(!0,!1);const i=new URL(window.location),o=i.searchParams.get("quality"),a=parseInt(o,10);if(a===L.LOW||a===L.MEDIUM||a===L.HIGH){const r=document.getElementById("quality-chooser");r.parentNode.removeChild(r),B.quality=a,i.searchParams.delete("quality"),window.history.pushState({},"",i),Se()}else At()}function At(){const s=document.getElementById("quality-chooser");document.getElementById("quality-buttons-wrapper").addEventListener("click",i=>{const o=i.target;if(o.nodeName==="BUTTON"){const a=o.getAttribute("data-quality"),r=parseInt(a);B.quality=r,Se(),s.parentNode.removeChild(s)}})}async function Se(){var R;const s=await((R=navigator.gpu)==null?void 0:R.requestAdapter());if(!s)return;const e=new Ce(s);e.devicePixelRatio=devicePixelRatio,e.outputSize=[innerWidth*B.qualityLevel.outputScale,innerHeight*B.qualityLevel.outputScale],document.body.appendChild(e.canvas);const i=new W(45*Math.PI/180,innerWidth/innerHeight,.1,100).setPosition({x:10,y:2,z:16}).lookAt({x:0,y:0,z:0});new De(i,e.canvas,!1,.1).lookAt([0,1,0]),await e.init(),e.device.queue.writeBuffer(e.ubos.projectionUBO,0,i.projectionMatrix),e.device.queue.writeBuffer(e.ubos.projectionUBO,16*Float32Array.BYTES_PER_ELEMENT,i.projectionInvMatrix),e.device.queue.writeBuffer(e.ubos.projectionUBO,16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT,new Float32Array(e.outputSize)),e.device.queue.writeBuffer(e.ubos.projectionUBO,16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+8*Float32Array.BYTES_PER_ELEMENT,new Float32Array([i.near])),e.device.queue.writeBuffer(e.ubos.projectionUBO,16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+8*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT,new Float32Array([i.far])),e.device.queue.writeBuffer(e.ubos.viewUBO,0*Float32Array.BYTES_PER_ELEMENT,i.viewMatrix),e.device.queue.writeBuffer(e.ubos.viewUBO,16*Float32Array.BYTES_PER_ELEMENT,i.viewInvMatrix),e.device.queue.writeBuffer(e.ubos.viewUBO,16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT,new Float32Array(i.position));const o={xMin:-3,yMin:-3,zMin:-3,width:100,height:100,depth:80,xStep:.075,yStep:.075,zStep:.075,isoLevel:20},a=new at(e),r=new lt(e),l=new C(e,r),n=new dt(e,r,l),u=new vt(e,o,a.spotLight),d=new G(e,a.spotLight),f=new Q(e),h=new Lt(e,a.pointLights.lightsBuffer),g=new Fe,m=B.qualityLevel;g.add(m,"pointLightsCount",0,K.MAX_LIGHTS_COUNT,1).listen().onChange(T=>{a.pointLights.lightsCount=T}),g.add(B,"quality",{Low:0,Medium:1,High:2}).listen().onChange(T=>{const I=new URL(window.location);I.searchParams.set("quality",T.toString()),window.location=I.href}),setInterval(b,5e3),addEventListener("focus",D),addEventListener("blur",E),se=requestAnimationFrame(w);function b(){a.rearrange(),u.rearrange()}function E(){cancelAnimationFrame(se)}function D(){se=requestAnimationFrame(w)}function w(T){T/=1e3;const I=T-Te;Te=T,requestAnimationFrame(w),e.device.queue.writeBuffer(e.ubos.viewUBO,0*Float32Array.BYTES_PER_ELEMENT,i.viewMatrix),e.device.queue.writeBuffer(e.ubos.viewUBO,16*Float32Array.BYTES_PER_ELEMENT,i.viewInvMatrix),e.device.queue.writeBuffer(e.ubos.viewUBO,16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT,new Float32Array(i.position)),e.device.queue.writeBuffer(e.ubos.viewUBO,16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+3*Float32Array.BYTES_PER_ELEMENT,new Float32Array([T])),e.device.queue.writeBuffer(e.ubos.viewUBO,16*Float32Array.BYTES_PER_ELEMENT+16*Float32Array.BYTES_PER_ELEMENT+3*Float32Array.BYTES_PER_ELEMENT+1*Float32Array.BYTES_PER_ELEMENT,new Float32Array([I])),e.onRender();const A=e.device.createCommandEncoder(),j=A.beginComputePass();u.updateSim(j,T,I),a.updateLightsSim(j,T,I),l.updateBloom(j),j.end();const te=A.beginRenderPass(V(Y({},a.spotLight.framebufferDescriptor),{label:"spot light 0 shadow map render pass"}));u.renderShadow(te),d.renderShadow(te),te.end();const z=A.beginRenderPass(V(Y({},a.framebufferDescriptor),{label:"gbuffer"}));u.render(z),f.render(z),d.render(z),h.render(z),z.end();const le=A.beginRenderPass(V(Y({},r.framebufferDescriptor),{label:"copy pass"}));a.render(le),le.end();const ce=A.beginRenderPass(V(Y({},l.framebufferDescriptor),{label:"bloom pass"}));l.render(ce),ce.end();const de=A.beginRenderPass({label:"draw default framebuffer",colorAttachments:[e.colorAttachment]});n.render(de),de.end(),e.device.queue.submit([A.finish()])}}function Pe(s=!1,e=!0){const i=document.getElementById("chrome-warning"),o=document.getElementById("non-chrome-text"),a=document.getElementById("outdated-chrome-text");if(i.style.setProperty("display","block"),!s)throw o.style.removeProperty("display"),new Error("Demo runs on up-to-date chromium browsers only!");if(!e)throw a.style.removeProperty("display"),new Error("Demo runs on up-to-date chromium browsers only!")}
