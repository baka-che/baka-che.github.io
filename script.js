// Навигация
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Анимация при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за элементами
document.querySelectorAll('.fighter-card, .schedule-day, .gallery-item, .benefit-item').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Таймер для статистики
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Запуск анимации статистики при скролле
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat h3').forEach(stat => {
                const value = parseInt(stat.getAttribute('data-target'));
                animateValue(stat, 0, value, 2000);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (document.querySelector('.stats')) {
    statsObserver.observe(document.querySelector('.stats'));
}

// ==================== СИСТЕМА ОТЗЫВОВ ====================

let reviews = JSON.parse(localStorage.getItem('boxingReviews')) || [];

// Инициализация звезд рейтинга
function initRatingStars() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('reviewRating');

    if (!stars.length || !ratingInput) return;

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            ratingInput.value = rating;
            
            // Обновляем отображение звезд
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        });

        // Добавляем hover эффект
        star.addEventListener('mouseover', function() {
            const rating = this.getAttribute('data-rating');
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.style.color = '#ffc107';
                }
            });
        });

        star.addEventListener('mouseout', function() {
            const currentRating = ratingInput.value;
            stars.forEach(s => {
                if (s.getAttribute('data-rating') > currentRating) {
                    s.style.color = '#ddd';
                }
            });
        });
    });
}

// Обработка формы отзыва
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('reviewerName').value.trim();
        const rating = document.getElementById('reviewRating').value;
        const text = document.getElementById('reviewText').value.trim();
        
        // Валидация
        if (rating === '0') {
            alert('Пожалуйста, поставьте оценку');
            return;
        }
        
        if (name.length < 2) {
            alert('Имя должно содержать минимум 2 символа');
            return;
        }
        
        if (text.length < 10) {
            alert('Отзыв должен содержать минимум 10 символов');
            return;
        }
        
        // Создаем новый отзыв
        const newReview = {
            id: Date.now(),
            name: name,
            rating: parseInt(rating),
            text: text,
            date: new Date().toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
        
        // Добавляем в начало массива
        reviews.unshift(newReview);
        saveReviews();
        displayReviews();
        
        // Сбрасываем форму
        this.reset();
        resetRatingStars();
        
        // Показываем подтверждение
        showSuccessMessage('Спасибо за ваш отзыв!');
    });
}

// Сброс звезд рейтинга
function resetRatingStars() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('reviewRating');
    
    if (!stars.length || !ratingInput) return;
    
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
        star.style.color = '#ddd';
    });
    ratingInput.value = '0';
}

// Сохранение отзывов в localStorage
function saveReviews() {
    try {
        localStorage.setItem('boxingReviews', JSON.stringify(reviews));
    } catch (e) {
        console.error('Ошибка сохранения отзывов:', e);
    }
}

// Отображение отзывов
function displayReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="no-reviews">
                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Пока нет отзывов. Будьте первым!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <h4>${escapeHtml(review.name)}</h4>
                    <span>Оценка: ${review.rating}/5</span>
                </div>
                <div class="review-rating">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
            </div>
            <p>"${escapeHtml(review.text)}"</p>
            <span class="review-date">${review.date}</span>
        </div>
    `).join('');

    // Добавляем анимацию для новых отзывов
    setTimeout(() => {
        container.querySelectorAll('.review-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        });
    }, 100);
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показать сообщение об успехе
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
        style.remove();
    }, 3000);
}

// Инициализация системы отзывов при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждем немного, чтобы DOM полностью загрузился
    setTimeout(() => {
        initRatingStars();
        initReviewForm();
        displayReviews();
    }, 100);
});

// Обновление навигации (меняем Контакты на Отзывы)
function updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === '#contact') {
            link.textContent = 'Отзывы';
            link.setAttribute('href', '#reviews');
        }
    });
}

// Вызываем обновление навигации
updateNavigation();

// Кнопка "Начать тренировки" - плавная прокрутка к отзывам
document.querySelector('.cta-button')?.addEventListener('click', function(e) {
    e.preventDefault();
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
        reviewsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
});
// Анимация для карточек информации в расписании
const scheduleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Наблюдаем за карточками информации
document.querySelectorAll('.info-card').forEach(card => {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scheduleObserver.observe(card);
});