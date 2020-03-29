import { UIReducerActions, Difficulty } from '../../enum'

const appReducer = (state = getInitialState(), action:any):RState => {
    switch (action.type) {
        case UIReducerActions.NEW_SESSION:
            return { ...state, engineEvent: null, difficulty: action.difficulty}
        case UIReducerActions.SHOW_MODAL: 
            return { ...state, modal: action.modal, engineEvent:null }
        case UIReducerActions.HIDE_MODAL: 
            return { ...state, modal: null, engineEvent:null }
        case UIReducerActions.RESET:
            return getInitialState()
        default:
            return state
    }
};

export default appReducer;

const getInitialState = ():RState => {
    return {
       modal: null,
       engineEvent: null,
       difficulty: null
    }
}