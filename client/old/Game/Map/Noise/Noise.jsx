"use strict";

import noise2D from './2D'
import noise3D from './3D'
import noise4D from './4D'
import psrd2D from './psrd2D'
import noise3Dgrad from './3Dgrad'
import classic2D from './classic2D'
import classic3D from './classic3D'
import classic4D from './classic4D'
import cellular3D from './cellular3D'
import cellular2D from './cellular2D'
import cellular2x2 from './cellular2x2'
import cellular2x2x2 from './cellular2x2x2'

let types = {
    '2D': noise2D,
    '3D': noise3D,
    '4D': noise4D,
    'PSRD2D': psrd2D,
    '3DGRAD': noise3Dgrad,
    'CLASSIC2D': classic2D,
    'CLASSIC3D': classic3D,
    'CLASSIC4D': classic4D,
    'CELLULAR2D': cellular2D,
    'CELLULAR3D': cellular3D,
    'CELLULAR2X2': cellular2x2,
    'CELLULAR2X2X2': cellular2x2x2,
}

export default function(type) {

    type = type.toUpperCase();

    if (types.hasOwnProperty(type)) {
        return types[type];
    }

    throw "No noise function of " + type + " found";
}
