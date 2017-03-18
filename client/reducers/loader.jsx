"use strict";

let defaultState = {
    splash: true
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
