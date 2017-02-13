"use strict";

import Octree from './Octree'
import Orbital from './Orbital'
import Utils from '../../Modules/Utils'
import B from '../../Modules/Engine/Toolbox'
import Materials from '../Utilities/Materials'

let players = {};
let homePlayer = null;

export default class Player extends Orbital {
	constructor(kwargs={create:false}) {

		kwargs._id = kwargs._id || Utils.generate_name('Player');

		super(kwargs);

		let group = B.group.get();

		// Setting up the player mesh
		this.mesh = B.create.sphere(group.scene, 1, 16);
		this.mesh.position = this.pos;
		this.mesh.rotation.x = (Math.PI / 2);
		this.mesh.material = Materials.load('PlayerView');

		Octree.add(this.mesh);

		// Is this the current player, or another remote player?
		if (kwargs.homePlayer)
			homePlayer = this;

		// Remote player
		else
			players[this.mesh.name] = this;

		this.lines = [];
	}

	intersects(radius) {
		console.log(Octree.intersects(this.mesh.position, radius));
	}

	static current = () => (homePlayer);
	static get = (id) => (players.hasOwnProperty(id) ? players[id] : null);
}
