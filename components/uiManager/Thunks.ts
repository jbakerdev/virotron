import { UIReducerActions, Modal, Difficulty } from '../../enum'
import { getNewPlayer } from '../Util';
import { dispatch } from '../../App';

// export const onQuit = () => {
//     ipcRenderer.send('close')
//     dispatch({
//         type: UIReducerActions.QUIT
//     })
// }

export const onReset = () => {
    dispatch({
        type: UIReducerActions.RESET
    })
}

export const onShowModal = (modal:Modal) => {
    dispatch({
        type: UIReducerActions.SHOW_MODAL,
        modal
    })
}

export const onUpdateNPCs = (npcs:Array<PlayerState>) => {
    dispatch({
        type: UIReducerActions.UPDATE_NPCS,
        npcs
    })
}

export const onLose = () => {
    dispatch({
        type: UIReducerActions.LOSE
    })
}

export const onWin = () => {
    dispatch({
        type: UIReducerActions.WIN
    })
}

export const onUpdateActivePlayer = (playerId:string, roll:number) => {
    dispatch({
        type: UIReducerActions.UPDATE_ACTIVE,
        playerId,
        roll
    })
}

export const onUpdatePlayer = (player:PlayerState) => {
    dispatch({
        type: UIReducerActions.UPDATE_PLAYER,
        player
    })
}

export const onHideModal = () => {
    dispatch({
        type: UIReducerActions.HIDE_MODAL,
    })
}

export const onInitSession = (difficulty:Difficulty) => {
    dispatch({ type: UIReducerActions.NEW_SESSION })
}