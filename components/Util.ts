import * as v4 from 'uuid'
import { Difficulty, Activities } from '../enum';
import { Sprites } from '../assets/Assets';

export const getNewPlayer = () => {
    return {
        id:v4(),
        unlockedItems: []
    } as PlayerState
}

export const getEmoteSanity = (sanity:number) => {
    if(sanity > 225) return Sprites.grin
    if(sanity > 175) return Sprites.happy
    if(sanity > 125) return Sprites.unhappy
    if(sanity > 75) return Sprites.sad
    return Sprites.dead
}

export const getStationUsedText = (stationName:string) => {
    switch(stationName){
        case Activities.WORK: return "Already worked today"
        case Activities.SLEEP: return "Not tired"
        case Activities.FOOD: return "Not hungry"
        case Activities.ENTER: return "Just watched something"
    }
}