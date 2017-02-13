"use strict";
/* global require */

import B from '../../Modules/Engine/Toolbox'
import Utils from '../../Modules/Utils'
import Database from '../Utilities/Databases'

import Action from '../Actions/Actions'
import Octree from './Octree'

export default class Orbital {
	id;
	mesh;
	size;
	vel;
	connections;

	constructor(kwargs = {}) {

		this.mesh = null;
		this.connections = [];

		// Velocity selection for object movement
		this.vel = B.vectorize(kwargs.vel);
		this.pos = B.vectorize(kwargs.pos);

		this.size = Utils.get(kwargs, 'size', 1);

		this.id = kwargs['_id'] || kwargs['id'] || Utils.generate_name('Orbital');

		Database.add(this.id, this);
	}

	/**
	 * Should be called after creating a mesh to add this object to the octree
	 */
	meshDidLoad() {
		Octree.add(this.mesh);
	};

	position(newPos) { if (newPos) this.mesh.position=newPos; return this.mesh.position; }
	rotation(newRot) { if (newRot) this.mesh.rotation=newRot; return this.mesh.rotation; }

	trySetName(type, kwargs, force=true) {
		// Generate the name if we've not passed one
		if (! this.name) {
			if (!kwargs.name) {
				kwargs.name = Utils.generate_name(type);
			}

			if (force)
				this.name = kwargs.name;
		}
	}

	/**
	 * Return a simple line which joins two Orbitals
	 */
	buildLines(objects) {

		// Did we pass an array of objects?
		if (objects instanceof Array)
			return objects.map(obj => {
				return [
					this.mesh.position,
					obj.mesh.position || obj.pos
				];
			});


		// Passed a single object
		// TODO: Write tests to ensure we have the correct object type?
		return [[
			this.mesh.position,
			objects.mesh.position || objects.pos
		]];
	};

	/**
	 * Find a list of the closest objects
	 */
	static closest(object, dist = 10) {

		let pos = object.pos || object.mesh.position;

		return new Promise((res, rej) => {

			// Finding localised objects from the database
			res(Database.map(obj => {
					if (Math.abs(obj.mesh.position.x - pos.x) < dist && Math.abs(obj.mesh.position.z - pos.z) < dist) {
						return obj;
					}
					return false;
				})

				// Sort the items by their distance to the passed position or object
				.sort((a, b) => {

					let deltaA = (a.mesh.position.x - pos.x)**2 + (a.mesh.position.z - pos.z)**2;
					let deltaB = (b.mesh.position.x - pos.x)**2 + (b.mesh.position.z - pos.z)**2;

					return deltaA - deltaB;
				})
			)
		})
	}

	closest(distance, slices = -1) {
		let closest = Orbital.closest(this, distance);

		// Cull to the required number of slices
		if (closest.length) {
			closest = closest.slice(0, Math.min(closest.length - 1, slices));
		}

		return closest;
	}

	/**
	 * Start dragging the closest object(s) to the orbital
	 * @param distance  Maximum distance for the drag operation to start
	 * @param slices    Maximum number of items to drag
	 */
	dragClosest(distance = 5, slices = 1) {
		this.closest(distance, slices).then(items => {
			this.drag(items);
		});
	}

	drag(items) {
		Action.Orbital.drag(this, items);
	}

	move(vel) {
		Action.Orbital.move(this, vel);
	}
}
