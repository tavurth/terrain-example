'use strict';

import { connect } from 'react-redux'

import './index.scss'

export default class CanvasEngine extends React.Component {

	constructor(props) {
		super(props);

		// Setup the ReactDOM canvas, using our props
		this.canvas =
			<div
				id={this.props.id}
				width={this.props.width || 1024}
				height={this.props.height || 768}
				className={"render-canvas " + (this.props.class || '')}
			>
				{/* Included here is our default text for when the browser does not support canvas */}
				{/*Your browser does not support HTML5 Canvas*/}
			</div>;
	}

	componentDidMount() {

		// Get the reference to the active canvas
		let canvas = ReactDOM.findDOMNode(this);

		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	render() {
		return this.canvas;
	}
}
