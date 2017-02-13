"use strict";

import UI from './UI'
import Loading from './Loading'
import Orbital from './Orbital'

export function actionType(action, type) {
	return {
		...action,
		type
	};
}

export default {
	UI,
	Loading,
	Orbital
};