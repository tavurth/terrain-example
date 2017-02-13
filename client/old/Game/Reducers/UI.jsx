"use strict";

// Import Redux
import { combineReducers } from 'redux'

let UI = function(state = {}, action) {
	if (action.type.indexOf('/UI') < 0) {
		return state;
	}

	return {
		...state,
		...action
	};
};


// Combine all our our app reducers together
export default UI;