import * as React from 'react'
import AppStyles from '../../AppStyles';
import { onReset } from '../uiManager/Thunks';
import { Button } from '../Shared';
import { store } from '../../App';

export default class Win extends React.PureComponent {

    render(){
        return (
            <div style={{...AppStyles.modal, height:'100px', width:'350px', justifyContent:'space-between', backgroundSize:'cover'}}>
                <h2>YOU FLATTENED THE CURVE!</h2>
                <div>{Button(true, onReset, 'NEXT WAVE')}</div>
            </div>
        )
    }
}
