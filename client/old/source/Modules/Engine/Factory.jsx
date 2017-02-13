"use strict";

import Create from './Create'
import Vectors from './Vectors'

/**
 * Combinding functionality for export
 */
export default {
	create: {
		...Create
	},
	...Vectors
}