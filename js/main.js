/**
 * Fresh Chicken - Main UI Controller
 * Handles Navigation, Mobile Drawer, Sticky Navbar, Floating WhatsApp, and Footer Injection.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCartBadge();
    initBackToTop();
    initFooterContent();
    initFloatingWhatsApp();
    initFloatingCartBar();
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

    const instaBtn = document.getElementById('footer-instagram-btn');
    if (instaBtn && CONFIG.INSTAGRAM_URL) {
        instaBtn.href = CONFIG.INSTAGRAM_URL;
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

// Persistent Floating WhatsApp Button
function initFloatingWhatsApp() {
    let floatingWa = document.getElementById('floating-whatsapp');
    if (!floatingWa) {
        floatingWa = document.createElement('a');
        floatingWa.id = 'floating-whatsapp';
        floatingWa.target = '_blank';
        floatingWa.rel = 'noopener noreferrer';
        floatingWa.className = 'fixed bottom-6 right-6 z-40 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all whatsapp-pulse cursor-pointer group';
        floatingWa.setAttribute('aria-label', 'Chat or Order on WhatsApp');
        floatingWa.innerHTML = `
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" class="w-8 h-8 object-contain" />
            <span class="absolute right-16 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
                Order via WhatsApp
            </span>
        `;
        document.body.appendChild(floatingWa);
    }
    const phone = window.CONFIG?.WHATSAPP_NUMBER || '919148699386';
    floatingWa.href = `https://wa.me/${phone}?text=${encodeURIComponent('Hello ' + (window.CONFIG?.BUSINESS_NAME || 'Fresh Chicken') + ', I would like to order fresh chicken.')}`;
}

// Dynamic Sticky Floating Cart Bar across all browsing pages
function initFloatingCartBar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // Do not display on checkout, cart, or admin pages
    if (currentPage === 'checkout.html' || currentPage === 'cart.html' || currentPage === 'admin.html') {
        return;
    }

    let bar = document.getElementById('floating-cart-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'floating-cart-bar';
        bar.className = 'fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-8px_30px_rgba(19,59,44,0.15)] transform translate-y-full opacity-0 pointer-events-none transition-all duration-300';
        document.body.appendChild(bar);
    }

    const renderBar = () => {
        if (!window.cart) return;
        const count = window.cart.getTotalCount();
        const subtotal = window.cart.getSubtotal();
        const isKn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'kn') || (localStorage.getItem('fresh_chicken_lang') === 'kn');
        const freeLimit = window.CONFIG?.FREE_DELIVERY_LIMIT || 999;
        const isFree = subtotal >= freeLimit;
        const totalWeight = window.cart.getTotalWeight();
        const minWeight = window.cart.minOrderWeight || 1.0;
        const isWeightMet = totalWeight >= minWeight;

        if (count > 0) {
            bar.innerHTML = `
                <div class="max-w-5xl mx-auto flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 sm:gap-3">
                        <div class="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-100 text-[#133B2C] rounded-2xl flex items-center justify-center font-black relative flex-shrink-0 shadow-sm">
                            <span class="material-symbols-outlined text-2xl">shopping_bag</span>
                            <span class="absolute -top-1.5 -right-1.5 bg-[#E53935] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow border-2 border-white">${count}</span>
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs text-gray-500 font-bold">${count} ${count === 1 ? 'cut' : 'cuts'} (${totalWeight} Kg)</span>
                                ${isFree ? `
                                    <span class="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full whitespace-nowrap hidden xs:inline">${isKn ? 'ಉಚಿತ ಡೆಲಿವರಿ' : 'FREE Delivery'}</span>
                                ` : ''}
                            </div>
                            <div class="text-base sm:text-lg font-black text-[#133B2C] leading-none mt-0.5">₹${subtotal}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${isWeightMet ? `
                            <a href="checkout.html" class="bg-[#E53935] hover:bg-[#c62828] text-white font-extrabold px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 whitespace-nowrap">
                                <span>${isKn ? `ಆರ್ಡರ್ ಮಾಡಿ (${totalWeight} ಕೆ.ಜಿ)` : `Checkout (${totalWeight} Kg)`}</span>
                                <span class="material-symbols-outlined text-base">arrow_forward</span>
                            </a>
                        ` : `
                            <a href="cart.html" class="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap">
                                <span>${isKn ? `ಕನಿಷ್ಠ 1 ಕೆ.ಜಿ ಅಗತ್ಯ (${totalWeight} ಕೆ.ಜಿ)` : `Min 1 Kg Needed (${totalWeight} Kg)`}</span>
                                <span class="material-symbols-outlined text-base">scale</span>
                            </a>
                        `}
                        <a href="cart.html" class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold p-2.5 sm:px-3 sm:py-3 rounded-2xl text-xs transition-colors flex items-center justify-center" title="${isKn ? 'ಕಾರ್ಟ್ ವೀಕ್ಷಿಸಿ' : 'View Cart'}">
                            <span class="material-symbols-outlined text-xl">shopping_cart</span>
                        </a>
                    </div>
                </div>
            `;
            bar.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
            bar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');

            const btt = document.getElementById('back-to-top');
            if (btt) btt.style.bottom = '84px';
            const floatingWa = document.getElementById('floating-whatsapp');
            if (floatingWa) floatingWa.style.bottom = '84px';
        } else {
            bar.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
            bar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
            const btt = document.getElementById('back-to-top');
            if (btt) btt.style.bottom = '24px';
            const floatingWa = document.getElementById('floating-whatsapp');
            if (floatingWa) floatingWa.style.bottom = '24px';
        }
    };

    renderBar();
    window.addEventListener('cartUpdated', renderBar);
    window.addEventListener('languageChanged', renderBar);
}
