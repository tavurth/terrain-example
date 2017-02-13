"use strict";

// Import Redux
import { combineReducers } from 'redux'

/**
 * Importing reducers
 */
import loader from './loader'
import interact from './interact'

// Combine all our our app reducers together
export default combineReducers({
	  interact: interact,
	  loader: loader,
});
