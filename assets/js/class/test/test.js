import * as THREE from '../../lib/three.module.js'
import PublicMethod from '../../method/method.js'
import PARAM from './param/test.param.js'

import Texture from './build/test.texture.build.js'
import Plane from './build/test.plane.build.js'
import Child from './build/test.child.build.js'

export default class{
    constructor({app}){
        this.renderer = app.renderer

        this.modules = {
            Texture,
            Plane
            // Child
        }
        this.group = {}
        this.comp = {}
        this.build = new THREE.Group()

        this.init()
    }


    // init
    init(){
        this.initRenderObject()
        this.initGroup()
        this.create()
        this.add()
    }
    initGroup(){
        for(const module in this.modules){
            this.group[module] = new THREE.Group()
            this.comp[module] = null
        }
    }
    initRenderObject(){
        this.element = document.querySelector('.test-object')

        const {width, height} = this.element.getBoundingClientRect()

        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(PARAM.fov, width / height, PARAM.near, PARAM.far)
        this.camera.position.z = PARAM.pos
        
        this.size = {
            el: {
                w: width,
                h: height
            },
            obj: {
                w: PublicMethod.getVisibleWidth(this.camera, 0),
                h: PublicMethod.getVisibleHeight(this.camera, 0)
            }
        }
    }
  

    // add
    add(){
        for(let i in this.group) this.build.add(this.group[i])
        
        this.scene.add(this.build)
    }


    // create
    create(){
        for(const module in this.modules){
            const instance = this.modules[module]
            const group = this.group[module]

            this.comp[module] = new instance({group, size: this.size, renderer: this.renderer, texture: this.comp['Texture'], camera: this.camera})
        }
    }


    // animate
    animate(){
        this.render()
    }
    render(){
        const rect = this.element.getBoundingClientRect()
        const width = rect.right - rect.left
        const height = rect.bottom - rect.top
        const left = rect.left
        const bottom = this.renderer.domElement.clientHeight - rect.bottom

        // this.renderer.clear()

        this.renderer.setScissor(left, bottom, width, height)
        this.renderer.setViewport(left, bottom, width, height)

        this.animateObject()

        this.camera.lookAt(this.scene.position)
        this.renderer.render(this.scene, this.camera)
    }
    animateObject(){
        for(let i in this.comp){
            if(!this.comp[i] || !this.comp[i].animate) continue
            this.comp[i].animate()
        }
    }


    // resize
    resize(){
        const rect = this.element.getBoundingClientRect()
        const width = rect.right - rect.left
        const height = rect.bottom - rect.top

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        this.size = {
            el: {
                w: width,
                h: height
            },
            obj: {
                w: PublicMethod.getVisibleWidth(this.camera, 0),
                h: PublicMethod.getVisibleHeight(this.camera, 0)
            }
        }

        this.resizeObject()
    }
    resizeObject(){
        for(let i in this.comp){
            if(!this.comp[i] || !this.comp[i].resize) continue
            this.comp[i].resize(this.size)
        }
    }
}