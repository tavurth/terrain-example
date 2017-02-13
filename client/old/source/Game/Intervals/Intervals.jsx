"use strict";

let intervalHash = {};

/**
 * Add a new interval function
 * @param key       The name to use for a reference
 * @param func      The function to call on interval
 * @param interval  The interval timing (milliseconds)
 */
let add = (key, func, interval) => {
	if (intervalHash.hasOwnProperty(key))
		window.clearInterval(intervalHash[key]);

	intervalHash[key] = setInterval(func, interval);
};

/**
 * Remove a previously added interval
 * @param key  The name to reference for the removal
 */
let rem = (key) => {
	if (intervalHash.hasOwnProperty(key)) {
		window.clearInterval(intervalHash[key]);
		delete intervalHash[key];
	}
};

import Movement from '../Intervals/Movement'
import Dragging from '../Intervals/Dragging'

export default {
	add,
	rem,
	Movement,
	Dragging
};