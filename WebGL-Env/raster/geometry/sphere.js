class Sphere {
  constructor(r = 1, resolution = 32) {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];


  for (let i = 0; i <= resolution; i++) {
    const v = i * Math.PI / resolution;
    const sinv = Math.sin(v);
    const cosv = Math.cos(v);

    for (let j = 0; j <= resolution; j++) {
      const u = j * 2 * Math.PI / resolution;
      const sinu = Math.sin(u);
      const cosu = Math.cos(u);
      const x = cosu * sinv;
      const y = cosv;
      const z = sinu * sinv;
      this.vertices.push(r * x, r * y, r * z);
      this.normals.push(x, y, z);

      const U = j / resolution;
      const V = 1.0 - i / resolution;
      this.uvs.push(U, V);

    }
  }

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const k1 = (i * (resolution + 1)) + j;
      const k2 = k1 + resolution + 1;
      this.indices.push(k1, k2, k1 + 1);
      this.indices.push(k2, k2 + 1, k1 + 1);
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

