"use strict"

import Engine from 'modules/Engine'

let init = () => {

    let group = Engine.group.get();

    // Individiual render frame
    function animate() {
        requestAnimationFrame(animate);

        group.camera.position.x += group.camera.velocity.x /= 1.15;
        group.camera.position.y += group.camera.velocity.y /= 1.15;

        group.camera.rotation.z += group.camera.rVelocity.z /= 1.05;
        group.camera.rotation.y += group.camera.rVelocity.y /= 1.05;
        group.camera.rotation.x += group.camera.rVelocity.x /= 1.05;

        group.camera.position.y += 10;

        group.render();
    }
    animate();
}

export default {
    init
};
