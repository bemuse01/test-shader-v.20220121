import ShaderMethod from '../../../method/method.shader.js'

export default {
    draw: {
        vertex: `
            attribute vec3 aStartPosition;
            attribute vec3 aEndPosition;
            attribute float aDuration;
            attribute float aDelay;
            attribute vec2 aUv;

            varying vec2 vUv;

            uniform vec2 uRes;
            uniform sampler2D uPosition;
            uniform float uTime;

            void main(){
                vec3 newPosition = position;

                // float p = clamp(uTime - aDelay, 0.0, aDuration) / aDuration;
                // newPosition += mix(aStartPosition, aEndPosition, p);

                vec4 pos = texelFetch(uPosition, ivec2(aUv), 0);
                newPosition.xy = pos.xy;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

                vUv = aUv;
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
        uniform vec2 uRes;
        uniform float uRadius;
        uniform sampler2D uVelocity;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            ivec2 coord = ivec2(gl_FragCoord.xy);
            ivec2 res = ivec2(resolution.xy);
            
            vec4 pos = texture(tPosition, uv);
            vec4 uVel = texture(uVelocity, uv);

            pos.xy += uVel.xy;

            // not perfect just hack
            if(pos.x < -uRes.x * 0.5 - uRadius * 2.0) pos.x += uRes.x + uRadius * 2.0;
            if(pos.x > uRes.x * 0.5 + uRadius * 2.0) pos.x -= uRes.x - uRadius * 2.0;

            if(pos.y < -uRes.y * 0.5 - uRadius * 2.0) pos.y += uRes.y + uRadius * 3.0;
            if(pos.y > uRes.y * 0.5 + uRadius * 2.0) pos.y -= uRes.y - uRadius * 2.0;

            // pos.x = clamp(pos.x, -uRes.x * 0.5, uRes.x * 0.5);
            // pos.y = clamp(pos.y, -uRes.y * 0.5, uRes.y * 0.5);

            gl_FragColor = pos;
        }
    `,
    velocity: `
        uniform vec2 uRes;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;

            vec4 vel = texture(tVelocity, uv);
            vec4 pos = texture(tPosition, uv);

            gl_FragColor = vel;
        }
    `
}