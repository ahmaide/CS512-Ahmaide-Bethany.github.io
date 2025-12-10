function createShaderProgram(gl, vertexSource, fragmentSource) {
    // Helper to compile a shader
    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // Check for compile errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            console.error("Shader compilation failed:\n", info);
            console.error("Source:\n", source);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertShader || !fragShader) {
        throw new Error("Shader compilation failed.");
    }

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        console.error("Program linking failed:\n", info);
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        throw new Error("Program failed to link.");
    }

    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    return program;
}