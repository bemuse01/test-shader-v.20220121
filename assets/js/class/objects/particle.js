import * as THREE from '../../lib/three.module.js'

export default class{
    constructor({count, materialOpt}){
        this.count = count
        this.materialOpt = materialOpt

        this.init()
    }


    // init
    init(){
        this.create()
    }


    // create
    create(){
        const geometry = this.createGeometry()
        const material = this.createMaterial()
        this.mesh = new THREE.Points(geometry, material)
    }
    createGeometry(){
        return new THREE.BufferGeometry()
    }
    createMaterial(){
        if(this.materialOpt.vertexShader){
            return new THREE.ShaderMaterial(this.materialOpt)
        }else{
            return new THREE.PointsMaterial(this.materialOpt)
        }
    }


    // dispose
    dispose(){

    }


    // set
    setAttribute(name, array, itemSize){
        this.mesh.geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize))
    }


    // get
    get(){
        return this.mesh
    }
    getGeometry(){
        return this.mesh.geometry
    }
    getMaterial(){
        return this.mesh.material
    }
    getAttribute(name){
        return this.mesh.geometry.attributes[name]
    }
}