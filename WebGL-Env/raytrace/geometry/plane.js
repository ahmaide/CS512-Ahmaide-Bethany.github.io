class RTPlane {
    constructor({
        normal         = [0, 1, 0],
        d              = 0.0,
        color          = [1, 1, 1],
        material       = MATERIAL_DIFFUSE,
        reflectivity   = 0.0,
        refractiveIndex = 1.0
    } = {}) {
        this.normal         = normal;
        this.d              = d;
        this.color          = color;
        this.material       = material;
        this.reflectivity   = reflectivity;
        this.refractiveIndex = refractiveIndex;
    }

    upload(gl, program, index) {
        gl.uniform3fv(gl.getUniformLocation(program, `u_planes[${index}].normal`), this.normal);
        gl.uniform1f (gl.getUniformLocation(program, `u_planes[${index}].d`),      this.d);
        gl.uniform3fv(gl.getUniformLocation(program, `u_planes[${index}].color`),  this.color);
        gl.uniform1i (gl.getUniformLocation(program, `u_planes[${index}].material`), this.material);
        gl.uniform1f (gl.getUniformLocation(program, `u_planes[${index}].reflectivity`), this.reflectivity);
        gl.uniform1f (gl.getUniformLocation(program, `u_planes[${index}].refractiveIndex`), this.refractiveIndex);
    }
}
