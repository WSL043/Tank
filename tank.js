// 坦克类
class Tank {
    constructor(x, y, color, id, isAI = false) {
        this.x = x;
        this.y = y;
        this.size = 30;        this.color = color;
        this.id = id;
        this.speed = 3;
        this.angle = 0; // 炮塔角度
        this.bodyAngle = 0; // 车体角度
        this.health = 100; // 血量系统
        this.maxHealth = 100;
        this.score = 0;
        this.lastShot = 0;
        this.shootCooldown = 300; // 毫秒
        this.isAI = isAI;

        this.initialX = x;
        this.initialY = y;

        // AI相关属性
        if (this.isAI) {
            this.aiTarget = null;
            this.aiNextDecision = 0;
            this.aiDirection = { x: 0, y: 0 };
            this.aiShootCooldown = 0;
            this.aiDifficulty = 'normal'; // easy, normal, hard
        }
    }

    // 设置AI难度
    setAIDifficulty(difficulty) {
        if (this.isAI) {
            this.aiDifficulty = difficulty;
            // 根据难度调整AI属性
            switch(difficulty) {
                case 'easy':
                    this.speed = 2;
                    this.shootCooldown = 800;
                    break;
                case 'normal':
                    this.speed = 3;
                    this.shootCooldown = 500;
                    break;
                case 'hard':
                    this.speed = 4;
                    this.shootCooldown = 300;
                    break;
            }
        }
    }

    update(deltaTime, game) {
        if (this.isAI) {
            this.updateAI(deltaTime, game);
        }
    }

    updateAI(deltaTime, game) {
        const now = Date.now();

        // 根据难度调整AI决策间隔
        let decisionInterval = 200;
        switch(this.aiDifficulty) {
            case 'easy':
                decisionInterval = 500;
                break;
            case 'normal':
                decisionInterval = 300;
                break;
            case 'hard':
                decisionInterval = 150;
                break;
        }

        // AI决策间隔
        if (now > this.aiNextDecision) {
            this.makeAIDecision(game);
            this.aiNextDecision = now + decisionInterval + Math.random() * decisionInterval;
        }

        // AI移动
        if (this.aiDirection.x !== 0 || this.aiDirection.y !== 0) {
            const oldX = this.x;
            const oldY = this.y;

            this.x += this.aiDirection.x * this.speed;
            this.y += this.aiDirection.y * this.speed;

            // 更新车体角度和炮塔角度
            this.bodyAngle = Math.atan2(this.aiDirection.y, this.aiDirection.x);
            this.angle = this.bodyAngle; // 让炮塔跟随移动方向

            // 检查边界和碰撞
            game.checkBoundaries(this);
            game.checkObstacleCollisions(this);
        }

        // AI射击
        if (this.aiShootCooldown > 0) {
            this.aiShootCooldown -= deltaTime;
        }

        if (this.aiTarget && this.canShoot() && this.aiShootCooldown <= 0) {
            // 计算射击角度
            const dx = this.aiTarget.x - this.x;
            const dy = this.aiTarget.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 根据难度调整射击范围和精度
            let shootRange = 200;
            let aimOffset = 0;
            switch(this.aiDifficulty) {
                case 'easy':
                    shootRange = 150;
                    aimOffset = (Math.random() - 0.5) * 0.5; // 降低精度
                    break;
                case 'normal':
                    shootRange = 200;
                    aimOffset = (Math.random() - 0.5) * 0.3;
                    break;
                case 'hard':
                    shootRange = 250;
                    aimOffset = (Math.random() - 0.5) * 0.1; // 高精度
                    break;
            }

            if (distance < shootRange) {
                this.angle = Math.atan2(dy, dx) + aimOffset;
                game.shoot(this);

                let shootCooldownTime = 500;
                switch(this.aiDifficulty) {
                    case 'easy':
                        shootCooldownTime = 1000 + Math.random() * 1000;
                        break;
                    case 'normal':
                        shootCooldownTime = 500 + Math.random() * 800;
                        break;
                    case 'hard':
                        shootCooldownTime = 300 + Math.random() * 400;
                        break;
                }
                this.aiShootCooldown = shootCooldownTime;
            }
        }
    }

    makeAIDecision(game) {
        // 找到最近的敌人
        this.aiTarget = null;
        let minDistance = Infinity;        for (let player of game.players) {
            if (player !== this && player.health > 0) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    minDistance = distance;
                    this.aiTarget = player;
                }
            }
        }

        if (this.aiTarget) {
            const dx = this.aiTarget.x - this.x;
            const dy = this.aiTarget.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 根据难度调整AI行为
            let approachDistance = 150;
            let retreatDistance = 80;
            switch(this.aiDifficulty) {
                case 'easy':
                    approachDistance = 120;
                    retreatDistance = 60;
                    break;
                case 'normal':
                    approachDistance = 150;
                    retreatDistance = 80;
                    break;
                case 'hard':
                    approachDistance = 180;
                    retreatDistance = 100;
                    break;
            }

            // 决策逻辑
            if (distance > approachDistance) {
                // 靠近目标
                this.aiDirection.x = Math.sign(dx);
                this.aiDirection.y = Math.sign(dy);
            } else if (distance < retreatDistance) {
                // 距离太近，后退
                this.aiDirection.x = -Math.sign(dx);
                this.aiDirection.y = -Math.sign(dy);
            } else {
                // 随机移动（躲避）
                let randomChance = 0.3;
                if (this.aiDifficulty === 'hard') randomChance = 0.4;
                if (this.aiDifficulty === 'easy') randomChance = 0.2;

                if (Math.random() < randomChance) {
                    this.aiDirection.x = (Math.random() - 0.5) * 2;
                    this.aiDirection.y = (Math.random() - 0.5) * 2;
                } else {
                    this.aiDirection.x = 0;
                    this.aiDirection.y = 0;
                }
            }

            // 更新炮塔角度指向目标（但不立即瞄准，让炮塔跟随移动）
            if (this.aiDirection.x === 0 && this.aiDirection.y === 0) {
                this.angle = Math.atan2(dy, dx);
            }
        } else {
            // 没有目标时随机巡逻
            if (Math.random() < 0.2) {
                this.aiDirection.x = (Math.random() - 0.5) * 2;
                this.aiDirection.y = (Math.random() - 0.5) * 2;
            }
        }
    }

    // 根据移动方向更新车体角度和炮塔角度
    updateDirection(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            this.bodyAngle = Math.atan2(dy, dx);
            // 修复炮塔方向：让炮塔跟随移动方向
            this.angle = this.bodyAngle;
        }
    }

    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }    takeDamage(damage = 20) {
        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            // 坦克死亡，不再重生
        }
    }    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.health = this.maxHealth;
        this.score = 0;
        this.lastShot = 0;
        this.angle = 0;
        this.bodyAngle = 0;

        if (this.isAI) {
            this.aiTarget = null;
            this.aiNextDecision = 0;
            this.aiDirection = { x: 0, y: 0 };
            this.aiShootCooldown = 0;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size/2, this.y + this.size/2);

        // 绘制坦克车体
        ctx.rotate(this.bodyAngle);

        // 更好看的坦克车体渲染
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);

        // 绘制履带
        ctx.fillStyle = this.darkenColor(this.color, 0.3);
        ctx.fillRect(-this.size/2, -this.size/2 + 2, this.size, 4);
        ctx.fillRect(-this.size/2, this.size/2 - 6, this.size, 4);

        // 绘制车体边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);

        // 重置旋转，绘制炮塔
        ctx.rotate(-this.bodyAngle);
        ctx.rotate(this.angle);

        // 绘制炮管
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size/2 + 10, 0);
        ctx.stroke();

        // 绘制炮塔
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();        ctx.restore();

        // 绘制血条
        this.renderHealthBar(ctx);

        // AI标识和难度显示
        if (this.isAI) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.fillText(`AI(${this.aiDifficulty.toUpperCase()})`, this.x, this.y - 25);
        }
    }

    // 渲染血条
    renderHealthBar(ctx) {
        const barWidth = this.size;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 15;

        // 血条背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血条
        const healthPercent = this.health / this.maxHealth;
        let healthColor = '#4CAF50'; // 绿色
        if (healthPercent < 0.5) healthColor = '#FFC107'; // 黄色
        if (healthPercent < 0.25) healthColor = '#F44336'; // 红色

        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // 血条边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    // 辅助函数：使颜色变暗
    darkenColor(color, factor) {
        // 简单的颜色变暗函数
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const newR = Math.floor(r * (1 - factor));
        const newG = Math.floor(g * (1 - factor));
        const newB = Math.floor(b * (1 - factor));

        return `rgb(${newR}, ${newG}, ${newB})`;
    }
}
