import * as THREE from '../../../lib/three.module.js'
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
        const geometry = new THREE.PlaneGeometry(this.size.obj.w, this.size.obj.h, 1, 1)
        const material = new THREE.ShaderMaterial({
            vertexShader: Shader.vertex,
            fragmentShader: Shader.fragment,
            transparent: true,
            uniforms: {
                uTexture: {value: this.texture}
            }
        })
        this.mesh = new THREE.Mesh(geometry, material)

        group.add(this.mesh)
    }
}