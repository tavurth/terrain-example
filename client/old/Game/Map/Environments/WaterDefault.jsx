"use strict";

let vShaderWater = `

        varying vec2 vUv;
        void main() {

            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
        `;

let fShaderWater = Noise('classic2D') + `

        uniform vec2 muts;
        varying vec2 vUv;

        void main() {

            vec3 water = vec3(0.1, 0.3, .60);

            vec3 water1 = vec3(1.) * cnoise(vUv * 3000. + sin(muts.x * 2.));
            vec3 water2 = vec3(1.) * cnoise(vUv * 2000. + cos(muts.x * 2.));

            water = mix(water, water1, smoothstep(0.6, 0.8, water1));
            water = mix(water, water2, smoothstep(0.6, 0.8, water2));

            gl_FragColor = vec4(0.4, 0.5, 0.8, 0.5);
        }
        `;

export default function() {
    let muts = new THREE.Vector2(0, 0);
    let water = new THREE.Mesh(
        new THREE.PlaneGeometry(32786 * 8, 32786 * 8, 32, 32),
        new THREE.MeshPhongMaterial({
            opacity: 0.4,
            color: 0x3558a8,
            transparent: true,
            specular: 0xff0000,
            // vertexShader: vShaderWater,
            // fragmentShader: fShaderWater,
            // uniforms: { muts: { value: muts } },
        })
    );
    water.name = 'Water level'
    water.position.x = terrain.worldSize / 2;
    water.position.y = terrain.worldSize / 2;
    water.position.z = 570;

    return water;
}
