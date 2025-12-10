class RTCone {
    constructor({
        apex = [0, 0.5, 0],
        height = 1,
        radius = 1,
        axis = [0, -1, 0],
        color = [1, 1, 1],
        material = "diffuse",
        reflectivity = 0.0,
        refractiveIndex = 1.0
    } = {}) {
        this.apex = apex;
        this.height = height;
        this.radius = radius;
        this.axis = axis;
        this.color = color;
        this.material = material;
        this.reflectivity = reflectivity;
        this.refractiveIndex = refractiveIndex;
    }

    upload(gl, shader, index) {
        const program = shader.program;

        gl.uniform3fv(
            gl.getUniformLocation(program, `u_cones[${index}].apex`),
            this.apex
        );

        gl.uniform1f(
            gl.getUniformLocation(program, `u_cones[${index}].height`),
            this.height
        );

        gl.uniform1f(
            gl.getUniformLocation(program, `u_cones[${index}].radius`),
            this.radius
        );

        gl.uniform3fv(
            gl.getUniformLocation(program, `u_cones[${index}].axis`),
            this.axis
        );

        gl.uniform3fv(
            gl.getUniformLocation(program, `u_cones[${index}].color`),
            this.color
        );

        let matType = 0;
        if (this.material === "reflective") matType = 1;
        if (this.material === "refractive") matType = 2;

        gl.uniform1i(
            gl.getUniformLocation(program, `u_cones[${index}].material`),
            matType
        );

        gl.uniform1f(
            gl.getUniformLocation(program, `u_cones[${index}].reflectivity`),
            this.reflectivity
        );

        gl.uniform1f(
            gl.getUniformLocation(program, `u_cones[${index}].refractiveIndex`),
            this.refractiveIndex
        );
    }
}
