"use strict";

import { Object3D, RawShaderMaterial } from 'three'

let preVertex = `
precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec2 uv;
attribute vec3 normal;
attribute vec3 position;
`;

let preFragment = `
precision highp float;
`;

export default class BaseShader extends Object3D {

    vShader = '';
    fShader = '';

    defines = {};
    uniforms = {};
    extensions = {};

    material = false;

    constructor(options = {}) {
        super();
    }

    setup(options = {}) {
        this.material = new RawShaderMaterial({
            vertexShader: preVertex + this.vShader,
            fragmentShader: preFragment + this.fShader,
            uniforms: this.uniforms,
            defines: this.defines,
            extensions: this.extensions,
            ...options
        });
    }
}
