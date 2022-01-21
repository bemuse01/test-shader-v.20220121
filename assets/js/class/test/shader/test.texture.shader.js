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
        void main(){
            gl_FragColor = vec4(1);
        }
    `
}