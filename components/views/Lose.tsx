import * as React from 'react'
import AppStyles from '../../AppStyles';
import { TopBar, Button, Icon, NumericInput, LightButton } from '../Shared'
import { onReset } from '../uiManager/Thunks';
import { store } from '../../App';


export default class Lose extends React.PureComponent {

    render(){
        return (
            <div style={{...AppStyles.modal, height:'100px', width:'550px', justifyContent:'space-between', backgroundSize:'cover'}}>
                <h2>{store.getState().text}</h2>
                <div>{Button(true, onReset, 'END')}</div>
            </div>
        )
    }
}
