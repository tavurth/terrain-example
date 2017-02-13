"use strict";

import Group from '../../Modules/Engine/Groups'
import Fallback from '../Materials/Fallback'
import baseStar from '../Materials/baseStar'

let MaterialDB = {
	fallback: null
};
let MaterialArchive = {
	fallback: Fallback,
	baseStar: baseStar
};

/**
 * Load a material from our archives
 * @param name   The name to use for this material search
 * @param kwargs The key word arguments to pass to the constructor
 */
let archiveLoad = (name, kwargs) => {

	// Make sure we've loaded our default material
	if (! MaterialDB.fallback && name !== 'fallback') {
		archiveLoad('fallback');
	}

	// Make sure it exists in the library, else load it
	if (! MaterialArchive.hasOwnProperty(name) || ! MaterialArchive[name].hasOwnProperty('create')) {
		console.log("Failed to load material:", name);
		return MaterialDB.fallback;
	}

	// Loading the material from the archive and returning it
	return MaterialDB[name] = MaterialArchive[name].create(Group.get(), kwargs);
};

/**
 * Load a material from our previously loaded materials, or load it if it's not been used yet
 * @param name   The name to use for the lookup
 * @param kwargs The arguments to pass to the constructor or updater
 */
let load = (name, kwargs) => {

	// Have we already loaded this material?
	if (MaterialDB.hasOwnProperty(name)) {

		// Can we update this material?
		if (typeof MaterialArchive[name].update == 'function')
			return MaterialArchive[name].update(MaterialDB[name]);

		// Just return it
		return MaterialDB[name];
	}

	// Load and return, or return the fallback
	return archiveLoad(name, kwargs);
};

export default {
	load
};
