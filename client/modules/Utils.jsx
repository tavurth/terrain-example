"use strict";
/* global document, module */
let nameGenerationCounter = {};

// import screenfull from 'screenfull'

function set_cookie(name,value,days) {

    let expires;
    if (days) {
        let date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
}

function get_cookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function del_cookie(name) {
    set_cookie(name,"",-1);
}

function get(object, key, defaultValue) {
    object = object || {};

    if (object && object.hasOwnProperty(key)) {
        return object[key];
    }

    return defaultValue;
}
function set(object, key, newValue) {
    object = object || {};

    if (object) {
        return object[key] = newValue;
    }
    return false;
}
function inc(object, key, amount, defaultValue) {
    if (object) {
        if (object.hasOwnProperty(key)) {
            return object[key] += amount || 1;
        }

        // Initialise the value if it doesn't exist
        else if (defaultValue) {
            return object[key] = defaultValue;
        }

        return object[key] = 1;
    }

    return 1;
}
function dec(object, key, amount, defaultValue) {
    return inc(object, key, -amount, defaultValue);
}

/**
 * Use to generate a unique name to be used somewhere in the application
 * This name will increment from 0 and should not be used for data that is
 * shared by other clients.
 *
 * @param kwargs (String) When no object, just use the string as the basic name for the number
 * @param kwargs (Object) Use kwargs.type to identify the type for the number
 * @returns {string}
 */
function generate_name(kwargs) {

    let type;

    // Did we just pass a name via string?
    if (typeof kwargs === 'string') {
        type = kwargs;
    }
    // Maybe we passed a complex argument or no argument at all
    else {
        kwargs = kwargs || {};

        // If no type was specified use a default
        type = get(kwargs, 'type', 'NoType');
    }

    // Increment our counter for the name and return it
    return type + '_' + inc(nameGenerationCounter, type, 1);
}

/**
 * Returns true if the user is on mobile
 */
function is_mobile() {
    return ('ontouchstart' in document.documentElement);
}

/**
 * Some features are disabled for iOS users
 *
 * e.g. fullscreen will not function as expected
 * TODO: Add a popup when the user tries to access disabled features showing them how to accomplish the same thing
 */
function is_ios() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}


/**
 * Toggles full-screen state for the application
 *
 * Note: This will not function on iOS, for iOS users the site must be bookmarked before it will work correctly.
 */
export function toggle_fullscreen() {
/*
    if (screenfull.enabled) {
        screenfull.toggle();
    }

    return screenfull.isFullscreen;
*/
}

/**
*  Add default parameters to options
*  @param options    the options object initially passed
*  @param newOptions the default options to be used if missing
*/
export function options(options, newOptions = {}) {
    for (let key in newOptions) {
        if (typeof options[key] == 'undefined') {
            options[key] = newOptions[key];
        }
    }

    return options;
}

export default {
    get,
    set,
    inc,
    dec,
    options,
    is_mobile,
    set_cookie,
    get_cookie,
    del_cookie,
    generate_name,
    toggle_fullscreen
};
