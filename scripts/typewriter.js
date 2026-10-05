// ========== TYPEWRITER.JS - EFEITO MÁQUINA DE ESCREVER ========== //

/**
 * TypewriterEffect
 * Revela texto caractere por caractere com efeito de máquina de escrever
 */
class TypewriterEffect {
    constructor(textElementSelector, text, options = {}) {
        this.textElement = document.querySelector(textElementSelector);
        this.fullText = text;

        this.options = {
            speed: 50,
            pauseOnPunctuation: true,
            pauseDuration: 200,
            cursor: '|',
            showCursor: true,
            startOnScroll: true,
            ...options
        };

        this.currentIndex = 0;
        this.isTyping = false;
        this.isPaused = false;
        this.typewriterInterval = null;
        this.intersectionObserver = null;

        if (this.textElement) {
            this.init();
        }
    }

    /**
     * Inicializar typewriter
     */
    init() {
        this.reserveSpace();
        window.addEventListener('resize', debounce(() => this.reserveSpace(), 200));
        document.fonts?.ready.then(() => this.reserveSpace());

        if (this.options.startOnScroll) {
            this.setupScrollTrigger();
        }

        log('TypewriterEffect inicializado', 'info');
    }

    /**
     * Reservar a altura do texto completo para a página não "pular"
     * enquanto as letras aparecem
     */
    reserveSpace() {
        const box = this.textElement.parentElement;
        if (!box) return;

        const current = this.textElement.textContent;
        box.style.minHeight = '';
        this.textElement.textContent = this.fullText;
        box.style.minHeight = `${box.offsetHeight}px`;
        this.textElement.textContent = current;
    }

    /**
     * Setup para iniciar ao scrollar para elemento
     */
    setupScrollTrigger() {
        const options = {
            threshold: 0.35
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isTyping) {
                    this.start();
                    this.intersectionObserver.unobserve(this.textElement);
                }
            });
        }, options);

        this.intersectionObserver.observe(this.textElement);
    }

    /**
     * Iniciar efeito de typewriter
     */
    start() {
        if (this.isTyping) return;

        this.isTyping = true;
        this.currentIndex = 0;
        this.textElement.textContent = '';

        this.type();
    }

    /**
     * Parar efeito de typewriter
     */
    stop() {
        if (this.typewriterInterval) {
            clearTimeout(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        this.isTyping = false;
    }

    /**
     * Revelar próximo caractere
     */
    type() {
        if (this.currentIndex < this.fullText.length) {
            const char = this.fullText[this.currentIndex];
            this.textElement.textContent += char;

            // Verificar se deve fazer pausa após pontuação
            this.currentIndex++;

            const isPause = this.options.pauseOnPunctuation && ['.', '!', '?', ',', '\n'].includes(char);
            const wait = isPause ? this.options.pauseDuration : this.options.speed;
            this.typewriterInterval = setTimeout(() => this.type(), wait);
        } else {
            this.isTyping = false;
            this.onComplete();
        }
    }

    /**
     * Completar texto instantaneamente
     */
    complete() {
        this.stop();
        this.textElement.textContent = this.fullText;
        this.currentIndex = this.fullText.length;
        this.isTyping = false;
        this.onComplete();
    }

    /**
     * Callback quando typewriter termina
     */
    onComplete() {
        this.textElement.closest('.letter-container')?.classList.add('is-complete');

        // Disparar evento customizado
        const event = new CustomEvent('typewriterComplete', {
            detail: { text: this.fullText }
        });
        this.textElement.dispatchEvent(event);
    }

    /**
     * Resetar typewriter
     */
    reset() {
        this.stop();
        this.textElement.closest('.letter-container')?.classList.remove('is-complete');
        this.currentIndex = 0;
        this.textElement.textContent = '';
    }

    /**
     * Definir novo texto
     * @param {string} newText - Novo texto
     */
    setText(newText) {
        this.fullText = newText;
        this.reset();
    }

    /**
     * Destruir typewriter
     */
    destroy() {
        this.stop();
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }

    /**
     * Obter progresso
     * @returns {number} Percentual de conclusão (0-100)
     */
    getProgress() {
        return Math.floor((this.currentIndex / this.fullText.length) * 100);
    }

    /**
     * Verificar se está digitando
     * @returns {boolean} True se está digitando
     */
    isActive() {
        return this.isTyping;
    }
}

// ========== DADOS DA CARTA DE AMOR ========== //
const loveLetter = `Meu amor,

Quero que saiba o quanto você significa para mim. Cada dia ao seu lado é um presente que recebo com gratidão e alegria.

Você me faz querer ser uma pessoa melhor, mais forte, mais gentil. Seus olhos me acalmam quando estou em turbulência, seu sorriso é meu refúgio seguro.

Obrigado por cada abraço, cada riso, cada lágrima compartilhada. Obrigado por me escolher, por acreditar em nós, por sonhar comigo.

Hoje, e em todos os dias que virão, prometo te amar, te respeitar, e te fazer feliz.

Você não é só meu amor, mas minha melhor amiga, minha confidente, minha alma gêmea.

Com todo meu coração,

Seu amor eternamente.`;

// ========== INSTÂNCIA GLOBAL ========== //
let typewriter = null;

/**
 * Inicializar typewriter quando DOM estiver pronto
 */
function initTypewriter() {
    typewriter = new TypewriterEffect('#typewriter-text', loveLetter, {
        speed: 32,
        pauseOnPunctuation: true,
        pauseDuration: 180,
        showCursor: true,
        startOnScroll: true
    });

    // Movimento reduzido: mostrar a carta inteira de uma vez
    if (prefersReducedMotion()) {
        typewriter.complete();
    }

    // Botão "Ler tudo agora"
    document.querySelector('#letterSkip')?.addEventListener('click', () => {
        typewriter.intersectionObserver?.disconnect();
        typewriter.complete();
    });
}

/**
 * Listener para quando documento carregar
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriter);
} else {
    initTypewriter();
}

/**
 * Obter instância do typewriter
 * @returns {TypewriterEffect} Instância do typewriter
 */
function getTypewriter() {
    return typewriter;
}

/**
 * Iniciar typewriter manualmente
 */
function startTypewriter() {
    if (typewriter) {
        typewriter.start();
    }
}

/**
 * Completar typewriter
 */
function completeTypewriter() {
    if (typewriter) {
        typewriter.complete();
    }
}

/**
 * Resetar typewriter
 */
function resetTypewriter() {
    if (typewriter) {
        typewriter.reset();
    }
}

/**
 * Listener para evento de conclusão
 */
document.addEventListener('typewriterComplete', (e) => {
    log('Carta de amor concluída', 'info');
});
