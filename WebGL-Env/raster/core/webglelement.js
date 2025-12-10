class WebGLElement {
	constructor(gl, geometry, shader, name){
		this.gl = gl;
		this.geometry = geometry;
		this.shader = shader;
		this.name = name;
		this.vao = null;
		this.vbo = null;
		this.ibo = null;
		this.tbo = null;
		this.color = [0.5, 0.5, 0.5]; 
		this.texture = null;
        this.normalMap = null;

		if (geometry){
		    this.count = geometry.getIndices().length;

		}else{
			this.count = 0;
		}

		// to keep track of hierchichal relationships
		this.transform = mat4Identity();
		this.children = [];
		this.parent = null;
	}

	getProgram() {
		return this.shader.program;
	}

	getTransform() {
        return this.transform;
    }

    setTransform(matrix) {
        this.transform = matrix;
    }


	getWorldTransform() {
		if (!this.parent){
			return this.transform;
		}else{
			return multiplyMat4(this.parent.getWorldTransform(), 
								this.transform);
		}
	}

    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    getChildren() {
        return this.children;
    }

    setParent(parent) {
        this.parent = parent;
    }

    getParent() {
        return this.parent;
    }

    getElement() {
        return this.element;
    }

    setElement(element) {
        this.element = element;
    }

	getColor() {
		return this.color;
	}

	setColor(newColor) {
		this.color = newColor;
		this.createBuffers();
	}

	setGeometry(newGeometry){
		if (this.vbo) this.gl.deleteBuffer(this.vbo);
		if (this.ibo) this.gl.deleteBuffer(this.ibo);
		if (this.vao) this.gl.deleteVertexArray(this.vao);

		this.geometry = newGeometry;
		this.count = newGeometry.getIndices().length;
		this.createBuffers();  
	}

	getGeometry(){
		return this.geometry;
	}

	setTexture(texture){
		this.texture = texture;
	}

	getTexture(){
		return this.texture;
	}

    setNormalMap(normalMap){
        this.normalMap = normalMap;
    }

    getNormalMap(){
        return this.normalMap;
    }

	getUVs(){
		return this.geometry.getUVs();
	}

	createBuffers() {
    const gl = this.gl;
    const shader = this.shader;

    const vertices = this.geometry.getVertices();
    const normals  = this.geometry.getNormals();
    const uvs      = this.geometry.getUVs();
    const indices  = this.geometry.getIndices();
    const count    = this.geometry.getVertexCount();

    this.count = indices.length;

    const stride = 9 * 4;
    const interleaved = new Float32Array(count * 9);

    for (let i = 0; i < count; i++) {
        interleaved[i*9+0] = vertices[i*3+0];
        interleaved[i*9+1] = vertices[i*3+1];
        interleaved[i*9+2] = vertices[i*3+2];

        interleaved[i*9+3] = normals[i*3+0];
        interleaved[i*9+4] = normals[i*3+1];
        interleaved[i*9+5] = normals[i*3+2];

        interleaved[i*9+6] = this.color[0];
        interleaved[i*9+7] = this.color[1];
        interleaved[i*9+8] = this.color[2];
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, interleaved, gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    if (shader.posLoc !== -1) {
        gl.enableVertexAttribArray(shader.posLoc);
        gl.vertexAttribPointer(shader.posLoc, 3, gl.FLOAT, false, stride, 0);
    }

    // normals
	if (shader.normalLoc !== -1) {
		gl.enableVertexAttribArray(shader.normalLoc);
		gl.vertexAttribPointer(shader.normalLoc, 3, gl.FLOAT, false, stride, 3 * 4);
	}

    // colors
    if (shader.colorLoc !== -1) {
        gl.enableVertexAttribArray(shader.colorLoc);
        gl.vertexAttribPointer(shader.colorLoc, 3, gl.FLOAT, false, stride, 6*4);
    }

    // uvs for texture
    if (uvs.length > 0 && shader.aUV !== -1) {
        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
        gl.vertexAttribPointer(shader.aUV, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shader.aUV);

        this.tbo = uvBuffer;
    }else{
		console.log("This shape doesn't have UVS: ", this.name);
	}

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.vao = vao;
    this.vbo = vbo;
    this.ibo = ibo;
}

}