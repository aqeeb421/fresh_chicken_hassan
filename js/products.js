/**
 * Fresh Chicken - Products Page Controller
 * Handles product catalog rendering, search filter, category filter, and quantity handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return; // Only run on pages with products grid

    let activeCategory = 'All';
    let searchQuery = '';
    const quantityMap = {}; // Stores selected quantity per product ID (in 0.5 Kg steps)
    const cutMap = {};      // Stores selected cut preference per product ID
    const QTY_STEP = 0.5;  // Step size in Kg
    const QTY_MIN  = 1;    // Minimum order quantity in Kg

    // Product Names & Descriptions in Kannada
    const PRODUCT_NAMES_KN = {
        'prod-whole-chicken': 'ಚಿಕನ್ (ಚರ್ಮದೊಂದಿಗೆ)',
        'prod-skinless-chicken': 'ಚಿಕನ್ (ಚರ್ಮ ರಹಿತ)',
        'prod-boneless': 'ಬೋನ್ಲೆಸ್ ಚಿಕನ್',
        'prod-wings': 'ಚಿಕನ್ ವಿಂಗ್ಸ್ (ರೆಕ್ಕೆಗಳು)',
        'prod-drumsticks': 'ಚಿಕನ್ ಲೆಗ್ಸ್ (ಕಾಲುಗಳು)',
        'prod-breast-fillet': 'ಚಿಕನ್ ಬ್ರೆಸ್ಟ್ ಫಿಲೆಟ್',
        'prod-mince': 'ಚಿಕನ್ ಖೀಮಾ (ಕೈಮಾ)',
        'prod-lollipop': 'ಚಿಕನ್ ಲಾಲಿಪಾಪ್',
        'prod-liver-special': 'ಚಿಕನ್ ಲಿವರ್ (ಲಿವರ್ & ಗಿಝಾರ್ಡ್)'
    };

    const PRODUCT_DESC_KN = {
        'prod-whole-chicken': 'ಫಾರ್ಮ್‌ನಿಂದ ನೇರವಾಗಿ ತಂದ ಚರ್ಮದೊಂದಿಗಿನ ಸಂಪೂರ್ಣ ತಾಜಾ ಚಿಕನ್. ಸಾಂಪ್ರದಾಯಿಕ ಸಾರು, ಗ್ರೇವಿ ಮತ್ತು ರೋಸ್ಟ್‌ಗೆ ಉತ್ತಮ.',
        'prod-skinless-chicken': 'ಶುಚಿಗೊಳಿಸಿದ, ಕೊಬ್ಬು ರಹಿತ ತಾಜಾ ಚರ್ಮ ರಹಿತ ಚಿಕನ್. ಎಲ್ಲಾ ರೀತಿಯ ಮನೆ ಅಡುಗೆಗೆ ಸಿದ್ಧವಾಗಿದೆ.',
        'prod-boneless': '100% ಮೂಳೆಯಿಲ್ಲದ ಮೃದುವಾದ ಚಿಕನ್ ತುಂಡುಗಳು. ಟಿಕ್ಕಾ, ಚಿಲ್ಲಿ ಚಿಕನ್ ಹಾಗೂ ಫ್ರೈಗೆ ಅತ್ಯುತ್ತಮ.',
        'prod-wings': 'ರಸಭರಿತ ಚಿಕನ್ ವಿಂಗ್ಸ್. ಹಾಟ್ ವಿಂಗ್ಸ್, ಬಾರ್ಬೆಕ್ಯೂ ಮತ್ತು ಗರಿಗರಿಯಾದ ಸ್ನ್ಯಾಕ್ಸ್‌ಗೆ ಹೇಳಿಮಾಡಿಸಿದ್ದು.',
        'prod-drumsticks': 'ಮೂಳೆಯೊಂದಿಗೆ ಕೂಡಿದ ರಸಭರಿತ ಲೆಗ್ ಪೀಸ್‌ಗಳು. ತಂದೂರಿ ಹಾಗೂ ಮಸಾಲಾ ಗ್ರೇವಿಗೆ ಸೂಕ್ತ.',
        'prod-breast-fillet': 'ಹೆಚ್ಚಿನ ಪ್ರೋಟೀನ್ ಹೊಂದಿರುವ ಅತಿ ಮೃದು ಬ್ರೆಸ್ಟ್ ಫಿಲೆಟ್. ಜಿಮ್ ಹಾಗೂ ಫಿಟ್ನೆಸ್ ಪ್ರಿಯರಿಗೆ ಸೂಕ್ತ.',
        'prod-mince': 'ನಯವಾಗಿ ಕತ್ತರಿಸಿದ ತಾಜಾ ಚಿಕನ್ ಖೀಮಾ. ಕಬಾಬ್, ಖೀಮಾ ಗ್ರೇವಿ ಮತ್ತು ಬರ್ಗರ್‌ಗೆ ಹೇಳಿಮಾಡಿಸಿದ್ದು.',
        'prod-lollipop': 'ಫ್ರೆಂಚ್ ಶೈಲಿಯಲ್ಲಿ ಟ್ರಿಮ್ ಮಾಡಿದ ಚಿಕನ್ ಲಾಲಿಪಾಪ್. ಪಾರ್ಟಿ ಸ್ಟಾರ್ಟರ್ಸ್‌ಗೆ ರೆಡಿ.',
        'prod-liver-special': 'ಆರೋಗ್ಯಕರ ಹಾಗೂ ತಾಜಾ ಚಿಕನ್ ಲಿವರ್. ಕಬ್ಬಿಣಾಂಶ ಭರಿತ ಹಾಗೂ ರುಚಿಕರ ಫ್ರೈಗೆ ಸೂಕ್ತ.'
    };

    // Render initial products
    renderProducts();
    updateFreeDeliveryProgress();
    updateStoreStatusBanner();

    // Re-render when language changes
    window.addEventListener('languageChanged', () => {
        renderProducts();
        updateFreeDeliveryProgress();
        updateStoreStatusBanner();
    });

    // Re-render when real-time cloud prices are received from Firebase
    window.addEventListener('pricesUpdatedRealtime', () => {
        renderProducts();
    });

    // Update progress bar on cart changes
    window.addEventListener('cartUpdated', () => {
        updateFreeDeliveryProgress();
    });

    // Update Store Status Banner
    function updateStoreStatusBanner() {
        const textEl = document.getElementById('store-status-text');
        const bannerEl = document.getElementById('store-status-banner');
        if (!textEl || !window.CONFIG) return;

        const isKn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'kn') || (localStorage.getItem('fresh_chicken_lang') === 'kn');
        const info = window.CONFIG.getStoreStatusInfo ? window.CONFIG.getStoreStatusInfo() : { isOpen: true };
        if (info.isOpen) {
            textEl.innerHTML = isKn ? 
                `🟢 <strong>ಅಂಗಡಿ ತೆರೆದಿದೆ</strong> (ಬೆಳಿಗ್ಗೆ 9:00 - ರಾತ್ರಿ 8:00) • 30-45 ನಿಮಿಷಗಳಲ್ಲಿ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಡೆಲಿವರಿ` :
                `🟢 <strong>Open Now</strong> (9:00 AM - 8:00 PM) • Express Delivery in 30-45 Mins`;
            if (bannerEl) {
                bannerEl.className = 'bg-emerald-50 border border-emerald-200 text-emerald-950 px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-sm text-xs font-semibold';
            }
        } else {
            textEl.innerHTML = isKn ?
                `🌙 <strong>ಅಂಗಡಿ ಮುಚ್ಚಿದೆ (ಬೆಳಿಗ್ಗೆ 9:00 ಕ್ಕೆ ತೆರೆಯುತ್ತದೆ)</strong> • ಮುಂಜಾನೆ 9:00 ರ ಡೆಲಿವರಿಗೆ ಈಗಲೇ ಮುಂಗಡ ಆರ್ಡರ್ ಮಾಡಿ` :
                `🌙 <strong>Store Closed (Opens 9:00 AM)</strong> • Pre-order now for 9:00 AM morning fresh delivery`;
            if (bannerEl) {
                bannerEl.className = 'bg-amber-50 border border-amber-200 text-amber-950 px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-sm text-xs font-semibold';
            }
        }
    }

    // Dynamic Free Delivery Progress Bar Updater
    function updateFreeDeliveryProgress() {
        const statusText = document.getElementById('progress-status-text');
        const percentText = document.getElementById('progress-percentage-text');
        const fillBar = document.getElementById('progress-bar-fill');

        if (!statusText || !percentText || !fillBar || !window.cart) return;

        const isKn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'kn') || (localStorage.getItem('fresh_chicken_lang') === 'kn');
        const subtotal = window.cart.getSubtotal();
        const limit = window.CONFIG?.FREE_DELIVERY_LIMIT || 500;
        const percentage = Math.min(100, Math.round((subtotal / limit) * 100));

        fillBar.style.width = `${percentage}%`;
        percentText.textContent = `${percentage}%`;

        if (subtotal >= limit) {
            statusText.innerHTML = isKn ? `
                <span class="material-symbols-outlined text-base text-emerald-600">verified</span>
                <span class="text-emerald-700">🎉 ಅಭಿನಂದನೆಗಳು! ನಿಮಗೆ <strong>ಉಚಿತ ಹೋಮ್ ಡೆಲಿವರಿ</strong> ಲಭ್ಯವಾಗಿದೆ!</span>
            ` : `
                <span class="material-symbols-outlined text-base text-emerald-600">verified</span>
                <span class="text-emerald-700">🎉 Congratulations! You unlocked <strong>FREE Doorstep Delivery</strong>!</span>
            `;
            fillBar.className = 'bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm';
            percentText.className = 'text-emerald-600 font-extrabold';
        } else if (subtotal > 0) {
            const diff = limit - subtotal;
            statusText.innerHTML = isKn ? `
                <span class="material-symbols-outlined text-base text-emerald-600">local_shipping</span>
                <span><strong>ಉಚಿತ ಡೆಲಿವರಿಗೆ</strong> ಇನ್ನೂ <strong>₹${diff}</strong> ಮೊತ್ತದ ಚಿಕನ್ ಸೇರಿಸಿ!</span>
            ` : `
                <span class="material-symbols-outlined text-base text-emerald-600">local_shipping</span>
                <span>Add <strong>₹${diff}</strong> more chicken for <strong>FREE Delivery</strong>!</span>
            `;
            fillBar.className = 'bg-gradient-to-r from-[#133B2C] to-emerald-500 h-full rounded-full transition-all duration-500';
            percentText.className = 'text-[#133B2C] font-bold';
        } else {
            statusText.innerHTML = isKn ? `
                <span class="material-symbols-outlined text-base text-gray-500">local_shipping</span>
                <span class="text-gray-600">₹<strong>${limit}</strong> ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ಮನೆ ಬಾಗಿಲಿಗೆ ಡೆಲಿವರಿ</span>
            ` : `
                <span class="material-symbols-outlined text-base text-gray-500">local_shipping</span>
                <span class="text-gray-600">Free Doorstep Delivery on orders above <strong>₹${limit}</strong></span>
            `;
            fillBar.className = 'bg-gray-300 h-full rounded-full transition-all duration-500';
            percentText.className = 'text-gray-400 font-bold';
        }
    }

    // Category Chips Filter
    const categoryChips = document.querySelectorAll('.category-chip');
    categoryChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            categoryChips.forEach(c => {
                c.classList.remove('bg-[#133B2C]', 'text-white');
                c.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-100');
            });

            chip.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-100');
            chip.classList.add('bg-[#133B2C]', 'text-white');

            activeCategory = chip.dataset.category || 'All';
            renderProducts();
        });
    });

    // Search Input Filter
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderProducts();
        });
    }

    // Render filtered products
    function renderProducts() {
        const isKn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'kn') || (localStorage.getItem('fresh_chicken_lang') === 'kn');

        const filtered = PRODUCTS.filter(product => {
            const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                                  product.description.toLowerCase().includes(searchQuery) ||
                                  (PRODUCT_NAMES_KN[product.id] && PRODUCT_NAMES_KN[product.id].includes(searchQuery));
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-300 mb-3">search_off</span>
                    <h3 class="text-xl font-bold text-[#133B2C] mb-1">${isKn ? 'ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No products found'}</h3>
                    <p class="text-gray-500">${isKn ? 'ದಯವಿಟ್ಟು ಹುಡುಕಾಟ ಅಥವಾ ವರ್ಗವನ್ನು ಬದಲಾಯಿಸಿ.' : 'Try adjusting your search query or category filter.'}</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filtered.map(product => {
            const currentQty = quantityMap[product.id] || QTY_MIN;
            const activeCut = cutMap[product.id] || 'Curry Cut';
            const mktPrice = product.marketPricePerKg || (product.pricePerKg + 20);
            const savings = mktPrice - product.pricePerKg;

            const displayName = (isKn && PRODUCT_NAMES_KN[product.id]) ? PRODUCT_NAMES_KN[product.id] : product.name;
            const displayDesc = (isKn && PRODUCT_DESC_KN[product.id]) ? PRODUCT_DESC_KN[product.id] : product.description;

            return `
                <div class="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_24px_rgba(19,59,44,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(19,59,44,0.12)] transition-all duration-300 flex flex-col h-full group">
                    <!-- Image Container -->
                    <div class="relative w-full aspect-square overflow-hidden bg-gray-50">
                        <img src="${product.image}" alt="${displayName}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80';" />
                        ${product.badge ? `<span class="absolute top-4 left-4 bg-[#E53935] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">${isKn && window.t ? window.t(product.badge.toLowerCase().replace(/\s+/g, '_'), product.badge) : product.badge}</span>` : ''}
                        ${savings > 0 ? `<span class="absolute top-4 right-4 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">${isKn ? `₹${savings}/ಕೆ.ಜಿ ಉಳಿತಾಯ` : `Save ₹${savings}/Kg`}</span>` : ''}
                        <span class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-[#133B2C] text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200">
                            ${isKn ? 'ದಾಸ್ತಾನು ಲಭ್ಯವಿದೆ (ದಿನವೂ ತಾಜಾ)' : product.stockStatus}
                        </span>
                    </div>

                    <!-- Card Body -->
                    <div class="p-6 flex flex-col flex-grow justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-bold text-lg text-gray-900 leading-snug group-hover:text-[#133B2C] transition-colors">${displayName}</h3>
                            </div>
                            <p class="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">${displayDesc}</p>
                        </div>

                        <div>
                            <!-- DUAL PRICE BOX (Market Rate COT vs Our Best Price) -->
                            <div class="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 mb-3 space-y-1">
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-gray-500 font-medium">${isKn ? 'ಮಾರುಕಟ್ಟೆ ದರ (COT):' : 'Market Price (COT):'}</span>
                                    <span class="line-through text-gray-400 font-bold">₹${mktPrice} / ${isKn ? '1 ಕೆ.ಜಿ' : product.unit}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-[#133B2C] flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm text-emerald-600">verified</span>
                                        ${isKn ? 'ನಮ್ಮ ಉತ್ತಮ ಬೆಲೆ:' : 'Our Best Price:'}
                                    </span>
                                    <span class="text-2xl font-black text-[#133B2C]">₹${product.pricePerKg} <span class="text-xs text-gray-500 font-normal">/ ${isKn ? '1 ಕೆ.ಜಿ' : product.unit}</span></span>
                                </div>
                            </div>

                            <!-- CUT PREFERENCE SELECTION CHIPS (Only for Whole & Skinless Chicken) -->
                            ${(product.allowCutPreferences || product.id === 'prod-whole-chicken' || product.id === 'prod-skinless-chicken') ? `
                                <div class="mb-4">
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span class="text-[11px] font-bold text-gray-700 uppercase tracking-wider">${isKn ? 'ಕಟಿಂಗ್ ಶೈಲಿ:' : 'Cut & Prep Style:'}</span>
                                        <span class="text-[11px] text-emerald-800 font-extrabold bg-emerald-100/70 px-2 py-0.5 rounded-md" id="cut-label-${product.id}">${activeCut}</span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-1.5" data-product-id="${product.id}">
                                        <button type="button" class="cut-chip text-[11px] py-1.5 px-2 rounded-xl font-semibold border text-center transition-all ${activeCut === 'Curry Cut' ? 'bg-[#133B2C] text-white border-[#133B2C] shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}" data-id="${product.id}" data-cut="Curry Cut">
                                            ${isKn ? '🥘 ಸಾರು ಕಟ್' : '🥘 Curry Cut'}
                                        </button>
                                        <button type="button" class="cut-chip text-[11px] py-1.5 px-2 rounded-xl font-semibold border text-center transition-all ${activeCut === 'Biryani Cut' ? 'bg-[#133B2C] text-white border-[#133B2C] shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}" data-id="${product.id}" data-cut="Biryani Cut">
                                            ${isKn ? '🍗 ಬಿರಿಯಾನಿ ಕಟ್' : '🍗 Biryani Cut'}
                                        </button>
                                        <button type="button" class="cut-chip text-[11px] py-1.5 px-2 rounded-xl font-semibold border text-center transition-all ${activeCut === 'Fry Cut' ? 'bg-[#133B2C] text-white border-[#133B2C] shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}" data-id="${product.id}" data-cut="Fry Cut">
                                            ${isKn ? '🍳 ಫ್ರೈ ಕಟ್' : '🍳 Fry Cut'}
                                        </button>
                                        <button type="button" class="cut-chip text-[11px] py-1.5 px-2 rounded-xl font-semibold border text-center transition-all ${activeCut === 'Standard Cut' ? 'bg-[#133B2C] text-white border-[#133B2C] shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}" data-id="${product.id}" data-cut="Standard Cut">
                                            ${isKn ? '🔪 ಸಾಮಾನ್ಯ ಕಟ್' : '🔪 Standard'}
                                        </button>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Quantity & Add to Cart Controls -->
                            <div class="flex items-center gap-3">
                                <!-- Quantity Controller -->
                                <div class="flex items-center border border-gray-200 rounded-xl bg-gray-50/80 p-1">
                                    <button class="qty-btn-minus w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors" data-id="${product.id}">
                                        <span class="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <input
                                        type="number"
                                        class="qty-input w-14 text-center font-bold text-sm text-[#133B2C] bg-transparent border-none outline-none appearance-none"
                                        id="qty-val-${product.id}"
                                        data-price="${product.pricePerKg}"
                                        value="${currentQty}"
                                        min="${QTY_MIN}"
                                        step="0.5"
                                        aria-label="Quantity in Kg"
                                    />
                                    <button class="qty-btn-plus w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors" data-id="${product.id}">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>

                                <!-- Add to Cart Button -->
                                <button class="add-to-cart-btn flex-1 bg-[#133B2C] hover:bg-[#0b251b] text-white py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all" data-id="${product.id}">
                                    <span class="material-symbols-outlined text-base">add_shopping_cart</span>
                                    <span>${isKn ? `${currentQty} ಕೆ.ಜಿ ಸೇರಿಸಿ • ₹${Math.round(product.pricePerKg * currentQty * 100) / 100}` : `Add ${currentQty} Kg • ₹${Math.round(product.pricePerKg * currentQty * 100) / 100}`}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        attachProductEventListeners();
        renderComingSoonSection();
    }

    // Render Coming Soon Section
    function renderComingSoonSection() {
        const comingSoonGrid = document.getElementById('coming-soon-grid');
        if (!comingSoonGrid || !window.COMING_SOON_PRODUCTS) return;

        comingSoonGrid.innerHTML = window.COMING_SOON_PRODUCTS.map(item => `
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-amber-200/60 shadow-sm flex flex-col h-full relative group">
                <span class="absolute top-4 left-4 z-10 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                    ${item.badge}
                </span>

                <div class="relative w-full aspect-video overflow-hidden bg-amber-50/50">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" loading="lazy" />
                </div>

                <div class="p-6 flex flex-col justify-between flex-grow">
                    <div>
                        <h4 class="font-bold text-lg text-gray-900 mb-1">${item.name}</h4>
                        <p class="text-gray-500 text-xs leading-relaxed mb-4">${item.description}</p>
                    </div>

                    <div class="pt-3 border-t border-amber-100 flex items-center justify-between">
                        <span class="text-xs font-semibold text-amber-700 flex items-center gap-1">
                            <span class="material-symbols-outlined text-base">hourglass_top</span>
                            Launching Soon
                        </span>
                        <button onclick="alert('Thank you! We will notify you when ${item.name} is available in stock.')" class="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors">
                            Notify Me
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update quantity display and live price preview on the product card
    function updateQtyDisplay(id) {
        const qty = quantityMap[id] || QTY_MIN;

        // Update the input field value
        const input = document.getElementById(`qty-val-${id}`);
        if (input) {
            const price = parseFloat(input.dataset.price) || 0;
            input.value = qty;

            // Update the "Add X Kg • ₹Y" button label
            const btn = document.querySelector(`.add-to-cart-btn[data-id="${id}"] span:last-child`);
            if (btn) {
                const total = Math.round(price * qty * 100) / 100;
                btn.textContent = `Add ${qty} Kg \u2022 \u20B9${total}`;
            }
        }
    }

    // Validate and snap a raw value to nearest 0.5 Kg, clamped to QTY_MIN
    function sanitizeQty(raw) {
        let val = parseFloat(raw);
        if (isNaN(val) || val < QTY_MIN) val = QTY_MIN;
        // Snap to nearest 0.5
        val = Math.round(val * 2) / 2;
        if (val < QTY_MIN) val = QTY_MIN;
        return val;
    }

    // Attach +/- and Add to Cart event handlers
    function attachProductEventListeners() {
        // Cut Preference Chips
        document.querySelectorAll('.cut-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const productId = chip.dataset.id;
                const selectedCut = chip.dataset.cut;
                cutMap[productId] = selectedCut;

                // Update active button styles for this product
                const siblings = chip.parentElement.querySelectorAll('.cut-chip');
                siblings.forEach(s => {
                    s.classList.remove('bg-[#133B2C]', 'text-white', 'border-[#133B2C]', 'shadow-sm');
                    s.classList.add('bg-gray-50', 'text-gray-700', 'hover:bg-gray-100', 'border-gray-200');
                });

                chip.classList.remove('bg-gray-50', 'text-gray-700', 'hover:bg-gray-100', 'border-gray-200');
                chip.classList.add('bg-[#133B2C]', 'text-white', 'border-[#133B2C]', 'shadow-sm');

                const label = document.getElementById(`cut-label-${productId}`);
                if (label) label.textContent = selectedCut;
            });
        });

        // Minus Button
        document.querySelectorAll('.qty-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                let current = quantityMap[id] || QTY_MIN;
                if (current > QTY_MIN) {
                    quantityMap[id] = Math.round((current - QTY_STEP) * 10) / 10;
                    updateQtyDisplay(id);
                }
            });
        });

        // Plus Button
        document.querySelectorAll('.qty-btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                let current = quantityMap[id] || QTY_MIN;
                quantityMap[id] = Math.round((current + QTY_STEP) * 10) / 10;
                updateQtyDisplay(id);
            });
        });

        // Manual Input — validate on blur and Enter key
        document.querySelectorAll('.qty-input').forEach(input => {
            const id = input.id.replace('qty-val-', '');

            // Commit on blur (user clicks away)
            input.addEventListener('blur', () => {
                quantityMap[id] = sanitizeQty(input.value);
                updateQtyDisplay(id);
            });

            // Commit on Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });

            // Live button label as user types
            input.addEventListener('input', () => {
                const raw = parseFloat(input.value);
                const price = parseFloat(input.dataset.price) || 0;
                if (!isNaN(raw) && raw > 0) {
                    const btn = document.querySelector(`.add-to-cart-btn[data-id="${id}"] span:last-child`);
                    if (btn) {
                        const total = Math.round(price * raw * 100) / 100;
                        btn.textContent = `Add ${raw} Kg \u2022 \u20B9${total}`;
                    }
                }
            });
        });

        // Add to Cart Button
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                // Commit any typed value before adding
                const input = document.getElementById(`qty-val-${id}`);
                if (input) {
                    quantityMap[id] = sanitizeQty(input.value);
                    updateQtyDisplay(id);
                }
                const qty = quantityMap[id] || QTY_MIN;
                const prod = PRODUCTS.find(p => p.id === id);
                const allowsCut = prod && (prod.allowCutPreferences || prod.id === 'prod-whole-chicken' || prod.id === 'prod-skinless-chicken');
                const cutType = allowsCut ? (cutMap[id] || 'Curry Cut') : null;
                if (window.cart) {
                    window.cart.addItem(id, qty, cutType);
                }
            });
        });
    }
});

// Dynamic Home Promotional Banner Slider Controller
function renderDynamicHomeBanners() {
    const container = document.getElementById('home-dynamic-banners-container');
    if (!container || !window.bannersEngine) return;

    const banners = window.bannersEngine.getActiveBanners();
    if (!banners || banners.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    let currentSlide = 0;

    function renderSlide(index) {
        const b = banners[index];
        if (!b) return;

        container.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="bg-gradient-to-r from-[#133B2C] via-[#1a4a38] to-[#0b251b] rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl overflow-hidden relative min-h-[200px] flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500">
                    
                    ${b.image ? `
                        <div class="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none" style="background-image: url('${b.image}');"></div>
                    ` : ''}

                    <div class="max-w-2xl space-y-3 relative z-10 text-left">
                        ${b.badge ? `
                            <span class="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-400 text-amber-950 rounded-full text-xs font-black uppercase tracking-widest shadow-md">
                                <span class="material-symbols-outlined text-sm">campaign</span>
                                ${b.badge}
                            </span>
                        ` : ''}

                        ${b.title ? `
                            <h3 class="text-2xl sm:text-3xl font-black text-white leading-tight">
                                ${b.title}
                            </h3>
                        ` : ''}

                        ${b.description ? `
                            <p class="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                                ${b.description}
                            </p>
                        ` : ''}
                    </div>

                    <div class="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                        ${b.image ? `
                            <img src="${b.image}" alt="${b.title || 'Offer Banner'}" class="w-36 h-24 sm:w-48 sm:h-32 rounded-2xl object-cover border-2 border-white/20 shadow-xl" onerror="this.style.display='none'" />
                        ` : ''}

                        <a href="${b.linkUrl || 'products.html'}" class="w-full sm:w-auto bg-[#E53935] hover:bg-[#c62828] text-white px-6 py-3.5 rounded-2xl font-black text-xs shadow-xl hover:shadow-2xl transition-all whitespace-nowrap flex items-center justify-center gap-2">
                            <span>${b.linkText || 'Order Now'}</span>
                            <span class="material-symbols-outlined text-base">arrow_forward</span>
                        </a>
                    </div>
                </div>

                ${banners.length > 1 ? `
                    <div class="flex items-center justify-center gap-2 mt-4">
                        ${banners.map((_, i) => `
                            <button onclick="switchBannerSlide(${i})" class="h-2.5 rounded-full transition-all ${i === index ? 'bg-emerald-400 w-8' : 'bg-gray-700 w-2.5 hover:bg-gray-500'}"></button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    window.switchBannerSlide = function(i) {
        currentSlide = i;
        renderSlide(currentSlide);
    };

    renderSlide(currentSlide);

    if (banners.length > 1) {
        if (window.bannerSlideInterval) clearInterval(window.bannerSlideInterval);
        window.bannerSlideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % banners.length;
            renderSlide(currentSlide);
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderDynamicHomeBanners();
});

window.addEventListener('bannersUpdated', () => {
    renderDynamicHomeBanners();
});

