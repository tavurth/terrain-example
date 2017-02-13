"use strict";

import Player from '../Models/Player'
import B from '../../Modules/Engine/Toolbox'
import Database from '../Utilities/Databases'

let playerSlowdown = B.vector3(0.95, 0.95, 0.95);
let otherSlowdown  = B.vector3(0.995, 0.995, 0.995);

export function update() {

	Database.map(obj => {
		// Moving the object
		obj.mesh.position.addInPlace(obj.vel);

		obj.vel.multiplyInPlace((obj instanceof Player) ? playerSlowdown : otherSlowdown);

		// Collision detection should go here
	});
}

export default {
	update
};
