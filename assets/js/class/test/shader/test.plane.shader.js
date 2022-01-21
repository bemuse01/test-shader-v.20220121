import ShaderMethod from '../../../method/method.shader.js'

export default {
    vertex: `
        varying vec2 vUv;

        void main(){
            vUv = uv;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        uniform sampler2D uTexture;
        
        varying vec2 vUv;

        void main(){
            vec4 tex = texture(uTexture, vUv);

            gl_FragColor = tex;
        }
    `
}