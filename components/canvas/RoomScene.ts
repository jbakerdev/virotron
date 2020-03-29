import { Scene, GameObjects, Tilemaps, Geom, Game } from "phaser";
import { store } from "../../App";
import { defaults, Sprites } from '../../assets/Assets'
import { Modal, UIReducerActions, StaticLayers, Activities, StationOffsets } from "../../enum";
import { onLose, onWin, onUpdateActivePlayer, onUpdatePlayer, onShowModal } from "../uiManager/Thunks"
import TimerSprite from "./TimerSprite";
import { getEmoteSanity, getStationUsedText } from "../Util";

const TILE_WIDTH = 16
const MAX_SANITY_PIXELS = 250

export default class RoomScene extends Scene {

    unsubscribeRedux: Function
    selectIcon: GameObjects.Image
    selectedStation: number
    messageText: GameObjects.Text
    sounds: any
    stations: Array<GameObjects.Sprite>
    timers: Array<TimerSprite>
    map:Tilemaps.Tilemap
    backgroundLayer: Tilemaps.StaticTilemapLayer
    messages: Array<GameObjects.Text>
    focusedItem: GameObjects.Sprite
    sanityBar: GameObjects.TileSprite
    emote: GameObjects.Sprite
    foodTimeout: number
    sleepTimeout:number
    workTimeout:number
    entertainmentTimeout:number
    avatar:GameObjects.Sprite
    baseX:number
    day: number
    hour: number

    constructor(config){
        super(config)
        this.unsubscribeRedux = store.subscribe(this.onReduxUpdate)
        this.stations = []
        this.messages = []
        this.timers = []
        this.foodTimeout=0
        this.sleepTimeout=0
        this.workTimeout=0
        this.entertainmentTimeout=0
        this.day = 1
        this.hour = 0
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
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.food).setInteractive().setName(Activities.FOOD))
                    this.timers.push(new TimerSprite(this, tile.getCenterX(), tile.getCenterY()-16, 'time', Activities.FOOD).setAlpha(0))
                    break
                case Sprites.work:
                    tile.alpha = 0
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.work).setInteractive().setName(Activities.WORK))
                    this.timers.push(new TimerSprite(this, tile.getCenterX(), tile.getCenterY()-16, 'time',Activities.WORK).setAlpha(0))
                    break
                case Sprites.entertainment:
                    tile.alpha = 0
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.entertainment).setInteractive().setName(Activities.ENTER))
                    this.timers.push(new TimerSprite(this, tile.getCenterX(), tile.getCenterY()-16, 'time', Activities.ENTER).setAlpha(0))
                    break
                case Sprites.sleep:
                    tile.alpha = 0
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.sleep).setInteractive().setName(Activities.SLEEP))
                    this.timers.push(new TimerSprite(this, tile.getCenterX(), tile.getCenterY()-16, 'time',Activities.SLEEP).setAlpha(0))
                    break
                case 0:
                    tile.alpha = 0
                    this.sanityBar = this.add.tileSprite(tile.getCenterX()+125, tile.getCenterY(), 16,MAX_SANITY_PIXELS,'textures', Sprites.chain).setAngle(90)
                    this.baseX = tile.getCenterX()+125
                    this.add.text(tile.getCenterX()-40, tile.getCenterY()-24, 'sanity', { color:'white' })
                    this.messageText = this.add.text(tile.getCenterX()+200, tile.getCenterY()-24, 'Day '+this.day+' of 30', { color:'white', fontSize:'12px' })
                    this.emote = this.add.sprite(tile.getCenterX()-32, tile.getCenterY(), 'emotes', Sprites.happy)
                    break
                
            }
        })
        this.selectedStation = 0
        this.setSelectedStation(0)

        this.time.addEvent({
            delay: 1000,
            callback: this.tick,
            repeat: -1
        })

        this.cameras.main.setZoom(2)
        this.cameras.main.centerOn(floor.getBottomRight().x, floor.getBottomRight().y)
        
        this.input.keyboard.on('keydown-LEFT', (event) => {
            this.setSelectedStation(-1)
        })
        this.input.keyboard.on('keydown-RIGHT', (event) => {
            this.setSelectedStation(1)
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            this.tryUseSelectedStation()
        })
        this.input.mouse.disableContextMenu()
    }

    setSelectedStation = (index:number) => {
        if(index > 0){
            this.selectedStation = (this.selectedStation+index)%this.stations.length
        }
        else {
            this.selectedStation = this.selectedStation - 1
            if(this.selectedStation < 0) this.selectedStation = this.stations.length-1
        }
        let station = this.stations[this.selectedStation]
        this.setSelectIconPosition(station.getCenter())
        let stationOffset = StationOffsets[station.name]
        if(!this.avatar) this.avatar = this.add.sprite(station.getCenter().x+stationOffset.x, station.getCenter().y+stationOffset.y, 'avatar', Sprites['avatar'+station.name])
        else{
            this.avatar.setFrame(Sprites['avatar'+station.name])
            this.avatar.setPosition(station.getCenter().x+stationOffset.x, station.getCenter().y+stationOffset.y)
        } 
    }

    tryUseSelectedStation = () => {
        let station = this.stations[this.selectedStation]
        switch(station.name){
            case Activities.WORK:
                if(this.workTimeout === 0) {
                    this.workTimeout = 100
                    this.setSanity(this.sanityBar.height + 20)
                }
                else this.shakeIt(station)
                break
            case Activities.SLEEP:
                if(this.sleepTimeout === 0) {
                    this.sleepTimeout = 100
                    this.setSanity(this.sanityBar.height + 20)
                }
                else this.shakeIt(station)
                break
            case Activities.ENTER:
                if(this.entertainmentTimeout === 0) {
                    this.entertainmentTimeout = 100
                    this.setSanity(this.sanityBar.height + 20)
                }
                else this.shakeIt(station)
                break
            case Activities.FOOD:
                if(this.foodTimeout === 0) {
                    this.foodTimeout = 100
                    this.setSanity(this.sanityBar.height + 20)
                }
                else this.shakeIt(station)
                break
        }
    }

    shakeIt = (station:GameObjects.Sprite) => {
        this.sounds.error.play()
        this.tweens.add({
            targets: station,
            x: {
                from: station.x+Phaser.Math.Between(-2,2),
                to: station.x
            },
            y: {
                from: station.y+Phaser.Math.Between(-2,2),
                to: station.y
            },
            repeat:2,
            duration: 40
        })
        this.showText(this.avatar.x, this.avatar.y+30, getStationUsedText(station.name), 'white')
    }

    setSanity = (val:number) => {
        val = Math.min(MAX_SANITY_PIXELS, val)
        this.tweens.add({
            targets: this.sanityBar,
            height: val,
            duration: 1000,
            ease: 'Stepped',
            easeParams: [3],
            onUpdate: ()=>{
                this.sanityBar.setPosition(this.baseX, this.sanityBar.y)
            }
        })
    }

    tick = () => {
        this.hour++
        if(this.hour > 24){
            this.day++
            this.hour = 0
            if(this.day > 30) onShowModal(Modal.WIN)
            this.messageText.text = 'Day '+this.day+' of 30'
            this.showText(this.avatar.x, this.avatar.y, 'Another day over...', 'white')
        }
        this.foodTimeout-=10
        if(this.foodTimeout <= 0) this.foodTimeout = 0
        let t = this.timers.find(t=>t.activity === Activities.FOOD)
        t.setOverlayPercent(this.foodTimeout/100)

        this.sleepTimeout-=10
        if(this.sleepTimeout <= 0) this.sleepTimeout = 0
        t = this.timers.find(t=>t.activity === Activities.SLEEP)
        t.setOverlayPercent(this.sleepTimeout/100)

        this.entertainmentTimeout-=10
        if(this.entertainmentTimeout <= 0) this.entertainmentTimeout = 0
        t = this.timers.find(t=>t.activity === Activities.ENTER)
        t.setOverlayPercent(this.entertainmentTimeout/100)

        this.workTimeout-=10
        if(this.workTimeout <= 0) this.workTimeout = 0
        t = this.timers.find(t=>t.activity === Activities.WORK)
        t.setOverlayPercent(this.workTimeout/100)

        if(this.sanityBar.height > 5){
            this.sanityBar.height-=5
            this.sanityBar.setPosition(this.sanityBar.x-2.5, this.sanityBar.y)
            this.emote.setFrame(getEmoteSanity(this.sanityBar.height))
        }
        else onShowModal(Modal.LOSE)
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
        font.setStroke('#000000', 4);
        font.setDepth(4)
        this.messages.push(font)
        font.setPosition(x-(font.displayWidth/2), y-(30*this.messages.length))
        this.add.tween({
            targets: font,
            ease: 'Stepped',
            easeParams:[4],
            duration: 1500,
            y: y+30,
            onComplete: ()=>{
                font.destroy()
                this.messages = this.messages.filter(f=>f!==font)
            }
        })
    }
}