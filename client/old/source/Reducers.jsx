"use strict";

// Import Redux
import { combineReducers } from 'redux'

// Redux-form reducers
import { reducer as formReducer } from 'redux-form'
import GameReducers from './Game/Reducers/Reducers'

const DebugReducer = (state = {}, action) => {
    return state;
};

/**
 * Importing reducers
 */

// Combine all our our app reducers together
export default function ChartingReducers() {

    return combineReducers({
	    game: GameReducers,
        debug: DebugReducer,
    });
};