import { Scene, GameObjects, Tilemaps, Geom, Game, Display } from "phaser";
import { store } from "../../App";
import { defaults, Sprites } from '../../assets/Assets'
import { Modal, UIReducerActions, StaticLayers, Activities, StationOffsets, RandomEvents, Chatter } from "../../enum";
import { onLose, onWin, onUpdateActivePlayer, onUpdatePlayer, onShowModal } from "../uiManager/Thunks"
import TimerSprite from "./TimerSprite";
import { getEmoteSanity, getStationUsedText, getDays } from "../Util";

const TILE_WIDTH = 16
const MAX_SANITY_PIXELS = 250
const FOOD_MAX=100
const ENT_MAX=100
const WORK_MAX=200
const SLEEP_MAX=300

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
    emote: GameObjects.Sprite
    foodTimeout: number
    sleepTimeout:number
    workTimeout:number
    entertainmentTimeout:number
    avatar:GameObjects.Sprite
    baseX: number
    day: number
    hour: number
    maxDays: number
    meals: number
    mealCounter: GameObjects.Text
    status: Status
    g:GameObjects.Graphics
    sanity:number
    bar:GameObjects.TileSprite

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
        this.meals = 6
        this.maxDays = getDays(store.getState().difficulty)
        this.sanity = MAX_SANITY_PIXELS
        this.status = {
            internet: false,
            doctor: false,
            fired: false
        }
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
        this.sound.volume = 0.1
        this.sounds = {
            step: this.sound.add('step'),
            dead: this.sound.add('dead'),
            error: this.sound.add('error'),
            gameplay: this.sound.add('gameplay')
        }
        this.sounds.gameplay.play({ loop:true})

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
                    this.stations.push(this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'sprites', Sprites.food).setInteractive().setName(Activities.FOOD).setAngle(90))
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
                    this.bar = this.add.tileSprite(tile.getLeft()+125, tile.getTop()+8, MAX_SANITY_PIXELS, 16, 'chain')
                    this.time.addEvent({
                        delay:250,
                        callback: ()=>{
                            this.bar.setTilePosition(this.bar.tilePositionX+1)
                        },
                        repeat:-1
                    })
                    this.add.text(tile.getCenterX()-40, tile.getCenterY()-24, 'sanity', { color:'white' })
                    this.messageText = this.add.text(tile.getCenterX()+200, tile.getCenterY()-24, 'Day '+this.day+' of '+this.maxDays, { color:'white', fontSize:'12px' })
                    this.mealCounter = this.add.text(tile.getCenterX()+200, tile.getCenterY()+8, this.meals + ' meals left', { color:'white', fontSize:'12px' })
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
            if(this.avatar.alpha > 0) this.setSelectedStation(-1)
        })
        this.input.keyboard.on('keydown-RIGHT', (event) => {
            if(this.avatar.alpha > 0) this.setSelectedStation(1)
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            if(this.avatar.alpha > 0) this.tryUseSelectedStation()
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
                    this.workTimeout = WORK_MAX
                    this.setSanity(this.sanity+20)
                }
                else this.shakeIt(station)
                break
            case Activities.SLEEP:
                if(this.sleepTimeout === 0) {
                    this.sleepTimeout = SLEEP_MAX
                    this.setSanity(this.sanity+30)
                }
                else this.shakeIt(station)
                break
            case Activities.ENTER:
                if(this.entertainmentTimeout === 0) {
                    this.entertainmentTimeout = ENT_MAX
                    this.setSanity(this.sanity+20)
                }
                else this.shakeIt(station)
                break
            case Activities.FOOD:
                if(this.foodTimeout === 0) {
                    this.foodTimeout = FOOD_MAX
                    this.setSanity(this.sanity+10)
                    this.meals--
                    this.mealCounter.text = this.meals + ' meals left'
                    if(this.meals <= 0) {
                        this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y, 'You are out of food and must venture out', 5)
                        this.avatar.setAlpha(0)
                        this.time.addEvent({
                            delay: 5000,
                            callback: ()=>{
                                if(Phaser.Math.Between(0,10)===10){
                                    this.sounds.gameplay.stop()
                                    this.sounds.dead.play()
                                    onLose('You caught the virus.')
                                } 
                                else{
                                    this.avatar.setAlpha(1)
                                    this.meals = 6
                                    this.mealCounter.text = this.meals + ' meals left'
                                    this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y, 'You were able to find some food')
                                } 
                            }
                        })
                        
                    }
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
        this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y+30, getStationUsedText(station.name, this.status))
    }

    setSanity = (val:number) => {
        val = Math.min(MAX_SANITY_PIXELS, val)
        if(val > this.sanity){
            this.tweens.add({
                targets: this.bar,
                tilePositionX: this.bar.tilePositionX-5,
                duration: 500
            })
        }
        let diff = this.sanity - val
        this.bar.width = val
        this.bar.setPosition(this.bar.x-(diff/2), this.bar.y)
        this.sanity = val
    }

    tick = () => {
        if(!store.getState().modal){
            this.hour++
            if(this.hour > 24){
                this.day++
                this.hour = 0
                if(this.day > this.maxDays) onShowModal(Modal.WIN)
                this.messageText.text = 'Day '+this.day+' of '+this.maxDays
                this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y, 'Another day over...')
            }

            let event
            if(Phaser.Math.Between(0,100) === 100){
                event = RandomEvents[Phaser.Math.Between(0,RandomEvents.length-1)]
            }
            if(event){
                if(event.id === 'fired'){
                    this.status.fired = true
                }
                else if(event.id === 'doctor'){
                    this.avatar.setAlpha(0)
                    this.time.addEvent({
                        delay: event.duration*1000,
                        callback:() => {
                            if(Phaser.Math.Between(0,10) === 10){
                                onLose('You caught the virus.')
                                this.sounds.gameplay.stop()
                                this.sounds.dead.play()
                            }
                            else {
                                this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y, 'You made it back with medicine.')
                                this.avatar.setAlpha(1)
                            }
                        }
                    })
                } 
                else if(event.id === 'internet'){
                    this.time.addEvent({
                        delay: event.duration*1000,
                        callback:() => {
                            this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y, 'They fixed the internet.')
                            this.status.internet = false
                        }
                    })
                }
                this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y, event.title, event.duration)
            }
            else if(Phaser.Math.Between(0,33) === 33) {
                this.showText(this.avatar.getBottomCenter().x, this.avatar.getBottomCenter().y, Chatter[Phaser.Math.Between(0,Chatter.length-1)].title, 3)
            }

            this.foodTimeout-=10
            if(this.foodTimeout <= 0) this.foodTimeout = 0
            let t = this.timers.find(t=>t.activity === Activities.FOOD)
            t.setOverlayPercent(this.foodTimeout/FOOD_MAX)
    
            this.sleepTimeout-=10
            if(this.sleepTimeout <= 0) this.sleepTimeout = 0
            t = this.timers.find(t=>t.activity === Activities.SLEEP)
            t.setOverlayPercent(this.sleepTimeout/SLEEP_MAX)
    
            if(!this.status.internet){
                this.entertainmentTimeout-=10
            }
            else this.entertainmentTimeout = ENT_MAX
            if(this.entertainmentTimeout <= 0) this.entertainmentTimeout = 0
            t = this.timers.find(t=>t.activity === Activities.ENTER)
            t.setOverlayPercent(this.entertainmentTimeout/ENT_MAX)
    
            if(!this.status.fired){
                this.workTimeout-=10
            }
            else this.workTimeout = WORK_MAX
            if(this.workTimeout <= 0) this.workTimeout = 0
            t = this.timers.find(t=>t.activity === Activities.WORK)
            t.setOverlayPercent(this.workTimeout/WORK_MAX)
            
            if(this.sanity >= 0){
                this.setSanity(this.sanity-6)
                this.emote.setFrame(getEmoteSanity(this.sanity))
            }
            else{
                this.sounds.gameplay.stop()
                this.sounds.dead.play()
                onLose('You went insane.')
            } 
        }
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

    showText = (x:number, y:number, text:string, duration?:number) => {
        let font = this.add.text(x-30, y, text, {
            fontFamily: 'Arcology', 
            fontSize: '8px',
            color: 'white'
        })
        font.setStroke('#000000', 2);
        font.setWordWrapWidth(120)
        font.setDepth(4)
        this.add.tween({
            targets: font,
            ease: 'Stepped',
            easeParams:[4],
            duration: duration ? duration*1000 : 1500,
            y: y,
            onComplete: ()=>{
                font.destroy()
            }
        })
    }
}