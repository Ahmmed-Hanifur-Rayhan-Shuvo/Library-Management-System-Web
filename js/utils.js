// ===== UTILITY FUNCTIONS =====

class Utilities {
    constructor() {
        // Initialize utilities
    }

    // ===== DATE FUNCTIONS =====
    formatDate(date, format = 'dd-mm-yyyy') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        switch(format) {
            case 'dd-mm-yyyy':
                return `${day}-${month}-${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            case 'mm/dd/yyyy':
                return `${month}/${day}/${year}`;
            default:
                return `${day}-${month}-${year}`;
        }
    }

    parseDate(dateString) {
        if (!dateString) return null;
        
        // Try different formats
        const formats = [
            /^(\d{2})-(\d{2})-(\d{4})$/, // dd-mm-yyyy
            /^(\d{4})-(\d{2})-(\d{2})$/, // yyyy-mm-dd
            /^(\d{2})\/(\d{2})\/(\d{4})$/ // mm/dd/yyyy
        ];
        
        for (const regex of formats) {
            const match = dateString.match(regex);
            if (match) {
                const [, a, b, c] = match;
                // Determine format and create date
                if (regex.source.includes('yyyy-mm-dd')) {
                    return new Date(`${c}-${b}-${a}`);
                } else {
                    return new Date(`${c}-${b}-${a}`);
                }
            }
        }
        
        return new Date(dateString);
    }

    getDaysBetween(startDate, endDate) {
        const start = this.parseDate(startDate);
        const end = this.parseDate(endDate) || new Date();
        
        if (!start || !end) return 0;
        
        const diffTime = Math.abs(end - start);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // ===== VALIDATION FUNCTIONS =====
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validateName(name) {
        return name.trim().length >= 2;
    }

    validateStudentId(id) {
        return /^S\d+$/.test(id);
    }

    validateFacultyId(id) {
        return /^F\d+$/.test(id);
    }

    validateBookId(id) {
        return /^\d+$/.test(id);
    }

    // ===== STRING FUNCTIONS =====
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // ===== NUMBER FUNCTIONS =====
    formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }

    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    calculatePercentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    }

    // ===== ARRAY FUNCTIONS =====
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // ===== STORAGE FUNCTIONS =====
    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // ===== DOM FUNCTIONS =====
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    showElement(selector) {
        const element = this.getElement(selector);
        if (element) {
            element.style.display = '';
            element.classList.remove('hidden');
        }
    }

    hideElement(selector) {
        const element = this.getElement(selector);
        if (element) {
            element.style.display = 'none';
            element.classList.add('hidden');
        }
    }

    toggleElement(selector) {
        const element = this.getElement(selector);
        if (element) {
            if (element.style.display === 'none') {
                this.showElement(selector);
            } else {
                this.hideElement(selector);
            }
        }
    }

    getElement(selector) {
        if (typeof selector === 'string') {
            return document.querySelector(selector);
        }
        return selector;
    }

    // ===== EVENT FUNCTIONS =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ===== COLOR FUNCTIONS =====
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    lightenColor(hex, percent) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = 1 + (percent / 100);
        return this.rgbToHex(
            Math.min(255, Math.round(rgb.r * factor)),
            Math.min(255, Math.round(rgb.g * factor)),
            Math.min(255, Math.round(rgb.b * factor))
        );
    }

    darkenColor(hex, percent) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = 1 - (percent / 100);
        return this.rgbToHex(
            Math.max(0, Math.round(rgb.r * factor)),
            Math.max(0, Math.round(rgb.g * factor)),
            Math.max(0, Math.round(rgb.b * factor))
        );
    }

    // ===== FILE FUNCTIONS =====
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }

    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // ===== RANDOM FUNCTIONS =====
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 9);
        return `${prefix}${timestamp}${random}`;
    }

    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    }

    // ===== TIME FUNCTIONS =====
    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
        
        return "just now";
    }

    // ===== ERROR HANDLING =====
    handleError(error, userMessage = 'An error occurred') {
        console.error('Error:', error);
        
        // Log to error tracking service in production
        if (window.errorLoggingService) {
            window.errorLoggingService.log(error);
        }
        
        // Show user-friendly message
        showNotification(userMessage, 'error');
        
        // Return error for further handling
        return error;
    }

    // ===== PERFORMANCE =====
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start}ms`);
        return result;
    }

    // ===== COOKIE FUNCTIONS =====
    setCookie(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
}

// Create global utilities instance
const utils = new Utilities();