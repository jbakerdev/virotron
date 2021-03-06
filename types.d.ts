declare enum Difficulty {
    EASY='easy',
    MEDIUM='medium',
    HARD='hard'
}

declare enum UIReducerActions { 
    HIDE_MODAL='hmdl',
    SHOW_MODAL='smdl',
    QUIT='qg',
    NEW_SESSION='ngms',
    TICK='t',
    UPDATE_NPCS='uplay',
    LOSE= 'loose',
    WIN='win',
    RESET='reset',
    UPDATE_SELECTED='uslel',
    UPDATE_ACTIVE='uact',
    UPDATE_PLAYER='upl'
}

declare enum Modal {
    HELP='halp',
    LOSE='lose',
    WIN='win'
}

declare enum Kind {
    PLANT, ANIMAL, MINERAL
}

interface Asset {
    key: string
    type: string
    resource: any
    data?: any
}

interface Item {
    id:string
    createdWithIds: Array<string>
    assetIndex: number
    kind: Kind
}

interface PlayerState {
    id:string
    unlockedItems: Array<Item>
}

interface Tuple {
    tileX: number
    tileY: number
}

interface RState {
    engineEvent: UIReducerActions
    modal: Modal
}