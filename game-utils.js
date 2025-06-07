// 障碍物类 - 改进外观
class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.type = Math.floor(Math.random() * 3); // 随机障碍物类型
    }

    render(ctx) {
        ctx.save();

        switch(this.type) {
            case 0: // 石块
                this.renderStone(ctx);
                break;
            case 1: // 砖块
                this.renderBrick(ctx);
                break;
            case 2: // 钢块
                this.renderSteel(ctx);
                break;
        }

        ctx.restore();
    }

    renderStone(ctx) {
        // 石块外观
        ctx.fillStyle = '#696969';
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // 添加纹理
        ctx.fillStyle = '#808080';
        ctx.fillRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);

        // 添加裂纹效果
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y);
        ctx.lineTo(this.x + 8, this.y + this.size);
        ctx.moveTo(this.x, this.y + 10);
        ctx.lineTo(this.x + this.size, this.y + 8);
        ctx.stroke();

        // 边框
        ctx.strokeStyle = '#A9A9A9';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    renderBrick(ctx) {
        // 砖块外观
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // 砖块纹理
        const brickRows = 3;
        const brickHeight = this.size / brickRows;

        for (let i = 0; i < brickRows; i++) {
            const y = this.y + i * brickHeight;

            // 交替砖块模式
            if (i % 2 === 0) {
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x + this.size/2, y);
                ctx.lineTo(this.x + this.size/2, y + brickHeight);
                ctx.stroke();
            }

            // 水平线
            ctx.beginPath();
            ctx.moveTo(this.x, y + brickHeight);
            ctx.lineTo(this.x + this.size, y + brickHeight);
            ctx.stroke();
        }

        // 边框
        ctx.strokeStyle = '#D2691E';
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

        // 边框
        ctx.strokeStyle = '#B0C4DE';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
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
