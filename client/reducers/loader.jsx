"use strict";

import Config from '/modules/Config'

let defaultState = {
    splash: ! Config.debugMode
};

export default function(state = defaultState, action = {}) {

    if (action.type != 'loader') {
        return state;
    }

    return {
        ...state,
        ...action,
    }
}
