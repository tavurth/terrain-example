"use strict"

/**
 * Wraps the node to a sphere, and assigns UV coordinates
 */
function wrapToSphere(mesh, radius)  {

    let center = new THREE.Vector3(0,0,-radius);

    // Normalize and multiply by the sphere's radius
    mesh.geometry.vertices.map((vert, vertIdx) => {
        vert.add(mesh.position).sub(center).normalize().multiplyScalar(radius).sub(mesh.position);
    });

    mesh.geometry.computeVertexNormals();
    mesh.geometry.verticesNeedUpdate = true;
}

export default {
    wrapToSphere
}
