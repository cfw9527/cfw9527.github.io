// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏配置
const config = {
    gridSize: 20,
    initialSpeed: 150,
    speedIncrease: 10,
    foodColor: '#e74c3c',
    snakeColor: '#27ae60',
    headColor: '#229954',
    backgroundColor: '#ecf0f1'
};

// 游戏状态
const gameState = {
    snake: [],
    food: {},
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    level: 1,
    speed: config.initialSpeed,
    gameLoop: null,
    isRunning: false,
    isPaused: false
};

// 初始化游戏
function initGame() {
    // 重置蛇的位置和状态
    const centerX = Math.floor(canvas.width / (2 * config.gridSize)) * config.gridSize;
    const centerY = Math.floor(canvas.height / (2 * config.gridSize)) * config.gridSize;
    
    gameState.snake = [
        { x: centerX, y: centerY },
        { x: centerX - config.gridSize, y: centerY },
        { x: centerX - config.gridSize * 2, y: centerY }
    ];
    
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.level = 1;
    gameState.speed = config.initialSpeed;
    gameState.isRunning = false;
    gameState.isPaused = false;
    
    // 更新分数和等级显示
    updateScore();
    updateLevel();
    
    // 生成第一个食物
    generateFood();
    
    // 绘制初始游戏界面
    draw();
}

// 生成食物
function generateFood() {
    const maxX = canvas.width - config.gridSize;
    const maxY = canvas.height - config.gridSize;
    
    // 随机生成食物位置，确保不与蛇身重叠
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (maxX / config.gridSize)) * config.gridSize,
            y: Math.floor(Math.random() * (maxY / config.gridSize)) * config.gridSize
        };
    } while (isSnakeCollision(newFood.x, newFood.y));
    
    gameState.food = newFood;
}

// 检查是否与蛇身碰撞
function isSnakeCollision(x, y) {
    return gameState.snake.some(segment => segment.x === x && segment.y === y);
}

// 更新分数
function updateScore() {
    scoreDisplay.textContent = gameState.score;
}

// 更新等级
function updateLevel() {
    levelDisplay.textContent = gameState.level;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格（可选）
    drawGrid();
    
    // 绘制蛇
    gameState.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? config.headColor : config.snakeColor;
        ctx.fillRect(segment.x, segment.y, config.gridSize, config.gridSize);
        
        // 添加边框效果
        ctx.strokeStyle = '#1e8449';
        ctx.lineWidth = 2;
        ctx.strokeRect(segment.x, segment.y, config.gridSize, config.gridSize);
    });
    
    // 绘制食物
    ctx.fillStyle = config.foodColor;
    ctx.beginPath();
    ctx.arc(
        gameState.food.x + config.gridSize / 2,
        gameState.food.y + config.gridSize / 2,
        config.gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 绘制网格（辅助线）
function drawGrid() {
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 移动蛇
function moveSnake() {
    const head = { ...gameState.snake[0] };
    
    // 更新方向
    gameState.direction = gameState.nextDirection;
    
    // 根据方向移动头部
    switch (gameState.direction) {
        case 'up':
            head.y -= config.gridSize;
            break;
        case 'down':
            head.y += config.gridSize;
            break;
        case 'left':
            head.x -= config.gridSize;
            break;
        case 'right':
            head.x += config.gridSize;
            break;
    }
    
    // 检查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        // 吃到食物，增加分数，生成新食物，蛇身增长
        gameState.score += 10;
        updateScore();
        generateFood();
        
        // 每吃5个食物提升一级，加快速度
        if (gameState.score % 50 === 0) {
            gameState.level++;
            gameState.speed = Math.max(50, config.initialSpeed - (gameState.level - 1) * config.speedIncrease);
            updateLevel();
            
            // 重置游戏循环以应用新速度
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = setInterval(gameTick, gameState.speed);
        }
    } else {
        // 没吃到食物，移除尾部
        gameState.snake.pop();
    }
    
    // 添加新头部
    gameState.snake.unshift(head);
    
    // 检查游戏是否结束
    if (checkGameOver()) {
        endGame();
        return;
    }
    
    // 绘制更新后的游戏
    draw();
}

// 检查游戏是否结束
function checkGameOver() {
    const head = gameState.snake[0];
    
    // 检查是否撞墙
    if (
        head.x < 0 || 
        head.x >= canvas.width || 
        head.y < 0 || 
        head.y >= canvas.height
    ) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏主循环
function gameTick() {
    if (!gameState.isPaused) {
        moveSnake();
    }
}

// 开始游戏
function startGame() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameState.isPaused = false;
        gameState.gameLoop = setInterval(gameTick, gameState.speed);
        startBtn.textContent = '继续';
    } else if (gameState.isPaused) {
        gameState.isPaused = false;
        startBtn.textContent = '继续';
    }
}

// 暂停游戏
function pauseGame() {
    if (gameState.isRunning && !gameState.isPaused) {
        gameState.isPaused = true;
        startBtn.textContent = '继续';
    }
}

// 重置游戏
function resetGame() {
    // 清除游戏循环
    clearInterval(gameState.gameLoop);
    
    // 强制重置所有游戏状态
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.gameLoop = null;
    
    // 完全重新初始化游戏
    initGame();
    
    // 确保按钮状态正确
    startBtn.textContent = '开始游戏';
}

// 结束游戏
function endGame() {
    clearInterval(gameState.gameLoop);
    gameState.isRunning = false;
    
    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '20px Arial';
    ctx.fillText(`最终分数: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`达到等级: ${gameState.level}`, canvas.width / 2, canvas.height / 2 + 50);
    
    startBtn.textContent = '重新开始';
}

// 处理键盘输入
function handleKeyPress(e) {
    // 阻止方向键滚动页面
    if ([37, 38, 39, 40, 32].includes(e.keyCode)) {
        e.preventDefault();
    }
    
    // 处理方向键
    switch (e.keyCode) {
        case 38: // 上
            if (gameState.direction !== 'down') {
                gameState.nextDirection = 'up';
            }
            break;
        case 40: // 下
            if (gameState.direction !== 'up') {
                gameState.nextDirection = 'down';
            }
            break;
        case 37: // 左
            if (gameState.direction !== 'right') {
                gameState.nextDirection = 'left';
            }
            break;
        case 39: // 右
            if (gameState.direction !== 'left') {
                gameState.nextDirection = 'right';
            }
            break;
        case 32: // 空格
            if (gameState.isRunning) {
                pauseGame();
            }
            break;
    }
}

// 添加事件监听器
function setupEventListeners() {
    startBtn.addEventListener('click', () => {
        if (!gameState.isRunning) {
            // 检查是否是游戏结束后的重新开始状态
            if (startBtn.textContent === '重新开始') {
                // 游戏结束后点击重新开始，应该完全重置游戏
                resetGame();
            } else {
                // 正常开始新游戏
                startGame();
            }
        } else if (gameState.isPaused) {
            // 只有暂停时才继续游戏
            gameState.isPaused = false;
            startBtn.textContent = '继续';
        }
    });
    
    pauseBtn.addEventListener('click', pauseGame);
    resetBtn.addEventListener('click', resetGame);
    
    window.addEventListener('keydown', handleKeyPress);
    
    // 为移动设备添加触摸控制
    setupMobileControls();
}

// 设置移动设备控制
function setupMobileControls() {
    // 检查是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        // 创建移动控制按钮
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'mobile-controls';
        
        // 创建占位元素放在中心位置
        const placeholder = document.createElement('div');
        controlsContainer.appendChild(placeholder);
        
        const buttons = [
            { id: 'up', text: '↑' },
            { id: 'left', text: '←' },
            { id: 'down', text: '↓' },
            { id: 'right', text: '→' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.textContent = btn.text;
            // 同时支持触摸和点击事件
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const directionMap = {
                    'up': 'up',
                    'down': 'down',
                    'left': 'left',
                    'right': 'right'
                };
                
                const newDirection = directionMap[btn.id];
                const oppositeDirections = {
                    'up': 'down',
                    'down': 'up',
                    'left': 'right',
                    'right': 'left'
                };
                
                if (gameState.direction !== oppositeDirections[newDirection]) {
                    gameState.nextDirection = newDirection;
                }
            });
            controlsContainer.appendChild(button);
        });
        
        // 将控制按钮添加到分数显示下方
        const gameInfo = document.querySelector('.game-info');
        if (gameInfo) {
            gameInfo.parentNode.insertBefore(controlsContainer, gameInfo.nextSibling);
        } else {
            const gameContainer = document.querySelector('.game-container');
            gameContainer.appendChild(controlsContainer);
        }
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    setupEventListeners();
    initGame();
});