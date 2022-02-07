import * as THREE from '../../../lib/three.module.js'
import {GPUComputationRenderer} from '../../../lib/GPUComputationRenderer.js'
import Shader from '../shader/test.texture.shader.js'
import TestParam from '../param/test.param.js'
import Method from '../method/test.texture.method.js'
import Particle from '../../objects/particle.js'

export default class{
    constructor({group, size, renderer}){
        this.size = size

        this.param = {
            row: 30,
            col: 30,
            pointSize: Math.min(this.size.el.w, this.size.el.h) * 0.04,
            color: 0xffffff
        }

        this.renderer = renderer

        this.init(group)
    }


    // init
    init(group){
        this.initRenderTarget()
        this.create(group)
        this.initGPGPU()
    }
    initRenderTarget(){
        const {w, h} = this.size.el

        this.renderTarget = new THREE.WebGLMultisampleRenderTarget(w, h, {format: THREE.RGBAFormat})
        
        this.rtCamera = new THREE.PerspectiveCamera(TestParam.fov, w / h, TestParam.near, TestParam.far)
        this.rtCamera.position.z = TestParam.pos

        this.rtScene = new THREE.Scene()
    }
    initGPGPU(){
        this.gpuCompute = new GPUComputationRenderer(this.param.col, this.param.row, this.renderer)
        this.createTexture()
        this.initTexture()
        this.gpuCompute.init()
    }

    // set texutre
    createTexture(){
        this.createPositionTexture()
        // this.createVelocityTexture()
    }
    initTexture(){
        this.initPositionTexture()
        // this.initVelocityTexture()
    }
    disposeTexture(){
        this.disposePositionTexture()
    }

    // velocity texture
    createVelocityTexture(){
        const velocity = this.gpuCompute.createTexture()

        Method.fillVelocityTexture(velocity, {...this.size.obj})

        this.velocityVariable = this.gpuCompute.addVariable('tVelocity', Shader.velocity, velocity)
    }
    initVelocityTexture(){
        this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.velocityVariable, this.positionVariable])

        this.velocityUniforms = this.velocityVariable.material.uniforms

        // this.velocityUniforms['uTime'] = {value: null}
        // this.velocityUniforms['uTrd'] = {value: PARAM.tRd}
        // this.velocityUniforms['uNrd'] = {value: PARAM.nRd}
    }

    // position texture
    createPositionTexture(){
        const position = this.gpuCompute.createTexture()

        Method.fillPositionTexture(position, {...this.size.obj, pointSize: this.param.pointSize})

        this.positionVariable = this.gpuCompute.addVariable('tPosition', Shader.position, position)
    }
    initPositionTexture(){
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable])

        this.positionUniforms = this.positionVariable.material.uniforms
        
        this.positionUniforms['uRes'] = {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)}
        this.positionUniforms['uResEl'] = {value: new THREE.Vector2(this.size.el.w, this.size.el.h)}
        this.positionUniforms['uVelocity'] = {value: Method.createStaticVelocityTexture({w: this.param.col, h: this.param.row})}
    }
    disposePositionTexture(){
        this.positionUniforms['tPosition'].value.dispose()
        this.positionUniforms['uVelocity'].value.dispose()
    }
    resizePositionTexture(){
        const position = this.gpuCompute.createTexture()
        Method.fillPositionTexture(position, {...this.size.obj, pointSize: this.param.pointSize})

        this.positionUniforms['tPosition'].value.dispose()
        this.positionUniforms['tPosition'].value = position

        this.gpuCompute.doRenderTarget(this.positionVariable.material, this.positionVariable.renderTargets[0])
    }


    // create
    create(group){
        this.object = new Particle({
            count: this.param.col * this.param.row, 
            materialOpt: {
                vertexShader: Shader.draw.vertex,
                fragmentShader: Shader.draw.fragment,
                transparent: true,
                uniforms: {
                    uPointSize: {value: this.param.pointSize},
                    uPosition: {value: null},
                    uColor: {value: new THREE.Color(this.param.color)},
                    uCameraConst: {value: null}
                }
            }
        })

        const {uv} = this.createAttribute()

        this.object.setAttribute('position', new Float32Array(this.param.col * this.param.row * 3), 3)
        this.object.setAttribute('aUv', new Float32Array(uv), 2)

        this.rtScene.add(this.object.get())
    }
    createAttribute(){
        const uv = []

        for(let i = 0; i < this.param.row; i++){
            for(let j = 0; j < this.param.col; j++){
                uv.push(j, i)
            }
        }

        return {uv: new Float32Array(uv)}
    }


    // dispose
    dispose(){
        this.rtScene.remove(this.object.get())
        this.object.dispose()
    }

    
    // resize
    resize(size){
        this.size = size
        this.resizeRenderObject()
        this.resizeGPGPU()
    }
    resizeRenderObject(){
        this.rtCamera.aspect = this.size.el.w / this.size.el.h
        this.rtCamera.updateProjectionMatrix()

        this.renderTarget.setSize(this.size.el.w, this.size.el.h)
    }
    resizeGPGPU(){
        // this.disposeTexture()
        // this.initGPGPU()
        this.resizePositionTexture()

        this.positionUniforms['uRes'].value = new THREE.Vector2(this.size.obj.w, this.size.obj.h)
        this.positionUniforms['uResEl'].value = new THREE.Vector2(this.size.el.w, this.size.el.h)
    }


    // animate
    animate(renderer){
        this.gpuCompute.compute()

        this.object.getMaterial().uniforms['uPosition'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture

        renderer.setRenderTarget(this.renderTarget)
        renderer.clear()
        renderer.render(this.rtScene, this.rtCamera)
        renderer.setRenderTarget(null)
    }
}