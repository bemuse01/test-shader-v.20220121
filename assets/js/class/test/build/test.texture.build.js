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
            pointSize: 20,
        }

        this.init(group, renderer)
    }


    // init
    init(group, renderer){
        this.initRenderTarget()
        this.create(group)
        this.initGPGPU(renderer)
    }
    initRenderTarget(){
        const {w, h} = this.size.el

        this.renderTarget = new THREE.WebGLMultisampleRenderTarget(w, h, {format: THREE.RGBAFormat})
        
        this.rtCamera = new THREE.PerspectiveCamera(TestParam.fov, w / h, TestParam.near, TestParam.far)
        this.rtCamera.position.z = TestParam.pos

        this.rtScene = new THREE.Scene()
    }
    initGPGPU(renderer){
        this.gpuCompute = new GPUComputationRenderer(this.param.col, this.param.row, renderer)
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

        Method.fillPositionTexture(position, {...this.size.obj, position: this.object.getGeometry().attributes.position})

        this.positionVariable = this.gpuCompute.addVariable('tPosition', Shader.position, position)
    }
    initPositionTexture(){
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable])

        this.positionUniforms = this.positionVariable.material.uniforms
        
        this.positionUniforms['uRes'] = {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)}
        this.positionUniforms['uVelocity'] = {value: Method.createStaticVelocityTexture({w: this.param.col, h: this.param.row})}
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
                    uPosition: {value: null}
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

    
    // resize
    resize(size){
        this.size = size

        this.positionUniforms['uRes'].value = new THREE.Vector2(this.size.obj.w, this.size.obj.h)
    }


    // animate
    animate(renderer){
        this.gpuCompute.compute()

        this.object.getMaterial().uniforms['uPosition'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture

        renderer.setRenderTarget(this.renderTarget)
        renderer.clear()
        renderer.render(this.rtScene, this.rtCamera)
        renderer.setRenderTarget(null)

        // renderer.clear()

        // const position = this.mesh.geometry.attributes.position
        // const posArr = position.array

        // for(let i = 0; i < this.param.count; i++){
        //     const index = i * (this.param.seg + 2) * 3
 
        //     const {x, y} = this.velocity[i]

        //     for(let j = 0; j < this.param.seg + 2; j++){
        //         const idx = index + j * 3

        //         posArr[idx] += x
        //         posArr[idx + 1] += y
        //     }
        // }

        // position.needsUpdate = true
    }
}