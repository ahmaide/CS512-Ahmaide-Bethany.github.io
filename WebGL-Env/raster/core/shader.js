class Shader {

    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.program = this.initShaderProgram(vertexSource, fragmentSource);

        console.log("Shader program created:", this.program);
        console.log("Vertex Shader:", this.vs);
        console.log("Fragment Shader:", this.fs);
        if (!gl.getShaderParameter(this.vs, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.vs));
        }
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.program));
        }
    }


   createShader(gl, type, source) {
      let shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    createProgram(gl, vsSource, fsSource) {
      this.vs = this.createShader(gl, gl.VERTEX_SHADER, vsSource);
      this.fs = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      const program = gl.createProgram();
      gl.attachShader(program, this.vs);
      gl.attachShader(program, this.fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
      }
      return program;
    }

    initShaderProgram(vsSource, fsSource) {
      try {
        const program = this.createProgram(this.gl, vsSource, fsSource);
        this.gl.useProgram(program);
        this.posLoc = this.gl.getAttribLocation(program, "aPosition");
        this.colorLoc = this.gl.getAttribLocation(program, "aColor");
        this.timeLoc = this.gl.getUniformLocation(program, "uTime");
        this.normalLoc = this.gl.getAttribLocation(program, "aNormal");
        this.uMVM = this.gl.getUniformLocation(program, "uModelViewMatrix");
        this.uPM = this.gl.getUniformLocation(program, "uProjectionMatrix");
        this.uMTM = this.gl.getUniformLocation(program, "uModelTransformationMatrix");
        this.uNorm = this.gl.getUniformLocation(program, "uNormalMatrix");

        
        // lighting
        this.uLightPos = gl.getUniformLocation(program, "uLightPos");
        this.uLightColor = gl.getUniformLocation(program, "uLightColor");
        this.uAtten = gl.getUniformLocation(program, "uAtten");
        this.uViewPos = gl.getUniformLocation(program, "uViewPos");
        this.uKa = gl.getUniformLocation(program, "uKa");
        this.uKd = gl.getUniformLocation(program, "uKd");
        this.uKs = gl.getUniformLocation(program, "uKs");
        this.uShininess = gl.getUniformLocation(program, "uShininess");
        this.uEnableDiffuse = gl.getUniformLocation(program, "uEnableDiffuse");
        this.uEnableSpecular = gl.getUniformLocation(program, "uEnableSpecular");
        this.uShadingMode = gl.getUniformLocation(program, "uShadingMode");

        //texture
        this.aUV = gl.getAttribLocation(program, "aUV");
        this.uSampler = gl.getUniformLocation(program, "uSampler");
        this.uUseTexture = gl.getUniformLocation(program, "uUseTexture");

        this.uNormalSampler = gl.getUniformLocation(program, "uNormalSampler");
        this.uUseNormalMap  = gl.getUniformLocation(program, "uUseNormalMap");


//                 console.log("ATTRIBUTES for", program);
// console.log("  aPosition =", this.posLoc);
// console.log("  aNormal   =", this.normalLoc);
// console.log("  aUV       =", this.aUV);


        this.posLoc = gl.getAttribLocation(program, "aPosition");
        this.normalLoc = gl.getAttribLocation(program, "aNormal");
        this.aUV = gl.getAttribLocation(program, "aUV");

// console.log(">>> Shader Attribute Locations for program", program);
// console.log("   aPosition =", this.posLoc);
// console.log("   aNormal   =", this.normalLoc);
// console.log("   aUV       =", this.aUV);

        
        return program

      } catch (e) { console.error(e); }
    }

}
