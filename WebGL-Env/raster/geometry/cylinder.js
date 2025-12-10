class Cylinder {
  constructor(radius = 1, height = 1, resolution = 32) { 
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    
    for (let i = 0; i <= resolution; i++) {
      const v = -0.5 + (i / resolution);
      for (let j = 0; j <= resolution; j++) {
        const u = (j / resolution) * 2 * Math.PI;
        const x = Math.cos(u) * radius;
        const y = v * height;
        const z = Math.sin(u) * radius;
        this.vertices.push(x, y, z);
        this.normals.push(Math.cos(u), 0.0, Math.sin(u));

        const U = j / resolution; 
        const V = (v + 0.5);
        this.uvs.push(U, V);
      }
    }
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const k1 = i * (resolution + 1) + j;
        const k2 = k1 + (resolution + 1);
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