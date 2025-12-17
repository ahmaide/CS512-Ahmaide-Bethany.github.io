const { jsxs } = require("react/jsx-runtime");

function compareCase(a, b) {
    if (a.toLowerCase() === a.toUpperCase() || b.toLowerCase() === b.toUpperCase()) {
        return false; 
    }
    const isUpperA = (a === a.toUpperCase());
    const isUpperB = (b === b.toUpperCase());
    return isUpperA === isUpperB;
}

function pawn_destinations(row, col, board, isFirst, isWhite){
    let destinations = [];

    if(row+isWhite>=0 && row+isWhite<8 && board[row+isWhite][col]==''){
        destinations.push([row+isWhite, col]);
        if(row+(isWhite*2)>=0 && row+(isWhite*2)<8 && board[row+(isWhite*2)][col]=='' && isFirst)
            destinations.push([row+(isWhite*2), col]);
    }

    if(row+isWhite>=0 && col+1<8 && row+isWhite<8 &&
         !compareCase(board[row][col], board[row+isWhite][col+1]) && board[row+isWhite][col+1]!='')
        destinations.push([row+isWhite, col+1]);

    if(row+isWhite>=0 && col-1>=0 && row+isWhite<8 &&
         !compareCase(board[row][col], board[row+isWhite][col-1]) && board[row+isWhite][col-1]!='')
        destinations.push([row+isWhite, col-1]);

    return destinations;
}
    


function rook_destinations(row, col, board){
    let destinations = [];
    for(let i=row+1; i<8 ; i++){
        if(board[i][col] === ''){
            destinations.push([i, col]);
        }
        else {
            if(!compareCase(board[row][col], board[i][col])){
                destinations.push([i, col])
            }
            break;
        }
    }

    for(let i=row-1; i>=0 ; i--){
        if(board[i][col] === ''){
            destinations.push([i, col]);
        }
        else {
            if(!compareCase(board[row][col], board[i][col])){
                destinations.push([i, col])
            }
            break;
        }
    }

    for(let j=col+1; j<8 ; j++){
        if(board[row][j] === ''){
            destinations.push([row, j]);
        }
        else {
            if(!compareCase(board[row][col], board[row][j])){
                destinations.push([row, j])
            }
            break;
        }
    }

    for(let j=col-1; j>=0 ; j--){
        if(board[row][j] === ''){
            destinations.push([row, j]);
        }
        else {
            if(!compareCase(board[row][col], board[row][j])){
                destinations.push([row, j])
            }
            break;
        }
    }

    return destinations;
}


function knight_destinations(row, col, board){
    let destinations = [];
    let indexs = [-1, -2, 1, 2];
    for(let i =0; i<4 ; i++){
        for(let j = 0 ; j < 4 ; j++){
            if(i%2 === j%2){
                continue;
            }
            if(row+indexs[i]<8 && row+indexs[i]>=0 && col+indexs[j]<8 && col+indexs[j]>=0 &&
                 !compareCase(board[row][col], board[row+indexs[i]][col+indexs[j]])){
                    destinations.push([row+indexs[i], col+indexs[j]]);
                 }
                
        }
    }
    return destinations;
}

function bishop_destinations(row, col, board){
    let destinations = [];
    for(let i=row+1, j=col+1; i<8 && j<8 ; i++, j++){
        if(board[i][j] === ''){
            destinations.push([i, j]);
        }
        else {
            if(!compareCase(board[row][col], board[i][j])){
                destinations.push([i, j])
            }
            break;
        }
    }

    for(let i=row+1, j=col-1; i<8 && j>=0 ; i++, j--){
        if(board[i][j] === ''){
            destinations.push([i, j]);
        }
        else {
            if(!compareCase(board[row][col], board[i][j])){
                destinations.push([i, j])
            }
            break;
        }
    }

    for(let i=row-1, j=col+1; i>=0 && j<8 ; i--, j++){
        if(board[i][j] === ''){
            destinations.push([i, j]);
        }
        else {
            if(!compareCase(board[row][col], board[i][j])){
                destinations.push([i, j])
            }
            break;
        }
    }

    for(let i= row-1, j=col-1; i>=0 && j>=0 ; i--, j--){
        if(board[i][j] === ''){
            destinations.push([i, j]);
        }
        else {
            if(!compareCase(board[row][col], board[i][j])){
                destinations.push([i, j])
            }
            break;
        }
    }

    return destinations;
}

function queen_destinations(row, col, board){
    let destinations = [];
    destinations = [...rook_destinations(row, col, board), ...bishop_destinations(row, col, board)];
    return destinations;
}

function king_destinations(row, col, board){
    let destinations = [];
    for(let i=row-1; i<row+2 ; i++){
        for(let j=col-1; j<col+2; j++){
            if(i<8 && i>=0 && j<8 && j>=0 && (i!=row || j!=col) && !compareCase(board[row][col], board[i][j]))
                destinations.push([i, j]);
        }
    }
    return destinations;
}

function get_destinations(row, col, board, isWhite){
    let type = board[row][col];
    if (type.toUpperCase() == 'P'){
        let isFirst = true;
        if (row !=1 )
            isFirst = false;
        return pawn_destinations(row, col, board, isFirst, isWhite);
    }
    else if (type.toUpperCase() == 'R')
        return rook_destinations(row, col, board);
    else if (type.toUpperCase() == 'N')
        return knight_destinations(row, col, board);
    else if (type.toUpperCase() == 'B')
        return bishop_destinations(row, col, board);
    else if (type.toUpperCase() == 'Q')
        return queen_destinations(row, col, board);
    else if (type.toUpperCase() == 'K')
        return king_destinations(row, col, board);
    else
        return [];
}