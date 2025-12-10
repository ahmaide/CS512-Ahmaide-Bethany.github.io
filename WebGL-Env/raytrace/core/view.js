class RTView {
    constructor({
        position = [0, 0, 3],
        target   = [0, 0, 0],
        up       = [0, 1, 0],
        fov      = Math.PI / 3
    } = {}) {
        this.position = position;
        this.target   = target;
        this.up       = up;
        this.fov      = fov;

        this._updateBasis();
    }

    _updateBasis() {
        const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
        const norm = v => {
            const len = Math.hypot(v[0], v[1], v[2]);
            return [v[0]/len, v[1]/len, v[2]/len];
        };
        const cross = (a, b) => [
            a[1]*b[2] - a[2]*b[1],
            a[2]*b[0] - a[0]*b[2],
            a[0]*b[1] - a[1]*b[0],
        ];

        const forward = norm(sub(this.target, this.position));
        const right   = norm(cross(forward, this.up));
        const realUp  = cross(right, forward);

        this.forward = forward;
        this.right   = right;
        this.upVec   = realUp;
    }

    upload(gl, program) {
        gl.uniform3fv(gl.getUniformLocation(program, "u_cameraPos"),      this.position);
        gl.uniform3fv(gl.getUniformLocation(program, "u_cameraForward"),  this.forward);
        gl.uniform3fv(gl.getUniformLocation(program, "u_cameraRight"),    this.right);
        gl.uniform3fv(gl.getUniformLocation(program, "u_cameraUp"),       this.upVec);
        gl.uniform1f (gl.getUniformLocation(program, "u_fov"),            this.fov);
    }
}
