import ShaderMethod from '../../../method/method.shader.js'
import Param from '../param/test.texture.param.js'

export default {
    draw: {
        vertex: `
            attribute vec2 aUv;

            varying vec2 vUv;
            varying float vAlpha;

            uniform vec2 uRes;
            uniform sampler2D uPosition;
            uniform float uPointSize;
            uniform float cameraConstant;

            void main(){
                ivec2 coord = ivec2(aUv);
                int idx = coord.y * ${Param.col} + coord.x;
                vec3 newPosition = position;

                vec4 pos = texelFetch(uPosition, coord, 0);
                newPosition.xy = pos.xy;

                vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);

                gl_PointSize = pos.z * cameraConstant / ( -mvPosition.z );
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

                vUv = aUv;
                vAlpha = pos.w;
            }
        `,
        fragment: `
            precision highp sampler2DArray;

            varying vec2 vUv;
            varying float vAlpha;

            uniform vec3 uColor;
            uniform sampler2DArray textures;

            out vec4 outColor;

            void main(){
				// float f = length(gl_PointCoord - vec2(0.5, 0.5));
                float f = distance(gl_PointCoord, vec2(0.5));

                ivec2 coord = ivec2(vUv);
                int idx = coord.y * ${Param.col} + coord.x;
                vec4 color = texture(textures, vec3(gl_PointCoord, idx));

				// if(f > 0.5){
				// 	discard;
				// }

				outColor = color;
            }
        `
    },
    position: `
        uniform float time;
        uniform vec2 uRes;
        uniform vec2 uResEl;
        // uniform sampler2D uVelocity;

        ${ShaderMethod.rand()}

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            ivec2 coord = ivec2(gl_FragCoord.xy);
            ivec2 res = ivec2(resolution.xy);
            int idx = coord.y * res.x + coord.x;
            
            vec4 pos = texture(tPosition, uv);
            vec4 vel = texture(tVelocity, uv);

            float rad = pos.z;

            pos.y += vel.x;

            // if(pos.x < -uRes.x * 0.5 - rad) pos.x += uRes.x + rad * 2.0;
            // if(pos.x > uRes.x * 0.5 + rad) pos.x -= uRes.x - rad * 2.0;
            // if(pos.y < -uRes.y * 0.5 - rad) pos.y += uRes.y + rad * 2.0;
            // if(pos.y > uRes.y * 0.5 + rad) pos.y -= uRes.y - rad * 2.0;
            if(pos.y < -uRes.y * 0.5){
                pos.x = rand(vec2(time * 0.001 * uv.x, time * 0.01)) * uRes.x - (uRes.x * 0.5);
                pos.y = rand(vec2(time * 0.002 * uv.y, time * 0.02)) * uRes.y * 0.5;
                // pos.z = 3.0;
            }


            if(pos.z > 0.0){

                for(int i = 0; i < res.y; i++){

                    for(int j = 0; j < res.x; j++){
                        int idx2 = i * res.x + j;

                        if(idx == idx2) continue;

                        vec4 pos2 = texelFetch(tPosition, ivec2(j, i), 0);
                        vec2 dPos = pos2.xy - pos.xy;
                        float dist = length(dPos);
                        float rad2 = pos2.z;
                        float calcRad = rad + rad2;

                        // if(dist == 0.0) continue;

                        if(pos2.z == 0.0) continue;

                        if(dist < calcRad * 0.85){
                            if(rad > rad2){
                                // pos.z += pos2.z * 0.2;
                                pos.z += 1.0;
                                // pos2.z = 0.0;
                            }else{
                                pos.z = 0.0;
                                // pos.w = 0.5;
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

            // float rad = (pos.z / uResEl.y) * uRes.y * 0.5;

            // if(pos.y < -uRes.y * 0.5 - rad) pos.y += uRes.y + rad * 2.0;

            gl_FragColor = vel;
        }
    `
}