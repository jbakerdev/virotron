import { GameObjects, Physics, Scene, Geom } from "phaser"
import * as v4 from 'uuid'
import { Activities } from "../../enum";


export default class TimerSprite extends GameObjects.Sprite {
    
    activity: Activities
    overlay: GameObjects.Graphics
   
    constructor(scene:Scene, x:number, y:number, texture:string, activity:Activities){
        super(scene, x, y, texture)
        scene.add.existing(this)
        this.activity = activity
        this.setDepth(1)
        scene.add.tween({
            targets: this,
            scale: 0.7,
            duration: 1000,
            repeat: -1,
            ease: 'Stepped',
            easeParams: [3],
            yoyo: true
        })
        this.overlay = scene.add.graphics({x, y})
    }
    
    setOverlayPercent = (percent:number) => {
        this.overlay.clear()
        if(percent > 0) this.setAlpha(1)
        else{
            this.setAlpha(0)
            return
        } 
        this.overlay.fillStyle(0xffffff, 1);

        //  Without this the arc will appear closed when stroked
        this.overlay.beginPath();

        // arc (x, y, radius, startAngle, endAngle, anticlockwise)
        this.overlay.slice(0, 0, 8, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(percent*(360-90)));

        //  Uncomment this to close the path before stroking
        this.overlay.closePath();

        this.overlay.fillPath();
    }
}
