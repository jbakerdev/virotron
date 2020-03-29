import { Scene, GameObjects, Tilemaps, Geom } from "phaser";
import { store } from "../../App";
import { defaults, Sprites } from '../../assets/Assets'
import { Modal, UIReducerActions, StaticLayers } from "../../enum";
import { onLose, onWin, onUpdateActivePlayer, onUpdatePlayer } from "../uiManager/Thunks"

const TILE_WIDTH = 16

export default class RoomScene extends Scene {

    unsubscribeRedux: Function
    selectIcon: GameObjects.Image
    selectedStation: number
    selectedLabel: GameObjects.Text
    sounds: any
    stations: Array<GameObjects.Sprite>
    map:Tilemaps.Tilemap
    backgroundLayer: Tilemaps.StaticTilemapLayer
    messages: Array<GameObjects.Text>
    focusedItem: GameObjects.Sprite
    progressBars: Array<GameObjects.TileSprite>
    foodTimeout: number
    sleepTimeout:number
    workTimeout:number
    entertainmentTimeout:number
    
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
        
        let floor = this.map.createStaticLayer('floors', tileset)
        this.map.createStaticLayer('walls', tileset)
        let stations = this.map.createStaticLayer('objects', tileset)
        stations.forEachTile(t=>{
            let tile = t as Tilemaps.Tile
            switch(tile.index-1){
                case Sprites.food: 
                    tile.alpha = 0
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.food).setInteractive().setName('food'))
                    break
                case Sprites.work:
                    tile.alpha = 0
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.work).setInteractive().setName('work'))
                    break
                case Sprites.entertainment:
                    tile.alpha = 0
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.entertainment).setInteractive().setName('entertainment'))
                    break
                case Sprites.sleep:
                    tile.alpha = 0
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.sleep).setInteractive().setName('sleep'))
                    break
                case Sprites.workProgress:
                    tile.alpha = 0
                    this.progressBars.push(this.add.tileSprite(tile.getCenterX(), tile.getCenterY(), 16,16,'textures', Sprites.workProgress))
                    break
                case Sprites.entertainmentProgress:
                    tile.alpha = 0
                    this.progressBars.push(this.add.tileSprite(tile.getCenterX(), tile.getCenterY(), 16,16,'textures', Sprites.entertainmentProgress))
                    break
                case Sprites.sleepProgress:
                    tile.alpha = 0
                    this.progressBars.push(this.add.tileSprite(tile.getCenterX(), tile.getCenterY(), 16,16,'textures', Sprites.sleepProgress))
                    break
                case Sprites.foodProgress:
                    tile.alpha = 0
                    this.progressBars.push(this.add.tileSprite(tile.getCenterX(), tile.getCenterY(), 16,16,'textures', Sprites.foodProgress))
                    break
            }
        })
        this.selectedStation = 0
        this.setSelectIconPosition(this.stations[this.selectedStation].getCenter())
        this.selectedLabel = this.add.text(0, -20, this.stations[this.selectedStation].name, 
        { color:'white' }
        )

        this.time.addEvent({
            delay: 1000,
            callback: this.tick,
            repeat: -1
        })

        this.cameras.main.setZoom(2)
        this.cameras.main.centerOn(floor.getBottomRight().x, floor.getBottomRight().y)
        
        this.input.keyboard.on('keydown-LEFT', (event) => {
            this.selectedStation = (this.selectedStation-1)%this.stations.length
            this.selectedLabel.text = this.stations[this.selectedStation].name
            this.setSelectIconPosition(this.stations[this.selectedStation].getCenter())
        })
        this.input.keyboard.on('keydown-RIGHT', (event) => {
            this.selectedStation = (this.selectedStation+1)%this.stations.length
            this.selectedLabel.text = this.stations[this.selectedStation].name
            this.setSelectIconPosition(this.stations[this.selectedStation].getCenter())
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            //this.tryUseSelectedStation()
        })
        this.input.mouse.disableContextMenu()
    }

    tick = () => {
        this.progressBars.forEach(p=>{
            switch(p.frame){
                case Sprites.foodProgress:
                    p.width-=2
                    this.foodTimeout--
                    this.foodTimeout = Math.max(0,this.foodTimeout)
                    break
                case Sprites.sleepProgress:
                    //Decreased further by work action
                    p.width-=2
                    this.sleepTimeout--
                    this.sleepTimeout = Math.max(0,this.sleepTimeout)
                    break
                case Sprites.entertainmentProgress:
                    p.width-=2
                    this.entertainmentTimeout--
                    this.entertainmentTimeout = Math.max(0,this.entertainmentTimeout)
                    break
                case Sprites.workProgress:
                    //Decreased further by entertainment action
                    p.width-=2
                    this.workTimeout--
                    this.workTimeout = Math.max(0,this.workTimeout)
                    break
            }
        })
    }

    setSelectIconPosition(tuple:Tuple){
        if(!this.selectIcon){
            this.selectIcon = this.add.image(tuple.x, tuple.y, 'selected').setDepth(2).setScale(0.5)
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
}