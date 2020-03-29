import * as React from 'react'
import AppStyles from '../../AppStyles';
import Viewscreen from './Viewscreen'
import { TopBar, Button, LightButton, RangeInput, Icon, ProgressBar } from '../Shared'
import { Modal } from '../../enum';
import Lose from '../views/Lose';
import Win from '../views/Win';

interface Props {
    modal:Modal
}

export default class ViewscreenFrame extends React.Component<Props> {

    render(){
        return (
                <div style={{position:'relative', padding:'17px', backgroundImage:'url('+require('../../assets/ui/cheetex_bones.png')+')', backgroundColor:'magenta', backgroundBlendMode:'darken'}}>
                    <Viewscreen {...this.props} />
                    {this.props.modal === Modal.LOSE && <Lose/>}
                    {this.props.modal === Modal.WIN && <Win/>}
                </div>
        )
    }
}