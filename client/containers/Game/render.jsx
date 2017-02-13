"use strict"

import Engine from 'modules/Engine'

let init = () => {

    let group = Engine.group.get();

    // Individiual render frame
    function animate() {
        requestAnimationFrame(animate);

        group.camera.position.x += group.camera.velocity.x /= 1.15;
        group.camera.position.y += group.camera.velocity.y /= 1.15;

        // terrain2.animate(group.camera);

        group.render();
    }
    animate();
}

export default {
    init
};
