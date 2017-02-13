"use strict";

function wrapToSphere(mesh, center, radius) {
    mesh.geometry.faceVertexUvs = [[]];
    mesh.geometry.computeVertexNormals();

    let uvs, verts, n, twoPI = Math.PI * 2;
    mesh.geometry.faces.map((face, faceIdx) => {

        uvs = [];
        verts = [
            mesh.geometry.vertices[face.a],
            mesh.geometry.vertices[face.b],
            mesh.geometry.vertices[face.c],
        ];

        verts.map((vert, vertIdx) => {
            n = vert.clone().
                     normalize();

            uvs.push(new THREE.Vector2(
                (Math.atan2(n.x, n.z) / twoPI + 0.5),
                n.y * -0.5 + 0.5
            ));
        });
        mesh.geometry.faceVertexUvs[0].push(uvs);
    });
    mesh.geometry.uvsNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
};

export default {
    wrapToSphere
};
