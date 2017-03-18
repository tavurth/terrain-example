'use strict';

import React from 'react'
import { connect } from 'react-redux'

import Canvas from 'components/Canvas'
import Splash from 'containers/Splash'

class App extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className='full-size'>
                <Splash/>
                <Canvas id='main-render-canvas'/>
            </div>
        );
    }
}

export default connect()(App);
