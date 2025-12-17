let board_data = []


function boardToWorld(col, row) {
    // board tiles run from (0,0) to (8,8)
        // world center of tile = (col + 0.5, row + 0.5)
        return {
        x: BOARD_MIN_X + (col + 0.5) * BOARD_TILE_SIZE,
        z: BOARD_MIN_Z + (row + 0.5) * BOARD_TILE_SIZE
    };
}

function addPawn(col, row, color) {
    const parts = [];
    let pos = boardToWorld(col, row);
    const x = pos.x;
    const z = pos.z;
    const y = 0.0;

    parts.push(new RTCube({
        center: [x, y, z],
        size: [0.15, 0.25, 0.15],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 5.0
    }));

    parts.push(new RTSphere({
        center: [x, y + 0.3, z],
        radius: 0.15,
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    for (let p of parts) world.add(p);

    return parts;
}

function addRook(col, row, color) {
    const parts = [];
    let pos = boardToWorld(col, row);
    const x = pos.x;
    const z = pos.z;
    const y = 0.0;

    //base
    parts.push(new RTCube({
        center: [x, y, z],
        size: [0.25, 0.1, 0.25],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    //center
    parts.push(new RTCube({
        center: [x, y+0.1, z],
        size: [0.15, 0.5, 0.15  ],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 8.0
    }));

    // top
    parts.push(new RTCube({
        center: [x, y+0.6, z],
        size: [0.2, 0.1, 0.2],
        color,
        material: MATERIAL_GLASS,  
        refractiveIndex: 1.5  
    }));
    for (let p of parts) world.add(p);

    return parts;

}

function addKnight(col, row, color) {
    const parts = [];
    let pos = boardToWorld(col, row);
    const x = pos.x;
    const z = pos.z;
    const y = 0.0;
    

    parts.push(new RTCube({
        center: [x, y + 0.05, z],
        size: [0.3, 0.05, 0.3],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    const neckLength = 0.8;
    const neckThickness = 0.15;
    const tiltAngle = Math.PI / 6; 

    parts.push(new RTCube({

        center: [x, y + 0.45, z + 0.15],
        size: [neckThickness, neckLength / 2, neckThickness / 2],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 3.0,
    }));

    const headX = x;
    const headY = y + 0.85;
    const headZ = z + 0.35;
    
    parts.push(new RTCube({
        center: [headX, headY, headZ],
        size: [0.15, 0.15, 0.1],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));


    parts.push(new RTCube({
        center: [headX, headY + 0.1, headZ + 0.05],
        size: [0.03, 0.08, 0.03],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    parts.push(new RTCube({
        center: [headX, headY - 0.05, headZ - 0.05],
        size: [0.1, 0.05, 0.05],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    for (let p of parts) world.add(p);

    return parts;
}


function addBishop(col, row, color) {
    const parts = [];
    let pos = boardToWorld(col, row);
    const x = pos.x;
    const z = pos.z;
    const y = 0.0;

    const BASE_HEIGHT = 0.05; 
    parts.push(new RTCube({
        center: [x, y + BASE_HEIGHT, z],
        size: [0.25, BASE_HEIGHT, 0.25], 
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    const CONE_HEIGHT = 0.7; 
    parts.push(new RTCone({
        apex:    [x, y + BASE_HEIGHT * 2 + CONE_HEIGHT, z], 
        axis:    [0.0, -1.0, 0.0],
        height:  CONE_HEIGHT,
        radius:  0.2,               
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 3.0
    }));

    const HEAD_RADIUS = 0.1;
    parts.push(new RTSphere({
        center: [x, y + BASE_HEIGHT * 2 + CONE_HEIGHT - HEAD_RADIUS, z],
        radius: HEAD_RADIUS,
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));
    
    parts.push(new RTSphere({
        center: [x, y + 0.8, z],
        radius: 0.06,
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    for (let p of parts) world.add(p);

    return parts;
}

function addKing(col, row, color) {
    const pos = boardToWorld(col, row);
    const x = pos.x;
    const z = pos.z;
    const y = 0.0;

    const parts = [];
    // base
    

    parts.push(new RTCube({
        center: [x, y + 0.1, z],
        size: [0.25, 0.1, 0.25],
        color,
        material: MATERIAL_GLASS,  
        refractiveIndex: 1.5  
    }));

    //center
    parts.push(new RTCube({
        center: [x, y + 0.2, z],
        size: [0.1, 0.8, 0.1],
        color,
        material: MATERIAL_GLASS,  
        refractiveIndex: 8.0  
    }));

    //top / crown
    parts.push(new RTCube({
        center: [x, y + 1.0, z],
        size: [0.2, 0.1, 0.2],
        color,
        material: MATERIAL_GLASS,  
        refractiveIndex: 1.5  
    }));

    parts.push(new RTSphere({
        center: [x, y + 1.2, z],
        radius: 0.05,
        color,
        material: MATERIAL_GLASS,  
        refractiveIndex: 1.5  
    }));

    parts.push(new RTSphere({
        center: [x, y + 1.25, z],
        radius: 0.05,
        color,
         material: MATERIAL_GLASS,  
        refractiveIndex: 1.5  
    }));
    

    for (let p of parts) world.add(p);

    return parts;
}

function addQueen(col, row, color) {
    const pos = boardToWorld(col, row);
    const x = pos.x;
    const z = pos.z;
    const y = 0.0;

    const parts = [];

    const BASE_THICKNESS = 0.1; 
    parts.push(new RTCube({
        center: [x, y + BASE_THICKNESS / 2, z],
        size: [0.25, BASE_THICKNESS / 2, 0.25], 
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    const CENTER_BODY_HEIGHT = 0.6; 
    const CENTER_BODY_CENTER_Y = y + BASE_THICKNESS + CENTER_BODY_HEIGHT / 2;
    parts.push(new RTCube({
        center: [x, CENTER_BODY_CENTER_Y, z],
        size: [0.12, CENTER_BODY_HEIGHT / 2, 0.12],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 8.0
    }));

    const CROWN_BASE_THICKNESS = 0.1;
    const CROWN_BASE_CENTER_Y = CENTER_BODY_CENTER_Y + CENTER_BODY_HEIGHT / 2 + CROWN_BASE_THICKNESS / 2;
    parts.push(new RTCube({
        center: [x, CROWN_BASE_CENTER_Y, z],
        size: [0.2, CROWN_BASE_THICKNESS / 2, 0.2],
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));
    
    const CROWN_TIP_RADIUS = 0.08;
    const CROWN_TIP_CENTER_Y = CROWN_BASE_CENTER_Y + CROWN_BASE_THICKNESS / 2 + CROWN_TIP_RADIUS;
    parts.push(new RTSphere({
        center: [x, CROWN_TIP_CENTER_Y, z],
        radius: CROWN_TIP_RADIUS,
        color,
        material: MATERIAL_GLASS,
        refractiveIndex: 1.5
    }));

    for (let p of parts) world.add(p);
    return parts;
}


const white = [0.9, 0.9, 0.9];
const black = [0.15, 0.15, 0.15];

function placePieces() {

    for (let row = 0; row < 8; row++) {
        board_data[row] = []
        for (let col = 0; col < 8; col++) {
            board_data[row][col] = [];
        }
    }
    // Pawns
    for (let c = 0; c < 8; c++) {
        board_data [c][1] = addPawn(c, 1, white);
        
    }

    for (let c = 0; c < 8; c++) {
        board_data [c][6] = addPawn(c, 6, black);
    }

    // Rooks
    board_data [0][0] = addRook(0, 0, white);
    board_data [7][0] = addRook(7, 0, white);

    board_data [0][7] = addRook(0, 7, black);
    board_data [7][7] = addRook(7, 7, black);

    board_data [3][0] = addKing(3, 0, white);
    board_data [3][7] = addKing(3, 7, black);

    board_data [4][0] = addQueen(4, 0, white);
    board_data [4][7] = addQueen(4, 7, black);

    board_data [1][0] = addKnight(1, 0, white);
    board_data [6][0] = addKnight(6, 0, white);

    
    board_data [1][7] = addKnight(1, 7, black);
    board_data [6][7] = addKnight(6, 7, black);

    board_data [2][0] = addBishop(2, 0, white);
    board_data [5][0] = addBishop(5, 0, white);

    
    board_data [2][7] = addBishop(2, 7, black);
    board_data [5][7] = addBishop(5, 7, black);

    return board_data[4][0];
}
