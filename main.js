const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
if (!gl) alert("WebGL2 not supported.");

const MATERIAL_DIFFUSE     = 0;
const MATERIAL_REFLECTIVE  = 1;
const MATERIAL_REFRACTIVE  = 2;
const MATERIAL_EMISSIVE    = 3;
const MATERIAL_CHESSBOARD  = 99;
const MATERIAL_GLASS = 4;
const TARGET_ANGLE = Math.PI;

setupUI();


// Video Setup
const video = document.getElementById("videoTexture");
video.play().catch(e => console.error("Video play failed:", e));

const videoTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, videoTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

const MATERIAL_VIDEO = 5;

// set up shader with ray tracing logic
const program = createShaderProgram(gl, vertexShader, fragShader);
const uBoardMinLoc  = gl.getUniformLocation(program, "u_boardMin");
const uBoardSizeLoc = gl.getUniformLocation(program, "u_boardTileSize");

gl.useProgram(program);
gl.uniform2f(uBoardMinLoc, BOARD_MIN_X, BOARD_MIN_Z);
gl.uniform1f(uBoardSizeLoc, BOARD_TILE_SIZE);

// view/camera
const camera = new RTView({
    position: [0, 6, -10],
    target:   [0, 0, 0]
});

function uploadCamera() {
    camera.upload(gl, program);
}

const world = new RTWorld();

const boardY = 0.001;
// add plane for chessboard
world.add(new RTPlane({
    normal: [0, 1, 0],
    d:       0.0,
    color:  [1.0, 1.0, 1.0],
    material: MATERIAL_CHESSBOARD
}));

const tileSize = BOARD_TILE_SIZE;
const boardWidth  = 8 * tileSize;
const boardDepth  = 8 * tileSize;

const boardCenterX = BOARD_MIN_X + boardWidth / 2;
const boardCenterZ = BOARD_MIN_Z + boardDepth / 2;

const baseHeight = 0.8;   // thickness of wood under the board
const baseColor  = [0.45, 0.28, 0.15];

world.add(new RTCube({
    center: [boardCenterX, -baseHeight / 2 - 0.1, boardCenterZ],
    size: [
        boardWidth / 2 + 0.8,
        baseHeight/2,
        boardDepth / 2 + 0.8     
    ],
    color: baseColor,
    material: MATERIAL_VIDEO
}));

board_data = placePieces();

function uploadWorld() {
    world.upload(gl, program);
}


const quadVAO = gl.createVertexArray();
gl.bindVertexArray(quadVAO);

const quadBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
        -1, -1,
         3, -1,
        -1,  3
    ]),
    gl.STATIC_DRAW
);

gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


// function animateWorld(timeSeconds) {
//     const t = timeSeconds;

//     for (let i = 0; i < world.cubes.length; i++) {
//         world.cubes[i].rotation = t * 0.6; 
//     }
// }

function switchCameraView(duration = 1000) {
    const startPos = camera.position.slice();

    const endPos = [
        camera.position[0],
        camera.position[1],
        2 * boardCenterZ - camera.position[2]
    ];

    const startTime = performance.now();

    function animate() {
        const now = performance.now();
        const t = Math.min(1, (now - startTime) / duration);

        const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

        camera.position[0] = startPos[0] + (endPos[0] - startPos[0]) * ease;
        camera.position[1] = startPos[1] + (endPos[1] - startPos[1]) * ease;
        camera.position[2] = startPos[2] + (endPos[2] - startPos[2]) * ease;

        camera.target = [boardCenterX, 0, boardCenterZ];

        camera._updateBasis();

        uploadCamera();

        if (t < 1) requestAnimationFrame(animate);
    }

    animate();
}

let fall_original_offsets = null;

function animateFall(col, row, direction = -1) {
    let parts = board_data[col][row];
    if (!parts || parts.length === 0) return new Promise(r => r());

    const base = parts[0];
    const side = direction; 
    const TARGET_ANGLE = Math.PI / 2; 
    const DURATION = 600; 

    const sizeX = base.size ? base.size[0] : 0.4;
    const sizeY = base.size ? base.size[1] : 0.01;

    const pivot = {
        x: base.center[0] - side * sizeX, 
        y: base.center[1] - sizeY,   
        z: base.center[2] 
    };

    const initialOffsets = parts.map(p => {
        return {
            dx: p.center[0] - pivot.x,
            dy: p.center[1] - pivot.y,
            dz: p.center[2] - pivot.z,

            hasApex: !!p.apex,
            adx: p.apex ? p.apex[0] - pivot.x : 0,
            ady: p.apex ? p.apex[1] - pivot.y : 0,
            adz: p.apex ? p.apex[2] - pivot.z : 0,
            axis: p.axis ? [...p.axis] : null
        };
    });

    return new Promise((resolve) => {
        const startTime = performance.now();

        function loop() {
            const now = performance.now();
            let t = (now - startTime) / DURATION;
            if (t > 1) t = 1;
            const angle = TARGET_ANGLE * t;

            const s = Math.sin(angle);
            const c = Math.cos(angle);
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i];
                const origin = initialOffsets[i];
                const nx = origin.dx;
                const ny = origin.dy * c + side * origin.dz * s;
                const nz = side * origin.dy * s + origin.dz * c;

                p.center[0] = pivot.x + nx;
                p.center[1] = pivot.y + ny;
                p.center[2] = pivot.z + nz;
                if (origin.hasApex) {
                    const nax = origin.adx;
                    const nay = origin.ady * c + side * origin.adz * s;
                    const naz = side * origin.ady * s + origin.adz * c;

                    p.apex[0] = pivot.x + nax;
                    p.apex[1] = pivot.y + nay;
                    p.apex[2] = pivot.z + naz;
                    const ax = origin.axis[0];
                    const ay = origin.axis[1];
                    const az = origin.axis[2];

                    p.axis[0] = ax;
                    p.axis[1] = ay * c + side * az * s;
                    p.axis[2] = side * ay * s + az * c;
                }

                if (p.size && p.rotation) {
                    p.rotation = [
                        1, 0, 0,
                        0, c, side * -s,
                        0, side * s, c
                    ];
                }
            }
            
            uploadWorld();
            
            if (t < 1) {
                requestAnimationFrame(loop);
            } else {
                parts.forEach(p => {
                    if (world.cubes) {
                        const idx = world.cubes.indexOf(p);
                        if (idx > -1) world.cubes.splice(idx, 1);
                    }
                    if (world.cones) {
                        const idx = world.cones.indexOf(p);
                        if (idx > -1) world.cones.splice(idx, 1);
                    }
                    if (world.spheres) {
                        const idx = world.spheres.indexOf(p);
                        if (idx > -1) world.spheres.splice(idx, 1);
                    }
                });
                uploadWorld();
                resolve(); 
            }
        }
        loop();
    });
}


function render(time) {
    gl.useProgram(program);

    if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }

    gl.uniform1i(gl.getUniformLocation(program, "u_videoTexture"), 0);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), time );

    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, "u_lightIntensity"), params.lightIntensity);
    gl.uniform1f(gl.getUniformLocation(program, "u_ambientStrength"), params.ambientStrength);
    gl.uniform1f(gl.getUniformLocation(program, "u_reflectionStrength"), params.reflectionStrength);
    gl.uniform3f(
        gl.getUniformLocation(program, "u_objectColor"),
        params.colorR,
        params.colorG,
        params.colorB
    );
    gl.uniform1i(gl.getUniformLocation(program, "u_maxBounces"), params.maxBounces);

    uploadCamera();
    uploadWorld();

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}

let selected_parts = null;
let previously_selected = null;
let wasLastPieceWhite = true;

function show_selected_part_yellow(row, col) {
    if (previously_selected) {
        for (let p of previously_selected) {
            p.material = MATERIAL_GLASS;
            
            if (wasLastPieceWhite) {
                p.color = [0.9, 0.9, 0.9]; 
            } else {
                p.color = [0.15, 0.15, 0.15]; 
            }
            
            p.refractiveIndex = 1.0; 
            p.reflectivity = 1.5; 
        }
    }

    selected_parts = board_data[row][col];

    if (!selected_parts || selected_parts.length === 0) {
        selected_parts = null;
        previously_selected = null;
        return;
    }
    if (selected_parts[0].color[0] > 0.5) {
        wasLastPieceWhite = true;
    } else {
        wasLastPieceWhite = false;
    }
    const yellowish = [8.0, 8.0, 0.0]; 
    for (let p of selected_parts) {
        p.color = yellowish;
        p.material = MATERIAL_REFRACTIVE;
        p.refractiveIndex = 1.0; 
        p.reflectivity = 1.2; 
    }
    previously_selected = selected_parts;

    uploadWorld();
}

function clear_selected(){
    if (previously_selected) {
        for (let p of previously_selected) {
            p.material = MATERIAL_GLASS;
            
            if (wasLastPieceWhite) {
                p.color = [0.9, 0.9, 0.9]; 
            } else {
                p.color = [0.15, 0.15, 0.15]; 
            }
            
            p.refractiveIndex = 1.0; 
            p.reflectivity = 1.5; 
        }
    }
    previously_selected = null;
}

requestAnimationFrame(render);


function movePiece(currentCol, currentRow, targetCol, targetRow) {
    let parts = board_data[currentCol][currentRow];
    board_data[targetCol][targetRow] = board_data[currentCol][currentRow];
    board_data[currentCol][currentRow] = [];
    if (!parts || parts.length === 0) return;

    const base = parts[0]; 
    const startX = base.center[0];
    const startZ = base.center[2];
    const startY = base.center[1];


    const targetPos = boardToWorld(targetCol, targetRow);
    const endX = targetPos.x;
    const endZ = targetPos.z;
    const liftHeight = 2.0; 


    const initialOffsets = parts.map(p => ({
        cx: p.center[0], cy: p.center[1], cz: p.center[2],
        ax: p.apex ? p.apex[0] : 0, 
        ay: p.apex ? p.apex[1] : 0,
        az: p.apex ? p.apex[2] : 0
    }));

    const startTime = performance.now();
    const duration = 2000;

    function animate() {
        const now = performance.now();
        let t = (now - startTime) / duration;

        if (t > 1.0) t = 1.0;

        let curX = startX;
        let curY = startY;
        let curZ = startZ;


        if (t < 0.25) {
            const phase = t / 0.25; 
            curY = startY + (liftHeight * phase);
        } 

        else if (t < 0.50) {
            curY = startY + liftHeight; 
            const phase = (t - 0.25) / 0.25;
            curX = startX + (endX - startX) * phase;
        } 

        else if (t < 0.75) {
            curY = startY + liftHeight; 
            curX = endX;
            const phase = (t - 0.50) / 0.25;
            curZ = startZ + (endZ - startZ) * phase;
        } 

        else {
            curX = endX;
            curZ = endZ;
            const phase = (t - 0.75) / 0.25;
            curY = (startY + liftHeight) - (liftHeight * phase);
        }

        const dx = curX - startX;
        const dy = curY - startY;
        const dz = curZ - startZ;

        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            const init = initialOffsets[i];

            p.center[0] = init.cx + dx;
            p.center[1] = init.cy + dy;
            p.center[2] = init.cz + dz;


            if (p.apex) {
                p.apex[0] = init.ax + dx;
                p.apex[1] = init.ay + dy;
                p.apex[2] = init.az + dz;
            }
        }

        uploadWorld(); 
       
        

        if (t < 1.0) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}


function movePieceDiagonal(currentCol, currentRow, targetCol, targetRow) {
    let parts = board_data[currentCol][currentRow];
    board_data[targetCol][targetRow] = board_data[currentCol][currentRow];
    board_data[currentCol][currentRow] = [];

    if (!parts || parts.length === 0) return;

    const base = parts[0];
    const startX = base.center[0];
    const startY = base.center[1];
    const startZ = base.center[2];

    if (targetCol < 0 || targetCol > 7 || targetRow < 0 || targetRow > 7) {
        console.log("Move out of bounds! Canceling.");
        return;
    }

    const targetPos = boardToWorld(targetCol, targetRow);
    const endX = targetPos.x;
    const endZ = targetPos.z;
    const liftHeight = 2.0;

    const initialOffsets = parts.map(p => ({
        cx: p.center[0], cy: p.center[1], cz: p.center[2],
        ax: p.apex ? p.apex[0] : 0, 
        ay: p.apex ? p.apex[1] : 0,
        az: p.apex ? p.apex[2] : 0
    }));

    const startTime = performance.now();
    const duration = 1500;

    function animate() {
        const now = performance.now();
        let t = (now - startTime) / duration;
        if (t > 1.0) t = 1.0;

        let curX = startX;
        let curY = startY;
        let curZ = startZ;

        if (t < 0.25) {
            const phase = t / 0.25;
            curY = startY + (liftHeight * phase);
        } 

        else if (t < 0.75) {
            curY = startY + liftHeight; 
            const phase = (t - 0.25) / 0.50; 
            curX = startX + (endX - startX) * phase;
            curZ = startZ + (endZ - startZ) * phase;
        } 

        else {
            curX = endX;
            curZ = endZ;
            const phase = (t - 0.75) / 0.25;
            curY = (startY + liftHeight) - (liftHeight * phase);
        }

        const dx = curX - startX;
        const dy = curY - startY;
        const dz = curZ - startZ;

        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            const init = initialOffsets[i];

            p.center[0] = init.cx + dx;
            p.center[1] = init.cy + dy;
            p.center[2] = init.cz + dz;

            if (p.apex) {
                p.apex[0] = init.ax + dx;
                p.apex[1] = init.ay + dy;
                p.apex[2] = init.az + dz;
            }
        }

        uploadWorld();

        if (t < 1.0) requestAnimationFrame(animate);
    }

    animate();
}

let activeHighlights = [];

function highlightSquare3D(col, row) {
    const centerX = BOARD_MIN_X + (col + 0.5) * BOARD_TILE_SIZE;
    const centerZ = BOARD_MIN_Z + (row + 0.5) * BOARD_TILE_SIZE;
    
    const greyCube = new RTCube({
        center: [centerX, 0.01, centerZ], 
        size:   [BOARD_TILE_SIZE / 2, 0.01, BOARD_TILE_SIZE / 2],
        color:  [0.0, 0.8, 0.0], 
        material: MATERIAL_GLASS,
        refractiveIndex: 5.0 
    });
    
    world.add(greyCube);
    
    activeHighlights.push(greyCube);
    
    uploadWorld();
}

function clearHighlights() {
    for (let cube of activeHighlights) {
        const index = world.cubes.indexOf(cube);
        if (index > -1) {
            world.cubes.splice(index, 1);
        }
    }
    activeHighlights = [];
    uploadWorld();
}


window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        switchCameraView();
    }
});


window.addEventListener("load", function() {
    if (typeof setupUI === "function") setupUI();

    create2DBoard(); 

});

function switchVideo(filename) {
    const video = document.getElementById("videoTexture");
    
    video.src = filename;
    
    video.play().catch(e => console.error("Could not play video:", e));
    
    console.log("Switched texture to:", filename);
}