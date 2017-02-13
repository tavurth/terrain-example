"use strict";

export function setup(group) {
	// Setup our resize listener
	window.addEventListener('resize', () => {
		group.engine.resize();
	});
}

export default {
	setup
};