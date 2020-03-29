export enum UIReducerActions { 
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

export const StaticLayers = [
    'base', 'tiles'
]

export enum Difficulty {
    EASY='easy',
    MEDIUM='medium',
    HARD='hard'
}

export enum Activities {
    WORK='work',
    ENTER='entertainment',
    SLEEP='sleep',
    FOOD='food'
}

export enum Modal {
    HELP='halp',
    LOSE='lose',
    WIN='win'
}

export const StationOffsets = {
    [Activities.FOOD]: {x:-16, y:0},
    [Activities.ENTER]: {x:0, y:30},
    [Activities.SLEEP]: {x:+16, y:16},
    [Activities.WORK]: {x:0,y:32}
}

export const Items = {

}