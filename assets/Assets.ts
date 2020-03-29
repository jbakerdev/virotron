
export const defaults = [
    { key: 'TILESET', resource: require('./tiles.png'), type: 'image' },
    { key: 'overlay', resource: require('./overlay_white.png'), type: 'image' },
    { key: 'step', resource: require('./audio/step.mp3'), type: 'audio' },
    { key: 'intro', resource: require('./audio/intro.mp3'), type: 'audio' },
    { key: 'rock', resource: require('./audio/rock.mp3'), type: 'audio' },
    { key: 'error', resource: require('./audio/error.mp3'), type: 'audio' },
    { key: 'end', resource: require('./audio/end.mp3'), type: 'audio' },
    { key: 'destroyed', resource: require('./audio/destroyed.mp3'), type: 'audio' },
    { key: 'selected', resource: require('./selected.png'), type: 'image'},
    { key: 'map', resource: require('./display.json'), type: 'tilemapTiledJSON', data: {}},
    { key: 'sprites', resource: require('./tiles.png'), type: 'spritesheet', data: { frameWidth: 16, frameHeight: 16 }},
    { key: 'textures', resource: require('./textures.png'), type: 'spritesheet', data: { frameWidth: 16, frameHeight: 16 }},
    { key: 'emotes', resource: require('./emotes.png'), type: 'spritesheet', data: { frameWidth: 16, frameHeight: 16 }},
    { key: 'time', resource: require('./time.png'), type: 'image' },
    { key: 'avatar', resource: require('./avatar.png'),  type: 'spritesheet', data: { frameWidth: 16, frameHeight: 20 }},
]

export const Sprites = {
    work: 393,
    food: 266,
    entertainment: 291,
    sleep: 360,
    chain: 158,
    happy: 0,
    sad:1,
    goofy:2,
    mad: 3,
    grin: 4,
    unhappy:5,
    dead:6,
    chibi:7,
    cool:8,
    avatarwork: 3,
    avatarfood: 1,
    avatarentertainment:3,
    avatarsleep: 2
}

export const Icons = {
    
}