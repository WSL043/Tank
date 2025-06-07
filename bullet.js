// 子弹类 - 改进外观
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
        this.trail = []; // 子弹轨迹
        this.life = 1.0;
    }

    update(deltaTime) {
        // 记录轨迹
        this.trail.push({ x: this.x, y: this.y, life: 0.5 });

        // 限制轨迹长度
        if (this.trail.length > 8) {
            this.trail.shift();
        }

        // 更新轨迹生命值
        this.trail.forEach(point => {
            point.life -= 0.1;
        });

        this.x += this.dx;
        this.y += this.dy;
    }

    render(ctx) {
        // 渲染轨迹
        this.trail.forEach((point, index) => {
            if (point.life > 0) {
                ctx.save();
                ctx.globalAlpha = point.life * (index / this.trail.length);
                ctx.fillStyle = '#FFA500';
                const trailSize = this.size * (point.life * 0.8);
                ctx.fillRect(point.x - trailSize/2, point.y - trailSize/2, trailSize, trailSize);
                ctx.restore();
            }
        });

        // 渲染子弹主体
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 子弹渐变效果
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, '#FF6B35');

        ctx.fillStyle = gradient;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);

        // 子弹高光
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-this.size/4, -this.size/4, this.size/2, this.size/2);

        ctx.restore();
    }
}
