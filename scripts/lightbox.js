// ========== LIGHTBOX.JS - VISUALIZADOR DE FOTOS ========== //

/**
 * Lightbox
 * - As fotos são lidas da galeria (.memory-item img), sem lista duplicada
 * - Swipe para os lados no celular, arrastar para baixo para fechar
 * - Teclado: ← → e Esc
 */
const lightboxState = {
    images: [],
    index: 0,
    lastFocus: null,
    touch: null
};

function getLightboxEls() {
    return {
        root: document.querySelector('#lightbox'),
        img: document.querySelector('#lightbox-img'),
        counter: document.querySelector('#lightbox-counter'),
        indicators: document.querySelector('#lightbox-indicators')
    };
}

/**
 * Abrir lightbox
 * @param {number} index - Índice da imagem
 */
function openLightbox(index) {
    const { root } = getLightboxEls();
    if (!root || !lightboxState.images.length) return;

    lightboxState.lastFocus = document.activeElement;
    createLightboxIndicators();
    showLightboxImage(index);

    root.hidden = false;
    document.body.classList.add('is-locked');
    pauseParticles();

    // Próximo frame para a transição de opacidade acontecer
    requestAnimationFrame(() => {
        root.classList.add('active');
        root.querySelector('.lightbox-close')?.focus({ preventScroll: true });
    });
}

/**
 * Fechar lightbox
 */
function closeLightbox() {
    const { root, img } = getLightboxEls();
    if (!root || root.hidden) return;

    root.classList.remove('active');
    document.body.classList.remove('is-locked');
    resumeParticles();

    setTimeout(() => {
        root.hidden = true;
        img.classList.remove('is-loaded');
        img.style.transform = '';
        img.style.opacity = '';
    }, 350);

    lightboxState.lastFocus?.focus?.({ preventScroll: true });
}

/**
 * Exibir imagem pelo índice (com loop)
 * @param {number} index - Índice
 * @param {number} direction - -1 anterior, 1 próxima, 0 sem direção
 */
function showLightboxImage(index, direction = 0) {
    const { img, counter } = getLightboxEls();
    const total = lightboxState.images.length;

    lightboxState.index = (index + total) % total;
    const data = lightboxState.images[lightboxState.index];

    img.classList.remove('is-loaded', 'is-dragging');
    img.style.opacity = '';
    img.style.transform = direction ? `translateX(${direction * 40}px) scale(0.96)` : '';

    const reveal = () => {
        img.style.transform = '';
        requestAnimationFrame(() => img.classList.add('is-loaded'));
    };

    img.onload = reveal;
    img.src = data.src;
    img.alt = data.alt;
    if (img.complete) reveal();

    if (counter) {
        counter.textContent = `${lightboxState.index + 1} / ${total}`;
    }

    updateLightboxIndicators();
    preloadNeighbours();
}

/**
 * Pré-carregar as fotos vizinhas para a troca ser instantânea
 */
function preloadNeighbours() {
    const total = lightboxState.images.length;
    [1, -1].forEach(step => {
        const neighbour = lightboxState.images[(lightboxState.index + step + total) % total];
        const preload = new Image();
        preload.src = neighbour.src;
    });
}

function nextLightbox() {
    showLightboxImage(lightboxState.index + 1, 1);
}

function prevLightbox() {
    showLightboxImage(lightboxState.index - 1, -1);
}

/**
 * Criar indicadores do lightbox
 */
function createLightboxIndicators() {
    const { indicators } = getLightboxEls();
    if (!indicators || indicators.children.length > 0) return;

    lightboxState.images.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'lightbox-indicator';
        dot.setAttribute('aria-label', `Ir para foto ${index + 1}`);
        dot.addEventListener('click', () => {
            showLightboxImage(index, Math.sign(index - lightboxState.index));
        });
        indicators.appendChild(dot);
    });
}

/**
 * Atualizar indicadores do lightbox
 */
function updateLightboxIndicators() {
    document.querySelectorAll('.lightbox-indicator').forEach((dot, index) => {
        const isActive = index === lightboxState.index;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
}

/**
 * Gestos de toque: swipe horizontal troca de foto, swipe para baixo fecha
 */
function setupLightboxGestures(root, img) {
    root.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        lightboxState.touch = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            dx: 0,
            dy: 0,
            axis: null
        };
        img.classList.add('is-dragging');
    }, { passive: true });

    root.addEventListener('touchmove', (e) => {
        const t = lightboxState.touch;
        if (!t) return;

        t.dx = e.touches[0].clientX - t.x;
        t.dy = e.touches[0].clientY - t.y;
        t.axis = t.axis || (Math.abs(t.dx) > Math.abs(t.dy) ? 'x' : 'y');

        if (t.axis === 'x') {
            img.style.transform = `translateX(${t.dx}px) rotate(${t.dx * 0.02}deg)`;
        } else if (t.dy > 0) {
            img.style.transform = `translateY(${t.dy}px) scale(${1 - Math.min(t.dy / 1500, 0.15)})`;
            img.style.opacity = `${1 - Math.min(t.dy / 400, 0.6)}`;
        }
    }, { passive: true });

    root.addEventListener('touchend', () => {
        const t = lightboxState.touch;
        lightboxState.touch = null;
        img.classList.remove('is-dragging');
        if (!t) return;

        if (t.axis === 'x' && Math.abs(t.dx) > 50) {
            t.dx < 0 ? nextLightbox() : prevLightbox();
        } else if (t.axis === 'y' && t.dy > 110) {
            closeLightbox();
        } else {
            img.style.transform = '';
            img.style.opacity = '';
        }
    });
}

/**
 * Inicializar lightbox a partir da galeria
 */
function initLightbox() {
    const { root, img } = getLightboxEls();
    const items = document.querySelectorAll('.memory-item');
    if (!root || !img || !items.length) return;

    lightboxState.images = Array.from(items).map(item => {
        const photo = item.querySelector('img');
        return { src: photo.getAttribute('src'), alt: photo.alt };
    });

    items.forEach((item, index) => {
        item.setAttribute('aria-label', `Ampliar foto ${index + 1}`);
        item.addEventListener('click', () => openLightbox(index));
    });

    root.querySelectorAll('[data-lightbox-close]').forEach(el => {
        el.addEventListener('click', closeLightbox);
    });

    setupLightboxGestures(root, img);

    document.addEventListener('keydown', (e) => {
        if (root.hidden) return;

        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') prevLightbox();
        else if (e.key === 'ArrowRight') nextLightbox();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
} else {
    initLightbox();
}
