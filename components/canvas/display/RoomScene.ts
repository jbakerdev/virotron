import { Scene, GameObjects, Tilemaps, Geom } from "phaser";
import { store } from "../../../App";
import { defaults, Sprites } from '../../../assets/Assets'
import { Modal, UIReducerActions, StaticLayers } from "../../../enum";
import { onLose, onWin, onUpdateActivePlayer, onUpdatePlayer } from "../../uiManager/Thunks"

const TILE_WIDTH = 16

export default class RoomScene extends Scene {

    unsubscribeRedux: Function
    selectIcon: GameObjects.Image
    selectedTile: Tilemaps.Tile
    sounds: any
    stations: Array<GameObjects.Sprite>
    map:Tilemaps.Tilemap
    backgroundLayer: Tilemaps.StaticTilemapLayer
    messages: Array<GameObjects.Text>
    focusedItem: GameObjects.Sprite
    progressBars: Array<GameObjects.TileSprite>
    
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
            destroyed: this.sound.add('destroyed'),
            error: this.sound.add('error')
        }
        this.stations = []
        this.messages = []
        this.map = this.make.tilemap({ key: 'map'})
        let tileset = this.map.addTilesetImage('tiles', 'TILESET')
        
        let h = (this.game.canvas.height - this.map.heightInPixels) / 4
        let w = (this.game.canvas.width - this.map.widthInPixels) / 4
        this.backgroundLayer = this.map.createStaticLayer('background', tileset, w, h)
        let stations = this.map.createStaticLayer('stations', tileset, w, h)
        stations.forEachTile(t=>{
            let tile = t as Tilemaps.Tile
            tile.alpha = 0
            switch(tile.index){
                case Sprites.food: 
                    let btn = this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'tiles', Sprites.button).setInteractive()
                    this.add.text(btn.getCenter().x, btn.getCenter().y, 'Meld')
                    btn.on('pointerdown', this.meldItems)
                    break
                case Sprites.work:
                    this.researchSprite = this.add.tileSprite(tile.getCenterX(), tile.getCenterY(), 16, 16, 'tiles', Sprites.research).setInteractive()
                    break
                case Sprites.entertainment:
                    let slot = this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'tiles', Sprites.openSlot).setInteractive()
                    slot.on('pointerdown', ()=>onSelectSlot(this.slots.length))
                    this.slots.push(slot)
                    break
                case Sprites.sleep:
                    let locked = this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'tiles', Sprites.lockedSlot)
                    this.slots.push(locked)
                    break
            }
        })

        this.selectedTile = this.backgroundLayer.getTileAt(Math.round(this.map.width/2), Math.round(this.map.height/2))
        this.setSelectIconPosition({x:this.selectedTile.getCenterX(), y: this.selectedTile.getCenterY()})
        
        this.cameras.main.setZoom(1.25)
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.cameras.main.setScroll(this.map.widthInPixels/2, this.map.heightInPixels/2)
        
        this.input.keyboard.on('keydown-LEFT', (event) => {
            let targetTile = this.getNextStation(1)
            targetTile && this.setSelectIconPosition(targetTile)
        })
        this.input.keyboard.on('keydown-RIGHT', (event) => {
            let targetTile = this.getNextStation(-1)
            targetTile && this.setSelectIconPosition(targetTile)
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            this.tryUseSelectedStation()
        })
        this.input.mouse.disableContextMenu()
    }

    setSelectIconPosition(tuple:Tuple){
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
        this.selectIcon.setPosition(tuple.x,tuple.y)
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

    update(){
        
    }
}