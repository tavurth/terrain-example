'use strict';

import React from 'react'
import ReactDOM from 'react-dom'

import './index.scss'

export default class CanvasEngine extends React.Component {

    constructor(props) {
        super(props);

        this.properties = {};
        this.properties.id         = this.props.id;
        this.properties.width      = this.props.width  || 1024;
        this.properties.height     = this.props.height || 768;
        this.properties.className  = "render-canvas " + (this.props.class || '');
    }

    componentDidMount() {

        // Get the reference to the active canvas
        let canvas = ReactDOM.findDOMNode(this);

        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    render() {
        // Setup the ReactDOM canvas, using our props
        return (
            <canvas {...this.properties}>
                {/* Included here is our default text for when the browser does not support canvas */}
                {/*Your browser does not support HTML5 Canvas*/}
            </canvas>
        );
    }
}
