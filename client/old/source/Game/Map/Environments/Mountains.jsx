let vShader = `

varying vec3  vPosition;
varying float vDistance;
varying float vElevation;
varying float vClipFactor;

void main() {
    initialize();

    vPosition   = _vPosition;
    vElevation  = _vElevation;
    vClipFactor = _vClipFactor;
    vDistance    = distance(vec3(0.), position * nodeScale + nodePosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(_vPosition, 1.);
}
`;

import Noise from '../Noise/Noise'
let fShader = Noise('classic2D') + `

varying vec3  vPosition;
varying float vDistance;
varying float vElevation;
varying float vClipFactor;

uniform vec3  light;
uniform float nodeScale;
uniform float snowLevel;
uniform float stoneLevel;
uniform float grassLevel;
uniform float waterLevel;
uniform float elevation;

uniform vec3  cPosition;
uniform float nodeTesselation;

uniform sampler2D grass01;
uniform sampler2D stone01;

vec3 multisample(sampler2D toSample, vec2 uv) {
    vec3 diffuse;
    diffuse = texture2D(toSample, uv).rgb;
    diffuse = mix(diffuse, texture2D(toSample, uv * 10.).rgb, 0.5);
    diffuse = mix(diffuse, texture2D(toSample, uv * 100.).rgb, 0.5);

    return diffuse;
}

vec3 getNormal2(bool invert) {
    float vDelta = nodeScale / (nodeTesselation / (1. + vClipFactor));

    vec3 p0 = vPosition;
    vec3 p1 = vPosition + vec3(0.,  vDelta, 0.);
    vec3 p2 = vPosition + vec3(-vDelta, 0., 0.);

    // Now get the height at those points
    p1.z = getElevation(heightmap, p1);
    p2.z = getElevation(heightmap, p2);

    return invert ? normalize(cross(p1 - p0, p2 - p0)) : normalize(cross(p2 - p0, p1 - p0));
}

void main() {

    vec2 vUv    = getUv(vPosition);

    bool useNoise = true;

    // Random elements
    vec3 noise1 = useNoise ? vec3(cnoise(vUv * 5000.)) : vec3(0.0);
    vec3 noise3 = useNoise ? vec3(cnoise(vUv * 50000.)): vec3(0.0);

    noise1 = mix(noise1, vec3(0.), smoothstep(VIEWPORT_SIZE / 64., VIEWPORT_SIZE / 4., vDistance));
    noise3 = mix(noise3, vec3(0.), smoothstep(VIEWPORT_SIZE / 64., VIEWPORT_SIZE / 4., vDistance));

    vec3 normal = getNormal2(true);

    // Colors and materials
    vec3 snow   = vec3(0.9, 0.9, 1.0);
    vec3 water  = vec3(0.1, 0.2, 0.4);

    vec3 stone  = multisample(stone01, vUv);
    stone = mix(stone, mix(noise1, noise3, 0.2), 0.4);

    vec3 grass  = multisample(grass01, vUv);
    grass = mix(grass, noise3 / 2. + noise1 / 100., 0.2);

    vec3 diffuse = stone;

    // Mix sandy grass
    diffuse = mix(diffuse, mix(grass, vec3(0.4,0.3,0.01), 0.3), smoothstep(waterLevel, grassLevel-0.08, vElevation));

    // Mix grass
    diffuse = mix(diffuse, grass, smoothstep(grassLevel-0.08, grassLevel, vElevation));

    // Mix stone
    diffuse = mix(diffuse, stone, smoothstep(grassLevel, stoneLevel, vElevation));

    // Mix in snow
    // Caclulate the amount of snow sticking to slopes
    diffuse = mix(diffuse, snow, smoothstep(snowLevel, snowLevel * 1.4, vElevation) * smoothstep(0.6, 0.8, normal.z));

    // Add the point light
    normal = getNormal2(false) + noise1 / 100.;
    float incidence = dot(normalize(vPosition - light), normal);
    incidence = clamp(incidence, 0., 1.);
    diffuse = mix(mix(vec3(0.1), diffuse, 0.3), diffuse * 1.4, incidence);

    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogAmount = smoothstep(WORLD_SIZE_X / 1.8 * (vElevation / elevation), WORLD_SIZE_X / 1.4, depth);
    diffuse = mix(diffuse, vec3(0.5, 0.6, 0.95), fogAmount);

    // diffuse.rg = mix(diffuse.rg, floor(vUv / 0.05) * 0.05, 0.8);
    gl_FragColor = vec4(diffuse, 1.);
}
`;

export default function(terrainData, textures) {

    let light = [0,0,0];
    let elevation = terrainData.elevation;

    console.log(elevation);
    return {
        material: {
            extensions: {
                derivatives: true
            },
            uniforms: {
                light:        { type: 'v3', value: light },
                elevation:    { type: 'f',  value: elevation },
                grass01:      { type: 't',  value: textures['grass01'] },
                stone01:      { type: 't',  value: textures['stone01'] },
                snowLevel:    { type: 'f',  value: elevation * 0.18 },
                stoneLevel:   { type: 'f',  value: elevation * 0.35 },
                grassLevel:   { type: 'f',  value: elevation * 0.18 },
                waterLevel:   { type: 'f',  value: elevation * 0.09 },
            },
            vertexShader: vShader,
            fragmentShader: fShader
        }
    }
}
