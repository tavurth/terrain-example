"use strict";

import noise from './Noise'
import group from './Groups'
import Create from './Create'
import Vectors from './Vectors'
import Registry from './Registry'
import LoadingScreen from './LoadingScreen'

/**
 * Combinding functionality for export
 */
export default {
    group,
    noise,
    ...Vectors,
    create: {
        ...Create
    },
    ...Registry,
    LoadingScreen
}
