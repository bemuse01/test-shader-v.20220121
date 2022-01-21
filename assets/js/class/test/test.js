import * as THREE from '../../lib/three.module.js'
import PublicMethod from '../../method/method.js'
import PARAM from './param/test.param.js'

import TEXTURE from './build/test.texture.build.js'

export default class{
    constructor(){
        this.modules = {
            texture: TEXTURE
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

            this.comp[module] = new instance({group, size: this.size})
        }
    }


    // animate
    animate({app}){
        this.render(app)
    }
    render(app){
        const rect = this.element.getBoundingClientRect()
        const width = rect.right - rect.left
        const height = rect.bottom - rect.top
        const left = rect.left
        const bottom = app.renderer.domElement.clientHeight - rect.bottom

        // app.renderer.clear()

        app.renderer.setScissor(left, bottom, width, height)
        app.renderer.setViewport(left, bottom, width, height)

        this.animateObject(app)

        this.camera.lookAt(this.scene.position)
        app.renderer.render(this.scene, this.camera)
    }
    animateObject({renderer}){
        for(let i in this.comp){
            if(!this.comp[i] || !this.comp[i].animate) continue
            this.comp[i].animate(renderer)
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