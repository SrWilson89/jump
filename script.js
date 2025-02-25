document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.getElementById('game-container');
    const sonic = document.getElementById('sonic');
    const scoreElement = document.getElementById('score');
    const ringsElement = document.getElementById('rings');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const jumpBtn = document.getElementById('jump-btn');
    
    let gameStarted = false;
    let isJumping = false;
    let score = 0;
    let rings = 0;
    let speed = 5;
    let position = 50;
    let gravity = 0.9;
    let jumpForce = 15;
    let velocityY = 0;
    let gameInterval;
    let obstacleInterval;
    let ringInterval;
    let obstacles = [];
    let ringsArray = [];
    let isMovingLeft = false;
    let isMovingRight = false;
    
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // Controles tactiles
    leftBtn.addEventListener('touchstart', () => { isMovingLeft = true; });
    leftBtn.addEventListener('touchend', () => { isMovingLeft = false; });
    rightBtn.addEventListener('touchstart', () => { isMovingRight = true; });
    rightBtn.addEventListener('touchend', () => { isMovingRight = false; });
    jumpBtn.addEventListener('touchstart', jump);
    
    // También permitir hacer clic para dispositivos no táctiles
    leftBtn.addEventListener('mousedown', () => { isMovingLeft = true; });
    leftBtn.addEventListener('mouseup', () => { isMovingLeft = false; });
    rightBtn.addEventListener('mousedown', () => { isMovingRight = true; });
    rightBtn.addEventListener('mouseup', () => { isMovingRight = false; });
    jumpBtn.addEventListener('mousedown', jump);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    function handleKeyDown(e) {
        if (!gameStarted) return;
        
        switch (e.key) {
            case 'ArrowUp':
                jump();
                break;
            case 'ArrowLeft':
                isMovingLeft = true;
                break;
            case 'ArrowRight':
                isMovingRight = true;
                break;
        }
    }
    
    function handleKeyUp(e) {
        if (!gameStarted) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                isMovingLeft = false;
                break;
            case 'ArrowRight':
                isMovingRight = false;
                break;
        }
    }
    
    function startGame() {
        startScreen.style.display = 'none';
        gameStarted = true;
        gameInterval = setInterval(updateGame, 20);
        obstacleInterval = setInterval(createObstacle, 2000);
        ringInterval = setInterval(createRing, 1500);
    }
    
    function restartGame() {
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);
        clearInterval(ringInterval);
        
        // Limpiar obstáculos y anillos
        obstacles.forEach(obstacle => {
            if (obstacle.element) {
                obstacle.element.remove();
            }
        });
        ringsArray.forEach(ring => {
            if (ring.element) {
                ring.element.remove();
            }
        });
        
        obstacles = [];
        ringsArray = [];
        
        // Reiniciar valores
        score = 0;
        rings = 0;
        position = 50;
        velocityY = 0;
        isJumping = false;
        
        // Actualizar UI
        scoreElement.textContent = '0';
        ringsElement.textContent = '0';
        sonic.style.bottom = '100px';
        sonic.style.left = '50px';
        
        gameOverScreen.style.display = 'none';
        gameStarted = true;
        
        // Reiniciar intervalos
        gameInterval = setInterval(updateGame, 20);
        obstacleInterval = setInterval(createObstacle, 2000);
        ringInterval = setInterval(createRing, 1500);
    }
    
    function jump() {
        if (!isJumping && gameStarted) {
            isJumping = true;
            velocityY = jumpForce;
        }
    }
    
    function createObstacle() {
        if (!gameStarted) return;
        
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        gameContainer.appendChild(obstacle);
        
        const obstaclePosition = Math.random() * (gameContainer.offsetWidth - 30) + gameContainer.offsetWidth;
        obstacle.style.left = obstaclePosition + 'px';
        
        obstacles.push({
            element: obstacle,
            position: obstaclePosition
        });
    }
    
    function createRing() {
        if (!gameStarted) return;
        
        const ring = document.createElement('div');
        ring.classList.add('ring');
        gameContainer.appendChild(ring);
        
        const ringX = Math.random() * (gameContainer.offsetWidth - 30) + gameContainer.offsetWidth;
        const ringY = Math.random() * 100 + 120; // Altura variable
        
        ring.style.left = ringX + 'px';
        ring.style.bottom = ringY + 'px';
        
        ringsArray.push({
            element: ring,
            position: ringX,
            height: ringY,
            collected: false
        });
    }
    
    function updateGame() {
        if (!gameStarted) return;
        
        // Actualizar posición de Sonic
        if (isMovingLeft) {
            position -= speed;
            if (position < 0) position = 0;
        }
        
        if (isMovingRight) {
            position += speed;
            if (position > gameContainer.offsetWidth - 50) {
                position = gameContainer.offsetWidth - 50;
            }
        }
        
        // Física de salto
        if (isJumping) {
            velocityY -= gravity;
            const newBottom = parseInt(window.getComputedStyle(sonic).getPropertyValue('bottom')) + velocityY;
            
            if (newBottom <= 100) {
                sonic.style.bottom = '100px';
                isJumping = false;
                velocityY = 0;
            } else {
                sonic.style.bottom = newBottom + 'px';
            }
        }
        
        sonic.style.left = position + 'px';
        
        // Mover obstáculos
        obstacles.forEach((obstacle, index) => {
            obstacle.position -= speed;
            
            if (obstacle.element) {
                obstacle.element.style.left = obstacle.position + 'px';
                
                // Detectar colisión
                if (
                    position < obstacle.position + 30 &&
                    position + 50 > obstacle.position &&
                    parseInt(window.getComputedStyle(sonic).getPropertyValue('bottom')) < 150
                ) {
                    // Colisión
                    if (rings > 0) {
                        // Perder anillos en lugar de game over
                        rings = 0;
                        ringsElement.textContent = rings;
                    } else {
                        gameOver();
                    }
                }
            }
            
            // Eliminar obstáculos fuera de la pantalla
            if (obstacle.position < -30) {
                if (obstacle.element) {
                    obstacle.element.remove();
                }
                obstacles.splice(index, 1);
                score += 10;
                scoreElement.textContent = score;
            }
        });
        
        // Mover anillos
        ringsArray.forEach((ring, index) => {
            ring.position -= speed;
            
            if (ring.element) {
                ring.element.style.left = ring.position + 'px';
                
                // Detectar colección de anillo
                const sonicBottom = parseInt(window.getComputedStyle(sonic).getPropertyValue('bottom'));
                
                if (
                    !ring.collected &&
                    position < ring.position + 30 &&
                    position + 50 > ring.position &&
                    sonicBottom < ring.height + 30 &&
                    sonicBottom + 50 > ring.height
                ) {
                    // Recoger anillo
                    ring.collected = true;
                    ring.element.style.display = 'none';
                    rings++;
                    ringsElement.textContent = rings;
                    score += 5;
                    scoreElement.textContent = score;
                }
            }
            
            // Eliminar anillos fuera de la pantalla
            if (ring.position < -30) {
                if (ring.element) {
                    ring.element.remove();
                }
                ringsArray.splice(index, 1);
            }
        });
        
        // Aumentar dificultad con el tiempo
        if (score > 0 && score % 100 === 0) {
            speed += 0.1;
        }
    }
    
    function gameOver() {
        gameStarted = false;
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);
        clearInterval(ringInterval);
        
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'flex';
    }
    
    // Ajustar al tamaño de la ventana
    window.addEventListener('resize', function() {
        // Asegurarse de que Sonic esté dentro de los límites
        if (position > gameContainer.offsetWidth - 50) {
            position = gameContainer.offsetWidth - 50;
            sonic.style.left = position + 'px';
        }
    });
});