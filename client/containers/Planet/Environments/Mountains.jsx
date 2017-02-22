import Engine from 'modules/Engine'

let vShader = `

varying vec2  vUv2;
varying vec3  vPosition;
varying float vDistance;
varying float vElevation;
varying float vClipFactor;

void main() {
    initialize();

    vUv2 = uv;
    vPosition    = _vPosition;
    vElevation   = _vElevation;
    vClipFactor  = _vClipFactor;
    vDistance    = distance(vec3(0., 0., cameraPosition.z / 2.), position * nodeScale + nodePosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(_vPosition, 1.);
}
`;

let fShader = Engine.noise('classic2D') + `

varying vec2 vUv2;
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

uniform sampler2D grass01;
uniform sampler2D stone01;

vec3 multisample(sampler2D toSample, vec2 uv) {
    vec3 diffuse;
    diffuse = texture2D(toSample, uv).rgb;
    diffuse = mix(diffuse, texture2D(toSample, uv * 10.).rgb, 0.5);
    diffuse = mix(diffuse, texture2D(toSample, uv * 100.).rgb, 0.5);

    return diffuse;
}

vec3 getNormal2() {
    float height = getElevation(heightmap, vPosition);
    vec3 p = vec3(vPosition.xy, height);
    vec3 dPositiondx = dFdx(p - 0.1) * TESSELATION;
    vec3 dPositiondy = dFdy(p + 0.1) * TESSELATION;

    // The normal is the cross product of the differentials
    return normalize(cross(dPositiondx, dPositiondy));
}

vec3 getNormal() {

    float vDelta = nodeScale / (TESSELATION / (1. + vClipFactor));

    vec3 vNormal = vec3(0., 0., 1.);
    vec3 p0 = vPosition;

    vec3 vDelta1 = vDelta * normalize(cross(vNormal.yzx, vNormal));
    vec3 vDelta2 = vDelta * normalize(cross(vDelta1, vNormal));

    vec3 p1 = vPosition + vDelta1;
    vec3 p2 = vPosition + vDelta2;

    // Now get the height at those points
    p0.z = getElevation(heightmap, p0);
    p1.z = getElevation(heightmap, p1);
    p2.z = getElevation(heightmap, p2);

    return normalize(cross(p2 - p0, p1 - p0));
}

void main() {

    vec2 vUv = getUv(vPosition);

    bool debug = false;
    bool useNoise = true;

    // Random elements
    vec3 noise1 = useNoise ? vec3(cnoise(vUv * 5000.)) : vec3(0.0);
    vec3 noise3 = useNoise ? vec3(cnoise(vUv * 50000.)): vec3(0.0);

    noise1 = mix(noise1, vec3(0.), smoothstep(VIEWPORT_SIZE / 64., VIEWPORT_SIZE / 16., vDistance));
    noise3 = mix(noise3, vec3(0.), smoothstep(VIEWPORT_SIZE / 64., VIEWPORT_SIZE / 16., vDistance));

    // Colors and materials
    vec3 snow   = vec3(0.9, 0.9, 1.0);
    vec3 water  = vec3(0.1, 0.2, 0.4);

    vec3 stone  = multisample(stone01, vUv);
    stone = mix(stone, mix(noise1, noise3, 0.2), 0.4);

    vec3 grass  = multisample(grass01, vUv);
    grass = mix(grass, noise3 / 2. + noise1 / 10., 0.2);

    vec3 diffuse = stone;

    // Mix grass
    diffuse = mix(diffuse, grass, smoothstep(waterLevel, grassLevel, vElevation));

    // Mix sandy grass
    diffuse = mix(diffuse, mix(grass, vec3(0.4,0.3,0.01), 0.3), smoothstep(stoneLevel-0.12, stoneLevel, vElevation));

    // Mix stone
    diffuse = mix(diffuse, stone, smoothstep(grassLevel, stoneLevel, vElevation));

    // Mix in snow
    // Caclulate the amount of snow sticking to slopes
    vec3 normal = getNormal();
    diffuse = mix(diffuse, snow, smoothstep(snowLevel, snowLevel * 1.4, vElevation) * smoothstep(0.8, 0.95, normal.z));

    // Add the point light
    normal = getNormal();
    float incidence = dot(normalize(light), normal);
    incidence = clamp(incidence, 0., 1.);
    diffuse = mix(mix(vec3(0.1), diffuse, 0.3), diffuse * 2.8, incidence);

    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogAmount = smoothstep(WORLD_SIZE_X / 1.8 * (vElevation / ELEVATION), WORLD_SIZE_X / 1.4, depth);
    diffuse = mix(diffuse, vec3(0.5, 0.6, 0.95), fogAmount);

    if (debug) {
        diffuse.r *= 1. + vClipFactor;

        if (vUv2.x < 0.01)
            diffuse.r *= 1. + (1.- 0.01 - vUv2.x);
        if (vUv2.y < 0.01)
            diffuse.r *= 1. + (1.- 0.01 - vUv2.y);
    }
    gl_FragColor = vec4(diffuse, 1.);
}
`;

export default function(terrainData, textures) {

    let elevation = parseInt(terrainData.defines.ELEVATION);

    return {
        material: {
            ...terrainData,
            extensions: {
                derivatives: true
            },
            uniforms: {
                snowLevel:    { type: 'f',  value: elevation * 0.28 },
                stoneLevel:   { type: 'f',  value: elevation * 0.35 },
                grassLevel:   { type: 'f',  value: elevation * 0.28 },
                waterLevel:   { type: 'f',  value: elevation * 0.00 },
                light:        { type: 'v3', value: terrainData.uniforms.light.position },
            },
            vertexShader: vShader,
            fragmentShader: fShader
        }
    }
}
