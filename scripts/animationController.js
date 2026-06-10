// ========== ANIMATION CONTROLLER - INTERSECTION OBSERVER ========== //

/**
 * AnimationController
 * Gerencia animações de entrada usando Intersection Observer
 * Todas as seções com classe 'animate-on-scroll' serão animadas ao entrar no viewport
 */
class AnimationController {
    constructor(options = {}) {
        this.options = {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1,
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
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, this.options);

        // Observar todos os elementos com classe animate-on-scroll
        this.observeElements();
    }

    /**
     * Observar elementos que devem ser animados
     */
    observeElements() {
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
     */
    animateElement(element) {
        // Se já foi animado, não animar novamente (once: true)
        if (this.animatedElements.has(element)) {
            return;
        }

        // Marcar como animado
        this.animatedElements.add(element);

        // Obter dados do elemento
        const animationType = element.dataset.animation || 'fade-in';
        const duration = parseInt(element.dataset.duration) || 600;
        const delay = parseInt(element.dataset.delay) || 0;

        // Aplicar estilo de animação
        element.style.animationName = animationType;
        element.style.animationDuration = `${duration}ms`;
        element.style.animationDelay = `${delay}ms`;
        element.style.animationFillMode = 'forwards';
        element.style.animationTimingFunction = 'ease-out';

        // Adicionar classe para ativar animação
        element.classList.add('is-animated');

        // Parar de observar após animação completa (para economia de recursos)
        setTimeout(() => {
            this.observer.unobserve(element);
        }, duration + delay);
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

        element.style.animationName = animationType;
        element.style.animationDuration = `${duration}ms`;
        element.style.animationDelay = `${delay}ms`;
        element.style.animationFillMode = 'forwards';
        element.style.animationTimingFunction = 'ease-out';

        element.classList.add('is-animated');

        this.animatedElements.add(element);
    }

    /**
     * Fazer observer iniciar novamente (útil para conteúdo dinâmico)
     */
    refresh() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            if (!this.observedElements.has(element)) {
                this.observer.observe(element);
                this.observedElements.add(element);
            }
        });
    }

    /**
     * Parar de observar todos os elementos
     */
    destroy() {
        this.observer.disconnect();
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
            element.style.animationName = '';
            element.style.animationDuration = '';
            element.style.animationDelay = '';
        });

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
    animationController = new AnimationController({
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    });

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
