"use strict";

import Utils from '../Utils'
import Group from './Groups'

import { vector3 } from './Vectors'

let DEFAULT_TESSELATION = 8;

/**
 * Create basic BABYLON objects & tools
 */
let createBasic = {
    /**
     * Creates a new THREE.js engine and returns it
     * @param {} element which the engine should be appended to
     */
    engine: (element) => {
        let engine = new THREE.WebGLRenderer({ antialias: false });
        engine.setPixelRatio(window.devicePixelRatio);
        engine.setSize(window.innerWidth, window.innerHeight);

        element.appendChild(engine.domElement);

        return engine
    },

    scene: () => {
        return new THREE.Scene();
    },

    camera: (scene, position = vector3(0, 0, 0)) => {
        let camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 100, 120000);
        scene.add(camera);

        return camera;
    },

    light: (options = {}) => {

        Utils.options(options, {
            size: 1,
            dist: 0,
            power: 1,
            pos: [0, 0, 0],
            color: 0xffffff,
            type: 'ambient',
        });

        let light = false;
        let group = Group.get();

        switch ((options.type).toLowerCase()) {
            case 'point':
                light = new THREE.PointLight(options.color, options.power, options.distance); break;

            case 'ambient':
            default:
                light = new THREE.AmbientLight(options.color); break;
        };
        light.position.set(...options.pos);
        group.scene.add(light);

        return light;
    },
};

let createCombined = {
    basic: (canvasId, createCamera = true) => {
        let { canvas, engine, scene, camera } = false;
        if (canvas = document.getElementById(canvasId)) {

            // Was the engine successfully initialised
            if (engine = createBasic.engine(canvas)) {
                scene = createBasic.scene();

                // Should we create the camera? Has the scene been initialised?
                if (scene && createCamera) {
                    camera = createBasic.camera(scene);
                }
            }
        }

        let group = {
            scene,
            canvas,
            engine,
            camera
        };

        // TODO: Add the ability to disable this code through kwargs
        // Set the group in the group-server (so that other areas of code can call B.group.get)
        Group.set(group);

        return group;
    }
};

function generateHeight(width, height, options = {}) {

    options.quality = options.quality || 0.01;

    let size = width * height;
    let data = new Uint8Array(size);
    let perlin = new ImprovedNoise();

    // Heightmap generation Iteration
    for (let j = 0; j < 5; j ++) {

        // (X & Y) iteration
        for (let i = 0; i < size; i ++) {

            // Calculate the array coordinates
            let x = i % width, y = ~~ (i / width);

            // Add some generated data to the array
            data[i] += Math.abs(perlin.noise(x / options.quality, y / options.quality, 1) * options.quality * 1.75);
        }
        options.quality *= 5;
    }
    return data;
}


function generateTexture(data, width, height) {
    let canvas, canvasScaled, context, image, imageData, level, diff, vector3, sun, shade;

    vector3 = new THREE.Vector3(0, 0, 0);
    sun = new THREE.Vector3(1, 1, 1);
    sun.normalize();

    // Creating the canvas on which we'll generate the texture
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext('2d');

    // Fill the image with nothing
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    // Extract the image data for processing
    image = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = image.data;

    // Iterate over and fill our image data with the texture
    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++) {
        vector3.x = data[j - 2] - data[j + 2];
        vector3.y = 2;
        vector3.z = data[j - width * 2] - data[j + width * 2];
        vector3.normalize();
        shade = vector3.dot(sun);
        imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
        imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
        imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);
    }

    // Add the data back to the image and scale it 4 times larger
    context.putImageData(image, 0, 0);
    canvasScaled = document.createElement('canvas');
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;
    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);
    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;
    for (let i = 0, l = imageData.length; i < l; i += 4) {
        let v = ~~ (Math.random() * 5);
        imageData[i] += v;
        imageData[i + 1] += v;
        imageData[i + 2] += v;
    }
    context.putImageData(image, 0, 0);
    return canvasScaled;
}

/**
 * Create basic BABYLON shapes and models
 */
let createObject = {

    terrain: (options = {}) => {

        let group = Group.get();

        // Setup default options
        options.width = options.width || 256;
        options.height = options.height || 256;
        options.quality = options.quality || 256;

        // Generating the world data
        let data = generateHeight(options.quality, options.quality);

        // Setup the base geometry shape
        let geometry = new THREE.PlaneBufferGeometry(options.width, options.height, options.quality - 1, options.quality - 1);
        geometry.rotateX(- Math.PI / 2);

        // Building the vertices
        let vertices = geometry.attributes.position.array;
        for (let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3) {
            vertices[j + 1] = data[i] * 10;
        }

        // Building the texture
        let texture = new THREE.CanvasTexture(generateTexture(data, options.quality, options.quality));
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // Building the final mesh and adding it to the scene
        let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
        group.scene.add(mesh);

        return mesh;
    },

    /**
     *  Create a new flat plane with options
     */
    plane: (scene, options = {}) => {

        // Adding default parameters
        options.width  = options.width  || 10;
        options.height = options.height || 10;
        options.xNum   = options.xNum   || 10;
        options.yNum   = options.yNum   || 10;
        options.color  = options.color  || 0xffffff;
        options.sides  = options.sides  || THREE.DoubleSide;

        // Setup the plane geometry and material
        let geometry = new THREE.PlaneGeometry(options.width, options.height, options.xNum, options.yNum);
        let material = new THREE.MeshBasicMaterial({ color: options.color, side: options.sides });

        // Creating the plane, and adding it to the scene
        let plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        return plane;
    },

    /**
     * Create a new skybox for the scene, once created use scene.background = skybox
     */
    skybox: (path, title, format = 'png') => {
        // Build the paths for loading the image dataa
        let urls = [
            path + title + 'RT.' + format, path + title + 'LF.' + format,
            path + title + 'UP.' + format, path + title + 'DN.' + format,
            path + title + 'FT.' + format, path + title + 'BK.' + format
        ];

        // Setting up the background
        let skybox = new THREE.CubeTextureLoader().load(urls);
        skybox.format = THREE.RGBFormat;

        return skybox;
    },

    /**
     *  Create a new sphere, specify radius and tesselation of surfaces
     */
    sphere: (options = {}) => {

        let group = Group.get();

        Utils.options(options, {
            size: 10,
            mat: {
                color: 0xffffff,
                specular: 0x111111,
                shininess: 50,
            },
            tess: DEFAULT_TESSELATION,
            pos: [0, 0, 0]
        });
        let geometry = new THREE.SphereGeometry(options.size, options.tess, options.tess);

        if (! options.material) {
            options.material = new THREE.MeshPhongMaterial(options.mat);
        }

        let sphere = new THREE.Mesh(geometry, options.material);

        sphere.position.fromArray(options.pos);

        group.scene.add(sphere);
        return sphere;
    },

    disk: (scene, radius, tesselation = DEFAULT_TESSELATION) => {
        // TODO: Add THREE disk
        // let disk = BABYLON.Mesh.CreateDisc(Utils.generate_name('Disk'), radius, tesselation, scene, false, side);

        // Default is facing down
        // model.rotation.x = Math.PI / 2;

        // return disk;
    },

    ground: (scene, width, height, divisions = 2) => {
        // TODO: Add THREE ground
        // return BABYLON.Mesh.CreateGround(Utils.generate_name('Ground'), width, height, divisions, scene);
    }
};

export default {
    ...createBasic,
    ...createObject,
    ...createCombined
}
