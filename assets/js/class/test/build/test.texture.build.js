import * as THREE from '../../../lib/three.module.js'
import {PrefabBufferGeometry} from '../../../lib/three.module.extends.js'
import Shader from '../shader/test.texture.shader.js'
import TestParam from '../param/test.param.js'

export default class{
    constructor({group, size}){
        this.size = size

        this.param = {
            count: 2,
            radius: 3,
            seg: 32,
        }

        this.init(group)
    }


    // init
    init(group){
        this.initRenderTarget()
        this.create(group)
    }
    initRenderTarget(){
        const {w, h} = this.size.el

        console.log(w, h)

        this.renderTarget = new THREE.WebGLMultisampleRenderTarget(w, h)
        
        this.rtCamera = new THREE.PerspectiveCamera(TestParam.fov, w / h, TestParam.near, TestParam.far)
        this.rtCamera.position.z = TestParam.pos

        this.rtScene = new THREE.Scene()
    }


    // create
    create(group){
        this.createTexture()
        console.log(this.size)

        const geometry = new THREE.PlaneGeometry(this.size.obj.w, this.size.obj.h, 1, 1)
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            map: this.renderTarget.texture
        })
        const mesh = new THREE.Mesh(geometry, material)

        group.add(mesh)
    }
    createTexture(){
        const prefabGeometry = new THREE.CircleGeometry(this.param.radius, this.param.seg)
        const prefabGeometryCount = prefabGeometry.attributes.position.count
   
        const geometry = new PrefabBufferGeometry(prefabGeometry, this.param.count)
        const position = geometry.attributes.position
        const posArr = position.array

        const material = new THREE.ShaderMaterial({
            vertexShader: Shader.vertex,
            fragmentShader: Shader.fragment,
            transparent: true,
            uniforms: {
                uTexture: {value: null}
            }
        })

        for(let i = 0; i < this.param.count; i++){
            const index = i * prefabGeometryCount * 3
            
            const x = Math.random() * 20 - 10
            const y = Math.random() * 20 - 10

            for(let j = 0; j < prefabGeometryCount; j++){
                const idx = index + j * 3

                posArr[idx] += x
                posArr[idx + 1] += y
            }            
        }

        const mesh = new THREE.Mesh(geometry, material)

        this.rtScene.add(mesh)
    }

    
    // resize
    resize(size){
        this.size = size
    }


    // animate
    animate(renderer){
        renderer.setRenderTarget(this.renderTarget)
        renderer.render(this.rtScene, this.rtCamera)
        renderer.setRenderTarget(null)
    }
}