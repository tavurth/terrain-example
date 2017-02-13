
/*
// For importing into BABYLON application
let screenRes = 1.0;
 let postProcess = new BABYLON.PostProcess("Sample", "/source/Babylon/Shaders/Fog", ["screenSize", "highlightThreshold"], null, screenRes, null, BABYLON.Texture.BILINEAR_SAMPLINGMODE, group.engine, true);
 postProcess.onBind = function(mat, mesh) {
 let effect = mat.getEffect();
 effect.setFloat2("screenSize", postProcess.width, postProcess.height);
 effect.setMatrix("view", group.scene.getViewMatrix());
 console.log(group.scene.fogMode);
 effect.setFloat4("vFogInfos", group.scene.fogMode, group.scene.fogStart, group.scene.fogEnd, group.scene.fogDensity);
 effect.setColor3("vFogColor", group.scene.fogColor);
 };*/
/*
 postProcess.onApply = function (effect) {
 effect.setFloat2("screenSize", postProcess.width, postProcess.height);
 effect.setFloat("highlightThreshold", .01);
 };
 */
// group.camera.attachPostProcess(postProcess);

// group.scene.debugLayer.show(true, group.camera);


#ifdef GL_ES
precision highp float;
#endif

// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

// Parameters
uniform vec2 screenSize;
uniform float highlightThreshold;

float highlights(vec3 color)
{
 return smoothstep(highlightThreshold, 1.0, dot(color, vec3(0.3, 0.99, 0.11)));
}

void main(void)
{
 vec2 texelSize = vec2(1.0 / screenSize.x, 1.0 / screenSize.y);
 vec4 baseColor = texture2D(textureSampler, vUV + vec2(-1.0, -1.0) * texelSize) * 0.25;
 baseColor += texture2D(textureSampler, vUV + vec2(1.0, -1.0) * texelSize) * 0.25;
 baseColor += texture2D(textureSampler, vUV + vec2(1.0, 1.0) * texelSize) * 0.25;
 baseColor += texture2D(textureSampler, vUV + vec2(-1.0, 1.0) * texelSize) * 0.25;

 baseColor.a = highlights(baseColor.rgb);

 gl_FragColor = baseColor;
}
