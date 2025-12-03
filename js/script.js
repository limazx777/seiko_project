document.addEventListener('DOMContentLoaded', function() {
    // --- FUNÇÃO DE OTIMIZAÇÃO (THROTTLE) ---
    // Limita a frequência com que uma função pode ser chamada.
    // Usado para otimizar eventos de scroll e resize.
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Navegação suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Fechar menu móvel se estiver aberto
                const nav = document.querySelector('nav');
                const mobileMenuBtn = document.querySelector('.mobile-menu');
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });

    // Carrossel da Galeria (Estilo Leque)
    const galleryCarousel = document.querySelector('.gallery-fan-carousel');
    if (galleryCarousel) {
        const items = galleryCarousel.querySelectorAll('.gallery-item');
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        let currentIndex = 0;
        let autoRotateInterval;
        let isDown = false;
        let startX;
        let walk = 0;
        let startY;
        let isScrolling;

        const updateGalleryCarousel = () => {
            items.forEach((item, index) => {
                item.classList.remove('active', 'prev', 'next');

                if (index === currentIndex) {
                    item.classList.add('active');
                    // Permite a interação com a imagem central, se necessário no futuro
                    item.style.pointerEvents = 'auto';
                } else if (index === (currentIndex - 1 + items.length) % items.length) {
                    item.classList.add('prev');
                    // Impede interação com as imagens laterais
                    item.style.pointerEvents = 'none';
                } else if (index === (currentIndex + 1) % items.length) {
                    item.classList.add('next');
                    item.style.pointerEvents = 'none';
                }
            });
        };

        const nextItem = () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateGalleryCarousel();
        };

        const prevItem = () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateGalleryCarousel();
        };

        const startAutoRotate = () => {
            stopAutoRotate(); // Evita múltiplos intervalos
            autoRotateInterval = setInterval(nextItem, 4000); // Gira a cada 4 segundos
        };

        const stopAutoRotate = () => {
            clearInterval(autoRotateInterval);
        };

        nextBtn.addEventListener('click', () => {
            nextItem();
            stopAutoRotate();
            startAutoRotate(); // Reinicia o temporizador
        });

        prevBtn.addEventListener('click', () => {
            prevItem();
            stopAutoRotate();
            startAutoRotate(); // Reinicia o temporizador
        });

        // Adiciona funcionalidade de Swipe/Drag
        const startDrag = (e) => {
            isDown = true;
            startX = e.pageX || e.touches[0].pageX;
            startY = e.pageY || e.touches[0].pageY;
            isScrolling = undefined; // Reseta a detecção de scroll
            walk = 0;
            stopAutoRotate();
            galleryCarousel.style.cursor = 'grabbing';
        };

        const endDrag = (e) => {
            isDown = false;
            startAutoRotate();
            galleryCarousel.style.cursor = 'grab';

            // Só muda de item se não for um scroll vertical
            if (isScrolling === false && walk > 50) { // Swipe para a direita
                prevItem();
            } else if (isScrolling === false && walk < -50) { // Swipe para a esquerda
                nextItem();
            }
        };

        const moveDrag = (e) => {
            if (!isDown) return;

            const x = e.pageX || e.touches[0].pageX;
            const y = e.pageY || e.touches[0].pageY;
            walk = x - startX;
            const walkY = y - startY;

            // Detecta a intenção do usuário na primeira vez que ele move o dedo
            if (typeof isScrolling === 'undefined') {
                // Se o movimento vertical for maior que o horizontal, é um scroll
                isScrolling = Math.abs(walkY) > Math.abs(walk);
            }

            // Se não for um scroll vertical, previne o comportamento padrão (que seria selecionar texto, etc.)
            if (!isScrolling) {
                e.preventDefault();
            }
        };

        galleryCarousel.addEventListener('mousedown', startDrag);
        galleryCarousel.addEventListener('mouseup', endDrag);
        galleryCarousel.addEventListener('mouseleave', endDrag);
        galleryCarousel.addEventListener('mousemove', moveDrag);

        galleryCarousel.addEventListener('touchstart', startDrag);
        galleryCarousel.addEventListener('touchend', endDrag);
        galleryCarousel.addEventListener('touchmove', moveDrag);

        // Inicia o carrossel
        if (items.length > 0) {
            updateGalleryCarousel();
            startAutoRotate();
        }
    }

    // Animação ao rolar
    const animateOnScroll = function() {
        // Seleciona todos os .menu-item EXCETO os que estão dentro de .home-highlights
        const elements = document.querySelectorAll('.about-content, .menu-section:not(.home-highlights) .menu-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('fade-in');
            }
        });
    };
    
    // Adicionar classe para animação CSS
    const style = document.createElement('style');
    style.textContent = `
        /* Aplica a animação de entrada apenas nos elementos que não estão nos destaques */
        .about-content, .menu-section:not(.home-highlights) .menu-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // Executar animação ao carregar e ao rolar
    animateOnScroll(); // Executa uma vez no carregamento
    window.addEventListener('scroll', throttle(animateOnScroll, 100)); // Otimizado com throttle

    // Botão Voltar ao Topo
    const backToTopBtn = document.getElementById('back-to-top-btn');


    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Lógica da Tela de Carregamento para o Menu
document.addEventListener('DOMContentLoaded', function() {
    const viewMenuBtn = document.getElementById('view-full-menu-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const alertModal = document.getElementById('custom-alert-modal');

    if (viewMenuBtn && loadingOverlay && alertModal) {
        viewMenuBtn.addEventListener('click', function(e) {
            // Previne a navegação imediata
            e.preventDefault();

            // Mostra o modal de aviso
            alertModal.classList.add('show');

            const menuLink = this.href;

            // Ação para o botão "Continuar" no modal
            document.getElementById('custom-alert-confirm').onclick = () => {
                alertModal.classList.remove('show'); // Esconde o modal
                loadingOverlay.classList.add('show'); // Mostra a tela de carregamento

                // Aguarda a animação do loading e então navega
                setTimeout(() => {
                    window.location.href = menuLink;
                }, 700);
            };

            // Ação para o botão "Voltar" no modal
            document.getElementById('custom-alert-cancel').onclick = () => alertModal.classList.remove('show');
        });
    }
});