class Player {
    constructor(canvas, difficulty) {
        this.canvas = canvas;
        this.difficulty = difficulty;
        this.settings = Utils.getDifficultySettings(difficulty);
        this.size = Math.min(canvas.width, canvas.height) * 0.05;
        this.x = canvas.width / 2 - this.size / 2;
        this.y = canvas.height / 2 - this.size / 2;
        this.speed = Math.min(canvas.width, canvas.height) * this.settings.playerSpeed;
        this.dx = 0;
        this.dy = 0;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.x = Utils.clamp(this.x, 0, this.canvas.width - this.size);
        this.y = Utils.clamp(this.y, 0, this.canvas.height - this.size);
    }

    draw(ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    setDirection(keys) {
        this.dx = 0;
        this.dy = 0;

        if (keys.ArrowLeft || keys.a) this.dx = -this.speed;
        if (keys.ArrowRight || keys.d) this.dx = this.speed;
        if (keys.ArrowUp || keys.w) this.dy = -this.speed;
        if (keys.ArrowDown || keys.s) this.dy = this.speed;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
}