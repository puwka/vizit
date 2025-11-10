// Глобальная переменная для хранения текущей анимации скролла
let currentScrollAnimation = null;

// Плавная функция скролла (iOS style с easing)
const smoothScrollTo = (targetPosition, duration = 800) => {
    // Отменяем предыдущую анимацию, если она есть
    if (currentScrollAnimation) {
        cancelAnimationFrame(currentScrollAnimation);
        currentScrollAnimation = null;
    }

    const startPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime = null;

    // Если расстояние очень маленькое, скроллим сразу
    if (Math.abs(distance) < 1) {
        return;
    }

    // iOS easing function (ease-in-out-cubic) - более плавная
    const easeInOutCubic = (t) => {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime) => {
        if (startTime === null) {
            startTime = currentTime || performance.now();
        }
        
        const timeElapsed = (currentTime || performance.now()) - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        const currentPosition = startPosition + distance * ease;

        // Плавный скролл
        window.scrollTo({
            top: currentPosition,
            left: 0,
            behavior: 'auto' // Используем 'auto' так как анимацию делаем вручную
        });

        if (progress < 1) {
            currentScrollAnimation = requestAnimationFrame(animation);
        } else {
            // Финальная позиция для точности
            window.scrollTo({
                top: targetPosition,
                left: 0,
                behavior: 'auto'
            });
            currentScrollAnimation = null;
        }
    };

    // Запускаем анимацию
    currentScrollAnimation = requestAnimationFrame(animation);
};

// Плавный скролл к секциям (iOS style)
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;
            
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;
            
            // Получаем высоту навбара
            const navbar = document.querySelector('.navbar');
            const navHeight = navbar ? navbar.offsetHeight : 0;
            
            // Рассчитываем целевую позицию с учетом навбара
            const getTargetPosition = () => {
                const rect = targetSection.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return rect.top + scrollTop - navHeight;
            };
            
            const targetPosition = getTargetPosition();
            
            // Плавный скролл с iOS easing (800ms)
            smoothScrollTo(targetPosition, 800);

            // Подсветка секции после скролла
            const highlightSection = (el) => {
                if (!el) return;
                el.classList.remove('section-focus');
                // Принудительное перерасчёт для перезапуска анимации
                void el.offsetWidth;
                el.classList.add('section-focus');
                setTimeout(() => el.classList.remove('section-focus'), 900);
            };

            // Ждём завершение плавного скролла (800ms + небольшая задержка)
            setTimeout(() => highlightSection(targetSection), 850);
            
            // Закрываем мобильное меню после клика
            const navMenu = document.getElementById('navMenu');
            const menuToggle = document.getElementById('menuToggle');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                }
            }
        });
    });
};

// Инициализируем плавный скролл после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
} else {
    initSmoothScroll();
}

// Изменение навбара при скролле
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Мобильное меню
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Кнопка "Наверх"
const scrollTopBtn = document.getElementById('scrollTop');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        smoothScrollTo(0, 600);
    });
}

// Анимация появления блоков при скролле (iOS style с задержкой)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Добавляем задержку для плавного появления (iOS style)
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Наблюдаем за всеми элементами с классом fade-in
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Popup для связи (iOS style с анимацией)
const contactBtn = document.getElementById('contactBtn');
const contactPopup = document.getElementById('contactPopup');
const popupClose = document.getElementById('popupClose');

const openPopup = () => {
    if (contactPopup) {
        contactPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Предотвращаем скролл на iOS
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }
};

const closePopup = () => {
    if (contactPopup) {
        contactPopup.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
};

if (contactBtn && contactPopup) {
    contactBtn.addEventListener('click', openPopup);
}

if (popupClose && contactPopup) {
    popupClose.addEventListener('click', closePopup);
}

// Закрытие popup при клике вне его области
if (contactPopup) {
    contactPopup.addEventListener('click', (e) => {
        if (e.target === contactPopup) {
            closePopup();
        }
    });
}

// Закрытие popup при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactPopup && contactPopup.classList.contains('active')) {
        closePopup();
    }
});

// Анимация при загрузке страницы (iOS style)
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    });
});

// Плавная анимация чисел в статистике (iOS style с easing)
const animateNumbers = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((stat, index) => {
        const target = stat.textContent;
        const isNumber = !isNaN(parseFloat(target));
        
        if (isNumber) {
            // Задержка для последовательного появления
            setTimeout(() => {
                const finalValue = parseFloat(target);
                const suffix = target.replace(/[0-9.]/g, '');
                let startTime = null;
                const duration = 1500;
                
                const easeOutCubic = (t) => {
                    return 1 - Math.pow(1 - t, 3);
                };
                
                const animate = (currentTime) => {
                    if (!startTime) startTime = currentTime;
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    const eased = easeOutCubic(progress);
                    const currentValue = finalValue * eased;
                    
                    if (suffix === '%' || suffix === '+') {
                        stat.textContent = Math.round(currentValue) + suffix;
                    } else {
                        stat.textContent = currentValue.toFixed(1) + suffix;
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        stat.textContent = finalValue + suffix;
                    }
                };
                
                requestAnimationFrame(animate);
            }, index * 150);
        }
    });
};

// Запускаем анимацию чисел при появлении секции статистики
const statsSection = document.querySelector('.stats-grid');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Добавляем эффект parallax для hero секции (iOS style - более плавный)
const hero = document.querySelector('.hero');
if (hero) {
    let ticking = false;
    
    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const heroContent = hero.querySelector('.hero-content');
        const heroChat = hero.querySelector('.hero-chat');
        
        if (scrolled < window.innerHeight) {
            const opacity = Math.max(0.3, 1 - (scrolled / window.innerHeight) * 0.7);
            const translateY = scrolled * 0.2;
            const chatTranslateY = scrolled * 0.15;
            
            if (heroContent) {
                heroContent.style.opacity = opacity;
                heroContent.style.transform = `translateY(${translateY}px)`;
            }
            
            if (heroChat) {
                heroChat.style.transform = `translateY(${chatTranslateY}px)`;
            }
        }
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
}

// Добавляем активный класс к текущей секции в навигации
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    const navHeight = navbar.offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - navHeight - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Предзагрузка изображений для лучшей производительности
const preloadImages = () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.src && !img.complete) {
            const imageLoader = new Image();
            imageLoader.src = img.src;
        }
    });
};

window.addEventListener('load', preloadImages);

// Обработка ошибок загрузки изображений (iOS style placeholder)
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'https://via.placeholder.com/600x400/007AFF/FFFFFF?text=Image+Not+Found';
        this.alt = 'Изображение не загружено';
        this.style.borderRadius = '20px';
    });
    
    // Добавляем плавную загрузку изображений
    if (!img.complete) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    }
});

// Анимация чата в hero секции (iOS style)
let chatAnimationStarted = false;

const initChatAnimation = () => {
    if (chatAnimationStarted) return;
    
    const messages = document.querySelectorAll('.fade-in-message');
    const chatMessages = document.getElementById('chatMessages');
    const chatTyping = document.getElementById('chatTyping');
    
    if (!messages.length || !chatMessages) return;
    
    chatAnimationStarted = true;
    
    // Сбрасываем все сообщения
    messages.forEach(msg => {
        msg.classList.remove('visible', 'upload-complete');
        const text = msg.querySelector('.message-text');
        if (text) {
            text.style.opacity = '0';
        }
        const time = msg.querySelector('.message-time');
        if (time) {
            time.style.opacity = '0';
        }
    });
    
    // Показываем сообщения последовательно с улучшенной анимацией
    messages.forEach((message, index) => {
        const delay = parseInt(message.getAttribute('data-delay')) || (index + 1) * 1500;
        const isFileMessage = message.classList.contains('message-file');
        const isDeveloperMessage = message.classList.contains('message-developer');
        
        setTimeout(() => {
            // Показываем индикатор печати перед сообщением разработчика
            if (isDeveloperMessage && index > 0) {
                if (chatTyping) {
                    chatTyping.classList.add('show');
                }
                
                const typingDuration = isFileMessage ? 1500 : 1200;
                
                setTimeout(() => {
                    if (chatTyping) {
                        chatTyping.classList.remove('show');
                    }
                    
                    message.classList.add('visible');
                    
                    // Если это файл, запускаем анимацию загрузки
                    if (isFileMessage) {
                        const fileMessage = message;
                        
                        // После завершения загрузки показываем успешное состояние
                        setTimeout(() => {
                            fileMessage.classList.add('upload-complete');
                        }, 2800); // 0.8s delay + 2s animation
                    }
                }, typingDuration);
            } else {
                // Сообщения клиента появляются сразу
                message.classList.add('visible');
            }
        }, delay);
    });
};

// Запускаем анимацию чата после загрузки страницы
window.addEventListener('load', () => {
    setTimeout(initChatAnimation, 1500);
});

// Перезапускаем анимацию при возврате в hero секцию
const heroSection = document.querySelector('.hero');
if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                // Если секция видна и анимация еще не запущена, запускаем ее
                if (!chatAnimationStarted) {
                    setTimeout(initChatAnimation, 500);
                }
            }
        });
    }, { threshold: 0.5 });
    
    heroObserver.observe(heroSection);
}

// Консольное сообщение для разработчика (iOS style)
console.log('%c👋 Привет!', 'color: #007AFF; font-size: 24px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, sans-serif;');
console.log('%cЭтот сайт создан в стиле iOS 26 от Maksim - разработчика на Kwork', 'color: #8E8E93; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;');
console.log('%cСтек: HTML5, CSS3, Vanilla JavaScript', 'color: #34C759; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;');

