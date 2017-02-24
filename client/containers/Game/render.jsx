"use strict"

import Engine from 'modules/Engine'

let init = () => {

    let group = Engine.group.get();

    // Individiual render frame
    function animate() {
        requestAnimationFrame(animate);
        group.render();
    }
    animate();
}

export default {
    init
};
