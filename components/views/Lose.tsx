import * as React from 'react'
import AppStyles from '../../AppStyles';
import { TopBar, Button, Icon, NumericInput, LightButton } from '../Shared'
import { onReset } from '../uiManager/Thunks';

interface Props{
}

export default class Lose extends React.PureComponent<Props> {

    render(){
        return (
            <div style={{...AppStyles.modal, height:'150px', width:'100px', justifyContent:'space-between', backgroundSize:'cover'}}>
                <h2 style={{color:'black'}}>YOU DIED</h2>
                <div>{Button(true, onReset, 'END')}</div>
            </div>
        )
    }
}
