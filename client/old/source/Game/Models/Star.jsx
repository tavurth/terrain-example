"use strict";

import Materials from '../Utilities/Materials'
import B from '../../Modules/Engine/Toolbox'
import Utils from '../../Modules/Utils'

import Orbital from './Orbital'
import Group from '../../Modules/Engine/Groups'
let sphere = null;

function initialiseFirstSphere() {
	let scene = B.group.get().scene;
	let geometry = new THREE.InstancedBufferGeometry();
	geometry.maxInstancedCount = 9999999;

	var vertices = new THREE.BufferAttribute( new Float32Array( triangles * 3 * 3 ), 3 );
	sphere = B.create.sphere(scene, 1, 8);

	// Creating our meshes for LOD filtering
	let sphereLOD1 = B.create.sphere(scene, 1, 1);
	let sphereLOD2 = B.create.sphere(scene, 1, 0.1);
	let sphereLOD3 = B.create.sphere(scene, 1, 0.01);

	sphere.material = sphereLOD1.material = sphereLOD2.material = sphereLOD3.material = Materials.load('baseStar');

	// Adding the LOD filters to our sun object
	sphere.addLODLevel(50, sphereLOD1);
	sphere.addLODLevel(80, sphereLOD2);
	sphere.addLODLevel(120, sphereLOD3);
	sphere.addLODLevel(180, null);

	// Hide this object
	sphere.isVisible = false;
}

export default class Star extends Orbital {
	constructor(kwargs = {}) {
		super(kwargs);

/*
		// Create the instancing sphere if we've not yet done so
		if (sphere === null) {
			initialiseFirstSphere();
		}
*/

		if (isNaN(kwargs.create) || kwargs.create)
			this.createMesh(kwargs);

		this.connections = 0;
	}

	createMesh(kwargs) {
		let group = Group.get();

		// Create an instance of that sphere for this mesh
		this.mesh = B.create.sphere(group.scene, 1);
		//sphere.createInstance(Utils.generate_name("Star"));

		// this.mesh.material.specularPower = 0;
		this.mesh.position.copy(this.pos);
		delete this.pos;

		this.meshDidLoad();
	}

	static loadMany(stars) {
		let toReturn = [];

		stars.slice(0, 100).map(obj => toReturn.push(new Star(obj)));

		return toReturn;
	};
}
