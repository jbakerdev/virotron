import { Scene, GameObjects, Tilemaps, Geom } from "phaser";
import { store } from "../../../App";
import { defaults, Sprites } from '../../../assets/Assets'
import { Modal, UIReducerActions, StaticLayers } from "../../../enum";
import { onLose, onWin, onUpdateActivePlayer, onUpdatePlayer } from "../../uiManager/Thunks"

const TILE_WIDTH = 16
const IMMUNITY_STEP = 8

export default class BoardScene extends Scene {

    unsubscribeRedux: Function
    selectIcon: GameObjects.Image
    selectedTile: Tilemaps.Tile
    sounds: any
    pieceSprites: Array<GameObjects.Sprite>
    map:Tilemaps.Tilemap
    tileLayer: Tilemaps.StaticTilemapLayer
    messages: Array<GameObjects.Text>
    playerStart: Tilemaps.Tile
    cpuStart: Tilemaps.Tile

    constructor(config){
        super(config)
        this.unsubscribeRedux = store.subscribe(this.onReduxUpdate)
    }

    preload = () =>
    {
        defaults.forEach(asset=>{
            (this.load[asset.type] as any)(asset.key, asset.resource, asset.data)
        })
        console.log('assets were loaded.')
    }
    
    onReduxUpdate = () => {
        const uiState = store.getState()
        let engineEvent = uiState.engineEvent
        if(engineEvent)
            switch(engineEvent){
                case UIReducerActions.TICK:
                    break
            }
    }

    create = () =>
    {
        this.sound.volume = 0.4
        this.sounds = {
            step: this.sound.add('step'),
            intro: this.sound.add('intro'),
            rock: this.sound.add('rock'),
            end: this.sound.add('end'),
            destroyed: this.sound.add('destroyed'),
            error: this.sound.add('error')
        }
        this.pieceSprites = []
        this.messages = []
        this.map = this.make.tilemap({ key: 'map'})
        let tileset = this.map.addTilesetImage('TILESET', 'TILESET')
        
        this.map.createStaticLayer('board', tileset)
        this.tileLayer = this.map.createStaticLayer('tiles', tileset)

        this.playerStart = this.tileLayer.getTileAt(4,2)
        this.cpuStart = this.tileLayer.getTileAt(4,0)
        
        this.setSelectIconPosition(this.selectedTile)
        
        this.cameras.main.setZoom(2)
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.cameras.main.setScroll(this.map.widthInPixels/2, this.map.heightInPixels/2)
        
        this.input.keyboard.on('keydown-LEFT', (event) => {
            
        })
        this.input.keyboard.on('keydown-RIGHT', (event) => {
            
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            
        })
        this.input.mouse.disableContextMenu()
    }

    setSelectIconPosition(targetTile:Tilemaps.Tile){
        if(!this.selectIcon){
            this.selectIcon = this.add.image(this.selectedTile.pixelX, this.selectedTile.pixelY, 'selected').setDepth(2).setScale(0.5)
            this.add.tween({
                targets: this.selectIcon,
                scale: 1,
                duration: 1000,
                repeat: -1,
                ease: 'Stepped',
                easeParams: [3],
                yoyo: true
            })
        }
        this.selectIcon.setPosition(targetTile.getCenterX(), targetTile.getCenterY())
        this.selectedTile = targetTile
        this.sounds.step.play()
    }

    showText = (x:number, y:number, text:string, color:string) => {
        let font = this.add.text(x, y, text, {
            fontFamily: 'Arcology', 
            fontSize: '8px',
            color
        })
        font.setDepth(4)
        this.messages.push(font)
        font.setPosition(x-(font.displayWidth/2), y-(30*this.messages.length))
        this.add.tween({
            targets: font,
            ease: 'Stepped',
            easeParams:[4],
            duration: 1500,
            alpha: 0,
            y: y+30,
            onComplete: ()=>{
                font.destroy()
                this.messages = this.messages.filter(f=>f.alpha > 0)
            }
        })
    }
}