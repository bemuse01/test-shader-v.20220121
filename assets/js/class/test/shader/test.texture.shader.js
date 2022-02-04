import ShaderMethod from '../../../method/method.shader.js'

export default {
    draw: {
        vertex: `
            attribute vec2 aUv;

            varying vec2 vUv;

            uniform vec2 uRes;
            uniform sampler2D uPosition;
            uniform float uPointSize;

            void main(){
                vec3 newPosition = position;

                vec4 pos = texelFetch(uPosition, ivec2(aUv), 0);
                newPosition.xy = pos.xy;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

                gl_PointSize = pos.z;

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
        uniform vec2 uRes;
        uniform vec2 uResEl;
        uniform float uRealPointSize;
        uniform sampler2D uVelocity;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            ivec2 coord = ivec2(gl_FragCoord.xy);
            ivec2 res = ivec2(resolution.xy);
            
            vec4 pos = texture(tPosition, uv);
            vec4 uVel = texture(uVelocity, uv);

            pos.xy += uVel.xy;

            if(pos.x < -uRes.x * 0.5 - uRealPointSize) pos.x += uRes.x + uRealPointSize * 2.0;
            if(pos.x > uRes.x * 0.5 + uRealPointSize) pos.x -= uRes.x - uRealPointSize * 2.0;
            if(pos.y < -uRes.y * 0.5 - uRealPointSize) pos.y += uRes.y + uRealPointSize * 2.0;
            if(pos.y > uRes.y * 0.5 + uRealPointSize) pos.y -= uRes.y - uRealPointSize * 2.0;

            int idx = coord.y * res.x + coord.x;

            float rad = (pos.z / uResEl.y) * uRes.y;

            if(pos.z > 0.0){

                for(int i = 0; i < res.y; i++){

                    for(int j = 0; j < res.x; j++){
                        int idx2 = i * res.x + j;

                        if(idx == idx2) continue;

                        vec4 pos2 = texelFetch(tPosition, ivec2(j, i), 0);
                        float dist = distance(pos.xy, pos2.xy);
                        float rad2 = (pos2.z / uResEl.y) * uRes.y;
                        float calcRad = rad + rad2;

                        if(pos2.z == 0.0) continue;

                        if(dist < calcRad){
                            if(idx < idx2){
                                pos.z += pos2.z * 0.1;
                            }else{
                                pos.z = 0.0;
                                break;
                            }
                        }
                    }

                    if(pos.z == 0.0){
                        break;
                    }

                }
                
            }

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