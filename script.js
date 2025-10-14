// Variables globales
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideCounter = document.getElementById('slideCounter');

// Inicializar la presentación
function init() {
    showSlide(currentSlide);
    updateCounter();
    updateButtons();
    
    // Event listeners para los botones
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Event listeners para teclado
    document.addEventListener('keydown', handleKeyPress);
    
    // Event listeners para gestos táctiles (móvil)
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe left - siguiente diapositiva
            nextSlide();
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe right - diapositiva anterior
            previousSlide();
        }
    }
}

// Mostrar diapositiva específica
function showSlide(index) {
    // Ocultar todas las diapositivas
    slides.forEach((slide) => {
        slide.classList.remove('active');
    });
    
    // Mostrar la diapositiva actual
    slides[index].classList.add('active');
    
    // Scroll al inicio de la diapositiva
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Ir a la siguiente diapositiva
function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        showSlide(currentSlide);
        updateCounter();
        updateButtons();
    }
}

// Ir a la diapositiva anterior
function previousSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
        updateCounter();
        updateButtons();
    }
}

// Actualizar contador de diapositivas
function updateCounter() {
    slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
}

// Actualizar estado de los botones
function updateButtons() {
    // Deshabilitar botón anterior si estamos en la primera diapositiva
    if (currentSlide === 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    
    // Deshabilitar botón siguiente si estamos en la última diapositiva
    if (currentSlide === totalSlides - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// Manejar teclas del teclado
function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // Espacio
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
        case 'PageUp':
            e.preventDefault();
            previousSlide();
            break;
        case 'Home':
            e.preventDefault();
            goToSlide(0);
            break;
        case 'End':
            e.preventDefault();
            goToSlide(totalSlides - 1);
            break;
    }
}

// Ir a una diapositiva específica
function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
        currentSlide = index;
        showSlide(currentSlide);
        updateCounter();
        updateButtons();
    }
}

// Función para modo de presentación completa (opcional)
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Event listener para F11 o doble clic (pantalla completa)
document.addEventListener('dblclick', (e) => {
    // Solo activar pantalla completa si no se hace doble clic en un control
    if (!e.target.closest('.controls')) {
        toggleFullScreen();
    }
});

// Agregar listener para tecla F para pantalla completa
document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullScreen();
    }
});

// Función para imprimir o exportar
function printPresentation() {
    window.print();
}

// Agregar listener para tecla P de print
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printPresentation();
    }
});

// Guardar progreso en memoria (sin localStorage)
let slideProgress = {
    lastSlide: 0,
    visitedSlides: []
};

// Guardar progreso de la diapositiva actual
function saveProgress() {
    slideProgress.lastSlide = currentSlide;
    if (!slideProgress.visitedSlides.includes(currentSlide)) {
        slideProgress.visitedSlides.push(currentSlide);
    }
}

// Restaurar progreso (se reinicia cada vez que se carga la página)
function restoreProgress() {
    if (slideProgress.lastSlide > 0) {
        goToSlide(slideProgress.lastSlide);
    }
}

// Actualizar progreso cada vez que cambiamos de diapositiva
function updateSlideWithProgress(index) {
    currentSlide = index;
    showSlide(currentSlide);
    updateCounter();
    updateButtons();
    saveProgress();
}

// Modificar las funciones nextSlide y previousSlide para incluir progreso
const originalNextSlide = nextSlide;
const originalPreviousSlide = previousSlide;

nextSlide = function() {
    originalNextSlide();
    saveProgress();
};

previousSlide = function() {
    originalPreviousSlide();
    saveProgress();
};

// Función para crear un índice de navegación rápida (opcional)
function createQuickNav() {
    const navContainer = document.createElement('div');
    navContainer.className = 'quick-nav';
    navContainer.style.cssText = `
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(102, 126, 234, 0.9);
        padding: 15px;
        border-radius: 10px;
        display: none;
        flex-direction: column;
        gap: 5px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 1000;
    `;
    
    // Crear puntos de navegación
    slides.forEach((slide, index) => {
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        dot.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0.5;
        `;
        
        if (index === currentSlide) {
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1.3)';
        }
        
        dot.addEventListener('click', () => {
            goToSlide(index);
            updateQuickNav();
        });
        
        navContainer.appendChild(dot);
    });
    
    document.body.appendChild(navContainer);
    
    // Mostrar/ocultar navegación rápida con tecla N
    document.addEventListener('keydown', (e) => {
        if (e.key === 'n' || e.key === 'N') {
            navContainer.style.display = navContainer.style.display === 'flex' ? 'none' : 'flex';
        }
    });
    
    return navContainer;
}

// Actualizar navegación rápida
function updateQuickNav() {
    const navDots = document.querySelectorAll('.nav-dot');
    navDots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1.3)';
        } else {
            dot.style.opacity = '0.5';
            dot.style.transform = 'scale(1)';
        }
    });
}

// Función para agregar un temporizador de presentación automática
let autoPlayInterval = null;
let autoPlayDelay = 5000; // 5 segundos por diapositiva

function startAutoPlay() {
    if (autoPlayInterval) return; // Ya está en reproducción
    
    autoPlayInterval = setInterval(() => {
        if (currentSlide < totalSlides - 1) {
            nextSlide();
        } else {
            stopAutoPlay();
        }
    }, autoPlayDelay);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

function toggleAutoPlay() {
    if (autoPlayInterval) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

// Tecla A para activar/desactivar reproducción automática
document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        toggleAutoPlay();
    }
});

// Detener autoplay si el usuario interactúa
document.addEventListener('click', (e) => {
    if (e.target.closest('.control-btn')) {
        stopAutoPlay();
    }
});

// Función para modo presentador (mostrar notas)
function togglePresenterMode() {
    const body = document.body;
    body.classList.toggle('presenter-mode');
}

// Tecla M para modo presentador
document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        togglePresenterMode();
    }
});

// Función para búsqueda rápida de diapositivas
function searchSlides(query) {
    const results = [];
    slides.forEach((slide, index) => {
        const content = slide.textContent.toLowerCase();
        if (content.includes(query.toLowerCase())) {
            results.push({
                index: index,
                title: slide.querySelector('h2')?.textContent || 'Sin título',
                slide: slide
            });
        }
    });
    return results;
}

// Función para crear un panel de búsqueda
function createSearchPanel() {
    const searchPanel = document.createElement('div');
    searchPanel.className = 'search-panel';
    searchPanel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: none;
        z-index: 2000;
        min-width: 400px;
    `;
    
    searchPanel.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #667eea;">Buscar en diapositivas</h3>
        <input type="text" id="searchInput" placeholder="Escribe para buscar..." style="
            width: 100%;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 15px;
        ">
        <div id="searchResults" style="max-height: 300px; overflow-y: auto;"></div>
        <button id="closeSearch" style="
            margin-top: 15px;
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
        ">Cerrar</button>
    `;
    
    document.body.appendChild(searchPanel);
    
    // Event listeners
    const searchInput = searchPanel.querySelector('#searchInput');
    const searchResults = searchPanel.querySelector('#searchResults');
    const closeBtn = searchPanel.querySelector('#closeSearch');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            const results = searchSlides(query);
            displaySearchResults(results, searchResults);
        } else {
            searchResults.innerHTML = '';
        }
    });
    
    closeBtn.addEventListener('click', () => {
        searchPanel.style.display = 'none';
        searchInput.value = '';
        searchResults.innerHTML = '';
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchPanel.style.display === 'block') {
            searchPanel.style.display = 'none';
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    });
    
    return searchPanel;
}

// Mostrar resultados de búsqueda
function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<p style="color: #999;">No se encontraron resultados</p>';
        return;
    }
    
    container.innerHTML = results.map(result => `
        <div class="search-result-item" data-index="${result.index}" style="
            padding: 12px;
            margin: 8px 0;
            background: #f8f9fa;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            border-left: 4px solid #667eea;
        ">
            <strong>Diapositiva ${result.index + 1}:</strong> ${result.title}
        </div>
    `).join('');
    
    // Event listeners para los resultados
    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            goToSlide(index);
            document.querySelector('.search-panel').style.display = 'none';
        });
        
        item.addEventListener('mouseenter', (e) => {
            e.target.style.background = '#667eea';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateX(5px)';
        });
        
        item.addEventListener('mouseleave', (e) => {
            e.target.style.background = '#f8f9fa';
            e.target.style.color = 'inherit';
            e.target.style.transform = 'translateX(0)';
        });
    });
}

// Tecla Ctrl+F o Cmd+F para abrir búsqueda
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchPanel = document.querySelector('.search-panel') || createSearchPanel();
        searchPanel.style.display = 'block';
        searchPanel.querySelector('#searchInput').focus();
    }
});

// Función para mostrar ayuda de atajos de teclado
function showHelp() {
    const helpPanel = document.createElement('div');
    helpPanel.className = 'help-panel';
    helpPanel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 3000;
        max-width: 600px;
    `;
    
    helpPanel.innerHTML = `
        <h2 style="color: #667eea; margin-bottom: 25px;">Atajos de teclado</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div><strong>→ / Espacio / PgDown:</strong> Siguiente</div>
            <div><strong>← / PgUp:</strong> Anterior</div>
            <div><strong>Home:</strong> Primera diapositiva</div>
            <div><strong>End:</strong> Última diapositiva</div>
            <div><strong>F:</strong> Pantalla completa</div>
            <div><strong>N:</strong> Navegación rápida</div>
            <div><strong>A:</strong> Reproducción automática</div>
            <div><strong>M:</strong> Modo presentador</div>
            <div><strong>Ctrl/Cmd + F:</strong> Buscar</div>
            <div><strong>Ctrl/Cmd + P:</strong> Imprimir</div>
            <div><strong>H / ?:</strong> Mostrar ayuda</div>
            <div><strong>Escape:</strong> Cerrar paneles</div>
        </div>
        <button id="closeHelp" style="
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        ">Cerrar</button>
    `;
    
    document.body.appendChild(helpPanel);
    
    helpPanel.querySelector('#closeHelp').addEventListener('click', () => {
        helpPanel.remove();
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            helpPanel.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

// Tecla H o ? para mostrar ayuda
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        showHelp();
    }
});

// Función para agregar indicador de progreso
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s ease;
        z-index: 9999;
    `;
    
    document.body.appendChild(progressBar);
    return progressBar;
}

// Actualizar barra de progreso
function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Modificar la función showSlide para actualizar la barra de progreso
const originalShowSlide = showSlide;
showSlide = function(index) {
    originalShowSlide(index);
    updateProgressBar();
};

// Función de inicialización mejorada
function initEnhanced() {
    init();
    createProgressBar();
    createQuickNav();
    
    // Mensaje de bienvenida en consola
    console.log('%c¡Bienvenido a la Presentación de Emociones! 🎨', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%cPresiona H para ver los atajos de teclado disponibles', 'color: #764ba2; font-size: 14px;');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhanced);
} else {
    initEnhanced();
}

// Exportar funciones para uso externo (opcional)
window.presentationAPI = {
    goToSlide: goToSlide,
    nextSlide: nextSlide,
    previousSlide: previousSlide,
    getCurrentSlide: () => currentSlide,
    getTotalSlides: () => totalSlides,
    startAutoPlay: startAutoPlay,
    stopAutoPlay: stopAutoPlay,
    searchSlides: searchSlides
};