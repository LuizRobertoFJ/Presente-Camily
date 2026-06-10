// ========== PARTICLES.JS - SISTEMA DE PARTÍCULAS ========== //

/**
 * ParticleSystem
 * Cria e gerencia partículas flutuando (confete, corações, etc)
 */
class ParticleSystem {
    constructor(canvasSelector, options = {}) {
        this.canvas = document.querySelector(canvasSelector);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.animationId = null;

        this.options = {
            particleCount: 30,
            particleSize: { min: 2, max: 5 },
            particleColors: ['#ff69b4', '#dc143c', '#8b0000', '#d4af37', '#ff1493'],
            particleOpacity: { min: 0.3, max: 0.8 },
            particleSpeed: { min: 0.5, max: 2 },
            heartEmojis: ['❤️', '💕', '💖', '💗', '💝'],
            heartFrequency: 0.05,
            createHeartsWithEmoji: true,
            ...options
        };

        if (this.canvas) {
            this.init();
        }
    }

    /**
     * Inicializar sistema de partículas
     */
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.start();
        window.addEventListener('resize', () => this.resizeCanvas());

        log('ParticleSystem inicializado', 'info');
    }

    /**
     * Redimensionar canvas
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Criar partículas
     */
    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.options.particleCount; i++) {
            this.addParticle();
        }
    }

    /**
     * Adicionar partícula individual
     */
    addParticle() {
        const isHeart = Math.random() < this.options.heartFrequency;

        const particle = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: isHeart ? 20 : getRandomNumber(
                this.options.particleSize.min,
                this.options.particleSize.max
            ),
            color: getRandomColor(),
            opacity: Math.random() * (this.options.particleOpacity.max - this.options.particleOpacity.min) + this.options.particleOpacity.min,
            vx: (Math.random() - 0.5) * this.options.particleSpeed.max,
            vy: -Math.random() * this.options.particleSpeed.max + this.options.particleSpeed.min,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            isHeart: isHeart,
            emoji: this.options.heartEmojis[Math.floor(Math.random() * this.options.heartEmojis.length)]
        };

        this.particles.push(particle);
    }

    /**
     * Desenhar partículas
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);

            if (particle.isHeart && this.options.createHeartsWithEmoji) {
                // Desenhar coração com emoji
                this.ctx.font = `${particle.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(particle.emoji, 0, 0);
            } else {
                // Desenhar partícula com cor
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        });
    }

    /**
     * Atualizar posição de partículas
     */
    update() {
        this.particles.forEach((particle, index) => {
            // Movimento
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Rotação
            particle.rotation += particle.rotationSpeed;

            // Gravidade suave
            particle.vy += 0.1;

            // Remover partícula se sair da tela
            if (particle.y > this.canvas.height + 50) {
                this.particles.splice(index, 1);
                this.addParticle();
            }

            // Wrap horizontal
            if (particle.x < -50) {
                particle.x = this.canvas.width + 50;
            } else if (particle.x > this.canvas.width + 50) {
                particle.x = -50;
            }
        });
    }

    /**
     * Loop de animação
     */
    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Iniciar animação
     */
    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    /**
     * Parar animação
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Destruir sistema
     */
    destroy() {
        this.stop();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        window.removeEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Adicionar explosão de partículas
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} count - Quantidade de partículas
     */
    explode(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 3;

            const particle = {
                x: x,
                y: y,
                size: getRandomNumber(3, 8),
                color: getRandomColor(),
                opacity: 0.9,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                isHeart: Math.random() < 0.3,
                emoji: this.options.heartEmojis[Math.floor(Math.random() * this.options.heartEmojis.length)]
            };

            this.particles.push(particle);
        }
    }

    /**
     * Obter número de partículas ativas
     * @returns {number} Número de partículas
     */
    getParticleCount() {
        return this.particles.length;
    }

    /**
     * Pausar animação
     */
    pause() {
        this.stop();
    }

    /**
     * Retomar animação
     */
    resume() {
        this.start();
    }
}

// ========== INSTÂNCIA GLOBAL ========== //
let particleSystem = null;

/**
 * Inicializar sistema de partículas quando DOM estiver pronto
 */
function initParticleSystem() {
    particleSystem = new ParticleSystem('#particleCanvas', {
        particleCount: 50,
        particleSize: { min: 2, max: 6 },
        particleColors: ['#ff69b4', '#dc143c', '#8b0000', '#d4af37'],
        particleOpacity: { min: 0.4, max: 0.9 },
        particleSpeed: { min: 0.5, max: 1.5 },
        heartFrequency: 0.08,
        createHeartsWithEmoji: true
    });
}

/**
 * Listener para quando documento carregar
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticleSystem);
} else {
    initParticleSystem();
}

/**
 * Obter instância do sistema de partículas
 * @returns {ParticleSystem} Instância do sistema
 */
function getParticleSystem() {
    return particleSystem;
}

/**
 * Explodir partículas em posição
 * @param {number} x - Posição X
 * @param {number} y - Posição Y
 * @param {number} count - Quantidade
 */
function explodeParticles(x, y, count = 30) {
    if (particleSystem) {
        particleSystem.explode(x, y, count);
    }
}

/**
 * Pausar partículas
 */
function pauseParticles() {
    if (particleSystem) {
        particleSystem.pause();
    }
}

/**
 * Retomar partículas
 */
function resumeParticles() {
    if (particleSystem) {
        particleSystem.resume();
    }
}
