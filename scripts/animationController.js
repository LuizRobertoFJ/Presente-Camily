// ========== ANIMATION CONTROLLER - INTERSECTION OBSERVER ========== //

/**
 * AnimationController
 * Gerencia animações de entrada usando Intersection Observer
 * Todas as seções com classe 'animate-on-scroll' serão animadas ao entrar no viewport
 */
class AnimationController {
    constructor(options = {}) {
        this.options = {
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.12,
            stagger: 110,
            ...options
        };

        this.observedElements = new Set();
        this.animatedElements = new Set();
        this.observer = null;

        this.init();
    }

    /**
     * Inicializar Intersection Observer
     */
    init() {
        // Sem suporte ou com movimento reduzido: mostrar tudo imediatamente
        if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
            document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('is-animated'));
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            // Elementos que entram juntos na tela aparecem em sequência (stagger)
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .map(entry => entry.target)
                .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

            visible.forEach((element, index) => {
                this.animateElement(element, Math.min(index, 6) * this.options.stagger);
            });
        }, this.options);

        // Observar todos os elementos com classe animate-on-scroll
        this.observeElements();
    }

    /**
     * Observar elementos que devem ser animados
     */
    observeElements() {
        if (!this.observer) return;

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            if (!this.observedElements.has(element)) {
                this.observer.observe(element);
                this.observedElements.add(element);
            }
        });
    }

    /**
     * Animar elemento ao entrar no viewport
     * @param {Element} element - Elemento a animar
     * @param {number} staggerDelay - Atraso calculado pelo lote (ms)
     */
    animateElement(element, staggerDelay = 0) {
        // Se já foi animado, não animar novamente (once: true)
        if (this.animatedElements.has(element)) {
            return;
        }

        this.animatedElements.add(element);
        this.observer.unobserve(element);

        if (element.dataset.duration) {
            element.style.animationDuration = `${parseInt(element.dataset.duration, 10)}ms`;
        }
        element.style.animationDelay = `${staggerDelay}ms`;

        // A classe ativa a animação definida em animations.css por data-animation
        element.classList.add('is-animated');
    }

    /**
     * Animar elemento manualmente
     * @param {Element|string} target - Elemento ou seletor
     * @param {string} animationType - Tipo de animação (fade-in, slide-up, scale-in)
     * @param {number} duration - Duração em ms
     * @param {number} delay - Delay em ms
     */
    animateManual(target, animationType = 'fade-in', duration = 600, delay = 0) {
        const element = typeof target === 'string'
            ? document.querySelector(target)
            : target;

        if (!element) {
            console.warn('Elemento não encontrado para animação manual');
            return;
        }

        element.dataset.animation = animationType;
        element.style.animationDuration = `${duration}ms`;
        element.style.animationDelay = `${delay}ms`;

        // Reinicia a animação caso o elemento já tenha sido animado
        element.classList.remove('is-animated');
        void element.offsetWidth;
        element.classList.add('is-animated');

        this.animatedElements.add(element);
    }

    /**
     * Fazer observer iniciar novamente (útil para conteúdo dinâmico)
     */
    refresh() {
        this.observeElements();
    }

    /**
     * Parar de observar todos os elementos
     */
    destroy() {
        this.observer?.disconnect();
        this.observedElements.clear();
        this.animatedElements.clear();
    }

    /**
     * Reiniciar animations (limpar cache de animados)
     */
    reset() {
        this.animatedElements.clear();
        const animatedElements = document.querySelectorAll('.is-animated');
        animatedElements.forEach(element => {
            element.classList.remove('is-animated');
            element.style.animationDuration = '';
            element.style.animationDelay = '';
        });

        this.observedElements.clear();
        this.observeElements();
    }

    /**
     * Obter estatísticas de observação
     * @returns {Object} Estatísticas
     */
    getStats() {
        return {
            observing: this.observedElements.size,
            animated: this.animatedElements.size,
            ratio: ((this.animatedElements.size / this.observedElements.size) * 100).toFixed(2) + '%'
        };
    }

    /**
     * Animar múltiplos elementos com stagger effect
     * @param {NodeList|Array} elements - Elementos
     * @param {string} animationType - Tipo de animação
     * @param {number} baseDuration - Duração base
     * @param {number} staggerDelay - Delay entre elementos
     */
    animateStaggered(elements, animationType = 'fade-in', baseDuration = 600, staggerDelay = 100) {
        Array.from(elements).forEach((element, index) => {
            this.animateManual(
                element,
                animationType,
                baseDuration,
                index * staggerDelay
            );
        });
    }

    /**
     * Verificar se elemento foi animado
     * @param {Element} element - Elemento
     * @returns {boolean} True se animado
     */
    isAnimated(element) {
        return this.animatedElements.has(element);
    }
}

// ========== INSTÂNCIA GLOBAL ========== //
let animationController = null;

/**
 * Inicializar animationController quando DOM estiver pronto
 */
function initAnimationController() {
    animationController = new AnimationController();

    log('AnimationController inicializado', 'info');
}

/**
 * Listener para quando documento carregar
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimationController);
} else {
    // DOM já carregado
    initAnimationController();
}

/**
 * Refresh animations quando conteúdo dinâmico é adicionado
 */
window.addEventListener('dynamicContentAdded', () => {
    if (animationController) {
        animationController.refresh();
    }
});

// ========== HELPER FUNCTIONS GLOBAIS ========== //

/**
 * Animar elemento único manualmente (convenience function)
 * @param {Element|string} target - Elemento ou seletor
 * @param {Object} options - Opções (animation, duration, delay)
 */
function animateElement(target, options = {}) {
    if (!animationController) return;

    const {
        animation = 'fade-in',
        duration = 600,
        delay = 0
    } = options;

    animationController.animateManual(target, animation, duration, delay);
}

/**
 * Animar múltiplos elementos com efeito stagger
 * @param {NodeList|Array|string} elements - Elementos ou seletor
 * @param {Object} options - Opções (animation, duration, staggerDelay)
 */
function animateStaggered(elements, options = {}) {
    if (!animationController) return;

    const {
        animation = 'fade-in',
        duration = 600,
        staggerDelay = 100
    } = options;

    const nodeList = typeof elements === 'string'
        ? document.querySelectorAll(elements)
        : elements;

    animationController.animateStaggered(nodeList, animation, duration, staggerDelay);
}

/**
 * Obter instância do controller
 * @returns {AnimationController} Instância do controller
 */
function getAnimationController() {
    return animationController;
}

/**
 * Atualizar animações (para conteúdo dinâmico)
 */
function refreshAnimations() {
    if (animationController) {
        animationController.refresh();
    }
}

/**
 * Resetar todas as animações
 */
function resetAnimations() {
    if (animationController) {
        animationController.reset();
    }
}
