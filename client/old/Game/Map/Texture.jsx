"use strict";

import Utils from '../../Modules/Utils'
import Group from '../../Modules/Engine/Groups'

function create(options = {}) {

    // TODO: Check passed shader type
    // We should pass a ShaderMaterial or RawShaderMaterial
    if (! options.shader) {
        throw "Must provide shader to texture generator function";
    }

    // Add defaults
    Utils.options(options, {
        pos: [0,0,0],      // Position is used when we want position dependant texture generation
        resolution: 1024,  // How many vertices should we use for our plane, and how many pixes should the camera show for render resolution
    });

    // Setup the camera which will photograph the texture once it's complete
    let textureCamera =
        new THREE.OrthographicCamera(-options.resolution/2,
                                      options.resolution/2,
                                      options.resolution/2,
                                     -options.resolution/2,
                                     -100,
                                      100);

    // Create the scene and add our plane which will be used for the texture generation
    let textureScene = new THREE.Scene();
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(options.resolution, options.resolution),
        options.shader
    );

    options.position = new THREE.Vector3(...options.pos);

    // Move the camera and plane slightly apart so that we get a good photo
    textureCamera.position.z += 20;

    textureScene.add(plane);

    // Setup the renderer for our texture
    let texture = new THREE.WebGLRenderTarget(options.resolution, options.resolution, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
    });

    // Render to texture
    Group.get().engine.render(textureScene, textureCamera, texture, true);

    texture.texture.wrapS = THREE.RepeatWrapping;
    texture.texture.wrapT = THREE.RepeatWrapping;

    plane.geometry.dispose();
    plane.material.dispose();

    return texture;
}

export default {
    create
}
