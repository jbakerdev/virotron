import * as React from 'react'
import AppStyles from '../../AppStyles';
import { onReset } from '../uiManager/Thunks';
import { Button } from '../Shared';

interface Props{
}

export default class Win extends React.PureComponent<Props> {

    render(){
        return (
            <div style={{...AppStyles.modal, height:'450px', justifyContent:'space-between', backgroundSize:'cover'}}>
                <h2 style={{color:'black'}}>WIN</h2>
                <div>{Button(true, onReset, 'PRAISE UNDUKU')}</div>
            </div>
        )
    }
}
