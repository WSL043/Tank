// 障碍物类 - 可破坏障碍物
class Obstacle {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.size = 30;

        // 根据比例分配障碍物类型: 木头5，石头3，铁2
        if (type !== null) {
            this.type = type;
        } else {
            const rand = Math.random() * 10;
            if (rand < 5) this.type = 0; // 木头 50%
            else if (rand < 8) this.type = 1; // 石头 30%
            else this.type = 2; // 铁 20%
        }

        // 设置障碍物属性
        switch(this.type) {
            case 0: // 木头
                this.name = '木头';
                this.maxHealth = 1;
                this.health = 1;
                break;
            case 1: // 石头
                this.name = '石头';
                this.maxHealth = 3;
                this.health = 3;
                break;
            case 2: // 铁
                this.name = '铁';
                this.maxHealth = 5;
                this.health = 5;
                break;
        }

        this.destroyed = false;
    }

    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroyed = true;
        }
        return this.destroyed;
    }

    render(ctx) {
        if (this.destroyed) return;

        ctx.save();

        // 根据血量调整透明度
        const healthPercent = this.health / this.maxHealth;
        ctx.globalAlpha = 0.3 + (healthPercent * 0.7); // 从30%到100%透明度

        switch(this.type) {
            case 0: // 木头
                this.renderWood(ctx);
                break;
            case 1: // 石头
                this.renderStone(ctx);
                break;
            case 2: // 铁
                this.renderSteel(ctx);
                break;
        }

        ctx.restore();

        // 显示血量条（如果受损）
        if (this.health < this.maxHealth) {
            this.renderHealthBar(ctx);
        }
    }

    renderWood(ctx) {
        // 木头外观
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // 木纹纹理
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < 5; i++) {
            const y = this.y + i * 6;
            ctx.fillRect(this.x, y, this.size, 2);
        }

        // 木纹线条
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + i * 10 + 5);
            ctx.lineTo(this.x + this.size, this.y + i * 10 + 3);
            ctx.stroke();
        }

        // 边框
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    renderStone(ctx) {
        // 石块外观
        ctx.fillStyle = '#696969';
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // 添加纹理
        ctx.fillStyle = '#808080';
        ctx.fillRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);

        // 添加裂纹效果（受损时更多裂纹）
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y);
        ctx.lineTo(this.x + 8, this.y + this.size);
        ctx.moveTo(this.x, this.y + 10);
        ctx.lineTo(this.x + this.size, this.y + 8);

        if (this.health < this.maxHealth) {
            ctx.moveTo(this.x + 15, this.y);
            ctx.lineTo(this.x + 12, this.y + this.size);
            ctx.moveTo(this.x + this.size, this.y + 20);
            ctx.lineTo(this.x, this.y + 18);
        }
        ctx.stroke();

        // 边框
        ctx.strokeStyle = '#A9A9A9';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    renderSteel(ctx) {
        // 钢块外观
        ctx.fillStyle = '#708090';
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // 金属纹理
        ctx.fillStyle = '#778899';
        ctx.fillRect(this.x + 1, this.y + 1, this.size - 2, this.size - 2);

        // 金属条纹
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#696969' : '#778899';
            ctx.fillRect(this.x + i * (this.size/4), this.y, this.size/4, this.size);
        }

        // 螺丝钉效果
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y + 5, 2, 0, Math.PI * 2);
        ctx.arc(this.x + this.size - 5, this.y + 5, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y + this.size - 5, 2, 0, Math.PI * 2);
        ctx.arc(this.x + this.size - 5, this.y + this.size - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        // 受损效果
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#FF4500';
            ctx.fillRect(this.x + Math.random() * 5, this.y + Math.random() * 5, 3, 3);
        }

        // 边框
        ctx.strokeStyle = '#B0C4DE';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    renderHealthBar(ctx) {
        const barWidth = this.size;
        const barHeight = 3;
        const barX = this.x;
        const barY = this.y - 8;

        // 血条背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血条
        const healthPercent = this.health / this.maxHealth;
        let healthColor = '#4CAF50'; // 绿色
        if (healthPercent < 0.7) healthColor = '#FFC107'; // 黄色
        if (healthPercent < 0.3) healthColor = '#F44336'; // 红色

        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // 血条边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

// 粒子类 - 改进爆炸效果
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
        this.decay = 0.015;
        this.color = color;
        this.size = 2 + Math.random() * 4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.gravity = 0.0001;
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        this.dy += this.gravity * deltaTime; // 添加重力效果
        this.life -= this.decay;
        this.size *= 0.98;
        this.rotation += this.rotationSpeed;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;

        // 创建渐变效果
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
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

// 输入管理器
class InputManager {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
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

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
}

// 游戏模式管理器 - 添加难度选择
class GameModeManager {
    constructor() {
        this.isSinglePlayer = false;
        this.aiDifficulty = 'normal'; // easy, normal, hard
    }

    toggleSinglePlayer() {
        this.isSinglePlayer = !this.isSinglePlayer;
        return this.isSinglePlayer;
    }

    setDifficulty(difficulty) {
        this.aiDifficulty = difficulty;
    }

    getDifficultyName() {
        switch(this.aiDifficulty) {
            case 'easy': return '简单';
            case 'normal': return '普通';
            case 'hard': return '困难';
            default: return '普通';
        }
    }

    cycleDifficulty() {
        const difficulties = ['easy', 'normal', 'hard'];
        const currentIndex = difficulties.indexOf(this.aiDifficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        this.aiDifficulty = difficulties[nextIndex];
        return this.aiDifficulty;
    }
}
