const basicVertexShader = `#version 300 es
in vec3 aPosition;
in vec3 aColor;

uniform float uTime; //time in sec
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelTransformationMatrix;

out vec3 vColor;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * uModelTransformationMatrix * vec4(aPosition,1.0);
  vColor = aColor;
}`;

const timeShiftingVertexShader = `#version 300 es
precision mediump float;
in vec3 aPosition;
in vec3 aColor;

uniform float uTime;
out vec3 vColor;

void main() {
  gl_Position = vec4(aPosition, 1.0);
  vColor = aColor;
}
  
`; 

const phongVertexShader = `#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aNormal;
in vec3 aColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix; 
uniform mat4 uModelTransformationMatrix;
uniform mat3 uNormalMatrix;

out vec3 vPosition; 
out vec3 vNormal; 
out vec3 vColor;

void main() {
    vec4 worldPos = uModelTransformationMatrix * vec4(aPosition, 1.0);
    vPosition = worldPos.xyz;
    vNormal   = normalize(uNormalMatrix * aNormal);
    vColor    = aColor;
    gl_Position = uProjectionMatrix * uModelViewMatrix * worldPos;
}`;


const textureVertexShader = `#version 300 es
in vec3 aPosition;
in vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelTransformationMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * uModelTransformationMatrix * vec4(aPosition,1.0);}
`;