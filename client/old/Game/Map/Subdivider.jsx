let Subdivider = function() {
};

// Applies the "modify" pattern
Subdivider.prototype.modify = function(geometry, start, stop) {

    if (typeof start == typeof stop == 'undefined')
        this.subdiv(geometry);

    else
        this.rangediv(geometry, start, stop);

    this.cleanup();
};

(function() {

    Subdivider.prototype.initialize = function(geometry) {
        geometry.toRemove = geometry.toRemove || {};
    };

    Subdivider.prototype.cleanup = function(geometry) {
        if (geometry.toRemove) {
            geometry.faces = geometry.faces.filter((face, i) => (! geometry.toRemove[i]));
            geometry.toRemove = {};
        }
        geometry.mergeVertices();
    };

    Subdivider.prototype.compute = function(geometry) {
        geometry.computeVertexNormals();
        geometry.computeFaceNormals();
    };

    Subdivider.prototype.smooth = function(geometry, size) {
        geometry.vertices.map(vert => {
            vert.normalize().multiplyScalar(size);
        });
        geometry.computeVertexNormals();
    };

    Subdivider.prototype.computeUvs = function(geometry, center) {

        geometry = geometry.geometry || geometry;

        // this.cleanup(geometry);
        // this.compute(geometry);
        geometry.faceVertexUvs[0] = [];

        const twoPI = Math.PI * 2;
        geometry.faces.map((face, faceIdx) => {

            let verts = [
                geometry.vertices[face.a],
                geometry.vertices[face.b],
                geometry.vertices[face.c],
            ];

            let faceUvs = [];

            geometry.faceVertexUvs[0].push(verts.map((vert, vertIdx) => {

                return new THREE.Vector2(
                    vert.x / 10000 + 0.5,
                    vert.y / 10000 + 0.5
                );

                // Converting the normal to cartesian coordinates based on the sphere size
                return new THREE.Vector2(

                    // Computing U
                    (

                        Math.atan2(
                            // Use our newly calculated normal
                            face.vertexNormals[vertIdx].x,
                            face.vertexNormals[vertIdx].z
                        ) / twoPI + 0.5
                    ),

                    // Computing V
                    (
                        face.vertexNormals[vertIdx].y * 0.5
                    ) + 0.5
                );
            }));
        });

        geometry.uvsNeedUpdate = true;
    };

    Subdivider.prototype.clipNormals = function(geometry, normal, similarity) {
        this.initialize(geometry);
        this.compute(geometry);

        geometry.faces.map((face, index) => {
            if (normal.dot(face.normal) < similarity)
                geometry.toRemove[index] = true;
        });

        this.compute(geometry);
        this.cleanup(geometry);
    };

    Subdivider.prototype.cleanEdges = function(geometry, center, distance) {
        // geometry.
    };

    Subdivider.prototype.splitNormal = function(geometry, normal, similarity) {
        geometry = geometry.geometry || geometry;

        this.compute(geometry);

        geometry.faces.map((face, index) => {
            if (normal.dot(face.normal) >= similarity) {
                this.splitIndex(geometry, index);
            }
        });

        this.cleanup(geometry);
        this.compute(geometry);
    };

    Subdivider.prototype.splitDistance = function(geometry, center, distance) {
        geometry = geometry.geometry || geometry;

        this.compute(geometry);

        geometry.faces.map((face, index) => {

            let splitType = 0;
            [face.a, face.b, face.c].map(vert => {
                if (center.distanceTo(geometry.vertices[vert]) <= distance) {
                    splitType++;
                }
            });
            if (splitType > 0)
                this.splitIndex(geometry, index, splitType);
        });

        this.cleanEdges(geometry, center, distance);

        this.cleanup(geometry);
        this.compute(geometry);
    };

    Subdivider.prototype.splitEdge = function(geometry, index) {
        let i1, i2, i3, a;

        this.initialize(geometry);

        i1 = geometry.faces[index].a;
        i2 = geometry.faces[index].b;
        i3 = geometry.faces[index].c;

        a = getNewVertex(i3, i2, [], geometry.vertices);
        geometry.faces.push(new THREE.Face3(i3, i2, a));

        geometry.toRemove[index] = true;
    };

    Subdivider.prototype.splitIndex = function(geometry, index, splitType) {
        let i1, i2, i3, a, b, c;

        this.initialize(geometry);

        i1 = geometry.faces[index].a;
        i2 = geometry.faces[index].b;
        i3 = geometry.faces[index].c;

        a = getNewVertex(i1, i2, [], geometry.vertices);
        b = getNewVertex(i2, i3, [], geometry.vertices);
        c = getNewVertex(i3, i1, [], geometry.vertices);

        if (splitType > 1) {
            geometry.faces.push(new THREE.Face3(i1, a, c));
            geometry.faces.push(new THREE.Face3(i2, b, a));
            geometry.faces.push(new THREE.Face3(i3, c, b));
            geometry.faces.push(new THREE.Face3(a,  b, c));

            geometry.toRemove[index] = true;
        }
        if (splitType < 1) {
            geometry.toRemove[index-2] = true;
        }
    };

    Subdivider.prototype.split = function(geometry) {
        geometry.faces.map((face, i) => {
            this.splitIndex(geometry, i);
        });
    };

    function getEdgeKey(i1, i2) {

        let vertexIndexA = Math.min(i1, i2);
        let vertexIndexB = Math.max(i1, i2);

        return vertexIndexA + "_" + vertexIndexB;
    }

    function getMiddle(pointA, pointB) {
        let middle = new THREE.Vector3();
        middle.subVectors(pointB.clone(), pointA.clone());
        middle.multiplyScalar(0.5);
        middle.subVectors(pointB.clone(), middle);
        return middle;
    }

    function getNewVertex(i1, i2, map, vertices) {
        let newIndex = vertices.length;

        let edgeKey = getEdgeKey(i1, i2);

        if (edgeKey in map) {
            return map[edgeKey];
        }

        // add new index
        map[edgeKey] = newIndex;

        // get the middle of the edge
        let middle = getMiddle(vertices[i1], vertices[i2]);

        vertices.push(middle);
        return newIndex;
    }
})();

export default Subdivider;
