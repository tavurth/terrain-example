"use strict";

import B from '../../Modules/Engine/Toolbox'

let Config = {
	clampSpeed: 0.2,
	normalizer: 50,
	clampMin: 0,
	clampMax: 0,

	// Divisors
	// These bring our computed vector speeds into the playable range
	maxW: 0,
	maxH: 0,
	divisorW: 0,
	divisorH: 0,
	divisorF: 0,
};

Config.clampMin = B.vector3(-Config.clampSpeed, -Config.clampSpeed, -Config.clampSpeed);
Config.clampMax = B.vector3( Config.clampSpeed,  Config.clampSpeed,  Config.clampSpeed);

Config.setup = (group) => {

	// Width and height of the canvas
	Config.maxW = group.canvas.width * Config.normalizer;
	Config.maxH = group.canvas.height * Config.normalizer;

	// Widths and heights of current group for mouse space speed translation
	Config.divisorW = B.vector3(Config.maxW, Config.maxW, Config.maxW);
	Config.divisorH = B.vector3(Config.maxH, Config.maxH, Config.maxH);

	// Final speed divisor for bringing mouse movements to world space speeds
	Config.divisorF = B.vector3(
		Config.clampSpeed * Config.normalizer,
		Config.clampSpeed * Config.normalizer,
		Config.clampSpeed * Config.normalizer
	);
};

export default Config;
