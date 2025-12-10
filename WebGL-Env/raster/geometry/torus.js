class Torus {
  constructor(radius = 1, tubeRadius = 0.3, radialResolution = 32, tubularResolution = 24) {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];

    for (let i = 0; i <= radialResolution; i++) {
      const u = (i / radialResolution) * 2 * Math.PI;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      for (let j = 0; j <= tubularResolution; j++) {
        const v = (j / tubularResolution) * 2 * Math.PI;
        const cosV = Math.cos(v);
        const sinV = Math.sin(v);

        const x = (radius + tubeRadius * cosV) * cosU;
        const y = (radius + tubeRadius * cosV) * sinU;
        const z = -tubeRadius * sinV;

        this.vertices.push(x, y, z);

        const nx = cosU * cosV;
        const ny = sinU * cosV;
        const nz = sinV;
        this.normals.push(nx, ny, nz);
      }
    }

    for (let i = 0; i < radialResolution; i++) {
      for (let j = 0; j < tubularResolution; j++) {
        const a = i * (tubularResolution + 1) + j;
        const b = a + tubularResolution + 1;

        this.indices.push(a, b, a + 1);
        this.indices.push(b, b + 1, a + 1);
      }
    }

    this.vertexCount = this.vertices.length / 3;
    this.vertices = new Float32Array(this.vertices);
    this.indices = new Uint16Array(this.indices);
  }

  getVertices() { 
    return this.vertices; 
  }

  getIndices() {
     return this.indices;
 }

  getVertexCount() { 
    return this.vertices.length / 3; 
  }
  
  getNormals(){
    return this.normals;
  }

  getUVs(){
    return this.uvs;
  }
  
}
