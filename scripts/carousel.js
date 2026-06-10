// ========== CAROUSEL.JS - GALERIA DE FOTOS ========== //

/**
 * Carousel
 * Gerencia carrossel responsivo com swipe, navegação e indicadores
 */
class Carousel {
    constructor(containerSelector = '.carousel-wrapper', options = {}) {
        this.container = document.querySelector(containerSelector);
        this.carousel = this.container?.querySelector('.carousel');
        this.items = this.carousel?.querySelectorAll('.carousel-item');
        this.prevBtn = this.container?.querySelector('.carousel-btn--prev');
        this.nextBtn = this.container?.querySelector('.carousel-btn--next');
        this.indicatorsContainer = this.container?.querySelector('.carousel-indicators');

        this.options = {
            autoSlide: false,
            autoSlideInterval: 5000,
            loop: true,
            initialSlide: 0,
            ...options
        };

        this.currentSlide = this.options.initialSlide;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.autoSlideTimer = null;

        if (this.carousel) {
            this.init();
        }
    }

    /**
     * Inicializar carousel
     */
    init() {
        this.createIndicators();
        this.attachEventListeners();
        this.updateSlide();

        if (this.options.autoSlide) {
            this.startAutoSlide();
        }

        log(`Carousel inicializado com ${this.items.length} items`, 'info');
    }

    /**
     * Criar indicadores (dots)
     */
    createIndicators() {
        if (!this.indicatorsContainer) return;

        this.indicatorsContainer.innerHTML = '';

        this.items.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'carousel-indicator';
            if (index === this.currentSlide) {
                dot.classList.add('active');
            }
            dot.onclick = () => this.goToSlide(index);
            this.indicatorsContainer.appendChild(dot);
        });
    }

    /**
     * Anexar event listeners
     */
    attachEventListeners() {
        // Botões prev/next
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());

        // Touch events (swipe)
        this.carousel?.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        this.carousel?.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Parar autoSlide ao interagir
        this.carousel?.addEventListener('mouseenter', () => {
            if (this.options.autoSlide) {
                clearInterval(this.autoSlideTimer);
            }
        });

        this.carousel?.addEventListener('mouseleave', () => {
            if (this.options.autoSlide) {
                this.startAutoSlide();
            }
        });
    }

    /**
     * Ir para próximo slide
     */
    next() {
        let nextSlide = this.currentSlide + 1;

        if (nextSlide >= this.items.length) {
            nextSlide = this.options.loop ? 0 : this.currentSlide;
        }

        this.goToSlide(nextSlide);
    }

    /**
     * Ir para slide anterior
     */
    prev() {
        let prevSlide = this.currentSlide - 1;

        if (prevSlide < 0) {
            prevSlide = this.options.loop ? this.items.length - 1 : 0;
        }

        this.goToSlide(prevSlide);
    }

    /**
     * Ir para slide específico
     * @param {number} index - Índice do slide
     */
    goToSlide(index) {
        if (index < 0 || index >= this.items.length) return;

        this.currentSlide = index;
        this.updateSlide();

        if (this.options.autoSlide) {
            clearInterval(this.autoSlideTimer);
            this.startAutoSlide();
        }
    }

    /**
     * Atualizar posição do slide
     */
    updateSlide() {
        if (!this.carousel) return;

        const offset = this.currentSlide * -100;
        this.carousel.style.transform = `translateX(${offset}%)`;

        // Atualizar indicadores
        const indicators = this.indicatorsContainer?.querySelectorAll('.carousel-indicator');
        indicators?.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    /**
     * Lidar com toque inicial
     * @param {TouchEvent} e - Evento de toque
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    /**
     * Lidar com toque final (swipe detection)
     * @param {TouchEvent} e - Evento de toque
     */
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    /**
     * Detectar direção do swipe
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0) {
            // Swipe para esquerda → próximo slide
            this.next();
        } else {
            // Swipe para direita → slide anterior
            this.prev();
        }
    }

    /**
     * Lidar com keypress
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleKeyPress(e) {
        if (document.activeElement.type === 'text' || document.activeElement.type === 'textarea') {
            return;
        }

        if (e.key === 'ArrowLeft') {
            this.prev();
        } else if (e.key === 'ArrowRight') {
            this.next();
        }
    }

    /**
     * Iniciar autoSlide
     */
    startAutoSlide() {
        this.autoSlideTimer = setInterval(() => {
            this.next();
        }, this.options.autoSlideInterval);
    }

    /**
     * Parar autoSlide
     */
    stopAutoSlide() {
        clearInterval(this.autoSlideTimer);
    }

    /**
     * Destruir carousel
     */
    destroy() {
        this.stopAutoSlide();
        this.prevBtn?.removeEventListener('click', () => this.prev());
        this.nextBtn?.removeEventListener('click', () => this.next());
        document.removeEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    /**
     * Obter slide atual
     * @returns {number} Índice do slide atual
     */
    getCurrentSlide() {
        return this.currentSlide;
    }

    /**
     * Obter total de slides
     * @returns {number} Total de slides
     */
    getTotalSlides() {
        return this.items.length;
    }
}

// ========== INSTÂNCIA GLOBAL ========== //
let carousel = null;

/**
 * Inicializar carousel quando DOM estiver pronto
 */
function initCarousel() {
    carousel = new Carousel('.carousel-wrapper', {
        autoSlide: false,
        loop: true
    });
}

/**
 * Listener para quando documento carregar
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
} else {
    initCarousel();
}
