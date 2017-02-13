"use strict";

import Group from '../../Modules/Engine/Groups'
import Player from '../Models/Player'
import Orbital from '../Models/Orbital'
import Interval from './Intervals'

let lines = [];
let dashCount = 8;

let group = false;

function tryInit() {
	if (! group) {
		group = Group.get();
	}
}

/**
 * Start dragging the closest object(s) to the orbital
 * @param orbital   The orbital object to use for the drag command
 * @param distance  Maximum distance for the drag operation to start
 * @param slices    Maximum number of items to drag
 */
export function dragClosest(orbital, distance = 5, slices = 1) {

	tryInit();

	Orbital.closest(orbital, distance).then(items => {

		// If we already have lines, dispose of them
		lines.map(line => {
			line.dispose();
		});
		lines = [];

		// Cull the number of items down to the required size, and save them in the orbital Object
		items = items.slice(0, slices);
		orbital.drag(items);

		// Build new lines from the orbital passed to the closest object
		orbital.buildLines(items).map((line, idx) => {

			// Creating the line
			let newLine = BABYLON.MeshBuilder.CreateDashedLines("line_" + idx, {
				points: line,
				gapSize: 8,
				dashSize: 16,
				updatable: true,
				dashBn: dashCount,
			}, group.scene);

			// Adding the start point so that we can update it later
			newLine.start = line[1];

			lines.push(newLine);
		});
	});

	console.log(Interval);

	Interval.add(orbital.name + '_dragging', function() {
		orbital.dragging.map(obj => {
			obj.vel += orbital.vel;
			obj.vel /= 2;
		});
	}, 50);
}

export default {
	dragClosest
};
