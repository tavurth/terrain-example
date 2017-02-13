"use strict";

import { Provider } from 'react-redux';

import App from 'containers/App';
import store from 'store';

import 'index.html';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
