"use strict";

import Mouse from './Mouse'
import Window from './Window'
import Keyboard from './Keyboard'
import Speeds from '../Globals/Speeds'

import Orbital from './Orbital'

let setup = (group) => {
	Window.setup(group);

	Speeds.setup(group);

	Mouse.setup(group);
	Keyboard.setup(group);
};

export default {
	setup,
	Orbital
}