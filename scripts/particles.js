// ========== PARTICLES.JS - SISTEMA DE PARTÍCULAS ========== //

/**
 * ParticleSystem
 * Corações e brilhos subindo suavemente no fundo do hero.
 * - Nítido em telas retina (devicePixelRatio)
 * - Menos partículas no celular
 * - Pausa quando o hero sai da tela ou a aba fica oculta
 */
class ParticleSystem {
    constructor(canvasSelector, options = {}) {
        this.canvas = document.querySelector(canvasSelector);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.animationId = null;
        this.isVisible = true;
        this.width = 0;
        this.height = 0;
        this.lastTime = 0;

        this.options = {
            particleCount: 40,
            particleSize: { min: 6, max: 18 },
            particleColors: ['#f06292', '#d6336c', '#e8436f', '#c9a24b', '#ffb3c7'],
            particleOpacity: { min: 0.25, max: 0.7 },
            particleSpeed: { min: 0.25, max: 0.8 },
            heartFrequency: 0.7,
            ...options
        };

        if (this.canvas && this.ctx) {
            this.init();
        }
    }

    /**
     * Inicializar sistema de partículas
     */
    init() {
        this.resizeCanvas();
        this.createParticles();

        if (prefersReducedMotion()) {
            // Apenas um quadro estático
            this.draw();
            return;
        }

        this.observeVisibility();
        this.start();

        log('ParticleSystem inicializado', 'info');
    }

    /**
     * Pausar quando o canvas não está visível (economia de bateria)
     */
    observeVisibility() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(([entry]) => {
            this.isVisible = entry.isIntersecting;
            if (this.isVisible) {
                this.start();
            } else {
                this.stop();
            }
        });

        observer.observe(this.canvas);
    }

    /**
     * Redimensionar canvas respeitando o devicePixelRatio
     */
    resizeCanvas() {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.width = rect.width || window.innerWidth;
        this.height = rect.height || window.innerHeight;
        this.canvas.width = Math.round(this.width * dpr);
        this.canvas.height = Math.round(this.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /**
     * Criar partículas
     */
    createParticles() {
        this.particles = [];

        const count = isMobileDevice()
            ? Math.round(this.options.particleCount * 0.55)
            : this.options.particleCount;

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(true));
        }
    }

    /**
     * Criar partícula individual
     * @param {boolean} randomY - Espalhar pela tela (início) ou nascer embaixo
     */
    createParticle(randomY = false) {
        const { particleSize, particleOpacity, particleSpeed, particleColors } = this.options;
        const isHeart = Math.random() < this.options.heartFrequency;
        const size = isHeart
            ? randomBetween(particleSize.min, particleSize.max)
            : randomBetween(2, 4);

        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : this.height + size * 2,
            size,
            color: particleColors[Math.floor(Math.random() * particleColors.length)],
            opacity: randomBetween(particleOpacity.min, particleOpacity.max),
            speed: randomBetween(particleSpeed.min, particleSpeed.max),
            swing: randomBetween(0.4, 1.4),
            phase: Math.random() * Math.PI * 2,
            rotation: randomBetween(-0.4, 0.4),
            isHeart
        };
    }

    /**
     * Desenhar um coração centrado na origem
     */
    drawHeart(size) {
        const s = size / 2;
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.35);
        ctx.bezierCurveTo(0, s * 0.05, -s * 0.5, -s * 0.55, -s, -s * 0.05);
        ctx.bezierCurveTo(-s * 1.1, s * 0.45, -s * 0.4, s * 0.8, 0, s * 1.1);
        ctx.bezierCurveTo(s * 0.4, s * 0.8, s * 1.1, s * 0.45, s, -s * 0.05);
        ctx.bezierCurveTo(s * 0.5, -s * 0.55, 0, s * 0.05, 0, s * 0.35);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Desenhar partículas
     */
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation + Math.sin(p.phase) * 0.15);

            if (p.isHeart) {
                this.drawHeart(p.size);
            } else {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    /**
     * Atualizar posição de partículas
     * @param {number} delta - Fator de tempo (1 = 60fps)
     */
    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.phase += 0.02 * delta;
            p.y -= p.speed * delta;
            p.x += Math.sin(p.phase) * p.swing * 0.5 * delta;

            // Ao sair pelo topo, renasce embaixo
            if (p.y < -p.size * 2) {
                if (p.temporary) {
                    this.particles.splice(i, 1);
                } else {
                    this.particles[i] = this.createParticle(false);
                }
            }
        }
    }

    /**
     * Loop de animação
     */
    animate(time = 0) {
        const delta = this.lastTime ? Math.min((time - this.lastTime) / 16.67, 3) : 1;
        this.lastTime = time;

        this.update(delta);
        this.draw();
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    /**
     * Iniciar animação
     */
    start() {
        if (!this.animationId && this.isVisible && !document.hidden && !prefersReducedMotion()) {
            this.lastTime = 0;
            this.animationId = requestAnimationFrame((t) => this.animate(t));
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
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Adicionar explosão de corações em uma posição
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} count - Quantidade de partículas
     */
    explode(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const p = this.createParticle(false);
            p.x = x + randomBetween(-30, 30);
            p.y = y + randomBetween(-30, 30);
            p.speed = randomBetween(1, 2.5);
            p.temporary = true;
            this.particles.push(p);
        }
    }

    getParticleCount() {
        return this.particles.length;
    }

    pause() {
        this.stop();
    }

    resume() {
        this.start();
    }
}

/**
 * Número aleatório (float) entre min e max
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// ========== INSTÂNCIA GLOBAL ========== //
let particleSystem = null;

/**
 * Inicializar sistema de partículas quando DOM estiver pronto
 */
function initParticleSystem() {
    particleSystem = new ParticleSystem('#particleCanvas');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticleSystem);
} else {
    initParticleSystem();
}

function getParticleSystem() {
    return particleSystem;
}

function explodeParticles(x, y, count = 30) {
    particleSystem?.explode(x, y, count);
}

function pauseParticles() {
    particleSystem?.pause();
}

function resumeParticles() {
    particleSystem?.resume();
}
