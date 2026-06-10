// ========== MAIN.JS - ORQUESTRADOR PRINCIPAL ========== //

/**
 * Inicialização principal do site
 * Carrega todos os módulos e configura listeners globais
 */

document.addEventListener('DOMContentLoaded', () => {
    log('=== INICIANDO SITE ROMÂNTICO ===', 'info');

    // 1. Verificar suporte a funcionalidades necessárias
    checkBrowserSupport();

    // 2. Inicializar componentes (já feito pelos scripts com defer)
    // - animationController.js
    // - carousel.js
    // - counter.js
    // - typewriter.js
    // - particles.js
    // - quiz.js
    // - celebration.js

    // 3. Setup global de listeners
    setupGlobalListeners();

    // 4. Setup scroll suave
    setupSmoothScroll();

    // 5. Setup parallax
    setupParallax();

    // 6. Mensagem de sucesso
    log('Todos os módulos inicializados com sucesso!', 'info');
});

/**
 * Verificar suporte a funcionalidades do navegador
 */
function checkBrowserSupport() {
    const requiredFeatures = {
        'Intersection Observer': 'IntersectionObserver' in window,
        'Canvas': 'canvas' in document.createElement('canvas'),
        'CSS Animations': supportsCSSProperty('animation'),
        'CSS Backdrop Filter': supportsCSSProperty('backdropFilter') || supportsCSSProperty('webkitBackdropFilter'),
        'LocalStorage': typeof (Storage) !== 'undefined'
    };

    log('=== VERIFICAÇÃO DE SUPORTE ===', 'info');

    for (const [feature, isSupported] of Object.entries(requiredFeatures)) {
        console.log(`✓ ${feature}: ${isSupported ? 'Suportado' : 'Não suportado'}`);
    }
}

/**
 * Setup global de listeners
 */
function setupGlobalListeners() {
    // Listener para links de scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                smoothScroll(href, 80);
            }
        });
    });

    // Listener para orientação do dispositivo
    window.addEventListener('orientationchange', () => {
        log('Orientação mudou', 'info');
        if (particleSystem) {
            particleSystem.resizeCanvas();
        }
    });

    // Listener para visibilidade da página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            log('Página perdeu foco', 'info');
            if (particleSystem) {
                particleSystem.pause();
            }
            if (relationshipCounter) {
                relationshipCounter.stopUpdating();
            }
        } else {
            log('Página voltou ao foco', 'info');
            if (particleSystem) {
                particleSystem.resume();
            }
            if (relationshipCounter) {
                relationshipCounter.startUpdating();
            }
        }
    });

    // Listener para resize
    window.addEventListener('resize', debounce(() => {
        log('Window redimensionada', 'info');
        if (particleSystem) {
            particleSystem.resizeCanvas();
        }
    }, 200));

    // Listener para offline/online
    window.addEventListener('online', () => {
        log('Conexão restaurada', 'info');
    });

    window.addEventListener('offline', () => {
        log('Sem conexão com internet', 'warn');
    });
}

/**
 * Setup de scroll suave para todos os links
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href*="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Setup de parallax suave em imagens
 */
function setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', throttle(() => {
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                applyParallax(element, parseFloat(speed));
            });
        }, 100));
    }
}

/**
 * Carregar dados customizados (futuro)
 */
function loadCustomData() {
    // Aqui podem ser carregados dados de um servidor
    // ou localStorage para customização do site

    // Exemplo de dados que podem ser customizados:
    const customConfig = {
        startDate: '2018-06-15T10:00:00', // Data de início do relacionamento
        couple: {
            name1: 'Você',
            name2: 'Eu'
        },
        colors: {
            primary: '#ff69b4',
            secondary: '#dc143c'
        }
    };

    return customConfig;
}

/**
 * Mostrar versão do site (debug)
 */
function getVersionInfo() {
    return {
        version: '1.0.0',
        releaseDate: '2026-06-08',
        modules: [
            'AnimationController',
            'Carousel',
            'RelationshipCounter',
            'TypewriterEffect',
            'ParticleSystem',
            'Quiz',
            'CelebrationEffect'
        ]
    };
}

/**
 * Status de todos os módulos
 */
function getModulesStatus() {
    return {
        animationController: animationController ? '✓ Ativo' : '✗ Inativo',
        carousel: carousel ? '✓ Ativo' : '✗ Inativo',
        relationshipCounter: relationshipCounter ? '✓ Ativo' : '✗ Inativo',
        typewriter: typewriter ? '✓ Ativo' : '✗ Inativo',
        particleSystem: particleSystem ? '✓ Ativo' : '✗ Inativo',
        quiz: quiz ? '✓ Ativo' : '✗ Inativo',
        celebrationEffect: celebrationEffect ? '✓ Ativo' : '✗ Inativo'
    };
}

/**
 * Print info no console
 */
function printSiteInfo() {
    console.clear();
    console.log('%c❤️ FELIZ DIA DOS NAMORADOS ❤️', 'color: #ff69b4; font-size: 24px; font-weight: bold;');
    console.log('%cVersão:', 'font-weight: bold;', getVersionInfo().version);
    console.log('%cMódulos:', 'font-weight: bold;');
    console.table(getModulesStatus());
    console.log('%cPor Amor ❤️', 'color: #dc143c; font-size: 16px; font-weight: bold;');
}

/**
 * Função auxiliar para testar animação manualmente
 */
function testAnimation(targetSelector, animationType = 'fade-in') {
    const target = document.querySelector(targetSelector);
    if (target) {
        animateElement(target, {
            animation: animationType,
            duration: 600
        });
    }
}

/**
 * Exportar funções úteis globalmente
 */
window.SiteUtils = {
    getVersionInfo,
    getModulesStatus,
    printSiteInfo,
    testAnimation,
    loadCustomData,
    // Funções de controle
    smoothScroll,
    animateElement,
    animateStaggered,
    getAnimationController,
    refreshAnimations,
    resetAnimations,
    // Carousel
    getCarousel: () => carousel,
    // Counter
    getCounter: () => relationshipCounter,
    getFormattedCounterTime,
    updateCounterDate,
    // Typewriter
    getTypewriter: () => typewriter,
    startTypewriter,
    completeTypewriter,
    resetTypewriter,
    // Particles
    getParticleSystem: () => particleSystem,
    explodeParticles,
    pauseParticles,
    resumeParticles,
    // Quiz
    getQuiz: () => quiz,
    submitQuiz,
    resetQuiz,
    // Celebration
    getCelebration: () => celebrationEffect,
    celebrate,
    confettiExplosion,
    // Lightbox
    openLightbox,
    closeLightbox,
    nextLightbox,
    prevLightbox,
    // Utilidades
    debounce,
    throttle,
    log,
    delay,
    getRandomNumber,
    getRandomColor,
    formatNumber,
    calculateTimeDifference,
    isInViewport
};

// Imprimir info no console
printSiteInfo();

// ========== SERVICE WORKER (Future PWA) ========== //
// Registrar service worker se suportado (future feature para PWA)
if ('serviceWorker' in navigator) {
    // Será habilitado quando adicionado um service worker
    // navigator.serviceWorker.register('/sw.js');
}

// ========== ANALYTICS (Future) ========== //
// Adicionar tracking de eventos (Google Analytics, Mixpanel, etc)
// Será adicionado conforme necessário

// ========== A/B TESTING (Future) ========== //
// Adicionar A/B testing para otimizações
// Será adicionado conforme necessário

log('Site inicializado e pronto para uso! 🎉', 'info');
