"use strict";

import Options from './Options'

let rand = `
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
`;

/**
   heightChunks is an array of 9 textures which form around the camera's location

   T₁  T₁  T₁  T₁  T₁

   T₁  T₀  T₀  T₀  T₁

   T₁  T₀  C   T₀  T₁

   T₁  T₀  T₀  T₀  T₁

   T₁  T₁  T₁  T₁  T₁

   When the camera position approaches the top right T₀,
   t₁s from the upper right sides are loaded and the array
   of heightChunks is shifted up and to the right,
   thus streaming the terrain (Can be from the server or
   generated in another shader)

   Bottom left T₀ is classified as the

   WorldTextureSize = 2048
   WorldTextureChunk = 1024
   chunkOffset ranges = [ -4 ... 4 ] (Camera position is [0])

   Let's assume we've already got the chunks loaded onto the GPU as textures,
   as this is handled by Terrain.jsx

 **/
let getUv =
    //
    // /**
    //  * Returns a reference to the current chunk of the vPosition
    //  */
    // vec4 getChunkDiffuse(sampler2D chunks, vec3 p) {
    //     // Useful
    //     float chunk     = 1. / WorldTextureChunk;
    //     float halfChunk = chunk / 2.;
    //
    //     // Calculate the world position of this pixel
    //     vec2  worldUv   = vPosition / WorldTextureSize;
    //
    //     vec2 TRChunkUv  = floor(worldUv / chunk) * chunk  + chunk;
    //     vec2 BLChunkUv  = TRChunkUv + chunk * 2.;
    //
    //     // Calculate the exact pixel position inside the chunk array
    //     vec2 chunkRange = TRChunkUv - BLChunkUv;
    //     vec2 chunkUv    = (worldUv - BLChunkUv) / chunkRange;
    //
    //     if (chunkUv.x < 0.5 - halfChunk) {
    //
    //         // Bottom left chunk
    //         if (chunkUv.y < 0.5 - halfChunk) {
    //             return texture2D(chunks[0], chunkUv * chunkRange);
    //         }
    //
    //         // Center left chunk
    //         else if (chunkUv.y < 0.5 + halfChunk) {
    //             return texture2D(chunks[3], (chunkUv - 0.5) * chunkRange);
    //         }
    //
    //         // Top left chunk
    //         else {
    //             return texture2D(chunks[6], (chunkUv - 0.5 + halfChunk) * chunkRange);
    //         }
    //     }
    //
    //     // Right side chunks
    //     else if (chunkUv.x > 0.5 + halfChunk) {
    //
    //         // Bottom right chunk
    //         if (chunkUv.y < 0.5 - halfChunk) {
    //             return texture2D(chunks[2], chunkUv);
    //         }
    //
    //         // Middle right chunk
    //         else if (chunkUv.y < 0.5 + halfChunk) {
    //             return texture2D(chunks[5], chunkUv);
    //         }
    //
    //         // Top right chunk
    //         else {
    //             return texture2D(chunks[8], chunkUv);
    //         }
    //     }
    //
    //     else {
    //         // Bottom center chunk
    //         if (chunkUv.y < 0.5 - halfChunk) {
    //             return texture2D(chunks[1], chunkUv);
    //         }
    //
    //         // Middle center chunk
    //         else if (chunkUv.x < 0.5 + halfChunk) {
    //             return texture2D(chunks[4], chunkUv);
    //         }
    //
    //         // Top center chunk
    //         else {
    //             return texture2D(chunks[7], chunkUv);
    //         }
    //     }
    // }
    `
/**
 * Returns the UV coordinates of the current vertex position
 * vec3 p => The translated position of the current vertex
 */
vec2 getUv(vec3 p) {

    float u = (p.x + nodePosition.x) / WORLD_SIZE_Y;
    float v = (p.y + nodePosition.y) / WORLD_SIZE_X;

    return vec2(u, v);
}
`;

let getElevation = `

/**
 *  Returns the height at our current vertex position
 *
 *  sampler2D sample => The texture from which to sample height data
 *  vec3 p           => The translated position of the current vertex
 */
float getElevation(sampler2D sample, vec3 p) {
    vec2 uv = getUv(p);
    vec4 d  = texture2D(sample, uv);

    return ((d.x + d.y + d.z) / (3.0 * 1.)) * ELEVATION;
}
`;

let getPosition = `
/**
 * Translates the current vertex coordinates into our terrain space
 * vec3 cPosition => Current camera position
 *                   This is required to keep the detail center at the camera coordinates
 *                   and as we will mutate the mesh, to keep the terrain from flickering
 */
vec3 getPosition(vec3 cPosition) {
    _vPosition  = position;

    // Scale by the size of this NODE
    _vPosition *= nodeScale;
    // _vPosition += nodePosition;

    // Translate by camera and NODE coordinates
    _vPosition   += cPosition;

    _vPosition.z = 0.;

    return _vPosition;
}
`;

let rawShader = ``;`
// precision highp int;
// precision highp float;
//
// // #define SHADER_NAME TerrainShaderMaterial
//
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// `;

let vShader = rawShader + `
// attribute vec2 uv;
// attribute vec3 position;

uniform sampler2D  texture;
uniform sampler2D  heightmap;

#define CLIP_UP 1
#define CLIP_DN 2
#define CLIP_LT 4
#define CLIP_RT 8

uniform vec3       cPosition;
uniform int        nodeEdge;
uniform float      nodeScale;
uniform vec3       nodePosition;
uniform float      nodeTesselation;


// Share these as required to fragmentshader
vec3  _vPosition;
float _vElevation;
float _vClipFactor;

/**
 * Returns true or false if the current nodeEdge matches the passed edge bitmask
 *
 * int edge => Bitmask edge to be checked against current nodeEdge
 */
bool clipSideMatches(int edge) {
    int e = nodeEdge / edge;
    return 2 * ( e / 2 ) != e;
}

/**
 * Returns a flaoting point value of the distance of
 * the current vertex from the edge of the current NODE mesh
 * vec2 p => UV coordinates of the current vertex
 */
float getClip(vec2 p) {
    float clip;
    float toReturn = 0.0;

    if (clipSideMatches(CLIP_RT) && p.x >= 1. - CLIP_EDGE) {
        clip     = 1.0 - clamp((1.0 - p.x) / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }
    if (clipSideMatches(CLIP_UP) && p.y >= 1. - CLIP_EDGE) {
        clip     = 1.0 - clamp((1.0 - p.y) / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }
    if (clipSideMatches(CLIP_LT) && p.x <= CLIP_EDGE) {
        clip     = 1.0 - clamp(p.x / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }
    if (clipSideMatches(CLIP_DN) && p.y <= CLIP_EDGE) {
        clip     = 1.0 - clamp(p.y / CLIP_EDGE, 0.0, 1.0);
        toReturn = max(clip, toReturn);
    }

    return toReturn;
}

/**
 * Returns a correct clipped position of a vertex
 * This is required because we will mutate vertices at the edge of each NODE to align
 * with a lower detail NODE's tesselation level
 *
 * vec3 p => Current translated vertex coordinates
 */
vec3 clipSides(vec3 p) {
    _vClipFactor = getClip(uv);

    float grid = nodeScale / nodeTesselation;
    p = floor(p / grid) * grid;

    // We're not currently close to an nodeEdge
    // nodeEdges are defined by a doubling of nodeScale for the same nodeTesselation
    if (_vClipFactor <= 0.01) {
        return p;
    }

    // Debugging
    // Lower the resolution of the grid, as we're moving to a
    // larger node from a smaller node
    grid *= 2.;
    vec3 p2 = floor(p / grid) * grid;

    // Linearly interpolate the low-poly and high-poly vertices,
    // depending on clipping factor, which is the distance between
    // the two parent meshes
    return mix(p, p2, _vClipFactor);
}
`
            + rand
            + getUv
            + getElevation
            + getPosition
            + `

/**
 * Initialize variables, translating the vertex position and calculating elevation
 * This function should be called at the beginning of your vertex shader
 */
void initialize() {
    _vPosition = clipSides(getPosition(cPosition));
    _vElevation = getElevation(heightmap, _vPosition);

    _vPosition.z = _vElevation;
}
`;

// precision highp int;
// precision highp float;

let fShader = rawShader + `
uniform sampler2D  texture;
uniform sampler2D  heightmap;
uniform vec3       nodePosition;
`
            + rand
            + getUv
            + getElevation;


let defaultVShader = `

varying vec3 currentVertexPosition;
void main() {
    // Required by Terrain
    // Calling this initializes our parameters
    initialize();

    currentVertexPosition = _vPosition;

    // Output the position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(_vPosition, 1.);
}
`;

let defaultFShader = `

varying vec3 currentVertexPosition;
void main() {
    vec2 vUv = getUv(currentVertexPosition);
    // gl_FragColor = texture2D(heightmap, vUv);
    gl_FragColor = vec4(1.0); // vec4(vUv.x, vUv.y, vUv.x + vUv.y, 1.);
}
`;

function buildShader(includes, defaultShader, userShader) {
    return (userShader) ? includes + userShader : includes + defaultShader;
}

export default class TerrainShaderMaterial extends THREE.ShaderMaterial {
    constructor(node) {

        // We're cloning the material
        if (! node) {
            return super();
        }

        let shaderOptions = {
            ...node
        };

        // Uniforms change on each node, and will be updated when we clone this shader
        shaderOptions.uniforms = TerrainShaderMaterial.setupUniforms(node);

        // Definitions do not change during the execution of our program
        // Allow the user to insert their own definitions here
        shaderOptions.defines = TerrainShaderMaterial.setupDefines(node);

        // Build a shader or use a default shader
        shaderOptions.vertexShader   = buildShader(vShader, defaultVShader, node.vertexShader);
        shaderOptions.fragmentShader = buildShader(fShader, defaultFShader, node.fragmentShader);

        super(shaderOptions);

        // For debugging
        this.type = 'TerrainShaderMaterial';
    }

    static setupUniforms(node) {

        let texture, heightmap;

        node.uniforms = {
            // ...node.uniforms,
            texture:      { type: 't',  value: node.texture },
            heightmap:    { type: 't',  value: node.heightmap },
            nodeEdge:     { type: 'i',  value: node.edge },
            cPosition:    { type: 'v3', value: node.cPosition },
            nodeScale:    { type: 'f',  value: node.uniforms.nodeScale },
            nodePosition: { type: 'v3', value: node.uniforms.nodePosition },
        }

        if (node.uniforms && node.uniforms.texture)
            texture = node.uniforms.texture.texture || node.uniforms.texture;

        if (node.uniforms.heightmap)
            heightmap = node.uniforms.heightmap.texture || node.uniforms.heightmap;

        // Build the uniforms object with default values and user values
        return {
            ...node.uniforms,
            texture:      { type: 't',  value: texture },
            heightmap:    { type: 't',  value: heightmap },
            nodeEdge:     { type: 'i',  value: node.uniforms.nodeEdge },
            cPosition:    { type: 'v3', value: node.uniforms.cPosition },
            nodeScale:    { type: 'f',  value: node.uniforms.nodeScale },
            nodePosition: { type: 'v3', value: node.uniforms.nodePosition },
        }
    }

    static setupDefines(node) {

        // Prevent errors if we've already loded the shader
        String.prototype.toFixed = function() { return this };

        // throw node;
        return {
            ...node.defines,
            CLIP_EDGE:     node.defines.CLIP_EDGE.toFixed(1),
            ELEVATION:     node.defines.ELEVATION.toFixed(1),
            TESSELATION:   node.defines.TESSELATION.toFixed(0),
            WORLD_SIZE_X:  node.defines.WORLD_SIZE_X.toFixed(1),
            WORLD_SIZE_Y:  node.defines.WORLD_SIZE_Y.toFixed(1),
            VIEWPORT_SIZE: node.defines.VIEWPORT_SIZE.toFixed(1),
        };
    }

    clone(node) {

        let newShader = super.clone();

        // TerrainShaderMaterial.setupUniforms(node);
        newShader.uniforms = {
            ...newShader.uniforms,
            ...TerrainShaderMaterial.setupUniforms(node),
        }

        return newShader;
    }
}
