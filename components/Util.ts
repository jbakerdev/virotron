import * as v4 from 'uuid'
import { Difficulty } from '../enum';
import { Sprites } from '../assets/Assets';

export const getNewPlayer = () => {
    return {
        id:v4(),
        unlockedItems: []
    } as PlayerState
}