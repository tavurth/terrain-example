"use strict";

// Import Redux
import { combineReducers } from 'redux'

/**
 * Importing reducers
 */
import UI from './UI'
import Loading from './Loading'

// Combine all our our app reducers together
export default combineReducers({
	ui: UI,
	loading: Loading,
});
