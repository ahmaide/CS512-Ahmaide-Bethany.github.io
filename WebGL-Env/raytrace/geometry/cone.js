class RTCone {
    constructor({
        apex           = [0, 0.5, 0],
        axis           = [0, -1, 0],
        height         = 1.0,
        radius         = 1.0,
        color          = [1, 1, 1],
        material       = MATERIAL_DIFFUSE,
        reflectivity   = 0.0,
        refractiveIndex = 1.0
    } = {}) {
        this.apex           = apex;
        this.axis           = axis;
        this.height         = height;
        this.radius         = radius;
        this.color          = color;
        this.material       = material;
        this.reflectivity   = reflectivity;
        this.refractiveIndex = refractiveIndex;
    }

    upload(gl, program, index) {
        gl.uniform3fv(gl.getUniformLocation(program, `u_cones[${index}].apex`),   this.apex);
        gl.uniform3fv(gl.getUniformLocation(program, `u_cones[${index}].axis`),   this.axis);
        gl.uniform1f (gl.getUniformLocation(program, `u_cones[${index}].height`), this.height);
        gl.uniform1f (gl.getUniformLocation(program, `u_cones[${index}].radius`), this.radius);
        gl.uniform3fv(gl.getUniformLocation(program, `u_cones[${index}].color`),  this.color);
        gl.uniform1i (gl.getUniformLocation(program, `u_cones[${index}].material`), this.material);
        gl.uniform1f (gl.getUniformLocation(program, `u_cones[${index}].reflectivity`), this.reflectivity);
        gl.uniform1f (gl.getUniformLocation(program, `u_cones[${index}].refractiveIndex`), this.refractiveIndex);
    }
}
