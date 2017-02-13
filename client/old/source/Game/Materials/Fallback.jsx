"use strict";

let BABYLON = require("babylonjs");

function create(group, kwargs) {
	let fallbackMaterial = new BABYLON.StandardMaterial('fallbackMaterial', group.scene);
	fallbackMaterial.alpha = 1;
	fallbackMaterial.backFaceCulling = true;
	fallbackMaterial.specularPower = 64;
	fallbackMaterial.useSpecularOverAlpha = true;
	fallbackMaterial.useAlphaFromDiffuseTexture = true;

	// diffuse definitions;
	fallbackMaterial.diffuseColor = new BABYLON.Color3(1.00, 0.32, 0.32);

	//Fresnel Parameters ;
	let fallbackMaterial_diffuseFresnel = new BABYLON.FresnelParameters();
	fallbackMaterial_diffuseFresnel.isEnabled = true;
	fallbackMaterial_diffuseFresnel.bias = 0;
	fallbackMaterial_diffuseFresnel.power = 1;
	fallbackMaterial_diffuseFresnel.leftColor = new BABYLON.Color3(0.6784313725490196, 0.611764705882353, 0.611764705882353);
	fallbackMaterial_diffuseFresnel.rightColor = new BABYLON.Color3(0.10980392156862745, 0.0392156862745098, 0.0392156862745098);
	fallbackMaterial.diffuseFresnelParameters = fallbackMaterial_diffuseFresnel;

	// emissive definitions;
	fallbackMaterial.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);

	// ambient definitions;
	fallbackMaterial.ambientColor = new BABYLON.Color3(0.36, 0.25, 0.25);

	// specular definitions;
	fallbackMaterial.specularColor = new BABYLON.Color3(1.00, 0.00, 0.00);

	return fallbackMaterial;
}

export default {
	create
}