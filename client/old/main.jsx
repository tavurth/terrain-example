'use strict';
/* global document */

import { Provider } from 'react-redux';

// Shim.js
import values from 'object.values'
if (!Object.values) {
	values.shim();
}

import Store from './Store'
import App from './App'

// Make sure that we've initialised react-tap for Material-UI
// http://stackoverflow.com/a/34015469/988941
require("react-tap-event-plugin")();

// console.log(document.getElementById('application'));
ReactDOM.render(
    <Provider store={Store}>
        <App />
    </Provider>,
	document.getElementById('application')
);
