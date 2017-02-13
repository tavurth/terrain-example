"use strict";

import Databases from './Databases'
import Syncer from '../../Modules/Syncer/Syncer'

let remote = window.location.origin;
remote = remote.slice(remote.indexOf(':') + 3, remote.lastIndexOf(':'));

let Host = new Syncer(Databases.mainDB, remote);

export default {
	Host
};
