"use strict";

export function type(type, isTrue) {
	let toReturn = {};
	toReturn[type] = isTrue;

	return {
		...toReturn,
		type: 'Game/Loading'
	};
}

export function clear() {
	return {
		clear: true,
		type: 'Game/Loading'
	};
}

export default {
	type,
	clear
}
