"use strict"

import React from 'react'
import { connect } from 'react-redux'
import FlatButton from 'material-ui/FlatButton';

import Game from 'containers/Game'

import './index.scss'

class Splash extends React.Component {
    constructor(props) {
        super(props);

    }

    selectQuality(setting) {
        this.props.dispatch({
            splash: false,
            type: 'loader'
        });

        Game.start('main-render-canvas', setting);
    }

    render() {
        let qualitySettings = [
            'ultra-low', 'low', 'medium', 'high', 'very-high'
        ];

        let hasSplash = (
            <div className='full-size splash-screen'>
                <div>
                    <h2>Quality level</h2>
                    <div id='quality-levels'>
                        {
                            qualitySettings.map((setting, id) => {
                                return (<FlatButton
                                            default={true}
                                            key={setting + '-quality-setting'}
                                            onTouchTap={() => this.selectQuality(setting)}
                                        >{setting}</FlatButton>)
                            })
                        }
                    </div>
                </div>
            </div>
        );

        return this.props.splash ? hasSplash : <div className='full-size'/>;
    }
}

// Mapping our state to props
let mapStateToProps = state => {
    return {
        splash: state.loader.splash,
    }
};

export default connect(mapStateToProps)(Splash);
