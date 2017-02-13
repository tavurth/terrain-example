"use strict";

import { actionType } from './Actions'

function action(action, type) {
	if (type && type.length > 0) {
		type = '/' + type;
	}

	return actionType(action, 'Game/UI' + type);
}

export default {
	action
}