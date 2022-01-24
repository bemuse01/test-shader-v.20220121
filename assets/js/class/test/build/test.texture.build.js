import * as THREE from '../../../lib/three.module.js'
import {GPUComputationRenderer} from '../../../lib/GPUComputationRenderer.js'
import {PrefabBufferGeometry} from '../../../lib/three.module.extends.js'
import Shader from '../shader/test.texture.shader.js'
import TestParam from '../param/test.param.js'
import Method from '../method/test.texture.method.js'

export default class{
    constructor({group, size, renderer}){
        this.size = size

        this.param = {
            count: 1,
            radius: 1,
            seg: 16,
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

        this.renderTarget = new THREE.WebGLMultisampleRenderTarget(w, h)
        
        this.rtCamera = new THREE.PerspectiveCamera(TestParam.fov, w / h, TestParam.near, TestParam.far)
        this.rtCamera.position.z = TestParam.pos

        this.rtScene = new THREE.Scene()
    }
    initGPGPU(renderer){
        this.gpuCompute = new GPUComputationRenderer(this.param.seg + 2, this.param.count, renderer)
        this.createTexture()
        this.initTexture()
        this.gpuCompute.init()
    }

    // set texutre
    createTexture(){
        // this.createVelocityTexture()
        this.createPositionTexture()
    }
    initTexture(){
        // this.initVelocityTexture()
        this.initPositionTexture()
    }

    // velocity texture
    createVelocityTexture(){
        const velocity = this.gpuCompute.createTexture()

        Method.fillVelocityTexture(velocity)

        this.velocityVariable = this.gpuCompute.addVariable('tVelocity', Shader.velocity, velocity)
    }
    initVelocityTexture(){
        this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.velocityVariable, this.positionVariable])

        this.velocityUniforms = this.velocityVariable.material.uniforms

        // this.velocityUniforms['uTime'] = {value: null}
        // this.velocityUniforms['uTrd'] = {value: PARAM.tRd}
        // this.velocityUniforms['uNrd'] = {value: PARAM.nRd}
        this.velocityUniforms['uRange'] = {value: PARAM.range}
        this.velocityUniforms['uStrength'] = {value: PARAM.strength}
    }

    // position texture
    createPositionTexture(){
        const position = this.gpuCompute.createTexture()

        Method.fillPositionTexture(position, {...this.size.obj, position: this.mesh.geometry.attributes.position})

        this.positionVariable = this.gpuCompute.addVariable('tPosition', Shader.position, position)
    }
    initPositionTexture(){
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable])

        this.positionUniforms = this.positionVariable.material.uniforms
        
        this.positionUniforms['uTime'] = {value: null}
    }


    // create
    create(){
        const prefabGeometry = new THREE.CircleGeometry(this.param.radius, this.param.seg)
        const prefabGeometryCount = prefabGeometry.attributes.position.count
   
        const geometry = new PrefabBufferGeometry(prefabGeometry, this.param.count)
        const position = geometry.attributes.position
        const posArr = position.array

        const material = new THREE.ShaderMaterial({
            vertexShader: Shader.draw.vertex,
            fragmentShader: Shader.draw.fragment,
            transparent: true,
            uniforms: {
                uTexture: {value: null},
                uPosition: {value: null},
                uTime: {value: null},
                uRes: {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)}
            }
        })

        const {w, h} = this.size.obj

        const uv = []

        for(let i = 0; i < this.param.count; i++){
            const index = i * prefabGeometryCount * 3
            
            const x = Math.random() * w - w / 2
            const y = Math.random() * h - h / 2
            

            for(let j = 0; j < prefabGeometryCount; j++){
                const idx = index + j * 3

                // posArr[idx] += x
                // posArr[idx + 1] += y

                const u = j
                const v = i

                uv.push(u, v)
            }
        }

        console.log(uv)

        geometry.setAttribute('aUv', new THREE.Float32BufferAttribute(uv, 2))

        this.mesh = new THREE.Mesh(geometry, material)

        this.rtScene.add(this.mesh)
    }

    
    // resize
    resize(size){
        this.size = size
    }


    // animate
    animate(renderer){
        this.gpuCompute.compute()

        this.mesh.material.uniforms['uPosition'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture
        this.mesh.material.uniforms['uTime'].value = window.performance.now()

        renderer.setRenderTarget(this.renderTarget)
        renderer.render(this.rtScene, this.rtCamera)
        renderer.setRenderTarget(null)
    }
}