import Plane from '../../objects/plane.js'

export default class{
    constructor({group}){
        this.group = group

        this.init()
    }


    // init
    init(){
        this.create()
    }


    // create
    create(){
        this.object = new Plane({
            width: 10,
            widthSeg: 1,
            height: 10,
            heightSeg: 1,
            materialName: 'MeshBasicMaterial',
            materialOpt: {
                color: 0xffffff
            }
        })

        this.group.add(this.object.get())
    }
}