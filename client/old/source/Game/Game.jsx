"use strict";

/**
 *  Importing modules
 */
import Hammer from 'hammerjs';
import Toolbox from '../Modules/Engine/Toolbox'
import Connection from './Utilities/Connection'

let group;
let startLoading = function (canvasId) {

    // Create a basic group from the canvas
    group = Toolbox.create.basic(canvasId);

    // Initialising the universe space
    group.camera.rotation.x = Math.PI / 8;

    // Prevent flickers for transparent objects
    group.engine.sortObjects = false;

    // Ask the server for some orbital data
    Connection.Host.await(
        // Waiting for the server to generate the positions
        'Map', 'Svalbard',
    )
              .then(data => {

                  let loader = new THREE.TextureLoader();

                  loader.load('/assets/textures/heightmap4.png', tex => {
                      // Start rendering once we've loaded it
                      mainScene(canvasId, data.action, tex);
                  });
              })
              .catch(err => {
                  throw err;
              });
};

import Terrain from './Map/Terrain/Terrain'
import PlanetLoader from './Map/PlanetLoader'

async function mainScene(canvasId, planetData, tex) {

    // let terrain = new Terrain({
    //     heightmap: tex,
    //     texture: tex,
    //     material: {
    //         wireframe: true,
    //     }
    // });
    // group.scene.add(terrain);
    let terrain2 = new Terrain({
        heightmap: tex,
        texture: tex,
        wireframe: true,
    });

    group.scene.add(terrain2);

    terrain2.position.z = - terrain2.worldSize / 4;
    group.camera.position.z = terrain2.elevation * 18;

    group.camera.position.x += terrain2.worldSize / 4;
    group.camera.position.y += terrain2.worldSize / 4;

    // let A = terrain.children[0].material;
    // let B = terrain2.children[0].material;
    // for (let key in A) {
    //     if (A[key] != B[key]) {
    //         if (typeof A[key] != 'string')
    //             console.log(key, A[key], B[key]);
    //     }
    // }
    // console.log(terrain, terrain2);

    // mouse variables to determine speed of mouse
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    window.addEventListener('keydown', event => {
        switch (event.code) {
            case 'ArrowUp':    group.camera.velocity.y += 800; break;
            case 'ArrowDown':  group.camera.velocity.y -= 800; break;
            case 'ArrowLeft':  group.camera.velocity.x -= 800; break;
            case 'ArrowRight': group.camera.velocity.x += 800; break;
        }
    });

    var hammertime = new Hammer(document.body);
    hammertime.get('pinch').set({ enable: true });

    group.camera.velocity = { x: 0, y: 0 };
    hammertime.on('pan', function(event) {
        group.camera.velocity.x -= event.deltaX / 4.;
        group.camera.velocity.y += event.deltaY / 4.;
    });

    hammertime.on('pinch', function(event) {
        group.camera.position.z = Math.max(Math.min(group.camera.position.z + event.deltaY * 20, terrain2.worldSize * .38), 1200);
    });

    window.addEventListener('mousewheel', (event) => {
        group.camera.position.z = Math.max(Math.min(group.camera.position.z + event.deltaY * 40, terrain2.worldSize * .38), 1200);
    });

    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        group.camera.aspect = window.innerWidth / window.innerHeight;
        group.camera.updateProjectionMatrix();
        group.engine.setSize(window.innerWidth, window.innerHeight);
    });

    // Our individiual render frame
    function animate() {
        requestAnimationFrame(animate);

        group.camera.position.x += group.camera.velocity.x /= 1.15;
        group.camera.position.y += group.camera.velocity.y /= 1.15;

        // terrain.animate(group.camera);
        terrain2.animate(group.camera);

        group.render();
    }
    animate();
};

export default {
    mainScene,
    startLoading
};
