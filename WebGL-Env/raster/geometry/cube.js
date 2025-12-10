class Cube {
  constructor(sx = 1, sy = 1, sz = 1) {
    const s = sx;
    this.vertices = new Float32Array([
      -1*s, -1*sy, -1*sz,
       1*s, -1*sy, -1*sz,
       1*s,  1*sy, -1*sz,
      -1*s,  1*sy, -1*sz,
      -1*s, -1*sy,  1*sz,
       1*s, -1*sy,  1*sz,
       1*s,  1*sy,  1*sz, 
      -1*s,  1*sy,  1*sz 
    ]);

    this.indices = new Uint16Array([
      0, 1, 2, 0, 2, 3, 
      4, 5, 6, 4, 6, 7, 
      3, 2, 6, 3, 6, 7, 
      0, 1, 5, 0, 5, 4, 
      1, 2, 6, 1, 6, 5,
      0, 3, 7, 0, 7, 4 
    ]);

    this.normals = new Float32Array([
       0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
       0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,
       0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,
       0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,
       1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,
      -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0,
    ]);

    this.uvs = new Float32Array([
      0, 0,  1, 0,  1, 1,  0, 1,
      0, 0,  1, 0,  1, 1,  0, 1,
      0, 0,  1, 0,  1, 1,  0, 1,
      0, 0,  1, 0,  1, 1,  0, 1,
      0, 0,  1, 0,  1, 1,  0, 1,
      0, 0,  1, 0,  1, 1,  0, 1,
    ]);
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