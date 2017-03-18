"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from 'containers/App';
import store from 'store';

import 'index.html';

// Material-UI for react, and theming libraries
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Make sure that we've initialised react-tap for Material-UI
// http://stackoverflow.com/a/34015469/988941
require("react-tap-event-plugin")();

ReactDOM.render(
        <Provider store={store}>
        <MuiThemeProvider className='full-size'>
        <App />
        </MuiThemeProvider>
        </Provider>,
    document.getElementById('root')
);
