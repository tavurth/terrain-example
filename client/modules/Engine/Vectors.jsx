"use strict";

import { Vector2, Vector3, Vector4 } from 'three';

export const vectorize = (obj = [0,0,0]) => {
	let values = Object.values(obj);

	switch (Object.keys(obj).length) {
		case 2:
			return new Vector2(...values);
		case 3:
			return new Vector3(...values);
		case 4:
			return new Vector4(...values);

		default:
			return new Vector3();
	}
};

export const vector3 = (x = 0, y = 0, z = 0) => {
	return new Vector3(x, y, z);
};

export const vector2 = (x = 0, y = 0) => {
	return new Vector2(x, y);
};

export default {
	vector2,
	vector3,
	vectorize
};
