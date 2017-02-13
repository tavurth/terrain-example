"use strict";

import Database from '../Utilities/Databases'

let orbital;
export function set(action) {
	if (orbital = Database.get(action.query._id)) {
		for (let key in action.action) {
			orbital[key] = action.action[key];
		}
	}
}

export default {
	set
};