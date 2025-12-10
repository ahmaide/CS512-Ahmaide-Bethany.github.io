class RTCube {
    constructor({
        center       = [0, 0, 0],
        size       = [ 1,  1,  1],
        color          = [1, 1, 1],
        material       = MATERIAL_DIFFUSE,
        reflectivity   = 0.0,
        refractiveIndex = 1.0,
        intensity       = 0.0,
        rotation        = 0.0
    } = {}) {
        this.center       = center;
        this.size       = size;
        this.color          = color;
        this.material       = material;
        this.reflectivity   = reflectivity;
        this.refractiveIndex = refractiveIndex;
        this.intensity      = intensity;
        this.rotation = rotation;
    }
    

    upload(gl, program, index) {
        gl.uniform3fv(gl.getUniformLocation(program, `u_cubes[${index}].center`), this.center);
        gl.uniform3fv(gl.getUniformLocation(program, `u_cubes[${index}].size`), this.size);
        gl.uniform3fv(gl.getUniformLocation(program, `u_cubes[${index}].color`),    this.color);
        gl.uniform1i (gl.getUniformLocation(program, `u_cubes[${index}].material`), this.material);
        gl.uniform1f (gl.getUniformLocation(program, `u_cubes[${index}].reflectivity`), this.reflectivity);
        gl.uniform1f (gl.getUniformLocation(program, `u_cubes[${index}].refractiveIndex`), this.refractiveIndex);
        gl.uniform1f (gl.getUniformLocation(program, `u_cubes[${index}].intensity`), this.intensity);

    
        let angle = this.rotation;
        let cosA = Math.cos(angle);
        let sinA = Math.sin(angle);

        const rot = new Float32Array([
            cosA, 0, sinA,
            0,    1, 0,
           -sinA, 0, cosA
        ]);

        gl.uniformMatrix3fv(
            gl.getUniformLocation(program, `u_cubes[${index}].rotation`),
            false,
            rot
        );
    }
}
