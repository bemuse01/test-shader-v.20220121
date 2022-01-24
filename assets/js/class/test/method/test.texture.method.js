export default {
    fillPositionTexture(texture, {w, h, position}){
        const {data, width, height} = texture.image
        const array = position.array
        
        for(let j = 0; j < height; j++){

            const px = Math.random() * w - w / 2
            const py = Math.random() * h - h / 2

            const vx = Math.random() - 0.5
            const vy = Math.random() - 0.5

            for(let i = 0; i < width; i++){
                const index = (j * width + i) * 4
                const idx = (j * width + i) * 3

                const x = array[idx]
                const y = array[idx + 1]

                // position
                data[index] = x + px
                data[index + 1] = y + py
                // velocity
                data[index + 2] = vx
                data[index + 3] = vy
            }
        }
    },
    fillPositionTexture2({w, h, position}){
        for(let j = 0; j < h; j++){
            for(let i = 0; i < w; i++){
                
            }
        }
    }
}