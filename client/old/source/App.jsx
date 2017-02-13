'use strict';

import { connect } from 'react-redux'

import Canvas from './Modules/Engine/Canvas/Canvas'
import Game from './Game/Game'

class App extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		Game.startLoading('Canvas01');
	}

	render() {
		return (
			<Canvas id="Canvas01" class="app-main">
			</Canvas>
		)
	}
}

export default connect()(App)
