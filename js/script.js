// --- Dữ liệu Game ---
const levels = [
    { enemiesToKill: 5, speed: 2, spawnRate: 80, wish: "Chúc mừng sinh nhật! Khởi động thế thôi, màn 1 dễ mà đúng không?" },
    { enemiesToKill: 8, speed: 3, spawnRate: 60, wish: "Cậu đỉnh đấy! Tuổi mới chúc cậu luôn mạnh khỏe, tràn đầy năng lượng như khi click nãy giờ!" },
    { enemiesToKill: 12, speed: 4, spawnRate: 45, wish: "Sắp đến đích rồi! Chúc mọi dự định trong năm nay của cậu đều sẽ thành công rực rỡ." },
    { enemiesToKill: 15, speed: 5, spawnRate: 30, wish: "Màn 4 căng quá! Chúc cậu luôn gặp may mắn, nụ cười luôn trên môi nhé." },
    { enemiesToKill: 20, speed: 6, spawnRate: 20, wish: "Bạn là siêu nhân! Chúc cậu một sinh nhật thật hạnh phúc bên gia đình và những người yêu thương. Happy Birthday!" }
];

let currentLevel = 0;
let lives = 3;
let enemiesKilledInLevel = 0;
let isPlaying = false;
let enemiesArray = [];
let spawnTimer = 0;
let animationId;

// --- Giao diện DOM ---
const gameArea = document.getElementById('game-area');
const livesDisplay = document.getElementById('lives-display');
const levelDisplay = document.getElementById('level-display');
const wishText = document.getElementById('wish-text');

// Các màn hình
const startScreen = document.getElementById('start-screen');
const levelClearScreen = document.getElementById('level-clear-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');

// Nút bấm
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-next').addEventListener('click', nextLevel);
document.getElementById('btn-restart').addEventListener('click', resetGame);

// --- Logic Hệ thống ---
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
        // Đã phá đảo (Chiến thắng)
        victoryScreen.classList.remove('hidden');
    } else {
        startLevel();
    }
}

function startLevel() {
    enemiesKilledInLevel = 0;
    updateHUD();
    clearAllEnemies();
    isPlaying = true;
    gameLoop();
}

function updateHUD() {
    levelDisplay.innerText = `STAGE ${currentLevel + 1}/5`;
    let hearts = '';
    for(let i=0; i<lives; i++) hearts += '❤️';
    livesDisplay.innerText = hearts;
}

// Xóa quái vật trên màn hình
function clearAllEnemies() {
    enemiesArray.forEach(enemy => enemy.element.remove());
    enemiesArray = [];
}

// Tạo quái vật mới
function spawnEnemy() {
    const enemyEl = document.createElement('div');
    enemyEl.classList.add('enemy');
    gameArea.appendChild(enemyEl);

    // Vị trí bắt đầu ở mép phải màn hình
    const startX = gameArea.offsetWidth;
    enemyEl.style.left = startX + 'px';

    const enemyObj = {
        element: enemyEl,
        x: startX
    };

    enemiesArray.push(enemyObj);

    // Lắng nghe sự kiện người chơi click vào quái vật
    // Dùng pointerdown để hỗ trợ cả chuột trên máy tính và chạm trên điện thoại
    enemyEl.addEventListener('pointerdown', function() {
        if (!isPlaying) return;
        
        // Tạo hiệu ứng đỏ
        this.style.backgroundColor = '#FF5555';
        
        // Xóa khỏi mảng và DOM
        const index = enemiesArray.indexOf(enemyObj);
        if (index > -1) enemiesArray.splice(index, 1);
        
        setTimeout(() => this.remove(), 50);
        
        enemiesKilledInLevel++;
        checkLevelComplete();
    });
}

function checkLevelComplete() {
    if (enemiesKilledInLevel >= levels[currentLevel].enemiesToKill) {
        // Thắng màn này
        isPlaying = false;
        cancelAnimationFrame(animationId);
        
        // Hiện lời chúc
        wishText.innerText = levels[currentLevel].wish;
        
        // Chờ 0.5s rồi mới hiện bảng để không bị đường đột
        setTimeout(() => {
            if(currentLevel === levels.length - 1) {
                victoryScreen.classList.remove('hidden'); // Nếu là ải 5 thì hiện màn phá đảo
            } else {
                levelClearScreen.classList.remove('hidden'); // Màn bình thường thì hiện bảng Next
            }
        }, 500);
    }
}

function takeDamage() {
    lives--;
    updateHUD();
    
    // Hiệu ứng màn hình chớp đỏ khi bị mất máu
    gameArea.style.backgroundColor = '#ff4d4d';
    setTimeout(() => { gameArea.style.backgroundColor = '#78A7FF'; }, 100);

    if (lives <= 0) {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        setTimeout(() => gameOverScreen.classList.remove('hidden'), 300);
    }
}

// Vòng lặp chính của Game
function gameLoop() {
    if (!isPlaying) return;

    // Sinh quái vật
    spawnTimer++;
    const currentSettings = levels[currentLevel];
    
    if (spawnTimer >= currentSettings.spawnRate) {
        spawnEnemy();
        spawnTimer = 0;
    }

    // Di chuyển quái vật
    for (let i = 0; i < enemiesArray.length; i++) {
        let enemy = enemiesArray[i];
        enemy.x -= currentSettings.speed;
        enemy.element.style.left = enemy.x + 'px';

        // Nếu quái chạm vào vùng của người chơi (left < 80px)
        if (enemy.x <= 80) {
            enemy.element.remove();
            enemiesArray.splice(i, 1);
            i--; // Điều chỉnh lại index sau khi xóa
            takeDamage();
        }
    }

    // Lặp lại frame tiếp theo
    animationId = requestAnimationFrame(gameLoop);
}