"use strict";

// Import Redux
import { combineReducers } from 'redux'

let Loading = function(state = {}, action) {
	if (action.type.indexOf('/Loading') < 0) {
		return state;
	}

	// Finished all loading types
	if (action.clear) {
		return {}
	}

	// Return incremental loading
	return {
		...state,
		...action
	};
};


// Combine all our our app reducers together
export default Loading;