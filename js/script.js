const levels = [
    { targetToDodge: 10, speedY: 3, spawnRate: 60, wish: "Chúc mừng sinh nhật! Mới màn 1 thôi, khởi động cổ tay đi nào!" },
    { targetToDodge: 15, speedY: 4, spawnRate: 45, wish: "Né hay lắm! Tuổi mới chúc cậu luôn nhạy bén và linh hoạt như thế này nhé!" },
    { targetToDodge: 20, speedY: 5, spawnRate: 35, wish: "Bắt đầu khó rồi đây! Chúc mọi khó khăn trong cuộc sống của cậu đều bị né tránh thành công." },
    { targetToDodge: 30, speedY: 6, spawnRate: 25, wish: "Quá đỉnh! Chúc cậu luôn giữ được sự kiên trì và vững vàng trước mọi thử thách." },
    { targetToDodge: 40, speedY: 7, spawnRate: 15, wish: "Màn cuối bão tố nhưng cậu vẫn qua được! Happy Birthday!" }
];

let currentLevel = 0;
let lives = 3;
let dodgedCount = 0;
let isPlaying = false;
let obstacles = [];
let spawnTimer = 0;
let animationId;

const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const livesDisplay = document.getElementById('lives-display');
const levelDisplay = document.getElementById('level-display');
const wishText = document.getElementById('wish-text');

const startScreen = document.getElementById('start-screen');
const levelClearScreen = document.getElementById('level-clear-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-next').addEventListener('click', nextLevel);
document.getElementById('btn-restart').addEventListener('click', resetGame);

// --- Hệ Thống Điều Khiển Theo Chuột ---
function movePlayer(clientX, clientY) {
    if (!isPlaying) return;
    const rect = gameArea.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Giới hạn không cho nhân vật văng ra khỏi màn hình
    if (x < 15) x = 15;
    if (x > rect.width - 15) x = rect.width - 15;
    if (y < 15) y = 15;
    if (y > rect.height - 15) y = rect.height - 15;

    player.style.left = x + 'px';
    player.style.top = y + 'px';
}

gameArea.addEventListener('mousemove', (e) => movePlayer(e.clientX, e.clientY));
gameArea.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Chống cuộn màn hình trên điện thoại
    movePlayer(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

// --- Logic Trò Chơi ---
function startGame() {
    startScreen.classList.add('hidden');
    resetGameStats();
    startLevel();
}

function resetGameStats() {
    currentLevel = 0;
    lives = 3;
    updateHUD();
}

function resetGame() {
    gameOverScreen.classList.add('hidden');
    resetGameStats();
    startLevel();
}

function nextLevel() {
    levelClearScreen.classList.add('hidden');
    currentLevel++;
    if (currentLevel >= levels.length) {
        victoryScreen.classList.remove('hidden');
    } else {
        startLevel();
    }
}

function startLevel() {
    dodgedCount = 0;
    updateHUD();
    clearAllObstacles();
    
    // Đưa người chơi về giữa khi bắt đầu
    player.style.left = '50%';
    player.style.top = '80%';
    
    isPlaying = true;
    gameLoop();
}

function updateHUD() {
    levelDisplay.innerText = `STAGE ${currentLevel + 1} (Né: ${dodgedCount}/${levels[currentLevel].targetToDodge})`;
    livesDisplay.innerText = '❤️'.repeat(lives);
}

function clearAllObstacles() {
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
}

// Hàm xử lý va chạm (Hitbox)
function isCollide(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    // Trừ hao 5px để việc né tránh dễ thở hơn một chút
    return !(
        aRect.top + 5 > bRect.bottom ||
        aRect.right - 5 < bRect.left ||
        aRect.bottom - 5 < bRect.top ||
        aRect.left + 5 > bRect.right
    );
}

function spawnObstacle() {
    const el = document.createElement('div');
    el.classList.add('obstacle');
    gameArea.appendChild(el);

    const gameWidth = gameArea.offsetWidth;
    const startX = Math.random() * (gameWidth - 30);
    const patternRand = Math.random();
    
    // 3 Quỹ đạo bay: 40% thẳng, 30% chéo, 30% sóng lượn
    let pattern = 'straight';
    if (patternRand > 0.7) pattern = 'sine';
    else if (patternRand > 0.4) pattern = 'diagonal';

    const obs = {
        element: el,
        x: startX,
        y: -40,
        baseX: startX,
        speedY: levels[currentLevel].speedY + (Math.random() * 2), // Tốc độ rơi ngẫu nhiên
        speedX: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2), // Tốc độ trượt ngang
        pattern: pattern
    };
    
    obstacles.push(obs);
}

function takeDamage() {
    lives--;
    updateHUD();
    
    gameArea.style.backgroundColor = '#660000'; // Nháy đỏ
    setTimeout(() => { gameArea.style.backgroundColor = '#2b2b2b'; }, 150);

    if (lives <= 0) {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        gameOverScreen.classList.remove('hidden');
    }
}

function checkLevelComplete() {
    updateHUD();
    if (dodgedCount >= levels[currentLevel].targetToDodge) {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        wishText.innerText = levels[currentLevel].wish;
        
        setTimeout(() => {
            if(currentLevel === levels.length - 1) victoryScreen.classList.remove('hidden');
            else levelClearScreen.classList.remove('hidden');
        }, 500);
    }
}

function gameLoop() {
    if (!isPlaying) return;

    const currentSettings = levels[currentLevel];
    spawnTimer++;
    if (spawnTimer >= currentSettings.spawnRate) {
        spawnObstacle();
        spawnTimer = 0;
    }

    const gameWidth = gameArea.offsetWidth;
    const gameHeight = gameArea.offsetHeight;

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obs.speedY;

        // Tính toán quỹ đạo bay
        if (obs.pattern === 'diagonal') {
            obs.x += obs.speedX;
            // Đụng tường dội lại
            if (obs.x <= 0 || obs.x >= gameWidth - 30) obs.speedX *= -1; 
        } else if (obs.pattern === 'sine') {
            obs.x = obs.baseX + Math.sin(obs.y / 40) * 80;
        }

        obs.element.style.left = obs.x + 'px';
        obs.element.style.top = obs.y + 'px';

        // 1. Kiểm tra va chạm với người chơi
        if (isCollide(player, obs.element)) {
            obs.element.remove();
            obstacles.splice(i, 1);
            i--;
            takeDamage();
            continue;
        }

        // 2. Chướng ngại vật rơi xuống đáy an toàn (Đã né thành công)
        if (obs.y > gameHeight) {
            dodgedCount++;
            obs.element.remove();
            obstacles.splice(i, 1);
            i--;
            checkLevelComplete();
            // Nếu qua ải thì dừng luôn vòng for
            if(!isPlaying) break; 
        }
    }

    if (isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}