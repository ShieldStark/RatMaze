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
    let interval;
    let queue = [];
    generateButton.addEventListener('click', generateMaze);

    function generateMaze() {
        mazeContainer.innerHTML = '';
        maze = [];
        victoryMessage.classList.add('hidden');
        paused = false;
        foundPath = false;
        queue = [];

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
            if (randRow === 0 && randCol === 0) continue;
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
        if (paused && queue.length > 0) {
            paused = false;
            resumeBFS();
        } else {
            paused = false;
            shortestPathBFS(0, 0);
        }
    });

    pauseButton.addEventListener('click', () => {
        paused = true;
        clearInterval(interval);
    });

    resetButton.addEventListener('click', generateMaze);

    function shortestPathBFS(startX, startY) {
        const rows = maze.length;
        const cols = maze[0].length;
        const directions = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 }
        ];
        
        queue.push({ x: startX, y: startY, path: [] });
        maze[startX][startY].visited = true;

        interval = setInterval(() => {
            if (paused || queue.length === 0) {
                clearInterval(interval);
                return;
            }

            const { x, y, path } = queue.shift();
            maze[x][y].element.classList.add('path');

            if (x === destination.x && y === destination.y) {
                clearInterval(interval);
                victoryMessage.classList.remove('hidden');
                showShortestPath(path);
                foundPath = true;
                return;
            }

            for (let i = 0; i < directions.length; i++) {
                const newX = x + directions[i].x;
                const newY = y + directions[i].y;

                if (isValidMove(newX, newY, rows, cols)) {
                    queue.push({ x: newX, y: newY, path: [...path, { x: newX, y: newY }] });
                    maze[newX][newY].visited = true;
                }
            }
        }, 1000);
    }

    function isValidMove(x, y, rows, cols) {
        return x >= 0 && y >= 0 && x < rows && y < cols && !maze[x][y].blocked && !maze[x][y].visited;
    }

    function resumeBFS() {
        const rows = maze.length;
        const cols = maze[0].length;

        interval = setInterval(() => {
            if (paused || queue.length === 0) {
                clearInterval(interval);
                return;
            }

            const { x, y, path } = queue.shift();
            maze[x][y].element.classList.add('path');

            if (x === destination.x && y === destination.y) {
                clearInterval(interval);
                victoryMessage.classList.remove('hidden');
                showShortestPath(path);
                foundPath = true;
                return;
            }

            const directions = [
                { x: -1, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: -1 },
                { x: 0, y: 1 }
            ];

            for (let i = 0; i < directions.length; i++) {
                const newX = x + directions[i].x;
                const newY = y + directions[i].y;

                if (isValidMove(newX, newY, rows, cols)) {
                    queue.push({ x: newX, y: newY, path: [...path, { x: newX, y: newY }] });
                    maze[newX][newY].visited = true;
                }
            }
        }, 1000);
    }

    function showShortestPath(path) {
        path.forEach((pos, index) => {
            setTimeout(() => {
                maze[pos.x][pos.y].element.classList.add('path');
            }, index * 100);
        });
    }
});
