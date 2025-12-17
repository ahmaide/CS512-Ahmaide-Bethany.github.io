const PIECE_ASSETS = {
    b: { // Black Pieces
        p: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chess_pdt60.png",
        r: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Chess_rdt60.png",
        n: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Chess_ndt60.png",
        b: "https://upload.wikimedia.org/wikipedia/commons/8/81/Chess_bdt60.png",
        q: "https://upload.wikimedia.org/wikipedia/commons/a/af/Chess_qdt60.png",
        k: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Chess_kdt60.png"
    },
    w: { // White Pieces
        p: "https://upload.wikimedia.org/wikipedia/commons/0/04/Chess_plt60.png",
        r: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png",
        n: "https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png",
        b: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png",
        q: "https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png",
        k: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Chess_klt60.png"
    }
};

let selectedSquare = null;

let destinations = [];

let flipped = false;

let BOARD_LAYOUT = [
    ['R', 'N', 'B', 'K', 'Q', 'B', 'N', 'R'], 
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], 
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'k', 'q', 'b', 'n', 'r']  
];

let layout_2D = [
    ['R', 'N', 'B', 'K', 'Q', 'B', 'N', 'R'], 
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], 
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['',  '',  '',  '',  '',  '',  '',  ''],   
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'k', 'q', 'b', 'n', 'r']  
];



function create2DBoard() {
    const container = document.getElementById("chessBoard2D");
    if (!container) return;

    container.innerHTML = "";
    container.style.position = "relative"; 
    container.style.width = "500px";
    container.style.height = "500px";


    const grid = document.createElement("div");
    grid.style.position = "absolute";
    grid.style.inset = "0";
    grid.style.zIndex = "1";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(8, 1fr)";
    grid.style.gridTemplateRows = "repeat(8, 1fr)";


    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement("div");
            square.addEventListener("click", () => {
                checkSquareCase(col, row);
            });
            square.style.boxShadow = "inset 0 0 0 1px rgba(0, 0, 0, 0.5)";
            square.style.display = "flex";
            square.style.alignItems = "center";
            square.style.justifyContent = "center";
            square.style.cursor = "pointer"; 
            if ((row + col) % 2 === 0) {
                square.style.backgroundColor = "rgba(238, 238, 210, 0.6)"; 
            } else {
                square.style.backgroundColor = "rgba(118, 150, 86, 0.6)"; 
            }
            if (BOARD_LAYOUT[7-row] && BOARD_LAYOUT[7-row][7-col]) {
                const pieceCode = BOARD_LAYOUT[7-row][7-col];
                
                if (pieceCode !== '') {
                    const colorKey = (pieceCode === pieceCode.toUpperCase()) ? 'w' : 'b';
                    const typeKey  = pieceCode.toLowerCase();
                    
                    if (PIECE_ASSETS[colorKey] && PIECE_ASSETS[colorKey][typeKey]) {
                        const img = document.createElement("img");
                        img.src = PIECE_ASSETS[colorKey][typeKey];
                        
                        img.style.width = "100%";
                        img.style.height = "100%";
                        img.style.objectFit = "contain";
                        img.style.pointerEvents = "none";
                        
                        square.appendChild(img);
                    }
                }
            }
            grid.appendChild(square);
        }
    }
    container.appendChild(grid);
}


function updateBoardPieces() {
    const container = document.getElementById("chessBoard2D");
    if (!container) return;

    const grid = container.lastElementChild; 

    if (!grid || grid.children.length !== 64) {
        console.warn("Grid not found or invalid. Recreating board...");
        create2DBoard(); 
        return;
    }

    const squares = grid.children;

    for (let row = 0; row <8 ; row++) {
        for (let col = 0; col < 8; col++) {
            const index = row * 8 + col;
            const square = squares[index];
            square.innerHTML = ""; 
            if (layout_2D[7-row] && layout_2D[7-row][7-col]) {
                const pieceCode = layout_2D[7-row][7-col];
            
                if (pieceCode !== '') {
                    const colorKey = (pieceCode === pieceCode.toUpperCase()) ? 'w' : 'b';
                    const typeKey  = pieceCode.toLowerCase();
                    
                    if (PIECE_ASSETS[colorKey] && PIECE_ASSETS[colorKey][typeKey]) {
                        const img = document.createElement("img");
                        img.src = PIECE_ASSETS[colorKey][typeKey];
                        
                        img.style.width = "100%";
                        img.style.height = "100%";
                        img.style.objectFit = "contain";
                        img.style.pointerEvents = "none";
                        
                        square.appendChild(img);
                    }
                }
            }
        }
    }
}

function getDefaultSquareColor(col, row) {
    const isEven = (col + row) % 2 === 0;
    return isEven ? "rgba(238, 238, 210, 0.6)" : "rgba(118, 150, 86, 0.6)";
}

function highlightSquare(col, row) {
    const container = document.getElementById("chessBoard2D");
    if (!container) return;
    const grid = container.lastElementChild;
    const squares = grid.children;
    if (selectedSquare) {
        const oldIndex = selectedSquare.row * 8 + selectedSquare.col;
        if (squares[oldIndex]) {
            squares[oldIndex].style.backgroundColor = getDefaultSquareColor(selectedSquare.col, selectedSquare.row);
        }
    }
    const newIndex = row * 8 + col;
    if (squares[newIndex]) {
        squares[newIndex].style.backgroundColor = "rgba(255, 255, 0, 0.6)";
    }
    selectedSquare = { col, row };
}

function highlightDestinations() {
    const container = document.getElementById("chessBoard2D");
    if (!container) return;
    const grid = container.lastElementChild;
    const squares = grid.children;
    for (const destanation of destinations){
        row = 7-destanation[0];
        col = 7-destanation[1];
        const newIndex = row * 8 + col;
        if (squares[newIndex]) {
          squares[newIndex].style.backgroundColor = "rgba(255, 0, 0, 0.6)";
        }
        if(!flipped){
            highlightSquare3D(destanation[1], destanation[0]);
        }
        else{
            highlightSquare3D(7-destanation[1], 7- destanation[0]);
        }
    }
}

function clearDestinations(){
    const container = document.getElementById("chessBoard2D");
    if (!container) return;
    const grid = container.lastElementChild;
    const squares = grid.children;
    for (const destanation of destinations){
        row = 7 -destanation[0];
        col = 7 -destanation[1];
        const oldIndex = row * 8 + col;
        squares[oldIndex].style.backgroundColor = getDefaultSquareColor(col, row);
    }
    destinations = [];
    clearHighlights();
}

function checkSquareCase(col, row){
     let type = layout_2D[7-row][7-col];
     
    if(destinations.some(sub => sub[0] === 7-row && sub[1] === 7-col)){
        move(col, row);
    }
    else{
        if(type == ''){
            return;
        }
        if ((type == type.toUpperCase() && !flipped) || (type != type.toUpperCase() && flipped)){
            onSquareClick(col, row);
        }
    }
}

function onSquareClick(col, row) {
    clearDestinations();
    destinations = get_destinations(7-row, 7-col, layout_2D, 1);
    highlightDestinations(destinations);
    if(!flipped)
        show_selected_part_yellow(7-col, 7-row);
    else
        show_selected_part_yellow(col, row);
    
    highlightSquare(col, row);
    const piece = BOARD_LAYOUT[row][col];
}

let doneFlipping = false;

function flip_board(){
    clear_selected();
    clearDestinations();
    flipped = !flipped;
    //removeHighlight3D();
    const container = document.getElementById("chessBoard2D");
    if (!container) return;
    const grid = container.lastElementChild;
    const squares = grid.children;
    if (selectedSquare) {
        const oldIndex = selectedSquare.row * 8 + selectedSquare.col;
        if (squares[oldIndex]) {
            squares[oldIndex].style.backgroundColor = getDefaultSquareColor(selectedSquare.col, selectedSquare.row);
        }
    }
    
    for(let i=0 ; i<4 ; i++){
        for(let j =0 ; j<8 ; j++){
            let temp = layout_2D[i][j];
            layout_2D[i][j] = layout_2D[7-i][7-j];
            layout_2D[7-i][7-j] = temp;
        }
    }
    updateBoardPieces();
}

function move(col, row){
    doneFlipping = false;
    let new_col = 7 - col;
    let new_row = 7 - row;
    let old_col = 7 - selectedSquare.col;
    let old_row = 7- selectedSquare.row;
    if(Math.abs(old_col-new_col) == Math.abs(new_row - old_row)){
        if(!flipped){
            animateFall(new_col, new_row, 1);
            movePieceDiagonal(old_col, old_row, new_col, new_row);
        }
        else{
            animateFall(7-new_col, 7-new_row, -1);
            movePieceDiagonal(7 - old_col, 7 - old_row, 7 - new_col, 7 - new_row);   

        }
    }
    else{
        if(!flipped){
            animateFall(new_col, new_row, 1);
            movePiece(old_col, old_row, new_col, new_row);
        }
        else{
            animateFall(7-new_col, 7-new_row, -1);
            movePiece(7 - old_col, 7 - old_row, 7 - new_col, 7 - new_row);
        }
    }
    layout_2D[7-row][7-col]= layout_2D[old_row][old_col];
    layout_2D[old_row][old_col] = '';
    updateBoardPieces();
    flip_board();
}