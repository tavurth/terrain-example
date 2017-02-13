"use strict";

import Connection from '../Utilities/Connection'

/**
 * Send a move event to the Syncer controller which then ladles the new info into the database
 * @param orbital  The orbital making the movement
 * @param newVel   The objects new velocity (Inclusive of old velocity)
 */
export function move(orbital, newVel) {
	Connection.Host.update('Orbital/Movement', {_id: orbital.id}, { vel: newVel });
}

/**
 * Send a drag event to the Syncer controller which then ladles the new info into the database
 * @param orbital  The orbital doing the dragging
 * @param items    The items being dragged
 */
export function drag(orbital, items) {

	// Extract the IDs of the objects to be dragged
	items = items.map(item => {
		return item.id;
	});

	Connection.Host.update('Orbital/Dragging', {_id: orbital.id}, { dragging: items });
}

export default {
	move,
	drag
}
