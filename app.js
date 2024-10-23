document.addEventListener('DOMContentLoaded', () => {
    const mazeContainer = document.getElementById('maze');
    const startButton = document.getElementById('start');
    const pauseButton = document.getElementById('pause');
    const resetButton = document.getElementById('reset');
    const generateButton = document.getElementById('generate');
    const victoryMessage = document.getElementById('victory');

    let maze = [];
    let ratPosition = { x: 0, y: 0 };
    let destination = { x: 0, y: 0 };
    let paused = false;
    let foundPath = false;
    let delay = 300; 
    let interval;
    let path = [];

    generateButton.addEventListener('click', generateMaze);

    function generateMaze() {
        mazeContainer.innerHTML = '';
        maze = [];
        victoryMessage.classList.add('hidden');
        paused = false;
        foundPath = false;
        path = [];

        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        const blocks = parseInt(document.getElementById('blocks').value);

        mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
        for (let i = 0; i < rows; i++) {
            maze[i] = [];
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                mazeContainer.appendChild(cell);
                maze[i][j] = { element: cell, blocked: false, visited: false };
            }
        }
        for (let i = 0; i < blocks; i++) {
            const randRow = Math.floor(Math.random() * rows);
            const randCol = Math.floor(Math.random() * cols);
            if ((randRow === 0 && randCol === 0) || (randRow === rows - 1 && randCol === cols - 1)) continue;
            maze[randRow][randCol].blocked = true;
            maze[randRow][randCol].element.classList.add('blocked');
        }

        ratPosition = { x: 0, y: 0 };
        destination = { x: rows - 1, y: cols - 1 };
        maze[0][0].element.classList.add('rat');
        maze[destination.x][destination.y].element.classList.add('destination');
    }

    startButton.addEventListener('click', () => {
        if (foundPath) return;
        if (paused) {
            paused = false; 
            runBacktrackingWithDelay(ratPosition.x, ratPosition.y); 
        } else {
            runBacktrackingWithDelay(ratPosition.x, ratPosition.y);
        }
    });

    pauseButton.addEventListener('click', () => {
        paused = true; 
        clearInterval(interval);
    });

    resetButton.addEventListener('click', generateMaze);

    async function runBacktrackingWithDelay(x, y) {
        if (foundPath || paused) return;

        if (await backtrack(x, y)) {
            foundPath = true;
            return;
        }
    }

    async function backtrack(x, y) {
        if (x === destination.x && y === destination.y) {
            victoryMessage.classList.remove('hidden');
            foundPath = true;
            return true;
        }
        maze[x][y].visited = true;
        path.push({ x, y });
        maze[x][y].element.classList.add('path');
        await new Promise(resolve => setTimeout(resolve, delay));

        const directions = [
            { x: -1, y: 0 },
            { x: 1, y: 0 }, 
            { x: 0, y: -1 },
            { x: 0, y: 1 } 
        ];

        for (let i = 0; i < directions.length; i++) {
            const newX = x + directions[i].x;
            const newY = y + directions[i].y;
            if (isValidMove(newX, newY)) {
                ratPosition = { x: newX, y: newY };
                if (paused) {
                    await new Promise(resolve => {
                        const checkPaused = setInterval(() => {
                            if (!paused) {
                                clearInterval(checkPaused);
                                resolve();
                            }
                        }, 100);
                    });
                }
                if (await backtrack(newX, newY)) {
                    return true;
                }
            }
        }
        path.pop();
        maze[x][y].element.classList.remove('path');
        return false;
    }

    function isValidMove(x, y) {
        const rows = maze.length;
        const cols = maze[0].length;
        return x >= 0 && y >= 0 && x < rows && y < cols && !maze[x][y].blocked && !maze[x][y].visited;
    }
});