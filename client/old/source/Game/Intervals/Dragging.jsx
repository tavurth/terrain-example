"use strict";

import Speeds from '../Globals/Speeds'
import Database from '../Utilities/Databases'

export function update() {

	Database.map(aModel => {

		if (! aModel.hasOwnProperty('dragging') || ! aModel.dragging.length)
			return;

		// For every object which is dragging another
		aModel.dragging.map(bModel => {

			if (! (bModel = Database.get(bModel)))
				return;

			// Moving the dragged object towards the dragger
			bModel.vel
				.addInPlace(
					bModel.mesh.position.subtract(aModel.mesh.position)
						.normalize()
						.divide(Speeds.divisorF).divide(Speeds.divisorF).negate());

		});
	});
}

export default {
	update
};