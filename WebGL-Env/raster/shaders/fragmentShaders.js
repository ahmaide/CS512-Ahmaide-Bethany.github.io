const basicFragShader = `#version 300 es
precision mediump float;
in vec3 vColor;

out vec4 fragColor;

void main() {
  fragColor = vec4(vColor,1.0);
}`;

const timeShiftingFragShader = `#version 300 es
  precision mediump float;
  in vec3 vColor;

  uniform float uTime;
  out vec4 fragColor;

  void main() {
    float pulse = 0.5 + 0.5 * sin(uTime * 0.2);
    vec3 shifted = vColor * (0.5 + pulse);
  fragColor = vec4(shifted, 1.0);
  }
`;

const phongFragShader = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vColor;
in vec3 vPosition;
out vec4 fragColor;

uniform vec3 uLightPos[2];
uniform vec3 uLightColor[2];
uniform vec3 uAtten[2];
uniform vec3 uViewPos;

uniform vec3 uKa;
uniform vec3 uKd;
uniform vec3 uKs;
uniform float uShininess;

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uViewPos - vPosition);

    vec3 globalAmbient = vec3(0.25, 0.25, 0.3);
    vec3 ambient = (uKa * vColor) * globalAmbient;

    vec3 total = ambient;

    for (int i = 0; i < 2; i++) {
        vec3 L = normalize(uLightPos[i] - vPosition);
        float dist = length(uLightPos[i] - vPosition);
        vec3 atten = uAtten[i];
        float fatt = 1.0 / (atten.x + atten.y * dist + atten.z * dist * dist);

        // Diffuse term
        float diff = max(dot(N, L), 0.0);
        vec3 diffuse = uKd * diff * uLightColor[i];

        // Specular term
        vec3 R = reflect(-L, N);
        float spec = pow(max(dot(V, R), 0.0), uShininess);
        vec3 specular = uKs * spec * uLightColor[i];

        total += fatt * (diffuse + specular);
    }

    // total = clamp(total, 0.0, 1.0);

    fragColor = vec4(total, 1.0);
}
`

const textureFragShader = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;

uniform sampler2D uTexture;

void main() {
    fragColor = texture(uTexture, vTexCoord);
}
`;