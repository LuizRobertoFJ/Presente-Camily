// ========== UTILS.JS - HELPER FUNCTIONS ========== //

/**
 * Scroll suave até uma seção
 * @param {string} selector - Seletor CSS do elemento
 * @param {number} offset - Offset em pixels (padrão: 0)
 */
function smoothScroll(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

/**
 * Calcular diferença de tempo entre data inicial e agora
 * @param {string|Date} startDate - Data de início
 * @returns {Object} Objeto com dias, horas, minutos, segundos
 */
function calculateTimeDifference(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now - start;

    return {
        totalMilliseconds: diff,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        totalSeconds: Math.floor(diff / 1000),
        totalMinutes: Math.floor(diff / (1000 * 60)),
        totalHours: Math.floor(diff / (1000 * 60 * 60))
    };
}

/**
 * Formatar número com separadores
 * @param {number} num - Número a formatar
 * @returns {string} Número formatado (ex: 1.234)
 */
function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Debounce function para otimizar eventos frequentes
 * @param {Function} func - Função a executar
 * @param {number} delay - Delay em ms
 * @returns {Function} Função debounced
 */
function debounce(func, delay = 300) {
    let timeoutId = null;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle function para limitar execução de eventos
 * @param {Function} func - Função a executar
 * @param {number} limit - Limite em ms
 * @returns {Function} Função throttled
 */
function throttle(func, limit = 100) {
    let inThrottle;

    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Verificar se elemento está visível no viewport
 * @param {Element} element - Elemento a verificar
 * @returns {boolean} True se visível
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
    );
}

/**
 * Gerar número aleatório entre min e max
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatório
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gerar cor hexadecimal aleatória
 * @returns {string} Cor em hexadecimal (ex: #ff69b4)
 */
function getRandomColor() {
    const colors = [
        '#ff69b4', // Rosa
        '#dc143c', // Vermelho
        '#8b0000', // Vinho
        '#d4af37', // Dourado
        '#ff1493'  // Rosa escuro
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Aplicar efeito parallax ao elemento durante scroll
 * @param {Element} element - Elemento com parallax
 * @param {number} speed - Velocidade de parallax (0.1 - 1)
 */
function applyParallax(element, speed = 0.5) {
    const offsetY = window.pageYOffset;
    const elementOffset = element.getBoundingClientRect().top + offsetY;

    if (isInViewport(element)) {
        const yPos = (offsetY - elementOffset) * speed;
        element.style.transform = `translateY(${yPos}px)`;
    }
}

/**
 * Animar contador de número
 * @param {Element} element - Elemento a animar
 * @param {number} targetValue - Valor final
 * @param {number} duration - Duração em ms
 * @param {string} prefix - Prefixo (ex: "")
 * @param {string} suffix - Sufixo (ex: "%")
 */
function animateCounter(element, targetValue, duration = 1000, prefix = '', suffix = '') {
    const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: easeOutQuad
        const easing = 1 - (1 - progress) * (1 - progress);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easing);

        element.textContent = prefix + formatNumber(currentValue) + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Copiar texto para clipboard
 * @param {string} text - Texto a copiar
 * @returns {Promise} Promise que resolve quando copiado
 */
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback para navegadores antigos
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    }
}

/**
 * Verificar suporte a feature CSS
 * @param {string} property - Propriedade CSS a verificar
 * @returns {boolean} True se suportado
 */
function supportsCSSProperty(property) {
    const element = document.createElement('div');
    return property in element.style;
}

/**
 * Adicionar classe com delay
 * @param {Element} element - Elemento
 * @param {string} className - Classe a adicionar
 * @param {number} delay - Delay em ms
 */
function addClassWithDelay(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.add(className);
    }, delay);
}

/**
 * Remover classe com delay
 * @param {Element} element - Elemento
 * @param {string} className - Classe a remover
 * @param {number} delay - Delay em ms
 */
function removeClassWithDelay(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.remove(className);
    }, delay);
}

/**
 * Toggle classe com transição
 * @param {Element} element - Elemento
 * @param {string} className - Classe a toglar
 */
function toggleClass(element, className) {
    element.classList.toggle(className);
}

/**
 * Obter elemento aleatório de um array de elementos
 * @param {NodeList|Array} elements - Elementos
 * @returns {Element} Elemento aleatório
 */
function getRandomElement(elements) {
    return elements[Math.floor(Math.random() * elements.length)];
}

/**
 * Criar elemento com classes
 * @param {string} tag - Tag HTML
 * @param {string|Array} classes - Classe(s) CSS
 * @param {string} innerHTML - Conteúdo HTML (opcional)
 * @returns {Element} Elemento criado
 */
function createElement(tag, classes = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (classes) {
        if (Array.isArray(classes)) {
            element.classList.add(...classes);
        } else {
            element.className = classes;
        }
    }
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    return element;
}

/**
 * Esperar por tempo determinado
 * @param {number} ms - Millisegundos
 * @returns {Promise} Promise que resolve após delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Obter valor de atributo data com fallback
 * @param {Element} element - Elemento
 * @param {string} attribute - Nome do atributo data
 * @param {*} defaultValue - Valor padrão
 * @returns {*} Valor do atributo ou padrão
 */
function getDataAttribute(element, attribute, defaultValue = null) {
    return element.dataset[attribute] || defaultValue;
}

/**
 * Converter em número com segurança
 * @param {*} value - Valor a converter
 * @param {number} defaultValue - Valor padrão
 * @returns {number} Número convertido ou padrão
 */
function toNumber(value, defaultValue = 0) {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Ofuscar email
 * @param {string} email - Email a ofuscar
 * @returns {string} Email ofuscado (ex: u***@example.com)
 */
function obfuscateEmail(email) {
    const [local, domain] = email.split('@');
    const obfuscated = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
    return `${obfuscated}@${domain}`;
}

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validar URL
 * @param {string} url - URL a validar
 * @returns {boolean} True se válida
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Limpar string de caracteres especiais
 * @param {string} str - String a limpar
 * @returns {string} String limpa
 */
function sanitizeString(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Capitalizar primeira letra
 * @param {string} str - String
 * @returns {string} String capitalizada
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Mesclar dois objetos
 * @param {Object} obj1 - Primeiro objeto
 * @param {Object} obj2 - Segundo objeto
 * @returns {Object} Objeto mesclado
 */
function mergeObjects(obj1, obj2) {
    return { ...obj1, ...obj2 };
}

/**
 * Clonar objeto profundamente
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Cópia profunda
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Verificar se array contém valor
 * @param {Array} arr - Array
 * @param {*} value - Valor a procurar
 * @returns {boolean} True se contém
 */
function arrayContains(arr, value) {
    return arr.some(item => item === value);
}

/**
 * Remover duplicatas de array
 * @param {Array} arr - Array
 * @returns {Array} Array sem duplicatas
 */
function removeDuplicates(arr) {
    return [...new Set(arr)];
}

/**
 * Obter queriesParams da URL
 * @returns {Object} Objeto com query parameters
 */
function getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

/**
 * Log com timestamp (apenas em modo debug: adicione ?debug na URL)
 * @param {*} message - Mensagem
 * @param {string} type - Tipo ('info', 'warn', 'error')
 */
const DEBUG = new URLSearchParams(window.location.search).has('debug');

function log(message, type = 'info') {
    if (!DEBUG && type === 'info') return;

    const method = type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log';
    const prefix = `[${new Date().toLocaleTimeString()}] ${type.toUpperCase()}:`;
    console[method](prefix, message);
}

/**
 * Verificar se o usuário prefere menos movimento
 * @returns {boolean} True se movimento reduzido está ativo
 */
function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Verificar se é um dispositivo de toque / tela pequena
 * @returns {boolean} True se for mobile
 */
function isMobileDevice() {
    return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
}

// ========== EXPORT PARA MODULAR USE ========== //
// Se usar módulos ES6: export { ... }
// Para este projeto (vanilla), as funções estão globalmente disponíveis
