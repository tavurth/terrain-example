"use strict";

import NeDB from 'nedb'

/**
 *  Setting up temporary variables
 */
let mainDB = new NeDB();

mainDB.ensureIndex({ fieldName: 'pos', unique: false, sparse: true }, function (err) {
	if (err)
		throw err;
});
mainDB.ensureIndex({ fieldName: 'vel', unique: false, sparse: true }, function (err) {
	if (err)
		throw err;
});

let hashDB = {};

let add = (id, obj) => {
	hashDB[id] = obj;
};

let rem = (id) => {
	if (hashDB.hasOwnProperty(id))
		delete hashDB[id];
};

let get = (id) => {
	return (hashDB.hasOwnProperty(id)) ? hashDB[id] : false;
};

let map = (func) => {
	return Object.values(hashDB).map(func).filter(a => (a));
};

export default {
	mainDB,
	hashDB,
	get,
	add,
	rem,
	map,
}