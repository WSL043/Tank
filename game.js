// 游戏主类
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

        // 对象池
        this.bulletPool = new ObjectPool(() => new Bullet(0, 0, 0, null), 50);
        this.particlePool = new ObjectPool(() => new Particle(0, 0), 100);

        // 输入管理
        this.keys = {};
        this.setupEventListeners();

        // 初始化游戏
        this.init();
    }

    init() {
        // 创建玩家
        this.players = [
            new Tank(100, 100, '#4CAF50', 1), // 玩家1 - 绿色
            new Tank(this.width - 100, this.height - 100, '#2196F3', 2) // 玩家2 - 蓝色
        ];

        // 生成地图
        this.generateMap();

        // 开始游戏循环
        this.gameLoop();
    }

    generateMap() {
        this.obstacles = [];
        const obstacleCount = Math.floor((this.width * this.height) * 0.05 / (30 * 30)); // 5%密度

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

    setupEventListeners() {
        // 防止空格键滚动页面
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    update(deltaTime) {
        if (!this.gameRunning) return;

        // 更新玩家
        this.players.forEach(player => {
            if (player.lives > 0) {
                this.updatePlayerInput(player);
                player.update(deltaTime);
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
        let moved = false;

        if (player.id === 1) {
            // 玩家1: WASD
            if (this.keys['KeyW']) { player.y -= speed; moved = true; }
            if (this.keys['KeyS']) { player.y += speed; moved = true; }
            if (this.keys['KeyA']) { player.x -= speed; moved = true; }
            if (this.keys['KeyD']) { player.x += speed; moved = true; }
            if (this.keys['Space'] && player.canShoot()) {
                this.shoot(player);
            }
        } else if (player.id === 2) {
            // 玩家2: 方向键
            if (this.keys['ArrowUp']) { player.y -= speed; moved = true; }
            if (this.keys['ArrowDown']) { player.y += speed; moved = true; }
            if (this.keys['ArrowLeft']) { player.x -= speed; moved = true; }
            if (this.keys['ArrowRight']) { player.x += speed; moved = true; }
            if (this.keys['Enter'] && player.canShoot()) {
                this.shoot(player);
            }
        }

        if (moved) {
            this.checkObstacleCollisions(player);
        }
    }

    shoot(player) {
        const bullet = this.bulletPool.get();
        bullet.reset(player.x + player.size/2 - 2, player.y + player.size/2 - 2, player.angle, player);
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
            if (player !== bullet.owner && player.lives > 0 && this.isColliding(bullet, player)) {
                player.takeDamage();
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
        for (let i = 0; i < 10; i++) {
            const particle = this.particlePool.get();
            particle.reset(x, y,
                Math.random() * Math.PI * 2,
                50 + Math.random() * 100,
                '#FF6B35');
            this.particles.push(particle);
        }
    }

    updateScore(player) {
        player.score += 100;
        document.getElementById(`player${player.id}-score`).textContent = player.score;
    }

    checkGameOver() {
        const alivePlayers = this.players.filter(p => p.lives > 0);
        if (alivePlayers.length <= 1) {
            this.gameRunning = false;
            const winner = alivePlayers.length === 1 ? alivePlayers[0] : null;
            this.showGameOver(winner);
        }
    }

    showGameOver(winner) {
        const gameOverText = document.getElementById('gameOverText');
        if (winner) {
            gameOverText.textContent = `玩家${winner.id}获胜！`;
        } else {
            gameOverText.textContent = '平局！';
        }
        document.getElementById('gameOver').style.display = 'block';
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 渲染障碍物
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));

        // 渲染玩家
        this.players.forEach(player => {
            if (player.lives > 0) {
                player.render(this.ctx);
            }
        });

        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(this.ctx));

        // 渲染粒子效果
        this.particles.forEach(particle => particle.render(this.ctx));
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

// 坦克类
class Tank {
    constructor(x, y, color, id) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.color = color;
        this.id = id;
        this.speed = 3;
        this.angle = 0;
        this.lives = 3;
        this.score = 0;
        this.lastShot = 0;
        this.shootCooldown = 300; // 毫秒

        this.initialX = x;
        this.initialY = y;
    }

    update(deltaTime) {
        // 坦克更新逻辑（如果需要的话）
    }

    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }

    takeDamage() {
        this.lives--;
        document.getElementById(`player${this.id}-lives`).textContent = this.lives;

        if (this.lives > 0) {
            // 重生
            this.x = this.initialX;
            this.y = this.initialY;
        }
    }

    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.lives = 3;
        this.score = 0;
        this.lastShot = 0;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size/2, this.y + this.size/2);

        // 绘制坦克身体
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);

        // 绘制炮管
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size/2 + 10, 0);
        ctx.stroke();

        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);

        ctx.restore();

        // 绘制生命值指示器
        for (let i = 0; i < this.lives; i++) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + i * 8, this.y - 10, 6, 6);
        }
    }
}

// 子弹类
class Bullet {
    constructor(x, y, angle, owner) {
        this.reset(x, y, angle, owner);
    }

    reset(x, y, angle, owner) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.owner = owner;
        this.speed = 8;
        this.size = 4;
        this.dx = Math.cos(this.angle) * this.speed;
        this.dy = Math.sin(this.angle) * this.speed;
    }

    update(deltaTime) {
        this.x += this.dx;
        this.y += this.dy;
    }

    render(ctx) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}

// 障碍物类
class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
    }

    render(ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.size, this.size);

        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
}

// 粒子类
class Particle {
    constructor(x, y) {
        this.reset(x, y, 0, 0, '#FF6B35');
    }

    reset(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.dx = Math.cos(angle) * speed * 0.01;
        this.dy = Math.sin(angle) * speed * 0.01;
        this.life = 1.0;
        this.decay = 0.02;
        this.color = color;
        this.size = 2 + Math.random() * 3;
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        this.life -= this.decay;
        this.size *= 0.99;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// 对象池类
class ObjectPool {
    constructor(createFn, initialSize = 10) {
        this.createFn = createFn;
        this.pool = [];

        // 预填充池
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }

    release(obj) {
        this.pool.push(obj);
    }
}

// 启动游戏
let game;
window.addEventListener('load', () => {
    game = new TankGame();
});
