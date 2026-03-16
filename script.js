// ===== MAIN APPLICATION SCRIPT =====

// DOM Ready Function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Set current year in footer
    setCurrentYear();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize active nav links
    initActiveNavLinks();
});

// ===== APPLICATION INITIALIZATION =====
function initApp() {
    console.log('📚 Library Management System Initialized');
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    const userType = localStorage.getItem('userType');
    
    if (currentUser && userType) {
        updateAuthButtons();
    }
    
    // Initialize animations
    initAnimations();
}

// ===== UTILITY FUNCTIONS =====
function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const isVisible = navLinks.style.display === 'flex' || 
                            navLinks.style.display === 'block';
            
            if (isVisible) {
                navLinks.style.display = 'none';
                authButtons.style.display = 'none';
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                navLinks.style.display = 'flex';
                authButtons.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = 'var(--primary-dark)';
                navLinks.style.padding = 'var(--spacing-md)';
                navLinks.style.gap = 'var(--spacing-md)';
                
                authButtons.style.position = 'absolute';
                authButtons.style.top = 'calc(100% + 200px)';
                authButtons.style.left = '0';
                authButtons.style.width = '100%';
                authButtons.style.backgroundColor = 'var(--primary-dark)';
                authButtons.style.padding = 'var(--spacing-md)';
                authButtons.style.flexDirection = 'column';
                
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-container')) {
            navLinks.style.display = 'none';
            authButtons.style.display = 'none';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== ACTIVE NAV LINKS =====
function initActiveNavLinks() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= (sectionTop - 100)) {
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
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.portal-card, .feature-card, .stat').forEach(el => {
        observer.observe(el);
    });
}

// ===== AUTHENTICATION FUNCTIONS =====
function updateAuthButtons() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userType = localStorage.getItem('userType');
    
    if (currentUser && userType) {
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="pages/${userType}-dashboard.html" class="btn btn-login">
                    <i class="fas fa-user"></i> Dashboard
                </a>
                <button onclick="logout()" class="btn btn-register">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
        }
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ===== LOADING INDICATOR =====
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.remove();
    }
}

// ===== FORM VALIDATION =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// ===== BOOK ANIMATIONS =====
function animateBookStack() {
    const books = document.querySelectorAll('.book');
    books.forEach((book, index) => {
        book.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
    });
}

// Add CSS animation for floating effect
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
        50% { transform: translateY(-20px) rotate(var(--rotation, 0deg)); }
    }
    
    .book-1 { --rotation: -5deg; }
    .book-2 { --rotation: 2deg; }
    .book-3 { --rotation: 8deg; }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary-dark);
        color: var(--text-light);
        padding: 15px 20px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        z-index: 9999;
        border-left: 4px solid var(--accent-green);
        animation: slideIn 0.3s ease;
    }
    
    .notification-error {
        border-left-color: #ff3838;
    }
    
    .notification-success {
        border-left-color: var(--accent-green);
    }
    
    .notification-warning {
        border-left-color: #ffa502;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-gray);
        cursor: pointer;
        padding: 5px;
    }
    
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    }
    
    .loading-spinner {
        text-align: center;
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid transparent;
        border-top-color: var(--accent-green);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Start book animation when page loads
window.addEventListener('load', animateBookStack);