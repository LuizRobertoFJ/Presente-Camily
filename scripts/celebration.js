// ========== CELEBRATION.JS - CONFETE, CORAÇÕES E SPARKLES ========== //

/**
 * CelebrationEffect
 * Cria efeitos de celebração: confete, corações voadores e sparkles.
 * As keyframes ficam em styles/animations.css.
 */
class CelebrationEffect {
    constructor(containerSelector = '#confetti-container', options = {}) {
        this.container = document.querySelector(containerSelector);

        this.options = {
            confettiCount: 90,
            heartCount: 22,
            sparkleCount: 26,
            colors: ['#f06292', '#d6336c', '#8e1538', '#c9a24b', '#ffb3c7', '#ffffff'],
            hearts: ['❤️', '💕', '💖', '💗', '💝'],
            ...options
        };

        // Menos elementos no celular para manter 60fps
        if (isMobileDevice()) {
            this.options.confettiCount = Math.round(this.options.confettiCount * 0.6);
            this.options.heartCount = Math.round(this.options.heartCount * 0.7);
            this.options.sparkleCount = Math.round(this.options.sparkleCount * 0.6);
        }

        log('CelebrationEffect inicializado', 'info');
    }

    randomColor() {
        return this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
    }

    /**
     * Confete caindo por toda a tela
     */
    createConfetti() {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < this.options.confettiCount; i++) {
            const confetti = document.createElement('span');
            const w = randomBetween(6, 12);
            const isRibbon = Math.random() > 0.6;

            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.width = `${isRibbon ? w * 0.5 : w}px`;
            confetti.style.height = `${isRibbon ? w * 2 : w * 0.6}px`;
            confetti.style.background = this.randomColor();
            confetti.style.borderRadius = Math.random() > 0.7 ? '50%' : '2px';
            confetti.style.setProperty('--drift', `${randomBetween(-120, 120)}px`);
            confetti.style.setProperty('--spin', `${randomBetween(360, 1080) * (Math.random() > 0.5 ? 1 : -1)}deg`);
            confetti.style.animation = `confettiFall ${randomBetween(2.6, 4.6)}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${randomBetween(0, 0.6)}s both`;

            confetti.addEventListener('animationend', () => confetti.remove(), { once: true });
            fragment.appendChild(confetti);
        }

        this.container.appendChild(fragment);
    }

    /**
     * Corações subindo de baixo até o topo da tela
     */
    createHearts() {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < this.options.heartCount; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart-animation';
            heart.textContent = this.options.hearts[Math.floor(Math.random() * this.options.hearts.length)];
            heart.style.left = `${randomBetween(2, 92)}%`;
            heart.style.fontSize = `${randomBetween(18, 40)}px`;
            heart.style.setProperty('--sway', `${randomBetween(-60, 60)}px`);
            heart.style.setProperty('--tilt', `${randomBetween(-25, 25)}deg`);
            heart.style.animation = `heartRise ${randomBetween(3.5, 6)}s var(--ease-out) ${randomBetween(0, 1.4)}s both`;

            heart.addEventListener('animationend', () => heart.remove(), { once: true });
            fragment.appendChild(heart);
        }

        this.container.appendChild(fragment);
    }

    /**
     * Brilhos dourados espalhados
     */
    createSparkles() {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < this.options.sparkleCount; i++) {
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animation = `sparkle ${randomBetween(0.9, 1.6)}s ease-out ${randomBetween(0, 1.2)}s both`;

            sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
            fragment.appendChild(sparkle);
        }

        this.container.appendChild(fragment);
    }

    /**
     * Explosão de confete a partir de um ponto (ex.: o botão)
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     */
    confettiExplosion(x, y) {
        const fragment = document.createDocumentFragment();
        const count = isMobileDevice() ? 24 : 36;

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('span');
            const angle = (Math.PI * 2 * i) / count + randomBetween(-0.2, 0.2);
            const distance = randomBetween(90, 220);

            confetti.className = 'confetti';
            confetti.style.left = `${x}px`;
            confetti.style.top = `${y}px`;
            confetti.style.width = `${randomBetween(6, 10)}px`;
            confetti.style.height = `${randomBetween(6, 10)}px`;
            confetti.style.background = this.randomColor();
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.setProperty('--vx', `${Math.cos(angle) * distance}px`);
            confetti.style.setProperty('--vy', `${Math.sin(angle) * distance}px`);
            confetti.style.animation = `confettiBurst ${randomBetween(0.8, 1.3)}s var(--ease-out) both`;

            confetti.addEventListener('animationend', () => confetti.remove(), { once: true });
            fragment.appendChild(confetti);
        }

        this.container.appendChild(fragment);
    }

    /**
     * Combinar todos os efeitos
     * @param {Element} origin - Elemento de onde sai a explosão
     */
    celebrate(origin) {
        if (!this.container || prefersReducedMotion()) return;

        if (origin) {
            const rect = origin.getBoundingClientRect();
            this.confettiExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        this.createConfetti();
        this.createHearts();
        this.createSparkles();

        // Vibração curta em celulares que suportam
        if (navigator.vibrate) {
            navigator.vibrate([30, 40, 60]);
        }

        this.playSound();
    }

    /**
     * Pequeno acorde de "sininho" com Web Audio API
     */
    playSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const audioContext = new AudioCtx();
            const notes = [659.25, 783.99, 987.77, 1318.51]; // Mi, Sol, Si, Mi

            notes.forEach((frequency, index) => {
                const start = audioContext.currentTime + index * 0.09;
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.type = 'sine';
                osc.frequency.value = frequency;
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.start(start);
                osc.stop(start + 0.65);
            });

            setTimeout(() => audioContext.close(), 1400);
        } catch (e) {
            // Silencioso se Web Audio não suportado
        }
    }

    /**
     * Destruir effect
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// ========== INSTÂNCIA GLOBAL ========== //
let celebrationEffect = null;

function initCelebration() {
    celebrationEffect = new CelebrationEffect('#confetti-container');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCelebration);
} else {
    initCelebration();
}

/**
 * Disparar celebração (botão da surpresa)
 */
function celebrate() {
    const button = document.querySelector('#surpriseBtn');

    celebrationEffect?.celebrate(button);

    if (button && !button.classList.contains('is-opened')) {
        button.classList.add('is-opened');
        button.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
            button.hidden = true;
            showSurpriseMessage();
        }, 450);
    }
}

/**
 * Mostrar mensagem de surpresa
 */
function showSurpriseMessage() {
    const message = document.querySelector('#surpriseMessage');
    if (!message) return;

    // Carrega o player do Spotify só agora (página inicial mais leve)
    const player = message.querySelector('.spotify-player[data-src]');
    if (player) {
        player.src = player.dataset.src;
        player.removeAttribute('data-src');
    }

    message.hidden = false;
    message.classList.add('is-revealed');

    setTimeout(() => {
        message.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }, 150);
}

function getCelebration() {
    return celebrationEffect;
}

function confettiExplosion(x, y) {
    celebrationEffect?.confettiExplosion(x, y);
}
