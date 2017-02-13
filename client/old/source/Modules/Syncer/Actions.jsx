"use strict";

/**
 * Exposes the result of local or remote dispatch actions to the developer
 * @param where   What took place? 'orbital-positions', 'planet-created'
 * @param what    Where did it take place? 'local', 'remote', 'both'
 * @param action  Action dispatch request
 */
export function dispatch(where, what, action) {
	return {
		what,
		where,
		action,
		type: 'Syncer/Dispatch'
	}
}

/**
 * Exposes the result of local or remote insertion actions to the developer
 * @param where   What took place? 'orbital-positions', 'planet-created'
 * @param what    Where did it take place? 'local', 'remote', 'both'
 * @param action  Items involved in the transaction
 */
export function insert(where, what, action) {
	return {
		what,
		action,
		where,
		type: 'Syncer/Insert'
	}
}

/**
 * Exposes the result of local or remote update actions to the developer
 * @param where    What took place? 'orbital-updates', 'planet-changed'
 * @param what     Where did it take place? 'local', 'remote', 'both'
 * @param query    The item to search for
 * @param action   Items involved in the transaction
 * @param options  Additional options to be passed forwards
 */
export function update(where, what, query, action, options) {
	return {
		what,
		query,
		where,
		action,
		options,
		type: 'Syncer/Update'
	}
}

/**
 * Exposes the result of local or remote removal actions to the developer
 * @param where   What took place? 'orbital-destruction', 'planet-destroyed'
 * @param what    Where did it take place? 'local', 'remote', 'both'
 * @param action  Items involved in the transaction
 */
export function remove(where, what, action) {
	return {
		what,
		where,
		action,
		type: 'Syncer/Remove'
	}
}

export default {
	insert,
	update,
	remove
}