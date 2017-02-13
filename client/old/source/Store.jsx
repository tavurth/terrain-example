"use strict";

import { createStore, applyMiddleware } from 'redux';

/**
 * Importing middleware
 */
import promiseMiddleware from './Modules/middleware/promiseMiddleware';
import ThunkMiddleware from 'redux-thunk';

/**
 * Importing reducers
 */
import reducers from './Reducers';

// Apply the promise middleware for async
let createGameStore = applyMiddleware(promiseMiddleware, ThunkMiddleware)(createStore);

// Create the store and return it
// Use Redux-devtools if the user has the plugin installed
export default createGameStore(reducers(), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
