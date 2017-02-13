"use strict";

import Utils from '../Utils'
import SocketIO from 'socket.io-client'
import Actions from './Actions'

// let DEBUG = true;
let DEBUG = false;

export default class Syncer {

	  static debug() {
		    if (DEBUG)
			      console.log('[Syncer]', ...arguments);
	  }

	  /**
	   * First argument must be a database, second and third are the connection to make
	   *
	   * @param database   Already established database (currently only NeDB)
	   * @param remote     Remote address for socket.io connection
	   * @param port       Remote port for socket.io connection
	   */
	  constructor(database, remote = 'localhost', port = '8080') {
		    this.handle = SocketIO.connect('http://'+remote+':'+port+'/');

		    this.handle.on('connect', err => {
			      if (err)
				        throw err;

			      Syncer.debug('connected to', remote, 'on port', port);
		    });

		    // Hold the callback functions here, this is used for "await" functionality
		    this.callbackHash = {};

		    /**
		     * Update the local database
		     */
		    this.handle.on('insert',   command => this.insert_local(command));
		    this.handle.on('update',   command => this.update_local(command));
		    this.handle.on('remove',   command => this.remove_local(command));
		    this.handle.on('dispatch', command => Syncer.dispatch_local(command));
		    this.handle.on('message',  message => Syncer.debug('Got basic message:', message));
	  }

	  /**
	   * Called automatically to insert data in the table when we receive a response from the handle
	   * @param what
	   * @param data
	   */
	  insert_local({what, data} = { name: '', data: []}) {
		    return this.reduce(Actions.insert('local', what, data));
	  }

	  /**
	   * Called automatically to remove data from the table when we receive a response from the handle
	   * @param what
	   * @param remove
	   * @param options
	   */
	  remove_local(what, remove, options = {}) {
		    return this.reduce(Actions.remove('local', what, remove, options));
	  }

	  /**
	   * Called automatically to update data in the table when we receive a response from the handle
	   * @param what
	   * @param query
	   * @param update
	   * @param options
	   */
	  update_local(what, query, update, options = {}) {
		    this.reduce(Actions.update('local', what, query, update, options))
	  }

	  /**
	   * Sometimes we just want to dispatch a redux action on receipt of data
	   * @param what    What's the name?
	   * @param action  What's the action (Including data perhaps)
	   */
	  static dispatch_local(what, action) {
		    this.reduce(Actions.dispatch('local', what, action))
	  }

	  /**
	   * Send a database insert request to connected clients
	   * @param what
	   * @param data
	   */
	  insert_remote(what, data) {
		    this.handle.emit('insert', data);
		    this.reduce(Actions.insert('remote', what, data))
	  }

	  /**
	   * Send a database remove request to connected clients
	   * @param what
	   * @param data
	   * @param options
	   */
	  remove_remote(what, data, options) {
		    this.handle.emit('remove', data, options);
		    this.reduce(Actions.remove('remote', what, data, options))
	  }

	  /**
	   * Send database updates to the connected clients
	   * @param what
	   * @param query
	   * @param data
	   * @param options
	   */
	  update_remote(what, query, data, options = {}) {
		    this.handle.emit('update', query, data, options);
		    this.reduce(Actions.update('remote', what, query, data, options))
	  }

	  /**
	   * Sometimes we just want to dispatch a redux action on a remote machine or another client
	   * @param what    What's the name?
	   * @param action  What's the action (Including data perhaps)
	   */
	  dispatch_remote(what, action) {
		    this.handle.emit('dispatch', action);
		    this.reduce(Actions.dispatch('remote', what, action))
	  }

	  /**
	   * Insert locally and remotely at the same time
	   * @param arguments Will be passed forward to the internal functions
	   */
	  insert() {
		    this.insert_local(...arguments);
		    this.insert_remote(...arguments);
	  }

	  /**
	   * Remove locally and remotely at the same time
	   * @param arguments Will be passed forward to the internal functions
	   */
	  remove() {
		    this.remove_local(...arguments);
		    this.remove_remote(...arguments);
	  }

	  /**
	   * Update locally and remotely at the same time
	   * @param arguments Will be passed forward to the internal functions
	   */
	  update() {
		    this.update_local(...arguments);
		    this.update_remote(...arguments);
	  }

	  /**
	   * Dispatch locally and remotely at the same time
	   * @param arguments Will be passed forward to the internal functions
	   */
	  dispatch() {
		    this.dispatch_local(...arguments);
		    this.dispatch_remote(...arguments);
	  }

	  /**
	   * Make a basic request to the connected handle
	   */
	  request() {
		    this.handle.emit(...arguments);
	  }

	  await() {
		    let name = false;

		    // Make sure we have some arguments
		    if (arguments.length) {

			      // Extract basic string data name
			      if (typeof arguments[0] == 'string') {
				        name = arguments[0];
			      }

			      // Extract complex data string name
			      else if (arguments[0] instanceof Object && arguments[0].hasOwnProperty('name')) {
				        name = arguments[0]['name'];
			      }

			      // Just generate a default name
			      else {
				        name = Utils.generate_name('Syncer_await');
			      }

			      // Make sure we've extracted the name for the server
			      this.request(name, ...Array.prototype.slice.call(arguments, 1));

			      // Wait for the server to respond and then call the promised functionality
			      return new Promise((res, rej) => {
				        this.add(name, res, rej);
			      })
		    }

		    // Check that we have passed some valid arguments
		    return new promise((res, rej) => {
			      rej('Found no data to pass for processing, please see Syncer docs.')
		    });

	  }

	  /**
	   * Calls the synchronous await functionality for multiple different requests
	   */
	  await_many() {
		    let toAwait = [];

		    Array.prototype.map.call(arguments, arg => {
			      (typeof arg == 'string') ?
				    toAwait.push(this.await(arg)):
				    toAwait.push(this.await(...arg));
		    });

		    return Promise.all(toAwait);
	  }

	  /**
	   * Add a new callback for a specified event
	   * @param name     The name of the event to wait for
	   * @param res      The result function
	   * @param rej      The error function
	   * @param options  Options to be saved for the callback
	   */
	  add(name, res = () => {}, rej = () =>{}, options = { persist: true }) {

		    // Adding multiple callbacks at once
		    if (name instanceof Array)
			      name.map(item => this.add(item, res, rej, options));

		    this.callbackHash[name] = { res, rej, ...options };
	  };

	  /**
	   * Remove a named callback function
	   * @param name  The name of the function to remove
	   */
	  rem(name) {

		    // Adding multiple callbacks at once
		    if (name instanceof Array)
			      name.map(item => this.remove(item));

		    if (this.callbackHash.hasOwnProperty(name))
			      delete this.callbackHash[name];
	  };

	  /**
	   * Try to call a callback function when we recieve an event type
	   * @param type      The type of event (success or failure)
	   * @param name      The name of the event to use for lookup
	   * @param action    The data to send to the callback
	   */
	  call(type, name, action) {

		    // Do we have a name property in the action?
		    if (this.callbackHash.hasOwnProperty(name)) {

			      // Did we define the location of the event?
			      let callback = this.callbackHash[name];

			      // Make sure we fit the callback properties
			      if (! callback.hasOwnProperty('where') || callback.where == action.where) {
				        if (! callback.hasOwnProperty('what') || callback.what == action.what) {

					          // Has the developer passed us a resolve or reject function type?
					          if (callback.hasOwnProperty(type))
						            callback[type](action);

					          // Should we keep track of this callback in the future?
					          if (callback.hasOwnProperty('persist') && callback.persist === false)
						            this.rem(name);
				        }
			      }
		    }
	  };

	  /**
	   * Successfully received a callback
	   * @param name    The name of the callback
	   * @param action  The data for the callback function
	   */
	  res() {
		    this.call('res', ...arguments);
	  };

	  /**
	   * A callback function was rejected
	   * @param name    The name of the function
	   * @param action  Any error codes or other associated data
	   */
	  rej() {
		    this.call('rej', ...arguments);
	  };

	  /**
	   * Reduce an incoming event or action to perform callbacks
	   * @param action  The action to reduce
	   */
	  reduce(action = { type: '' }) {

		    let what = action.what;
		    delete action.what;

		    // Did we get an attached status in the action?
		               if (typeof action.status != 'undefined') {

			                 // Call the correct resolve or reject function
			                 (action.status == 'success') ?
				               this.res(what, ...arguments):
				               this.rej(what, ...arguments);
		               }

		    // No status, try to call the resolve function anyway
		    else {
			      this.res(what, ...arguments);
		    }
	  };
}
