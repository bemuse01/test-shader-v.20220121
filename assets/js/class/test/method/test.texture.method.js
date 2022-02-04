import * as THREE from '../../../lib/three.module.js'

export default {
    fillPositionTexture(texture, {w, h, pointSize}){
        const {data, width, height} = texture.image
        
        for(let j = 0; j < height; j++){
            for(let i = 0; i < width; i++){
                const index = (j * width + i) * 4

                const px = Math.random() * w - w / 2
                const py = Math.random() * h - h / 2

                // position
                data[index] = px
                data[index + 1] = py
                // point size
                data[index + 2] = pointSize
                // real point size
                data[index + 3] = 0
            }
        }
    },
    createStaticVelocityTexture({w, h}){
        const velocity = []

        for(let j = 0; j < h; j++){

            const vx = 0
            const vy = -Math.random() * 0.5

            for(let i = 0; i < w; i++){
                const index = (j * w + i) * 3

                // velocity
                velocity[index] = vx
                velocity[index + 1] = vy
                velocity[index + 2] = 0
            }
        }

        return new THREE.DataTexture(new Float32Array(velocity), w, h, THREE.RGBFormat, THREE.FloatType)
    },
    fillVelocityTexture(texture, {w, h, position}){
        const {data, width, height} = texture.image
        
        for(let j = 0; j < height; j++){

            const vx = Math.random() - 0.5
            const vy = Math.random() - 0.5

            for(let i = 0; i < width; i++){
                const index = (j * width + i) * 4

                // check boundary
                data[index] = 0
                data[index + 1] = 0
                // 
                data[index + 2] = 0
                data[index + 3] = 0
            }
        }
    }
}