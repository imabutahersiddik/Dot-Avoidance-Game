class Obstacle {
    constructor(canvas, difficulty) {
        this.canvas = canvas;
        this.settings = Utils.getDifficultySettings(difficulty);
        
        const minSize = Math.min(canvas.width, canvas.height) * 0.03;
        const maxSize = Math.min(canvas.width, canvas.height) * 0.06;
        this.size = Utils.random(minSize, maxSize);
        
        const baseSpeed = Utils.random(
            this.settings.obstacleSpeedMin,
            this.settings.obstacleSpeedMax
        ) * (Math.min(canvas.width, canvas.height) * 0.002);
        
        const side = Math.floor(Utils.random(0, 4));
        
        switch(side) {
            case 0: // Top
                this.x = Utils.random(0, canvas.width);
                this.y = -this.size;
                this.dx = Utils.random(-baseSpeed, baseSpeed);
                this.dy = baseSpeed;
                break;
            case 1: // Right
                this.x = canvas.width + this.size;
                this.y = Utils.random(0, canvas.height);
                this.dx = -baseSpeed;
                this.dy = Utils.random(-baseSpeed, baseSpeed);
                break;
            case 2: // Bottom
                this.x = Utils.random(0, canvas.width);
                this.y = canvas.height + this.size;
                this.dx = Utils.random(-baseSpeed, baseSpeed);
                this.dy = -baseSpeed;
                break;
            case 3: // Left
                this.x = -this.size;
                this.y = Utils.random(0, canvas.height);
                this.dx = baseSpeed;
                this.dy = Utils.random(-baseSpeed, baseSpeed);
                break;
        }
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return (
            this.x + this.size < 0 ||
            this.x - this.size > this.canvas.width ||
            this.y + this.size < 0 ||
            this.y - this.size > this.canvas.height
        );
    }

    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
}