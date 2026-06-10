// ========== CELEBRATION.JS - CONFETE, CORAÇÕES E SPARKLES ========== //

/**
 * CelebrationEffect
 * Cria efeitos de celebração: confete, corações voadores e sparkles
 */
class CelebrationEffect {
    constructor(containerSelector = '#confetti-container', options = {}) {
        this.container = document.querySelector(containerSelector);

        this.options = {
            confettiCount: 50,
            confettiDuration: 3000,
            heartCount: 15,
            heartDuration: 3000,
            sparkleCount: 30,
            sparkleDuration: 2000,
            colors: ['#ff69b4', '#dc143c', '#8b0000', '#d4af37', '#ff1493'],
            ...options
        };

        if (this.container) {
            this.init();
        }
    }

    /**
     * Inicializar effect
     */
    init() {
        log('CelebrationEffect inicializado', 'info');
    }

    /**
     * Criar confete
     */
    createConfetti() {
        for (let i = 0; i < this.options.confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';

            const duration = Math.random() * 2 + 2;
            const delay = Math.random() * 0.3;

            confetti.style.animation = `fall ${duration}s linear ${delay}s forwards`;
            confetti.style.opacity = Math.random() * 0.5 + 0.5;

            this.container.appendChild(confetti);

            // Remover após animação
            setTimeout(() => {
                confetti.remove();
            }, (duration + delay) * 1000);
        }
    }

    /**
     * Criar corações voadores
     */
    createHearts() {
        const hearts = ['❤️', '💕', '💖', '💗', '💝'];

        for (let i = 0; i < this.options.heartCount; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart-animation';
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.bottom = '-50px';
            heart.style.fontSize = (Math.random() * 20 + 20) + 'px';

            this.container.appendChild(heart);

            // Remover após animação
            setTimeout(() => {
                heart.remove();
            }, 3000);
        }
    }

    /**
     * Criar sparkles (brilhos)
     */
    createSparkles() {
        for (let i = 0; i < this.options.sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.width = '10px';
            sparkle.style.height = '10px';
            sparkle.style.borderRadius = '50%';
            sparkle.style.backgroundColor = '#d4af37';
            sparkle.style.boxShadow = '0 0 10px #d4af37';
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = Math.random() * window.innerHeight + 'px';
            sparkle.style.zIndex = '999';

            const duration = Math.random() * 1 + 1;
            const delay = Math.random() * 0.5;

            sparkle.style.animation = `sparkle ${duration}s ease-out ${delay}s forwards`;

            this.container.appendChild(sparkle);

            // Remover após animação
            setTimeout(() => {
                sparkle.remove();
            }, (duration + delay) * 1000);
        }
    }

    /**
     * Combinar todos os efeitos
     */
    celebrate() {
        this.createConfetti();
        this.createHearts();
        this.createSparkles();

        // Efeito sonoro (opcional - pode usar Web Audio API)
        this.playSound();
    }

    /**
     * Reproduzir som de celebração (se disponível)
     */
    playSound() {
        try {
            // Criar sons simples com Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Som 1: Nota aguda
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();

            osc1.connect(gain1);
            gain1.connect(audioContext.destination);

            osc1.frequency.value = 800;
            gain1.gain.setValueAtTime(0.2, audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            osc1.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + 0.3);

            // Som 2: Nota mais grave
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();

                osc2.connect(gain2);
                gain2.connect(audioContext.destination);

                osc2.frequency.value = 1000;
                gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.3);
            }, 150);
        } catch (e) {
            // Silencioso se Web Audio não suportado
        }
    }

    /**
     * Explodir confete em posição específica
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     */
    confettiExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.position = 'fixed';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.backgroundColor = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
            confetti.style.width = (Math.random() * 10 + 3) + 'px';
            confetti.style.height = (Math.random() * 10 + 3) + 'px';

            const angle = (Math.PI * 2 * i) / 30;
            const velocity = Math.random() * 5 + 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            const duration = Math.random() * 2 + 1;

            confetti.style.setProperty('--vx', vx);
            confetti.style.setProperty('--vy', vy);
            confetti.style.animation = `confettiFall ${duration}s ease-out forwards`;

            this.container.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, duration * 1000);
        }
    }

    /**
     * Destruir effect
     */
    destroy() {
        // Limpar container
        this.container.innerHTML = '';
    }
}

// ========== KEYFRAMES ADICIONAIS ========== //
// Adicionar ao CSS dinamicamente se não existirem
function addCelebrationStyles() {
    const styleId = 'celebration-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }

        @keyframes sparkle {
            from {
                opacity: 1;
                transform: scale(1);
            }
            to {
                opacity: 0;
                transform: scale(0) translateY(-100px);
            }
        }

        @keyframes confettiFall {
            to {
                transform: translateX(calc(var(--vx) * 100px)) translateY(calc(var(--vy) * 100px)) rotate(720deg);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(style);
}

// ========== INSTÂNCIA GLOBAL ========== //
let celebrationEffect = null;

/**
 * Inicializar celebration effect quando DOM estiver pronto
 */
function initCelebration() {
    addCelebrationStyles();

    celebrationEffect = new CelebrationEffect('#confetti-container', {
        confettiCount: 60,
        heartCount: 20,
        sparkleCount: 40,
        colors: ['#ff69b4', '#dc143c', '#8b0000', '#d4af37', '#ff1493']
    });
}

/**
 * Listener para quando documento carregar
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCelebration);
} else {
    initCelebration();
}

/**
 * Disparar celebração
 */
function celebrate() {
    if (celebrationEffect) {
        celebrationEffect.celebrate();
        showSurpriseMessage();
    }
}

/**
 * Mostrar mensagem de surpresa
 */
function showSurpriseMessage() {
    const message = document.querySelector('#surpriseMessage');
    if (message) {
        message.style.display = 'block';
        animateElement(message, {
            animation: 'scale-in',
            duration: 800,
            delay: 500
        });
    }
}

/**
 * Obter instância de celebration
 * @returns {CelebrationEffect} Instância
 */
function getCelebration() {
    return celebrationEffect;
}

/**
 * Confete explosion em ponto específico
 * @param {number} x - Posição X
 * @param {number} y - Posição Y
 */
function confettiExplosion(x, y) {
    if (celebrationEffect) {
        celebrationEffect.confettiExplosion(x, y);
    }
}

// ========== LIGHTBOX FUNCTIONS ========== //

/**
 * Array com URLs das imagens para lightbox
 */
const lightboxImages = [
    'assets/63d65879-4111-4f9f-8b52-05b7ccf115ae.jpeg',
    'assets/6b9428b6-5bc2-4570-b709-8ffc2489c8cc.jpeg',
    'assets/731be33c-ed69-4531-b02a-bc084b448828.jpeg',
    'assets/95ecfa30-aab8-4bdf-8fec-386409ecc985.jpeg',
    'assets/b4948355-ff55-40bd-a8d9-16d87e4ac88b.jpeg',
    'assets/c16f2193-c892-4d25-9127-845dc3a18718.jpeg',
    'assets/ea667619-6b26-4264-974c-062ac0b05673.jpeg',
    'assets/WhatsApp Image 2026-06-08 at 14.46.30.jpeg',
    'assets/WhatsApp Image 2026-06-08 at 14.46.30 (1).jpeg'
];

let currentLightboxIndex = 0;

/**
 * Abrir lightbox
 * @param {number} index - Índice da imagem
 */
function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.querySelector('#lightbox');
    const img = document.querySelector('#lightbox-img');

    img.src = lightboxImages[index];
    lightbox.classList.add('active');

    createLightboxIndicators();
    updateLightboxIndicators();

    // Bloquear scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Fechar lightbox
 */
function closeLightbox() {
    const lightbox = document.querySelector('#lightbox');
    lightbox.classList.remove('active');

    // Restaurar scroll
    document.body.style.overflow = 'auto';
}

/**
 * Próxima imagem no lightbox
 */
function nextLightbox() {
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
    const img = document.querySelector('#lightbox-img');
    img.src = lightboxImages[currentLightboxIndex];
    updateLightboxIndicators();
}

/**
 * Imagem anterior no lightbox
 */
function prevLightbox() {
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    const img = document.querySelector('#lightbox-img');
    img.src = lightboxImages[currentLightboxIndex];
    updateLightboxIndicators();
}

/**
 * Criar indicadores do lightbox
 */
function createLightboxIndicators() {
    const container = document.querySelector('#lightbox-indicators');
    if (!container || container.children.length > 0) return;

    lightboxImages.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'lightbox-indicator';
        if (index === currentLightboxIndex) {
            dot.classList.add('active');
        }
        dot.onclick = () => {
            currentLightboxIndex = index;
            document.querySelector('#lightbox-img').src = lightboxImages[index];
            updateLightboxIndicators();
        };
        container.appendChild(dot);
    });
}

/**
 * Atualizar indicadores do lightbox
 */
function updateLightboxIndicators() {
    const indicators = document.querySelectorAll('.lightbox-indicator');
    indicators.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentLightboxIndex);
    });
}

// Fechar lightbox com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const lightbox = document.querySelector('#lightbox');
        if (lightbox.classList.contains('active')) {
            closeLightbox();
        }
    }

    const lightbox = document.querySelector('#lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            prevLightbox();
        } else if (e.key === 'ArrowRight') {
            nextLightbox();
        }
    }
});
