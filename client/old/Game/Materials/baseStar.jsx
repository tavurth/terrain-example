"use strict";

// mat_338940
let BABYLON = require("babylonjs");

function update(material, kwargs) {
	console.log("Here");
	return material;
}

function create(group, kwargs) {
	let baseStar = new BABYLON.StandardMaterial('baseStar', group.scene);
	baseStar.alpha = 0.06;
	baseStar.backFaceCulling = true;
	baseStar.specularPower = 1;
	baseStar.useSpecularOverAlpha = true;
	baseStar.useAlphaFromDiffuseTexture = false;

	// diffuse definitions

	baseStar.diffuseColor = new BABYLON.Color3(1.00, 0.96, 0.00);
	// Fresnel Parameters
	let baseStar_diffuseFresnel = new BABYLON.FresnelParameters();
	baseStar_diffuseFresnel.isEnabled = true;
	baseStar_diffuseFresnel.bias = 0.32;
	baseStar_diffuseFresnel.power = 1;
	baseStar_diffuseFresnel.leftColor = new BABYLON.Color3(1, 1, 1);
	baseStar_diffuseFresnel.rightColor = new BABYLON.Color3(0.8392156862745098, 0.803921568627451, 0);
	baseStar.diffuseFresnelParameters = baseStar_diffuseFresnel;

	// emissive definitions

	baseStar.emissiveColor = new BABYLON.Color3(0.66, 0.56, 0.19);
	// Fresnel Parameters
	let baseStar_emissiveFresnel = new BABYLON.FresnelParameters();
	baseStar_emissiveFresnel.isEnabled = true;
	baseStar_emissiveFresnel.bias = 0.21;
	baseStar_emissiveFresnel.power = 12;
	baseStar_emissiveFresnel.leftColor = new BABYLON.Color3(0.9803921568627451, 1, 0);
	baseStar_emissiveFresnel.rightColor = new BABYLON.Color3(1, 0.9019607843137255, 0);
	baseStar.emissiveFresnelParameters = baseStar_emissiveFresnel;

	// ambient definitions
	baseStar.ambientColor = new BABYLON.Color3(1.00, 1.00, 1.00);

	// Fresnel Parameters
	let baseStar_opacityFresnel = new BABYLON.FresnelParameters();
	baseStar_opacityFresnel.isEnabled = true;
	baseStar_opacityFresnel.bias = 0.12;
	baseStar_opacityFresnel.power = 10;
	baseStar_opacityFresnel.leftColor = new BABYLON.Color3(0, 0, 0);
	baseStar_opacityFresnel.rightColor = new BABYLON.Color3(1, 1, 1);
	baseStar.opacityFresnelParameters = baseStar_opacityFresnel;

	// specular definitions;
	baseStar.specularColor = new BABYLON.Color3(0.00, 0.00, 0.00);

	return baseStar;
}

export default {
	create,
	update
}