
let spherical = () => {
    let vertexShader = `

    varying vec2 vUv;
    varying float red;

    uniform float xPos;
    uniform float yPos;
    uniform float uScale;
    uniform float largest;
    uniform sampler2D texture;

    vec3 getHeight(vec2 vPosition, float grid) {
        vec4 diffuse = texture2D(texture, vPosition);
        float dSum   = diffuse.x + diffuse.y + diffuse.z;

        float rounded = floor(dSum * grid) / grid;

        return vec3(0.0); //rounded * grid * normal * 8.;
    }

    void main() {
        vUv = uv;
        vUv.x += xPos;
        vUv.y += yPos;
        red = -1.0;

        float ;
        float dMin, dMax = largest, grid = uScale;

        vec3 vPosition = position;
        vPosition.z = -1.;

        // Get the vertex distance from the center
        float distance = distance(position, vec3(0.,0.,0.));

        bool found = false;
        for (int i=0; i < 3; i++) {
            if (distance < dMax * 0.97) {
                dMax /= 2.0;
                grid /= 2.0;
            }
            else {
                if (distance < dMax * 1.09) {
                    red = 4.0;
                }

                vPosition    = floor(vPosition / grid) * grid;
                break;
            }
        }
        vPosition   += getHeight(vUv, grid);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
    }

    `;

    let fragmentShader = `

    varying vec2 vUv;
    varying float red;
    uniform sampler2D texture;
    void main () {
        gl_FragColor = red > 0. ? vec4(1.0, vec3(.0)) : vec4(1.0);//texture2D(texture, vUv);
    }
    `;

    let mat  = new THREE.ShaderMaterial({
        uniforms: {
            xPos: { value: 0 },
            yPos: { value: 0 },
            uScale: { value: 64 },
            texture: { value: tex },
            largest: { value: 6000 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        wireframe: true
    });
    let geo = new THREE.PlaneGeometry(16000, 16000, mat.uniforms.uScale.value, mat.uniforms.uScale.value);

    let sdiv = new Subdivider();

    let center = new THREE.Vector3(0,0,0);
    sdiv.splitDistance(geo, center, mat.uniforms.largest.value);
    sdiv.splitDistance(geo, center, mat.uniforms.largest.value / 2);
    sdiv.splitDistance(geo, center, mat.uniforms.largest.value / 4);
    sdiv.computeUvs(geo);
    geo.mergeVertices();

    /* console.log(tex);
     * mat = new THREE.MeshPhongMaterial({
     *     color: 0xffffff,
     *     texture: tex
     * });
     */
    let mesh = new THREE.Mesh(geo, mat);

    group.scene.add(mesh);

    group.register(() => {
        mat.uniforms.xPos.value = -(group.camera.velocity.x * 0.00002);
        mat.uniforms.yPos.value = group.camera.velocity.y * 0.00002;
    });

    return mesh;
};
