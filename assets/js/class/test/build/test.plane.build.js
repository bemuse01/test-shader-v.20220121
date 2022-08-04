import * as THREE from '../../../lib/three.module.js'
import Plane from '../../objects/plane.js'
import Shader from '../shader/test.plane.shader.js'

export default class{
    constructor({group, size, texture}){
        this.size = size
        
        this.texture = texture.renderTarget.texture

        this.init(group)
    }


    // init
    init(group){
        this.create(group)
    }


    // create
    create(group){
        this.object = new Plane({
            width: this.size.obj.w,
            height: this.size.obj.h,
            widthSeg: 1,
            heightSeg: 1,
            materialName: 'ShaderMaterial',
            materialOpt: {
                vertexShader: Shader.vertex,
                fragmentShader: Shader.fragment,
                transparent: true,
                uniforms: {
                    uTexture: {value: this.texture},
                    uRes: {value: new THREE.Vector2(this.size.el.w, this.size.el.h)}
                }
            }
        })

        group.add(this.object.get())
    }


    // resize
    resize(size){
        this.size = size
        
        this.object.resize({width: this.size.obj.w, height: this.size.obj.h, widthSeg: 1, heightSeg: 1})
    }
}