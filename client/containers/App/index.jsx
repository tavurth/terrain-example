'use strict';

import React from 'react'
import { connect } from 'react-redux'

import Canvas from 'components/Canvas'
import Game from 'containers/Game'

class App extends React.Component {

	  constructor(props) {
		    super(props);

        this.id = 'main-render-canvas';
	  }

	  componentDidMount() {
		    Game.start(this.id);
	  }

	  render() {
		    return (
            {/* Our rendering context */},
			      <Canvas id={this.id}></Canvas>
		    )
	  }
}

export default connect()(App)
