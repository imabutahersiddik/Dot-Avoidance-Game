class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('scoreValue');
        this.finalScoreElement = document.getElementById('finalScore');
        this.highScoreElement = document.getElementById('highScore');
        this.difficultyElement = document.getElementById('difficultyValue');
        this.timeElement = document.getElementById('timeValue');
        this.gameOverScreen = document.getElementById('gameOver');
        this.startScreen = document.getElementById('startScreen');
        this.scoreHistory = document.getElementById('scoreHistory');
        this.startBtn = document.getElementById('startBtn');
        this.touchControls = document.getElementById('touchControls');

        this.resizeCanvas();
        this.difficulty = 'easy';
        this.settings = Utils.getDifficultySettings(this.difficulty);
        
        this.player = null;
        this.obstacles = [];
        this.score = 0;
        this.highScores = {
            easy: parseInt(localStorage.getItem('highScore_easy')) || 0,
            hard: parseInt(localStorage.getItem('highScore_hard')) || 0,
            veryHard: parseInt(localStorage.getItem('highScore_veryHard')) || 0
        };
        this.scoreHistories = {
            easy: JSON.parse(localStorage.getItem('scoreHistory_easy')) || [],
            hard: JSON.parse(localStorage.getItem('scoreHistory_hard')) || [],
            veryHard: JSON.parse(localStorage.getItem('scoreHistory_veryHard')) || []
        };
        this.gameLoop = null;
        this.keys = {};
        this.lastObstacleSpawn = 0;
        this.spawnInterval = this.settings.spawnIntervalStart;
        this.isGameOver = false;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.setupEventListeners();
        this.showStartScreen();
        this.updateScoreHistory();
        this.updateCurrentTime();

        if (this.isTouchDevice) {
            this.touchControls.style.display = 'block';
        }

        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    updateCurrentTime() {
        this.timeElement.textContent = Utils.formatDate(new Date());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateScoreHistory() {
        ['easy', 'hard', 'veryHard'].forEach(diff => {
            const tbody = document.querySelector(`#${diff}History tbody`);
            tbody.innerHTML = '';
            
            const scores = this.scoreHistories[diff];
            scores.sort((a, b) => b.score - a.score);
            
            scores.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.date}</td>
                    <td class="${index === 0 ? 'high-score' : ''}">${entry.score}</td>
                `;
                if (entry.isNew) {
                    row.classList.add('new-score');
                    delete entry.isNew;
                }
                tbody.appendChild(row);
            });
        });
    }

    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Touch controls
        const touchButtons = {
            'upBtn': { up: true },
            'downBtn': { down: true },
            'leftBtn': { left: true },
            'rightBtn': { right: true }
        };

        Object.keys(touchButtons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            
            const startEvent = (e) => {
                e.preventDefault();
                this.keys = { ...this.keys, ...touchButtons[btnId] };
            };

            const endEvent = (e) => {
                e.preventDefault();
                Object.keys(touchButtons[btnId]).forEach(key => {
                    this.keys[key] = false;
                });
            };

            btn.addEventListener('touchstart', startEvent, { passive: false });
            btn.addEventListener('touchend', endEvent, { passive: false });
            btn.addEventListener('mousedown', startEvent);
            btn.addEventListener('mouseup', endEvent);
        });

        // Score history tabs
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`${button.dataset.tab}Tab`).classList.add('active');
            });
        });

        // History buttons
        document.querySelectorAll('#historyBtn, #historyBtnGameOver').forEach(btn => {
            btn.addEventListener('click', () => {
                this.scoreHistory.style.display = 'block';
                this.startScreen.style.display = 'none';
                this.gameOverScreen.style.display = 'none';
            });
        });

        document.getElementById('closeHistory').addEventListener('click', () => {
            this.scoreHistory.style.display = 'none';
            if (this.isGameOver) {
                this.gameOverScreen.style.display = 'block';
            } else {
                this.startScreen.style.display = 'block';
            }
        });

        // Difficulty selection
        document.querySelectorAll('[data-difficulty]').forEach(button => {
            button.addEventListener('click', () => {
                this.difficulty = button.dataset.difficulty;
                this.settings = Utils.getDifficultySettings(this.difficulty);
                this.difficultyElement.textContent = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
                this.start();
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.player) {
                this.player = new Player(this.canvas, this.difficulty);
            }
        });

        // Start/Restart button
        this.startBtn.addEventListener('click', () => {
            this.showStartScreen();
        });
    }

    start() {
        this.reset();
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.scoreHistory.style.display = 'none';
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    reset() {
        this.resizeCanvas();
        this.player = new Player(this.canvas, this.difficulty);
        this.obstacles = [];
        this.score = 0;
        this.lastObstacleSpawn = 0;
        this.spawnInterval = this.settings.spawnIntervalStart;
        this.isGameOver = false;
        this.updateScore();
    }

    update() {
        if (this.isGameOver) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const playerInput = {
            ArrowLeft: this.keys.left || this.keys.arrowleft || this.keys.a,
            ArrowRight: this.keys.right || this.keys.arrowright || this.keys.d,
            ArrowUp: this.keys.up || this.keys.arrowup || this.keys.w,
            ArrowDown: this.keys.down || this.keys.arrowdown || this.keys.s
        };

        this.player.setDirection(playerInput);
        this.player.update();
        this.player.draw(this.ctx);

        const currentTime = Date.now();
        if (currentTime - this.lastObstacleSpawn > this.spawnInterval) {
            this.obstacles.push(new Obstacle(this.canvas, this.difficulty));
            this.lastObstacleSpawn = currentTime;
            this.spawnInterval = Math.max(
                this.settings.spawnIntervalMin,
                this.spawnInterval - this.settings.spawnIntervalDecrease
            );
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update();
            obstacle.draw(this.ctx);

            if (Utils.rectCollision(this.player.getBounds(), obstacle.getBounds())) {
                this.gameOver();
                return false;
            }

            return !obstacle.isOffScreen();
        });

        this.score += this.settings.scoreMultiplier;
        this.updateScore();

        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    gameOver() {
        this.isGameOver = true;
        cancelAnimationFrame(this.gameLoop);
        
        const currentHighScore = this.highScores[this.difficulty];
        if (this.score > currentHighScore) {
            this.highScores[this.difficulty] = this.score;
            localStorage.setItem(`highScore_${this.difficulty}`, this.score);
        }

        // Add score to history
        const scoreEntry = {
            date: Utils.formatDate(new Date()),
            score: this.score,
            isNew: true
        };
        
        this.scoreHistories[this.difficulty].push(scoreEntry);
        this.scoreHistories[this.difficulty].sort((a, b) => b.score - a.score);
        
        // Keep only top 10 scores
        if (this.scoreHistories[this.difficulty].length > 10) {
            this.scoreHistories[this.difficulty] = this.scoreHistories[this.difficulty].slice(0, 10);
        }
        
        localStorage.setItem(`scoreHistory_${this.difficulty}`, JSON.stringify(this.scoreHistories[this.difficulty]));
        
        this.updateScoreHistory();
        this.finalScoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScores[this.difficulty];
        this.gameOverScreen.style.display = 'block';
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    showStartScreen() {
        this.startScreen.style.display = 'block';
        this.gameOverScreen.style.display = 'none';
        this.scoreHistory.style.display = 'none';
        this.highScoreElement.textContent = this.highScores[this.difficulty];
    }
}

window.onload = () => {
    new Game();
};