const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const grid = 20; // Tamaño de cada celda
const boardWidth = 10; // Columnas
const boardHeight = 20; // Filas
let board;
let currentPiece;
let currentPos = { x: 3, y: 0 };
let gameInterval;
let paused = false;
let gameOver = false;

const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]]  // J
];

function resetGame() {
    board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
    currentPos = { x: 3, y: 0 };
    gameOver = false;
    document.getElementById("gameOver").style.display = 'none';
    spawnPiece();
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 1000 / 2);
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'blue';
                context.fillRect(x * grid, y * grid, grid, grid);
                context.strokeRect(x * grid, y * grid, grid, grid);
            }
        });
    });
}

function spawnPiece() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    currentPiece = pieces[randomIndex];
    currentPos = { x: 3, y: 0 };
    if (!isValidPosition(currentPiece, currentPos)) {
        gameOver = true;
        clearInterval(gameInterval);
        document.getElementById("gameOver").style.display = 'block';
    }
}

function isValidPosition(piece, pos) {
    return piece.every((row, y) => {
        return row.every((value, x) => {
            if (value) {
                const newX = pos.x + x;
                const newY = pos.y + y;
                return newX >= 0 && newX < boardWidth && newY >= 0 && newY < boardHeight && !board[newY]?.[newX];
            }
            return true;
        });
    });
}

function drawPiece() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = 'red';
                context.fillRect((currentPos.x + x) * grid, (currentPos.y + y) * grid, grid, grid);
                context.strokeRect((currentPos.x + x) * grid, (currentPos.y + y) * grid, grid, grid);
            }
        });
    });
}

function mergePiece() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPos.y + y][currentPos.x + x] = value;
            }
        });
    });
}

function removeLines() {
    board = board.reduce((acc, row) => {
        if (row.every(value => value)) {
            acc.unshift(Array(boardWidth).fill(0)); // Añadir una nueva fila vacía en la parte superior
        } else {
            acc.push(row);
        }
        return acc;
    }, []);
}

function update() {
    if (!paused && !gameOver) {
        currentPos.y++;
        if (!isValidPosition(currentPiece, currentPos)) {
            currentPos.y--;
            mergePiece();
            removeLines();
            spawnPiece();
        }
        drawBoard();
        drawPiece();
    }
}

function dash() {
    while (isValidPosition(currentPiece, { x: currentPos.x, y: currentPos.y + 1 })) {
        currentPos.y++;
    }
}

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case 'a': // Mover a la izquierda
            currentPos.x--;
            if (!isValidPosition(currentPiece, currentPos)) {
                currentPos.x++;
            }
            break;
        case 'd': // Mover a la derecha
            currentPos.x++;
            if (!isValidPosition(currentPiece, currentPos)) {
                currentPos.x--;
            }
            break;
        case 's': // Mover hacia abajo
            currentPos.y++;
            if (!isValidPosition(currentPiece, currentPos)) {
                currentPos.y--;
            }
            break;
        case 'w': // Rotar la pieza
            const rotatedPiece = currentPiece[0].map((val, index) =>
                currentPiece.map(row => row[index]).reverse()
            );
            const originalPiece = currentPiece;
            currentPiece = rotatedPiece;
            if (!isValidPosition(currentPiece, currentPos)) {
                currentPiece = originalPiece;
            }
            break;
        case ' ': // Dash
            dash();
            break;
    }
});

document.getElementById("pause").addEventListener("click", () => {
    paused = !paused;
    if (paused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(update, 1000 / 2);
    }
});

// Conectar botones de movimiento
document.getElementById("left").addEventListener("click", () => {
    currentPos.x--;
    if (!isValidPosition(currentPiece, currentPos)) {
        currentPos.x++;
    }
});

document.getElementById("down").addEventListener("click", () => {
    currentPos.y++;
    if (!isValidPosition(currentPiece, currentPos)) {
        currentPos.y--;
    }
});

document.getElementById("right").addEventListener("click", () => {
    currentPos.x++;
    if (!isValidPosition(currentPiece, currentPos)) {
        currentPos.x--;
    }
});

document.getElementById("rotate").addEventListener("click", () => {
    const rotatedPiece = currentPiece[0].map((val, index) =>
        currentPiece.map(row => row[index]).reverse()
    );
    const originalPiece = currentPiece;
    currentPiece = rotatedPiece;
    if (!isValidPosition(currentPiece, currentPos)) {
        currentPiece = originalPiece;
    }
});

// Crear botón de Dash y Reiniciar solo una vez
if (!document.getElementById("dashButton")) {
    const dashButton = document.createElement("button");
    dashButton.innerText = "Dash";
    dashButton.id = "dashButton"; // Asignar ID para evitar duplicados
    dashButton.addEventListener("click", dash);
    document.getElementById("controls").appendChild(dashButton);
}

if (!document.getElementById("restartButton")) {
    const restartButton = document.createElement("button");
    restartButton.innerText = "Reiniciar";
    restartButton.id = "restartButton"; // Asignar ID para evitar duplicados
    restartButton.addEventListener("click", resetGame);
    document.getElementById("controls").appendChild(restartButton);
}

// Inicializar el juego
resetGame();
