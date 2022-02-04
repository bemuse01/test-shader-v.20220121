import ShaderMethod from '../../../method/method.shader.js'

export default {
    draw: {
        vertex: `
            attribute vec2 aUv;

            varying vec2 vUv;

            uniform vec2 uObjRes;
            uniform sampler2D uPosition;
            uniform float uPointSize;

            void main(){
                vec3 newPosition = position;

                vec4 pos = texelFetch(uPosition, ivec2(aUv), 0);
                newPosition.xy = pos.xy;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

                gl_PointSize = uPointSize;

                vUv = aUv;
            }
        `,
        fragment: `
            varying vec2 vUv;

            uniform vec3 uColor;

            void main(){
                // if ( vColor.y == 0.0 ) discard;

				// float f = length(gl_PointCoord - vec2(0.5, 0.5));
                float f = distance(gl_PointCoord, vec2(0.5));

				if(f > 0.5){
					discard;
				}

				gl_FragColor = vec4(uColor, 1.0);
            }
        `
    },
    position: `
        uniform vec2 uObjRes;
        uniform vec2 uElRes;
        uniform float uPointSize;
        uniform sampler2D uVelocity;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            ivec2 coord = ivec2(gl_FragCoord.xy);
            ivec2 res = ivec2(resolution.xy);
            
            vec4 pos = texture(tPosition, uv);
            vec4 uVel = texture(uVelocity, uv);

            float pointSize = (uPointSize / uElRes.y) * uObjRes.y;

            pos.xy += uVel.xy;

            if(pos.x < -uObjRes.x * 0.5 - pointSize) pos.x += uObjRes.x + pointSize * 2.0;
            if(pos.x > uObjRes.x * 0.5 + pointSize) pos.x -= uObjRes.x - pointSize * 2.0;

            if(pos.y < -uObjRes.y * 0.5 - pointSize) pos.y += uObjRes.y + pointSize * 2.0;
            if(pos.y > uObjRes.y * 0.5 + pointSize) pos.y -= uObjRes.y - pointSize * 2.0;

            // pos.x = clamp(pos.x, -uObjRes.x * 0.5, uObjRes.x * 0.5);
            // pos.y = clamp(pos.y, -uObjRes.y * 0.5, uObjRes.y * 0.5);

            gl_FragColor = pos;
        }
    `,
    velocity: `
        uniform vec2 uObjRes;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;

            vec4 vel = texture(tVelocity, uv);
            vec4 pos = texture(tPosition, uv);

            gl_FragColor = vel;
        }
    `
}