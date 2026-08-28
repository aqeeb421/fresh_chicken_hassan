/**
 * Fresh Chicken - Main UI Controller
 * Handles Navigation, Mobile Drawer, Sticky Navbar, Floating WhatsApp, and Footer Injection.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCartBadge();
    initBackToTop();
    initFooterContent();
    initPWA();
});

// Register PWA Service Worker (only in normal browser sessions, not in automated headless tests)
function initPWA() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http') && !navigator.webdriver) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('⚡ PWA Service Worker Registered! Scope:', reg.scope))
                .catch(err => console.warn('PWA registration skipped or failed:', err));
        });
    }
}

// Initialize sticky header & mobile navigation drawer
function initNavigation() {
    const header = document.getElementById('main-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    // Sticky header shadow on scroll
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('shadow-md', 'bg-white/95');
                header.classList.remove('bg-white/80');
            } else {
                header.classList.remove('shadow-md');
                header.classList.add('bg-white/80');
            }
        });
    }

    // Toggle Mobile Drawer
    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileDrawer.classList.remove('translate-x-full');
            document.body.classList.add('overflow-hidden');
        });
    }

    if (closeDrawerBtn && mobileDrawer) {
        closeDrawerBtn.addEventListener('click', () => {
            mobileDrawer.classList.add('translate-x-full');
            document.body.classList.remove('overflow-hidden');
        });
    }

    // Highlight active link based on current path
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('text-[#E53935]', 'font-bold');
            link.classList.remove('text-[#414844]');
        }
    });
}

// Update cart counter badges across desktop and mobile nav
function initCartBadge() {
    const updateBadges = () => {
        const count = window.cart ? window.cart.getTotalCount() : 0;
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = count;
            if (count > 0) {
                badge.classList.remove('hidden');
                badge.classList.add('animate-bounce');
                setTimeout(() => badge.classList.remove('animate-bounce'), 600);
            } else {
                badge.classList.add('hidden');
            }
        });
    };

    // Initial update
    updateBadges();

    // Listen for cart changes
    window.addEventListener('cartUpdated', updateBadges);
}

// Back to top floating button
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Inject business footer details from CONFIG constants
function initFooterContent() {
    if (!window.CONFIG) return;

    const addressEl = document.getElementById('footer-address');
    if (addressEl) addressEl.textContent = CONFIG.ADDRESS;

    const phoneEl = document.getElementById('footer-phone');
    if (phoneEl) phoneEl.textContent = CONFIG.PHONE_NUMBER;

    const hoursEl = document.getElementById('footer-hours');
    if (hoursEl) hoursEl.textContent = CONFIG.BUSINESS_HOURS;

    const waBtn = document.getElementById('footer-wa-btn');
    if (waBtn) {
        waBtn.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello ' + CONFIG.BUSINESS_NAME + ', I have an inquiry.')}`;
    }

    const floatingWa = document.getElementById('floating-whatsapp');
    if (floatingWa) {
        floatingWa.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello ' + CONFIG.BUSINESS_NAME + ', I would like to order fresh chicken.')}`;
    }

    // Secret Manager Keyboard Shortcut: Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            window.location.href = 'admin.html';
        }
    });
}
