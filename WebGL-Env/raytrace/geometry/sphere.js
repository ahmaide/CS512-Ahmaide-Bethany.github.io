class RTSphere {
    constructor({
        center         = [0, 0, 0],
        radius         = 1.0,
        color          = [1, 1, 1],
        material       = MATERIAL_DIFFUSE,
        reflectivity   = 0.0,
        refractiveIndex = 1.0,
        intensity      = 0.0
    } = {}) {
        this.center         = center;
        this.radius         = radius;
        this.color          = color;
        this.material       = material;
        this.reflectivity   = reflectivity;
        this.refractiveIndex = refractiveIndex;
        this.intensity      = intensity;
    }

    upload(gl, program, index) {
        gl.uniform3fv(gl.getUniformLocation(program, `u_spheres[${index}].center`), this.center);
        gl.uniform1f (gl.getUniformLocation(program, `u_spheres[${index}].radius`), this.radius);
        gl.uniform3fv(gl.getUniformLocation(program, `u_spheres[${index}].color`),  this.color);
        gl.uniform1i (gl.getUniformLocation(program, `u_spheres[${index}].material`), this.material);
        gl.uniform1f (gl.getUniformLocation(program, `u_spheres[${index}].reflectivity`), this.reflectivity);
        gl.uniform1f (gl.getUniformLocation(program, `u_spheres[${index}].refractiveIndex`), this.refractiveIndex);
        gl.uniform1f (gl.getUniformLocation(program, `u_spheres[${index}].intensity`), this.intensity);
    }
}
