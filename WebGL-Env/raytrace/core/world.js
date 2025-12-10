class RTWorld {
    constructor() {
        this.spheres = [];
        this.cubes   = [];
        this.cones   = [];
        this.planes  = [];
    }

    add(obj) {
        if (obj instanceof RTSphere) this.spheres.push(obj);
        else if (obj instanceof RTCube) this.cubes.push(obj);
        else if (obj instanceof RTCone) this.cones.push(obj);
        else if (obj instanceof RTPlane) this.planes.push(obj);
        else console.warn("Unknown RT object type", obj);
    }

    upload(gl, program) {
        gl.uniform1i(gl.getUniformLocation(program, "u_numSpheres"), this.spheres.length);
        gl.uniform1i(gl.getUniformLocation(program, "u_numCubes"),   this.cubes.length);
        gl.uniform1i(gl.getUniformLocation(program, "u_numCones"),   this.cones.length);
        gl.uniform1i(gl.getUniformLocation(program, "u_numPlanes"),  this.planes.length);

        this.spheres.forEach((s,  i) => s.upload(gl, program, i));
        this.cubes.forEach  ((c,  i) => c.upload(gl, program, i));
        this.cones.forEach  ((co, i) => co.upload(gl, program, i));
        this.planes.forEach ((pl, i) => pl.upload(gl, program, i));
    }
}
