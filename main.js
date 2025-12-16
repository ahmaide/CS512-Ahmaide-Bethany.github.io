const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
if (!gl) alert("WebGL2 not supported.");

const MATERIAL_DIFFUSE     = 0;
const MATERIAL_REFLECTIVE  = 1;
const MATERIAL_REFRACTIVE  = 2;
const MATERIAL_EMISSIVE    = 3;
const MATERIAL_CHESSBOARD  = 99;
const MATERIAL_GLASS = 4;

setupUI();

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
    material: MATERIAL_DIFFUSE
}));

king_parts = placePieces();

let kingAngle = 0;
let kingTargetAngle = Math.PI ;
let kingFalling = false;


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


function startKingFallLeft() {
    if (kingFalling) return;  // avoid double-trigger
    kingFalling = true;
}

let king_original_offsets = null;

function rotateKingLeft(parts, angle, side) {
    if (!parts || parts.length === 0) return;

    const base = parts[0];

    if (!king_original_offsets) {
        king_original_offsets = parts.map(p => {
            const data = {
                dx: p.center[0] - base.center[0],
                dy: p.center[1] - base.center[1],
                dz: p.center[2] - base.center[2]
            };

            if (p.apex) {
                data.adx = p.apex[0] - base.center[0]; 
                data.ady = p.apex[1] - base.center[1];
                data.adz = p.apex[2] - base.center[2];
                data.axis = [...p.axis];
            }
            return data;
        });
    }

    const pivot = {
        x: base.center[0] - side * base.size[0], 
        y: base.center[1] - base.size[1],  
        z: base.center[2] 
    };

    const s = Math.sin(angle);
    const c = Math.cos(angle);

    for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const o = king_original_offsets[i];

        const dx = (base.center[0] + o.dx) - pivot.x;
        const dy = (base.center[1] + o.dy) - pivot.y;
        const dz = (base.center[2] + o.dz) - pivot.z;

        const nx = dx; 
        const ny = dy * c + side * dz * s;
        const nz = side * dy * s + dz * c;

        p.center[0] = pivot.x + nx;
        p.center[1] = pivot.y + ny;
        p.center[2] = pivot.z + nz;

        if (p.apex && o.adx !== undefined) {
            const adx = (base.center[0] + o.adx) - pivot.x;
            const ady = (base.center[1] + o.ady) - pivot.y;
            const adz = (base.center[2] + o.adz) - pivot.z;

            const nax = adx;
            const nay = ady * c + side * adz * s;
            const naz = side * ady * s + adz * c;

            p.apex[0] = pivot.x + nax;
            p.apex[1] = pivot.y + nay;
            p.apex[2] = pivot.z + naz;

            const ax = o.axis[0];
            const ay = o.axis[1];
            const az = o.axis[2];

            p.axis[0] = ax;
            p.axis[1] = ay * c + side * az * s; 
            p.axis[2] = side * ay * s + az * c; 
        }


        if (p.size && p.rotation) {
            p.rotation = [
                1,  0,   0,
                0,  c,  side * -s,
                0,  side * s,   c
            ];
        }
    }
} 


function rotateKingFront(parts, angle, side) {
    if (!parts || parts.length === 0) return;

    const base = parts[0];

    if (!king_original_offsets) {
        king_original_offsets = parts.map(p => {
            const data = {
                dx: p.center[0] - base.center[0],
                dy: p.center[1] - base.center[1],
                dz: p.center[2] - base.center[2]
            };

            if (p.apex) {
                data.adx = p.apex[0] - base.center[0]; 
                data.ady = p.apex[1] - base.center[1];
                data.adz = p.apex[2] - base.center[2];
                data.axis = [...p.axis];
            }
            return data;
        });
    }

    const pivot = {
        x: base.center[0], 
        y: base.center[1] - base.size[1],  
        z: base.center[2] - side * base.size[2]
    };

    const s = Math.sin(angle);
    const c = Math.cos(angle);

    for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const o = king_original_offsets[i];

        const dx = (base.center[0] + o.dx) - pivot.x;
        const dy = (base.center[1] + o.dy) - pivot.y;
        const dz = (base.center[2] + o.dz) - pivot.z;

        const nx = side * dy * s + dx * c; 
        const ny = dy * c + side * dx * s;
        const nz = dz;

        p.center[0] = pivot.x + nx;
        p.center[1] = pivot.y + ny;
        p.center[2] = pivot.z + nz;

        if (p.apex && o.adx !== undefined) {
            const adx = (base.center[0] + o.adx) - pivot.x;
            const ady = (base.center[1] + o.ady) - pivot.y;
            const adz = (base.center[2] + o.adz) - pivot.z;

            const naz = adz;
            const nay = ady * c + side * adx * s;
            const nax = side * ady * s + adx * c;

            p.apex[0] = pivot.x + nax;
            p.apex[1] = pivot.y + nay;
            p.apex[2] = pivot.z + naz;

            const ax = o.axis[0];
            const ay = o.axis[1];
            const az = o.axis[2];

            p.axis[2] = az;
            p.axis[1] = ay * c + side* ax * s; 
            p.axis[0] = side * ay * s + ax * c; 
        }


        if (p.size && p.rotation) {
            p.rotation = [
                1,  0,   0,
                0,  c,  side * -s,
                0,  side * s,   c
            ];
        }
    }
} 


function render(time) {
    gl.useProgram(program);

    
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);

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
    rotateKingFront(king_parts, kingAngle, -1);
    uploadWorld();

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}

let color_switched = false;

function makeActivePartPurple() {
    if (!king_parts || king_parts.length === 0) return;

    color_switched = !color_switched;

    const ghostPurple = [8.0, 8.0, 0.0]; 

    for (let p of king_parts) {

        if(!color_switched){
            p.material = MATERIAL_GLASS;
            p.color = [1, 1, 1];
            p.refractiveIndex = 1.0; 
            p.reflectivity = 1.5; 
        }
        else{
            p.color = ghostPurple;
            p.material = MATERIAL_REFRACTIVE;
            p.refractiveIndex = 1.0; 
            p.reflectivity = 1.2; 
        }
    }
    
    uploadWorld();
}

requestAnimationFrame(render);

function fallKingLeft() {
    if (kingFalling || kingAngle >= kingTargetAngle) return; 
    
    kingFalling = true;

    let start = performance.now();
    const DURATION_MS = 500; 
    
    const startAngle = kingAngle; 

    function animate() {
        let now = performance.now();
        let t = (now - start) / DURATION_MS;
        
        if (t > 1) t = 1;

        kingAngle = startAngle + (kingTargetAngle - startAngle) * t;

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            kingAngle = kingTargetAngle;
            kingFalling = false;
        }
    }
    animate();
}


function movePiece(parts, targetCol, targetRow) {
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


function movePieceDiagonal(parts, steps, dirX, dirZ) {
    if (!parts || parts.length === 0) return;

    const base = parts[0];
    const startX = base.center[0];
    const startY = base.center[1];
    const startZ = base.center[2];

    const currentCol = Math.floor((startX - BOARD_MIN_X) / BOARD_TILE_SIZE);
    const currentRow = Math.floor((startZ - BOARD_MIN_Z) / BOARD_TILE_SIZE);

    const targetCol = currentCol + (steps * dirX);
    const targetRow = currentRow + (steps * dirZ);

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


window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        switchCameraView();
    }
});

window.addEventListener("keydown", e => {
    if (e.key === "k" || e.key === "K") {
        fallKingLeft();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "c" || e.key === "C") {
        makeActivePartPurple();
    }
});


window.addEventListener("keydown", (e) => {
    if (e.key === "m" || e.key === "M") {
        movePiece(king_parts, 3, 3);
    }
});


window.addEventListener("keydown", (e) => {

    if (e.key === "d" || e.key === "D") {
        movePieceDiagonal(king_parts, 3, 1, -1);
    }
});