import * as React from 'react';
import AppStyles, { colors } from '../AppStyles';
import { ButtonStrip, Select, Button } from './Shared'
import { onInitSession, onShowModal } from './uiManager/Thunks';
import { Difficulty, Modal } from '../enum';
import Help from './views/Help';
const boot = require('../assets/audio/intro.mp3')

interface Props {
    
}

export default class Login extends React.Component<Props> {

    state = { transitionState: 0, audio: new Audio(boot) }

    componentDidMount(){
        // this.state.audio.loop = true
        // this.state.audio.play()
    }

    componentWillUnmount(){
        this.state.audio.pause()
    }

    render(){
        return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div>
                <div style={{backgroundSize:'cover', width:'800px', height:'800px'}}>
                    <h3 style={{fontFamily:'Arcology', fontSize:'75px', paddingTop:'50%', paddingLeft:'10px'}}>VIROTRON</h3>
                    <div style={{padding:'10px'}}>
                        <div style={{marginBottom:'10px'}}>
                        {ButtonStrip([
                            {text: 'Short', handler: ()=>{onInitSession(Difficulty.EASY)}, active: false},
                            {text: 'Medium', handler: ()=>{onInitSession(Difficulty.MEDIUM)}, active: false},
                            {text: 'Endless', handler: ()=>{onInitSession(Difficulty.HARD)}, active: false},
                        ])}
                        </div>
                        
                        {/* <div style={{marginTop:'100px'}}>
                        {ButtonStrip([
                            {text: 'UNDUKU?', handler: ()=>onShowModal(Modal.HELP), active: false}
                        ])}
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
        )
    }
}