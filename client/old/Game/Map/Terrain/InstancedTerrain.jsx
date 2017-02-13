"use strict";

// Base imports
import Options from './Options'
import Texture from '../Texture'

// Used to correctly render the terrain model
import TerrainShaderMaterial from './InstancedTerrainShaderMaterial'

const LEFT   = 'LEFT';   // 1;
const RIGHT  = 'RIGHT';  // 2;
const TOP    = 'TOP';    // 3;
const BOTTOM = 'BOTTOM'; // 4;
const UPDATE_BOUNDING_SPHERES = 8 // Update bounding spheres every n frames to save CPU

class Terrain extends THREE.Object3D {
    constructor(options = {}) {

        // Call the THREE.Object3D constructor
        super();

        // Adding default options
        Options.defaults(options, {
            nLevels:        5,      // Number of rings of nodes to generate
            load:           true,   // Should we load immediately?
            wireframe:      false,  // Render nodes as wireframes

            // Definitions to be passed to fragment & vertex shaders
            defines: {
                CLIP_EDGE:      0.5,    // Border clipping (Gives a smoother transition between tesselation levels)
                ELEVATION:      200,    // Maximum elevation
                TESSELATION:    64,     // Tesselation of a single node
                WORLD_SIZE_X:   32768,  // Total scale of our world space
                WORLD_SIZE_Y:   32768,  // Total scale of our world space
                VIEWPORT_SIZE:  32768,  // Size of our Node-window onto the terrain
            },

            // Uniforms to be passed to fragment & vertex shaders
            uniforms: {
                texture:   false,
                heightmap: false,

            },

            // Material, will be built later from options.defines and options.uniforms,
            // but we can pass material specific options here also
            material: {
                wireframe: false,
            },

            // Send in progress loading functions
            onError:        (errorMessage) => {},
            onLoad:         (terrainObject) => {},
            onProgress:     (name, itemsLoaded, itemsTotal) => {},
            onStart:        (name, itemsLoaded, itemsTotal) => {},
        });

        if (! options.heightmap) {
            console.warn("You have not specified a heightmap texture, without this your terrain will be flat");
        }

        // Functions used to keep track of the loading process
        // Initialise these to receive callbacks
        this.onLoad     = options.onLoad;
        this.onError    = options.onError;
        this.onStart    = options.onStart;
        this.onProgress = options.onProgress;

        // Options used directly for terrain construction
        this.nLevels     = options.nLevels;

        // Save options to this terrain object
        this.defines     = options.defines;
        this.uniforms    = options.uniforms;
        this.material    = options.material;

        // Specified a delayed loading?
        if (options.load)
            this.load();
    }

    load() {
        // Setup a plane geometry which will be scaled for each of our nodes
        this.renderShader = false;
        // this.planeGeometry = new THREE.PlaneBufferGeometry(1, 1, this.tesselation, this.tesselation);
        // this.planeGeometry.computeBoundingSphere();
        // this.updateBoundingSpheres = UPDATE_BOUNDING_SPHERES;

        // Create the splay of nodes we'll use for this terrain mesh
        this.createSplay();

        // Save the heightmap data into an array for later queries
        // this.initializeHeightmap().then(this.onLoad);
        this.onLoad();
    }

    createSplay() {

        // Each level of detail here represents one node in a splay around the player
        // Looking something like this
        //
        //      X
        //    X X X
        //  X X P X X
        //    X X X
        //      X
        //
        // Where P is the player, and each X away from P is doubled in scale and halfed in tesselation
        //

        let x, y;
        let level = 0;
        let detailLevels = [];
        let currentScale = this.defines.VIEWPORT_SIZE / Math.pow(2, this.nLevels);

        // Which side we will use for edge-morphing:
        let UP = 1;
        let DN = 2;
        let LT = 4;
        let RT = 8;

        // x-y start position
        let xSt = 0;
        let ySt = 0;

        // Building each node of the required quality
        let nodeId = 0;

        // Create the basic geometry to be instanced for each node
        this.geometry  = new THREE.InstancedBufferGeometry();
        this.geometry.addAttribute('position', new THREE.PlaneGeometry(1, 1, this.defines.TESSELATION, this.defines.TESSELATION).vertices);

        let currentNode;
        let numberInstances = this.nLevels * 12 + 4;
        let bufferScaleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(numberInstances * 2), 2);

        // Prepare to build a node from current parameters
        let addNode = (x, y, scale) => {

            let edge = 0;

            // Setting edge masks
            edge |= (x < xSt-scale) ? LT : (x > xSt ? RT : 0);
            edge |= (y < ySt-scale) ? DN : (y > ySt ? UP : 0);

            bufferScaleAttribute.array[x + (y * this.defines.TESSELATION)] = scale;

            // Incremental loading progress
            this.onProgress('Terrain/AddNodeToGeometry', nodeId++, detailLevels.length);
        };

        // Tell our caller that we're starting the load
        this.onStart('Terrain/CreateSplay', 0, detailLevels.length);

        // Add central nodes
        addNode(xSt,          ySt,         scale1);
        addNode(xSt,          ySt-scale1,  scale1);
        addNode(xSt-scale1,   ySt-scale1,  scale1);
        addNode(xSt-scale1,   ySt,         scale1);

        let loop = () => {
            while (++level <= this.nLevels) {

                // Build up the surrounding tiles
                for (x = xSt,     y = ySt;     x < xSt + 4; x++) { addNode(x, y, currentScale); }  // Bottom left to bottom right
                for (x = xSt + 4, y = ySt + 1; y < ySt + 4; y++) { addNode(x, y, currentScale); }  // Bottom right to Top right
                for (x = xSt + 4, y = ySt + 4; x > xSt;     x--) { addNode(x, y, currentScale); }  // Top right to top left
                for (x = xSt,     y = ySt + 3; y > ySt + 1; y--) { addNode(x, y, currentScale); }  // Top left to Bottom left

                currentScale *= 2;
            }
            // Give the loader time to render
            return setTimeout(loop, 0);
        }
        loop();
        throw bufferScaleAttribute;

        this.createGeometry()
    };

    /**
     * Node creation factory
     * Pass in options, get a single terrain node
     *
     * Terrain nodes are loosley bound together in the form of a splay
     * to create our spherical world.
     */
    addNodeToBuffer(node, bufferScaleAttribute) {
        bufferScaleAttribute[x + (y * this.defines.TESSELATION)] = node.scale;
    }

    createGeometry(nodeGeometries) {

    }

    animate(camera) {

        // this.position.z = - camera.position.z;
        this.position.x = camera.position.x / 2;
        this.position.y = camera.position.y / 2;

        // Only update the bounding spheres once every BOUNDING_SPHERE_UPDATE frames
        if (false && this.updateBoundingSpheres % UPDATE_BOUNDING_SPHERES == 0) {

            let nI     = this.children.length;

            while (nI--) {
                this.children[nI].geometry.boundingSphere.center.copy(this.position);
            }
            this.updateBoundingSpheres = 0;
        }

        this.updateBoundingSpheres++;
    }

    /**
     * Initialise the internal representation of our heightmap.
     * You will find this useful later when you want to get the elevation at specific coordinates
     */
    initializeHeightmap() {
        if (! this.heightmap) {
            return;
        }
        let heightmap, tempCanvas, tempContext, heightData;

        // Get the real location of the height information
        heightmap = this.heightmap.image || this.heightmap.texture || this.heightmap;

        // Create a temp canvas of the width and height, we'll write here to then retrieve the data
        tempCanvas = document.createElement('canvas');
        tempCanvas.width  = heightmap.width;
        tempCanvas.height = heightmap.height;

        // Used to keep track of the loading progress
        let progressPct = 100;
        this.onStart('Terrain/CreateHeightmap', 0, heightmap.width * heightmap.height * 4);

        // draw the image onto the canvas
        tempContext = tempCanvas.getContext("2d");
        tempContext.drawImage(heightmap, 0, 0, heightmap.width, heightmap.height);

        // copy the contents of the canvas
        heightData = tempContext.getImageData(0, 0, heightmap.width, heightmap.height);

        // Extract the pixel data count (RGB or RGBA)
        let rgbCount = (heightData.data.length / (heightData.width * heightData.height));

        let x, y, elev, rgb, pos = 0, toPush = [];

        // First fill the width with new 2D array
        this.heightData = new Array(heightData.width * heightData.height);

        x   = 0;
        y   = heightData.height - 1;
        pos = 0;

        return new Promise((res, rej) => {
            // TODO: Look at performance bonus for de-increment loop
            // We'll use a incrementing while loops to speed things up a bit
            let loop = () => {
                while (pos < heightData.data.length - 1) {
                    rgb  = 3;
                    elev = 0;

                    // Add that pixel (x-y-coord) to the current pixel store
                    elev += heightData.data[pos++];
                    elev += heightData.data[pos++];
                    elev += heightData.data[pos++];

                    // Skip the next alpha channel
                    pos++;

                    this.heightData[x + (y * heightData.width)] = (elev / 765.) * this.elevation;

                    // We've reached the edge of the image
                    if (++x >= heightData.width) {
                        x = 0;
                        y--;

                        // Incremental loading progress for loading screens
                        if (pos % progressPct == 0) {
                            this.onProgress('Terrain/CreateHeightmap', pos, heightData.data.length);

                            // Add a timeout so that we render a frame of progress
                            return setTimeout(loop, 0);
                        }
                    }
                }

                // Finished loading
                res();
            }

            // Start the load-loop
            loop();
        });
    }

    getElevation(x, y) {

        let xPos = Math.floor((x / this.worldSizeX) * this.heightData.length);
        let yPos = Math.floor((y / this.worldSizeY) * this.heightData[0].length);

        // We'll just attempt to get the current position as elevation
        // If we fail, due to texture wrapping, don't let the caller see heights
        try {
            return this.heightData[xPos][yPos];

        } catch(err) {

            // Somehow, we've wrapped outside the map
            return 0;
        }
    }

    dispose(ofTextures = true) {
        this.children.map(node => {
            node.geometry.dispose();
            node.material.dispose();
        });

        if (ofTextures) {
            let uniform;

            // Loop through the uniforms and check for textures to dispose of
            Object.keys(this.renderShader.uniforms).map(key => {
                uniform = this.renderShader.uniforms[key];

                // Check only for texture types
                if (uniform.type == 't') {
                    if (uniform.value instanceof THREE.Texture)
                        uniform.value.dispose();
                }
            })
        }

        this.renderShader.dispose();
        this.planeGeometry.dispose();
    }
};

export default Terrain;
