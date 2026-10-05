// ========== COUNTER.JS - CONTADOR DE TEMPO DO RELACIONAMENTO ========== //

/**
 * RelationshipCounter
 * Calcula e atualiza em tempo real: dias, horas, minutos, segundos
 */
class RelationshipCounter {
    constructor(options = {}) {
        this.startDate = null;
        this.updateInterval = null;
        this.updateIntervalDuration = 1000; // atualizar a cada 1 segundo

        this.elements = {
            days: document.querySelector('[data-counter="days"]'),
            hours: document.querySelector('[data-counter="hours"]'),
            minutes: document.querySelector('[data-counter="minutes"]'),
            seconds: document.querySelector('[data-counter="seconds"]')
        };

        this.options = {
            startDateInputSelector: '#startDate',
            animateChange: true,
            ...options
        };

        this.currentValues = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        this.init();
    }

    /**
     * Inicializar contador
     */
    init() {
        this.getStartDate();

        if (this.startDate) {
            this.update();
            this.startUpdating();
            log('RelationshipCounter inicializado', 'info');
        } else {
            console.warn('Data de início não encontrada para o contador');
        }
    }

    /**
     * Obter data de início do input
     */
    getStartDate() {
        const input = document.querySelector(this.options.startDateInputSelector);
        if (input && input.value) {
            this.startDate = new Date(input.value);
        }
    }

    /**
     * Atualizar valores do contador
     */
    update() {
        const timeDiff = calculateTimeDifference(this.startDate);

        // Verificar quais valores mudaram
        const values = {
            days: timeDiff.days,
            hours: timeDiff.hours,
            minutes: timeDiff.minutes,
            seconds: timeDiff.seconds
        };

        // Atualizar elementos
        Object.entries(values).forEach(([key, value]) => {
            const element = this.elements[key];
            if (!element) return;

            // Verificar mudança de valor
            if (this.currentValues[key] !== value) {
                if (this.options.animateChange) {
                    this.animateValueChange(element, value);
                } else {
                    element.textContent = formatNumber(value);
                }
                this.currentValues[key] = value;
            }
        });
    }

    /**
     * Animar mudança de valor com efeito
     * @param {Element} element - Elemento a animar
     * @param {number} newValue - Novo valor
     */
    animateValueChange(element, newValue) {
        element.classList.add('is-ticking');

        setTimeout(() => {
            element.textContent = formatNumber(newValue);
            element.classList.remove('is-ticking');
        }, 120);
    }

    /**
     * Iniciar atualização automática
     */
    startUpdating() {
        if (this.updateInterval || !this.startDate) return;

        this.update();
        this.updateInterval = setInterval(() => {
            this.update();
        }, this.updateIntervalDuration);
    }

    /**
     * Parar atualização
     */
    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Definir nova data de início
     * @param {Date|string} newDate - Nova data
     */
    setStartDate(newDate) {
        this.startDate = new Date(newDate);
        this.update();
    }

    /**
     * Obter tempo total decorrido
     * @returns {Object} Objeto com tempos
     */
    getTimeDifference() {
        return calculateTimeDifference(this.startDate);
    }

    /**
     * Formatar tempo decorrido como string
     * @returns {string} String formatada (ex: "1 dia, 5 horas, 30 minutos")
     */
    formatAsString() {
        const diff = this.getTimeDifference();
        const parts = [];

        if (diff.days > 0) {
            parts.push(`${diff.days} ${diff.days === 1 ? 'dia' : 'dias'}`);
        }
        if (diff.hours > 0) {
            parts.push(`${diff.hours} ${diff.hours === 1 ? 'hora' : 'horas'}`);
        }
        if (diff.minutes > 0) {
            parts.push(`${diff.minutes} ${diff.minutes === 1 ? 'minuto' : 'minutos'}`);
        }

        return parts.join(', ') || '0 segundos';
    }

    /**
     * Destruir contador
     */
    destroy() {
        this.stopUpdating();
    }

    /**
     * Obter estatísticas
     * @returns {Object} Estatísticas
     */
    getStats() {
        const diff = this.getTimeDifference();
        return {
            days: diff.days,
            hours: diff.hours,
            minutes: diff.minutes,
            seconds: diff.seconds,
            totalSeconds: diff.totalSeconds,
            formattedString: this.formatAsString()
        };
    }
}

// ========== INSTÂNCIA GLOBAL ========== //
let relationshipCounter = null;

/**
 * Inicializar contador quando DOM estiver pronto
 */
function initCounter() {
    relationshipCounter = new RelationshipCounter({
        startDateInputSelector: '#startDate',
        animateChange: true
    });
}

/**
 * Listener para quando documento carregar
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounter);
} else {
    initCounter();
}

/**
 * Obter instância do contador
 * @returns {RelationshipCounter} Instância do contador
 */
function getRelationshipCounter() {
    return relationshipCounter;
}

/**
 * Obter tempo decorrido formatado
 * @returns {string} Tempo formatado
 */
function getFormattedCounterTime() {
    return relationshipCounter ? relationshipCounter.formatAsString() : '';
}

/**
 * Atualizar data do contador manualmente
 * @param {Date|string} newDate - Nova data de início
 */
function updateCounterDate(newDate) {
    if (relationshipCounter) {
        relationshipCounter.setStartDate(newDate);
    }
}
