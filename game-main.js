// 游戏主类 - 重构版本
class TankGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // 游戏状态
        this.gameRunning = true;
        this.lastTime = 0;

        // 游戏对象
        this.players = [];
        this.bullets = [];
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];

        // 管理器
        this.inputManager = new InputManager();
        this.gameModeManager = new GameModeManager();

        // 对象池
        this.bulletPool = new ObjectPool(() => new Bullet(0, 0, 0, null), 50);
        this.particlePool = new ObjectPool(() => new Particle(0, 0), 100);

        // 初始化游戏
        this.init();
        this.setupGameModeControls();
        this.setupDifficultyControls();
    }

    init() {
        // 创建玩家
        this.players = [
            new Tank(100, 100, '#4CAF50', 1, false), // 玩家1 - 绿色
            new Tank(this.width - 100, this.height - 100, '#2196F3', 2, false) // 玩家2 - 蓝色
        ];

        // 生成地图
        this.generateMap();

        // 开始游戏循环
        this.gameLoop();
    }

    setupGameModeControls() {
        // F1键切换单人/双人模式
        document.addEventListener('keydown', (e) => {
            if (e.code === 'F1') {
                e.preventDefault();
                this.toggleGameMode();
            }
        });
    }

    setupDifficultyControls() {
        // F2键切换AI难度
        document.addEventListener('keydown', (e) => {
            if (e.code === 'F2') {
                e.preventDefault();
                this.cycleDifficulty();
            }
        });
    }

    cycleDifficulty() {
        const newDifficulty = this.gameModeManager.cycleDifficulty();

        // 更新AI坦克的难度
        for (let player of this.players) {
            if (player.isAI) {
                player.setAIDifficulty(newDifficulty);
            }
        }

        this.updateGameModeUI(`AI难度切换: ${this.gameModeManager.getDifficultyName()}`);
    }

    toggleGameMode() {
        const isSinglePlayer = this.gameModeManager.toggleSinglePlayer();

        if (isSinglePlayer) {
            // 切换到单人模式 - 玩家2变成AI
            this.players[1] = new Tank(this.width - 100, this.height - 100, '#FF5722', 2, true);
            this.players[1].setAIDifficulty(this.gameModeManager.aiDifficulty);
            this.updateGameModeUI('单人模式 - AI对手');
        } else {
            // 切换到双人模式
            this.players[1] = new Tank(this.width - 100, this.height - 100, '#2196F3', 2, false);
            this.updateGameModeUI('双人模式');
        }

        // 重置游戏状态
        this.restart();
    }

    updateGameModeUI(mode) {
        // 可以添加UI提示
        console.log(`游戏模式切换: ${mode}`);
    }

    generateMap() {
        this.obstacles = [];
        const obstacleCount = Math.floor((this.width * this.height) * 0.06 / (30 * 30)); // 增加到6%密度

        for (let i = 0; i < obstacleCount; i++) {
            let x, y, validPosition = false;
            let attempts = 0;

            do {
                x = Math.floor(Math.random() * (this.width - 30) / 30) * 30;
                y = Math.floor(Math.random() * (this.height - 30) / 30) * 30;

                // 检查是否与玩家起始位置冲突
                validPosition = !this.isNearPlayers(x, y, 100);
                attempts++;
            } while (!validPosition && attempts < 100);

            if (validPosition) {
                this.obstacles.push(new Obstacle(x, y));
            }
        }
    }

    isNearPlayers(x, y, distance) {
        for (let player of this.players) {
            if (Math.abs(player.x - x) < distance && Math.abs(player.y - y) < distance) {
                return true;
            }
        }
        return false;
    }

    update(deltaTime) {
        if (!this.gameRunning) return;

        // 更新玩家
        this.players.forEach(player => {
            if (player.health > 0) {
                if (!player.isAI) {
                    this.updatePlayerInput(player);
                }
                player.update(deltaTime, this);
                this.checkBoundaries(player);
            }
        });

        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime);

            // 检查边界
            if (bullet.x < 0 || bullet.x > this.width || bullet.y < 0 || bullet.y > this.height) {
                this.bulletPool.release(bullet);
                return false;
            }

            // 检查碰撞
            return !this.checkBulletCollisions(bullet);
        });

        // 更新粒子效果
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            if (particle.life <= 0) {
                this.particlePool.release(particle);
                return false;
            }
            return true;
        });

        // 检查游戏结束
        this.checkGameOver();
    }

    updatePlayerInput(player) {
        const speed = player.speed;
        let dx = 0, dy = 0;

        if (player.id === 1) {
            // 玩家1: WASD
            if (this.inputManager.isKeyPressed('KeyW')) { dy = -1; }
            if (this.inputManager.isKeyPressed('KeyS')) { dy = 1; }
            if (this.inputManager.isKeyPressed('KeyA')) { dx = -1; }
            if (this.inputManager.isKeyPressed('KeyD')) { dx = 1; }
            if (this.inputManager.isKeyPressed('Space') && player.canShoot()) {
                this.shoot(player);
            }
        } else if (player.id === 2 && !player.isAI) {
            // 玩家2: 方向键 (仅在非AI模式下)
            if (this.inputManager.isKeyPressed('ArrowUp')) { dy = -1; }
            if (this.inputManager.isKeyPressed('ArrowDown')) { dy = 1; }
            if (this.inputManager.isKeyPressed('ArrowLeft')) { dx = -1; }
            if (this.inputManager.isKeyPressed('ArrowRight')) { dx = 1; }
            if (this.inputManager.isKeyPressed('Enter') && player.canShoot()) {
                this.shoot(player);
            }
        }

        if (dx !== 0 || dy !== 0) {
            // 标准化对角线移动
            const length = Math.sqrt(dx * dx + dy * dy);
            dx = (dx / length) * speed;
            dy = (dy / length) * speed;

            player.x += dx;
            player.y += dy;

            // 更新坦克方向（这将同时更新车体和炮塔角度）
            player.updateDirection(dx, dy);

            this.checkObstacleCollisions(player);
        }
    }

    shoot(player) {
        const bullet = this.bulletPool.get();
        bullet.reset(
            player.x + player.size/2 - 2,
            player.y + player.size/2 - 2,
            player.angle,
            player
        );
        this.bullets.push(bullet);
        player.lastShot = Date.now();
    }

    checkBoundaries(player) {
        if (player.x < 0) player.x = 0;
        if (player.x > this.width - player.size) player.x = this.width - player.size;
        if (player.y < 0) player.y = 0;
        if (player.y > this.height - player.size) player.y = this.height - player.size;
    }

    checkObstacleCollisions(player) {
        for (let obstacle of this.obstacles) {
            if (this.isColliding(player, obstacle)) {
                // 简单的碰撞回退
                const dx = player.x - obstacle.x;
                const dy = player.y - obstacle.y;
                if (Math.abs(dx) > Math.abs(dy)) {
                    player.x = dx > 0 ? obstacle.x + obstacle.size : obstacle.x - player.size;
                } else {
                    player.y = dy > 0 ? obstacle.y + obstacle.size : obstacle.y - player.size;
                }
            }
        }
    }

    checkBulletCollisions(bullet) {
        // 检查与障碍物碰撞
        for (let obstacle of this.obstacles) {
            if (this.isColliding(bullet, obstacle)) {
                this.createExplosion(bullet.x, bullet.y);
                this.bulletPool.release(bullet);
                return true;
            }
        }

        // 检查与玩家碰撞
        for (let player of this.players) {
            if (player !== bullet.owner && player.health > 0 && this.isColliding(bullet, player)) {
                player.takeDamage(20); // 每次击中扣20血
                this.createExplosion(bullet.x, bullet.y);
                this.updateScore(bullet.owner);
                this.bulletPool.release(bullet);
                return true;
            }
        }

        return false;
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.size &&
               obj1.x + obj1.size > obj2.x &&
               obj1.y < obj2.y + obj2.size &&
               obj1.y + obj1.size > obj2.y;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            const particle = this.particlePool.get();
            const colors = ['#FF6B35', '#F7931E', '#FFD700', '#FF4500'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.reset(x, y,
                Math.random() * Math.PI * 2,
                50 + Math.random() * 100,
                color);
            this.particles.push(particle);
        }
    }

    updateScore(player) {
        player.score += 100;
        document.getElementById(`player${player.id}-score`).textContent = player.score;
    }

    checkGameOver() {
        const alivePlayers = this.players.filter(p => p.health > 0 && p.lives > 0);
        if (alivePlayers.length <= 1) {
            this.gameRunning = false;
            const winner = alivePlayers.length === 1 ? alivePlayers[0] : null;
            this.showGameOver(winner);
        }
    }

    showGameOver(winner) {
        const gameOverText = document.getElementById('gameOverText');
        if (winner) {
            if (winner.isAI) {
                gameOverText.textContent = `AI获胜！(${this.gameModeManager.getDifficultyName()}难度) 再试一次？`;
            } else {
                gameOverText.textContent = `玩家${winner.id}获胜！`;
            }
        } else {
            gameOverText.textContent = '平局！';
        }
        document.getElementById('gameOver').style.display = 'flex';
    }

    render() {
        // 创建更好看的背景
        this.renderBackground();

        // 渲染障碍物
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));

        // 渲染玩家
        this.players.forEach(player => {
            if (player.health > 0) {
                player.render(this.ctx);
            }
        });

        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(this.ctx));

        // 渲染粒子效果
        this.particles.forEach(particle => particle.render(this.ctx));

        // 渲染游戏模式提示
        this.renderGameModeInfo();
    }

    renderBackground() {
        // 创建战场背景纹理
        const gradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, Math.max(this.width, this.height)/2
        );
        gradient.addColorStop(0, '#2d2d2d');
        gradient.addColorStop(1, '#1a1a1a');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 添加网格效果
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.width; x += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    renderGameModeInfo() {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('按F1切换单人/双人模式', 10, 25);
        this.ctx.fillText('按F2切换AI难度', 10, 45);

        if (this.gameModeManager.isSinglePlayer) {
            this.ctx.fillStyle = '#FF5722';
            this.ctx.fillText(`当前: 单人模式 (AI难度: ${this.gameModeManager.getDifficultyName()})`, 10, 65);
        } else {
            this.ctx.fillStyle = '#2196F3';
            this.ctx.fillText('当前: 双人模式', 10, 65);
        }
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    restart() {
        this.gameRunning = true;
        this.bullets = [];
        this.particles = [];

        // 重置玩家
        this.players.forEach(player => {
            player.reset();
        });

        // 重新生成地图
        this.generateMap();

        // 重置UI
        this.players.forEach(player => {
            document.getElementById(`player${player.id}-lives`).textContent = player.lives;
            document.getElementById(`player${player.id}-score`).textContent = player.score;
        });

        document.getElementById('gameOver').style.display = 'none';
    }
}

// 启动游戏
let game;
window.addEventListener('load', () => {
    game = new TankGame();
});
