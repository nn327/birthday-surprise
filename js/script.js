document.addEventListener('DOMContentLoaded', () => {
    const giftBox = document.getElementById('open-gift');
    const giftScreen = document.getElementById('gift-screen');
    const mainScreen = document.getElementById('main-screen');
    const bgMusic = document.getElementById('bg-music');
    const record = document.getElementById('record');
    const textElement = document.querySelector('.typed-text');

    // Nội dung lời chúc
    const message = "Chúc cậu tuổi mới thật nhiều niềm vui, luôn rực rỡ và thành công. Tớ đã làm trang web này dành riêng cho cậu, hy vọng cậu thích sự bất ngờ này! 💖";
    let charIndex = 0;

    // Hàm tạo hiệu ứng gõ chữ
    function typeText() {
        if (charIndex < message.length) {
            textElement.textContent += message.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 50); // Tốc độ gõ chữ
        }
    }

    // Xử lý sự kiện click vào hộp quà
    giftBox.addEventListener('click', () => {
        // 1. Ẩn màn hình quà
        giftScreen.style.opacity = '0';
        giftScreen.style.transform = 'scale(2)';
        
        setTimeout(() => {
            giftScreen.style.display = 'none';
            
            // 2. Hiện màn hình chính & Đổi màu nền
            mainScreen.classList.remove('hidden');
            document.body.classList.add('party-mode');

            // 3. Phát nhạc và xoay đĩa
            bgMusic.play();
            record.classList.add('playing');

            // 4. Bắn pháo giấy
            fireConfetti();

            // 5. Bắt đầu gõ chữ sau khi chuyển cảnh
            setTimeout(typeText, 1000);
        }, 800);
    });

    // Cấu hình pháo giấy hoành tráng
    function fireConfetti() {
        var duration = 5 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 100 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#ff4757', '#ff6b81', '#ffffff', '#f6e58d']
            }));
            confetti(Object.assign({}, defaults, { particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#ff4757', '#ff6b81', '#ffffff', '#f6e58d']
            }));
        }, 250);
    }
});