const Utils = {
    rectCollision: (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    circleCollision: (circle1, circle2) => {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    },

    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    formatDate: (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    },

    getDifficultySettings: (difficulty) => {
        const settings = {
            easy: {
                playerSpeed: 0.006,
                obstacleSpeedMin: 1.5,
                obstacleSpeedMax: 3,
                spawnIntervalStart: 2000,
                spawnIntervalMin: 800,
                spawnIntervalDecrease: 25,
                scoreMultiplier: 1
            },
            hard: {
                playerSpeed: 0.007,
                obstacleSpeedMin: 2.5,
                obstacleSpeedMax: 4.5,
                spawnIntervalStart: 1500,
                spawnIntervalMin: 500,
                spawnIntervalDecrease: 35,
                scoreMultiplier: 2
            },
            veryHard: {
                playerSpeed: 0.008,
                obstacleSpeedMin: 3.5,
                obstacleSpeedMax: 6,
                spawnIntervalStart: 1000,
                spawnIntervalMin: 300,
                spawnIntervalDecrease: 45,
                scoreMultiplier: 3
            }
        };
        return settings[difficulty];
    }
};