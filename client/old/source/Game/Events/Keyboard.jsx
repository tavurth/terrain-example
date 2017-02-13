"use strict";

// Local game imports
import Store from '../../Store'
import Speeds, {speedsSetup} from '../Globals/Speeds'
import B from '../../Modules/Engine/Toolbox'
import Player from '../Models/Player'

export function setup(group) {

	let pressed = {};
	let speed = B.vector3();
	let player = Player.current();

	let intervalId = false;
	let keyRepeatFunc = () => {
		player.move(BABYLON.Vector3.Clamp(player.vel.addInPlace(speed), Speeds.clampMin, Speeds.clampMax));
	};

	let speedBuilder = () => {
		speed = B.vector3();
		for (let key in pressed) {
			speed.addInPlace(pressed[key]);
		}
	};

	group.canvas.addEventListener('keydown', e => {
		switch (e.code) {
			case 'ArrowUp':
				pressed[e.code] = B.vector3(-Speeds.clampSpeed / 10, 0, 0);
				break;

			case 'ArrowDown':
				pressed[e.code] = B.vector3(Speeds.clampSpeed / 10, 0, 0);
				break;

			case 'ArrowLeft':
				pressed[e.code] = B.vector3(0, 0, -Speeds.clampSpeed / 10);
				break;

			case 'ArrowRight':
				pressed[e.code] = B.vector3(0, 0, Speeds.clampSpeed / 10);
				break;

			case 'Space':
				player.intersects(0.1);
				player.dragClosest();
				break;

			default:
				console.log('[' + e.code + ']', 'pressed');
				break;
		}

		if (Object.keys(pressed).length && !intervalId) {
			intervalId = setInterval(keyRepeatFunc, 80);
		}

		speedBuilder();
	});

	group.canvas.addEventListener('keyup', e => {

		switch(e.code) {
			case 'Space':
				player.drag([]);
		}

		if (pressed.hasOwnProperty(e.code)) {
			delete pressed[e.code];
		}

		if (Object.keys(pressed).length < 1 && intervalId != false) {
			window.clearInterval(intervalId);
			intervalId = false;
		}

		speedBuilder();
	});
}

export default {
	setup
};
