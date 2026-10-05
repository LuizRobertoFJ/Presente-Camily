// ========== MAIN.JS - ORQUESTRADOR PRINCIPAL ========== //

/**
 * Inicialização principal do site.
 * Os módulos (animações, contador, carta, partículas, celebração, lightbox)
 * se inicializam sozinhos; aqui ficam as interações globais da página.
 */
document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScroll();
    setupReasonCards();
    setupScrollUI();
    setupGlobalListeners();

    log('Site inicializado e pronto para uso! 🎉', 'info');
});

/**
 * Scroll suave para todos os links internos (#secao)
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });
}

/**
 * Cards "Por que eu te amo": virar com toque/clique (funciona no celular)
 */
function setupReasonCards() {
    document.querySelectorAll('.reason-card').forEach(card => {
        card.addEventListener('click', () => {
            const flipped = card.classList.toggle('is-flipped');
            card.setAttribute('aria-pressed', String(flipped));
        });
    });
}

/**
 * Barra de progresso, navegação lateral e botão "voltar ao topo"
 */
function setupScrollUI() {
    const progressBar = document.querySelector('.scroll-progress__bar');
    const backToTop = document.querySelector('.back-to-top');
    const navLinks = Array.from(document.querySelectorAll('.dot-nav__link'));
    const hero = document.querySelector('#hero');
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    // Progresso de leitura (um único cálculo por frame)
    let ticking = false;
    const updateProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        if (progressBar) {
            progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateProgress);
        }
    }, { passive: true });
    updateProgress();

    if (!('IntersectionObserver' in window)) return;

    // Botão de topo aparece quando o hero sai da tela
    if (hero && backToTop) {
        new IntersectionObserver(([entry]) => {
            backToTop.classList.toggle('is-visible', !entry.isIntersecting);
        }, { threshold: 0.1 }).observe(hero);
    }

    // Seção ativa na navegação lateral + cor da barra do navegador no celular
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === `#${entry.target.id}`;
                link.classList.toggle('is-active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => sectionObserver.observe(section));

    // Barra do navegador fica vinho quando o rodapé aparece
    const footer = document.querySelector('.footer');
    if (footer && themeMeta) {
        new IntersectionObserver(([entry]) => {
            themeMeta.setAttribute('content', entry.isIntersecting ? '#4a0e1f' : '#fff1f3');
        }, { threshold: 0.3 }).observe(footer);
    }
}

/**
 * Listeners globais: resize, orientação e visibilidade da aba
 */
function setupGlobalListeners() {
    const handleResize = debounce(() => {
        particleSystem?.resizeCanvas();
    }, 200);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Economiza bateria quando a aba não está visível
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            particleSystem?.pause();
            relationshipCounter?.stopUpdating();
        } else {
            particleSystem?.resume();
            relationshipCounter?.startUpdating();
        }
    });
}

/**
 * Funções úteis expostas no console (window.SiteUtils)
 */
window.SiteUtils = {
    smoothScroll,
    animateElement,
    refreshAnimations,
    resetAnimations,
    getCounter: () => relationshipCounter,
    startTypewriter,
    completeTypewriter,
    resetTypewriter,
    getParticleSystem: () => particleSystem,
    explodeParticles,
    celebrate,
    confettiExplosion,
    openLightbox,
    closeLightbox
};
