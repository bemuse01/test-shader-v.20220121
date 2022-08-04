import * as THREE from '../../../lib/three.module.js'
import {GPUComputationRenderer} from '../../../lib/GPUComputationRenderer.js'
import Shader from '../shader/test.texture.shader.js'
import TestParam from '../param/test.param.js'
import Method from '../method/test.texture.method.js'
import Particle from '../../objects/particle.js'
import PublicMethod from '../../../method/method.js'
import Param from '../param/test.texture.param.js'

export default class{
    constructor({size, renderer, camera}){
        // this.group = group
        this.size = size
        this.renderer = renderer
        this.camera = camera

        this.param = {
            row: Param.row,
            col: Param.col,
            pointSize: Math.min(this.size.el.w, this.size.el.h) * 0.04,
            color: 0xffffff,
            font: 'Arial',
            fontSize: '20px',
            fontColor: '#ff0000'
        }

        this.init()
    }


    // init
    init(){
        this.initRenderTarget()
        this.create()
        this.initGPGPU()
    }
    initRenderTarget(){
        const {w, h} = this.size.el

        this.renderTarget = new THREE.WebGLRenderTarget(w, h, {format: THREE.RGBAFormat})
        this.renderTarget.samples = 1024

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
        this.createVelocityTexture()
    }
    initTexture(){
        this.initPositionTexture()
        this.initVelocityTexture()
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
        this.positionUniforms['uRes'] = {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)}
    }

    // position texture
    createPositionTexture(){
        const position = this.gpuCompute.createTexture()

        Method.fillPositionTexture(position, {...this.size.obj, pointSize: this.param.pointSize})

        this.positionVariable = this.gpuCompute.addVariable('tPosition', Shader.position, position)
    }
    initPositionTexture(){
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable])

        this.positionUniforms = this.positionVariable.material.uniforms
        
        this.positionUniforms['uRes'] = {value: new THREE.Vector2(this.size.obj.w, this.size.obj.h)}
        this.positionUniforms['uResEl'] = {value: new THREE.Vector2(this.size.el.w, this.size.el.h)}
        this.positionUniforms['time'] = {value: 0}
        // this.positionUniforms['uVelocity'] = {value: Method.createStaticVelocityTexture({w: this.param.col, h: this.param.row})}
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
    create(){
        const textures = this.initCanvasTexture()

        this.object = new Particle({
            materialName: 'ShaderMaterial',
            materialOpt: {
                vertexShader: Shader.draw.vertex,
                fragmentShader: Shader.draw.fragment,
                transparent: true,
                uniforms: {
                    uPointSize: {value: this.param.pointSize},
                    uPosition: {value: null},
                    uColor: {value: new THREE.Color(this.param.color)},
                    cameraConstant: {value: PublicMethod.getCameraConstant(this.size.el.h, this.camera)},
                    time: {value: 0},
                    textures: {value: textures}
                },
                glslVersion: THREE.GLSL3
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


    // texture
    initCanvasTexture(){
        const width = 16
        const height = 16
        const depth = this.param.row * this.param.col
        const data = []

        // for(let i = 0; i < this.param.row; i++){
        //     for(let j = 0; j < this.param.col; j++){
        //         const idx = i * this.param.col + j
        //         const ctx = this.createCanvasTexture({width, height})
        //         this.drawCanvasTexture(ctx, idx + '', {...this.param})

        //         const d = [...ctx.getImageData(0, 0, width, height).data]

        //         data.push(...d)
        //     }
        // }

        for(let i = 0; i < depth; i++){
            const ctx = this.createCanvasTexture({width, height})
            this.drawCanvasTexture(ctx, i + '', {...this.param})

            const d = [...ctx.getImageData(0, 0, width, height).data]

            data.push(...d)
        }
        // console.log(data)

        // const width = 32;
        // const height = 32;
        // const depth = this.param.row * this.param.col;
        
        // const size = width * height;
        // const data = new Uint8Array( 4 * size * depth );
        
        // for ( let i = 0; i < depth; i ++ ) {
        
        //     const color = new THREE.Color( Math.random(), Math.random(), Math.random() );
        //     const r = Math.floor( color.r * 255 );
        //     const g = Math.floor( color.g * 255 );
        //     const b = Math.floor( color.b * 255 );
        
        //     for ( let j = 0; j < size; j ++ ) {
        
        //         const stride = ( i * size + j ) * 4;
        
        //         data[ stride ] = r;
        //         data[ stride + 1 ] = g;
        //         data[ stride + 2 ] = b;
        //         data[ stride + 3 ] = 255;
        
        //     }
        // }

        const texture = new THREE.DataArrayTexture(new Uint8Array(data), width, height, depth)
        texture.needsUpdate = true

        console.log(texture)

        return texture
    }
    createCanvasTexture({width, height}){
        const ctx = document.createElement('canvas').getContext('2d')
        ctx.canvas.width = width
        ctx.canvas.height = height
        return ctx
    }
    drawCanvasTexture(ctx, txt1, {font, fontColor, fontSize}){
        const {width, height} = ctx.canvas

        // ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        ctx.font = `${fontSize} ${font}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = fontColor
        // ctx.fillText(~~(window.performance.now()), width / 2, height / 2)
        ctx.fillText(txt1, width / 2, height / 2)
        ctx.fillText(txt1, width / 2, height / 2)
        ctx.fillText(txt1, width / 2, height / 2)
        ctx.fillText(txt1, width / 2, height / 2)
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
    animate(){
        this.gpuCompute.compute()

        const time = window.performance.now()

        this.object.setUniform('uPosition', this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture)
        // this.object.setUniform('u', this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture)
        // this.object.setUniform('time', time)
        this.positionUniforms['time'].value = time

        this.renderer.setRenderTarget(this.renderTarget)
        this.renderer.clear()
        this.renderer.render(this.rtScene, this.rtCamera)
        this.renderer.setRenderTarget(null)
    }
}