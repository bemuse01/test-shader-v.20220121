import ShaderMethod from '../../../method/method.shader.js'

export default {
    draw: {
        vertex: `
            attribute vec2 aVelocity;
            attribute vec2 aUv;

            varying vec2 vUv;

            uniform vec2 uRes;
            uniform sampler2D uPosition;
            uniform float uTime;

            void main(){
                vUv = aUv;

                // vec4 pos = texture(uPosition, aUv);
                vec4 pos = texelFetch(uPosition, ivec2(aUv), 0);

                vec3 newPosition = position;

                newPosition.xy = pos.xy;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragment: `
            varying vec2 vUv;

            void main(){
                gl_FragColor = vec4(1);
            }
        `
    },
    position: `
        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            
            vec4 pos = texture(tPosition, uv);

            pos.xy += pos.zw;

            gl_FragColor = pos;
        }
    `
}