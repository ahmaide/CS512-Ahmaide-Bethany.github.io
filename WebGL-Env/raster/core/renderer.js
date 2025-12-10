class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    render(world, view) {
        const gl = this.gl;
        gl.clearColor(...world.backgroundColor);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const stack = [];
        // console.log(world.elements);
        for (const root of world.elements) {
            stack.push({ element: root, parentMatrix: mat4Identity() });
        }            

        while (stack.length > 0) {
            const { element, parentMatrix } = stack.pop();
            // console.log('Rendering:', element.name, 'Has geometry:', !!element.geometry, 'Has VAO:', !!element.vao);


            // world = parent * local
            const worldTransform = multiplyMat4(parentMatrix, element.transform);

            // Draw only if it has geometry
            if (element.geometry && element.vao && element.count) {
                const sh = element.shader;
                const modelViewMatrix = multiplyMat4(view.viewMatrix, worldTransform);

                gl.useProgram(sh.program);
                gl.bindVertexArray(element.vao);
                gl.uniformMatrix4fv(sh.uPM,  false, view.projMatrix);
                gl.uniformMatrix4fv(sh.uMVM, false, modelViewMatrix);
                gl.uniformMatrix4fv(sh.uMTM, false, worldTransform);

                const normalMatrix = computeNormalMatrix(modelViewMatrix);
                gl.uniformMatrix3fv(sh.uNorm, false, normalMatrix);    

                // gl.uniformMatrix4fv(sh.uMTM, false, worldTransform);
                // console.log(gl.getUniformLocation(sh.program, "uNormalMatrix"));

                // lighting
                gl.uniform3fv(sh.uLightPos, [
                3.0, 4.0, 1.0
                // -4.0, 4.0, 5.0 
                ]);

                gl.uniform3fv(sh.uLightColor, [
                [1.2, 0.8, 0.6]
                // 0.9, 1.0, 1.4 
                ]);

                gl.uniform3fv(sh.uAtten, [
                1.0, 0.01, 0.0005
                // 1.0, 0.01, 0.0005
                ]);

                if (sh.uViewPos) {
                    gl.uniform3fv(sh.uViewPos, new Float32Array(view.position));
                }


                // material
                gl.uniform3fv(sh.uKa,  [0.4, 0.4, 0.4]);
                gl.uniform3fv(sh.uKd, [0.9, 0.9, 0.9]);
                gl.uniform3fv(sh.uKs, [0.1, 0.1, 0.1]);
                gl.uniform1f(sh.uShininess, 5.0);


                // texture
                if (element.texture && element.shader.uSampler) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, element.texture.object);

                    gl.uniform1i(element.shader.uSampler, 0);

                    if (element.shader.uUseTexture) {
                        gl.uniform1i(element.shader.uUseTexture, 1);
                    }
                } else {
                    if (element.shader.uUseTexture) {
                        gl.uniform1i(element.shader.uUseTexture, 0);
                    }
                }
                console.log(element.name, "texture object:", element.texture?.object);
                console.log(`Drawing ${element.name}:`,
  "texture =", element.texture ? element.texture.object : null,
  "useTexture =", element.shader.uUseTexture ? gl.getUniform(element.shader.program, element.shader.uUseTexture) : null
);
                // normal maps
                if (element.normalMap && element.shader.uNormalSampler) {
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, element.normalMap.object);
                    gl.uniform1i(element.shader.uNormalSampler, 1);

                    if (element.shader.uUseNormalMap) {
                        gl.uniform1i(element.shader.uUseNormalMap, 1);
                    }
                } else {
                    if (element.shader.uUseNormalMap) {
                        gl.uniform1i(element.shader.uUseNormalMap, 0);
                    }
                }


                // old robot code
                // const needsOffset = element.name && (element.name.includes("arm") || element.name.includes("head"));

                // if (needsOffset) {
                //     gl.enable(gl.POLYGON_OFFSET_FILL);
                //     gl.polygonOffset(4.0, 10.0);
                // }

                gl.drawElements(gl.TRIANGLES, element.count, gl.UNSIGNED_SHORT, 0);

                // if (needsOffset) {
                //     gl.disable(gl.POLYGON_OFFSET_FILL);
                // }

                gl.bindVertexArray(null);
            }else {
                console.warn(`Skipping draw for ${element.name}: missing geometry or buffers.`);
            }

            for (const child of element.children) {
                stack.push({ element: child, parentMatrix: worldTransform });
            }
        }
            
    }
    

}