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
    const QTY_MIN  = 0.5;  // Minimum order quantity in Kg (supports 500g portions)

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
        const limit = window.CONFIG?.FREE_DELIVERY_LIMIT || 999;
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
                        <img src="${product.image}" alt="${displayName}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="if(this.src&&this.src.indexOf('?')!==-1){this.src=this.src.split('?')[0];}else{this.onerror=null;this.src='assets/images/with-skin-chicken.png';}" />
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

                            <!-- QUICK WEIGHT SELECTION CHIPS (0.5, 1, 1.5, 2 Kg) -->
                            <div class="mb-3">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="text-[11px] font-bold text-gray-700 uppercase tracking-wider">${isKn ? 'ತೂಕ ಆಯ್ಕೆ:' : 'Select Weight:'}</span>
                                    <span class="text-[11px] text-emerald-800 font-extrabold bg-emerald-100/70 px-2 py-0.5 rounded-md" id="weight-label-${product.id}">${currentQty === 0.5 ? (isKn ? '0.5 ಕೆ.ಜಿ (500 ಗ್ರಾಂ)' : '0.5 Kg (500g)') : `${currentQty} Kg`}</span>
                                </div>
                                <div class="grid grid-cols-4 gap-1.5">
                                    ${[0.5, 1, 1.5, 2].map(w => `
                                        <button type="button" class="weight-chip text-[11px] py-1 px-1 rounded-xl font-bold border text-center transition-all ${currentQty === w ? 'bg-[#133B2C] text-white border-[#133B2C] shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}" data-id="${product.id}" data-weight="${w}">
                                            ${w === 0.5 ? '500g' : `${w} Kg`}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Quantity & Add to Cart Controls -->
                            <div class="flex items-center gap-2">
                                <!-- Quantity Controller -->
                                <div class="flex items-center border border-gray-200 rounded-xl bg-gray-50/80 p-0.5">
                                    <button class="qty-btn-minus w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors" data-id="${product.id}" aria-label="Decrease quantity">
                                        <span class="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <input
                                        type="number"
                                        class="qty-input w-12 text-center font-bold text-xs text-[#133B2C] bg-transparent border-none outline-none appearance-none"
                                        id="qty-val-${product.id}"
                                        data-price="${product.pricePerKg}"
                                        value="${currentQty}"
                                        min="${QTY_MIN}"
                                        step="0.5"
                                        aria-label="Quantity in Kg"
                                    />
                                    <button class="qty-btn-plus w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors" data-id="${product.id}" aria-label="Increase quantity">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>

                                <!-- Add to Cart Button -->
                                <button class="add-to-cart-btn flex-1 bg-[#133B2C] hover:bg-[#0b251b] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer" data-id="${product.id}">
                                    <span class="material-symbols-outlined text-base">add_shopping_cart</span>
                                    <span>${isKn ? `ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ • ₹${Math.round(product.pricePerKg * currentQty * 100) / 100}` : `Add to Cart • ₹${Math.round(product.pricePerKg * currentQty * 100) / 100}`}</span>
                                </button>
                            </div>

                            <!-- 1-Click WhatsApp Quick Order -->
                            <button type="button" class="quick-order-btn w-full bg-[#25D366] hover:bg-[#1ebd59] text-white py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all mt-2 cursor-pointer" data-id="${product.id}">
                                <span class="material-symbols-outlined text-base">chat</span>
                                <span>${isKn ? '⚡ ನೇರ WhatsApp ಆರ್ಡರ್ (1-ಕ್ಲಿಕ್)' : '⚡ 1-Click WhatsApp Order'}</span>
                            </button>
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

        const isKn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'kn') || (localStorage.getItem('fresh_chicken_lang') === 'kn');

        const knTranslations = {
            'cs-nati-koli': {
                name: 'ನಾಟಿ ಕೋಳಿ (Nati Koli)',
                desc: 'ನೈಸರ್ಗಿಕ ನಾಟಿ ಕೋಳಿ ಮಾಂಸ. ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕದ ನೈಜ ರುಚಿ ಮತ್ತು ಆರೋಗ್ಯಕರ ಪೋಷಕಾಂಶಗಳು.'
            },
            'cs-nati-koli-eggs': {
                name: 'ನಾಟಿ ಕೋಳಿ ಮೊಟ್ಟೆಗಳು',
                desc: '100% ನೈಸರ್ಗಿಕ, ಫಾರ್ಮ್ ನಾಟಿ ಕೋಳಿ ಮೊಟ್ಟೆಗಳು. ಅಧಿಕ ಪ್ರೋಟೀನ್ ಮತ್ತು ವಿಟಮಿನ್‌ಗಳಿಂದ ಸಮೃದ್ಧ.'
            },
            'cs-fresh-fish': {
                name: 'ತಾಜಾ ಮೀನು (River & Sea Fish)',
                desc: 'ಸ್ವಚ್ಛಗೊಳಿಸಿದ, ಮಾಪಕ ರಹಿತ ಮತ್ತು ತಾಜಾ ಕಟ್ ಮಾಡಿದ ಪ್ರೀಮಿಯಂ ಮೀನುಗಳು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ.'
            }
        };

        comingSoonGrid.innerHTML = window.COMING_SOON_PRODUCTS.map(item => {
            const trans = isKn && knTranslations[item.id] ? knTranslations[item.id] : null;
            const displayName = trans ? trans.name : item.name;
            const displayDesc = trans ? trans.desc : item.description;
            const badgeText = isKn ? 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ' : item.badge;
            const launchingSoonText = isKn ? 'ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ' : 'Launching Soon';
            const notifyBtnText = isKn ? 'ತಿಳಿಸಿ (Notify Me)' : 'Notify Me';
            const alertMsg = isKn 
                ? `ಧನ್ಯವಾದಗಳು! ${displayName} ದಾಸ್ತಾನು ಬಂದಾಗ ನಾವು ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ.`
                : `Thank you! We will notify you when ${displayName} is available in stock.`;

            return `
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-amber-200/60 shadow-sm flex flex-col h-full relative group hover:border-amber-400/50 transition-all hover:shadow-md">
                <span class="absolute top-4 left-4 z-10 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                    ${badgeText}
                </span>

                <div class="relative w-full aspect-video overflow-hidden bg-amber-50/50">
                    <img src="${item.image}" alt="${displayName}" class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" loading="lazy" onerror="this.onerror=null;this.src='assets/images/with-skin-chicken.png';" />
                </div>

                <div class="p-6 flex flex-col justify-between flex-grow">
                    <div>
                        <h4 class="font-bold text-lg text-gray-900 mb-1">${displayName}</h4>
                        <p class="text-gray-500 text-xs leading-relaxed mb-4">${displayDesc}</p>
                    </div>

                    <div class="pt-3 border-t border-amber-100 flex items-center justify-between">
                        <span class="text-xs font-semibold text-amber-700 flex items-center gap-1">
                            <span class="material-symbols-outlined text-base">hourglass_top</span>
                            ${launchingSoonText}
                        </span>
                        <button onclick="alert('${alertMsg}')" class="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors">
                            ${notifyBtnText}
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // Update quantity display and live price preview on the product card
    function updateQtyDisplay(id) {
        const qty = quantityMap[id] || QTY_MIN;
        const isKn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'kn') || (localStorage.getItem('fresh_chicken_lang') === 'kn');

        // Update the input field value
        const input = document.getElementById(`qty-val-${id}`);
        if (input) {
            const price = parseFloat(input.dataset.price) || 0;
            input.value = qty;

            const weightLabel = document.getElementById(`weight-label-${id}`);
            if (weightLabel) {
                weightLabel.textContent = qty === 0.5 ? (isKn ? '0.5 ಕೆ.ಜಿ (500 ಗ್ರಾಂ)' : '0.5 Kg (500g)') : `${qty} Kg`;
            }

            // Update the "Add to Cart • ₹Y" button label
            const btn = document.querySelector(`.add-to-cart-btn[data-id="${id}"] span:last-child`);
            if (btn) {
                const total = Math.round(price * qty * 100) / 100;
                btn.textContent = isKn ? `ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ • ₹${total}` : `Add to Cart • ₹${total}`;
            }

            // Update active state of weight chips
            const card = input.closest('.bg-white');
            if (card) {
                card.querySelectorAll('.weight-chip').forEach(chip => {
                    const w = parseFloat(chip.dataset.weight);
                    if (w === qty) {
                        chip.classList.remove('bg-gray-50', 'text-gray-700', 'border-gray-200');
                        chip.classList.add('bg-[#133B2C]', 'text-white', 'border-[#133B2C]', 'shadow-sm');
                    } else {
                        chip.classList.remove('bg-[#133B2C]', 'text-white', 'border-[#133B2C]', 'shadow-sm');
                        chip.classList.add('bg-gray-50', 'text-gray-700', 'border-gray-200');
                    }
                });
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

        // Quick Weight Chips (0.5, 1, 1.5, 2 Kg)
        document.querySelectorAll('.weight-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const id = chip.dataset.id;
                const weight = parseFloat(chip.dataset.weight);
                if (!isNaN(weight)) {
                    quantityMap[id] = weight;
                    updateQtyDisplay(id);
                }
            });
        });

        // Minus Button
        document.querySelectorAll('.qty-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                let current = quantityMap[id] || 1;
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
                let current = quantityMap[id] || 1;
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
                        btn.textContent = `Add to Cart \u2022 \u20B9${total}`;
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
                const qty = quantityMap[id] || 1;
                const prod = PRODUCTS.find(p => p.id === id);
                const allowsCut = prod && (prod.allowCutPreferences || prod.id === 'prod-whole-chicken' || prod.id === 'prod-skinless-chicken');
                const cutType = allowsCut ? (cutMap[id] || 'Curry Cut') : null;
                if (window.cart) {
                    window.cart.addItem(id, qty, cutType);
                }
            });
        });

        // Quick WhatsApp 1-Click Order Button
        document.querySelectorAll('.quick-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                handleQuickOrder(id);
            });
        });
    }

    // Quick 1-Click WhatsApp Order Handler
    function handleQuickOrder(id) {
        const input = document.getElementById(`qty-val-${id}`);
        if (input) {
            quantityMap[id] = sanitizeQty(input.value);
            updateQtyDisplay(id);
        }
        let qty = quantityMap[id] || 1;
        if (qty < 1.0) {
            qty = 1.0;
            quantityMap[id] = 1.0;
            updateQtyDisplay(id);
            if (window.cart && window.cart.showToast) {
                window.cart.showToast('Minimum delivery weight is 1.0 Kg (set to 1.0 Kg)', 'info');
            }
        }
        const prod = PRODUCTS.find(p => p.id === id);
        if (!prod) return;

        const allowsCut = prod && (prod.allowCutPreferences || prod.id === 'prod-whole-chicken' || prod.id === 'prod-skinless-chicken');
        const cutType = allowsCut ? (cutMap[id] || 'Curry Cut') : null;
        
        // Exact pricing breakdown
        const subtotal = Math.round(prod.pricePerKg * qty * 100) / 100;
        const freeLimit = window.CONFIG?.FREE_DELIVERY_LIMIT || 999;
        const deliveryRate = window.CONFIG?.DELIVERY_CHARGE !== undefined ? window.CONFIG.DELIVERY_CHARGE : 40;
        const deliveryCharge = subtotal >= freeLimit ? 0 : deliveryRate;
        const grandTotal = Math.round((subtotal + deliveryCharge) * 100) / 100;

        let savedProfile = null;
        try {
            const stored = localStorage.getItem('fresh_chicken_customer_profile');
            if (stored) savedProfile = JSON.parse(stored);
        } catch(e) {}

        if (savedProfile && savedProfile.name && (savedProfile.area || savedProfile.street)) {
            // Direct launch with saved address!
            sendDirectWhatsAppOrder({
                prodName: prod.name,
                qty: qty,
                cutType: cutType,
                subtotal: subtotal,
                deliveryCharge: deliveryCharge,
                grandTotal: grandTotal,
                name: savedProfile.name,
                phone: savedProfile.phone || '',
                address: [savedProfile.street, savedProfile.area, 'Hassan'].filter(Boolean).join(', ')
            });
        } else {
            // Show clean 2-field modal
            showQuickOrderModal(prod, qty, cutType, subtotal, deliveryCharge, grandTotal);
        }
    }

    // Modal for 1-Click Quick Order
    function showQuickOrderModal(prod, qty, cutType, subtotal, deliveryCharge, grandTotal) {
        // Fallback calculations for safety
        const sTotal = typeof subtotal === 'number' ? subtotal : Math.round(prod.pricePerKg * qty * 100) / 100;
        const freeLimit = window.CONFIG?.FREE_DELIVERY_LIMIT || 999;
        const deliveryRate = window.CONFIG?.DELIVERY_CHARGE !== undefined ? window.CONFIG.DELIVERY_CHARGE : 40;
        const dCharge = typeof deliveryCharge === 'number' ? deliveryCharge : (sTotal >= freeLimit ? 0 : deliveryRate);
        const gTotal = typeof grandTotal === 'number' ? grandTotal : Math.round((sTotal + dCharge) * 100) / 100;

        let modal = document.getElementById('quick-order-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quick-order-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
            document.body.appendChild(modal);
        }

        const cutText = cutType ? ` • ${cutType}` : '';
        const isKn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'kn') || (localStorage.getItem('fresh_chicken_lang') === 'kn');

        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-gray-100 relative">
                <button type="button" onclick="document.getElementById('quick-order-modal').classList.add('hidden')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer">
                    <span class="material-symbols-outlined text-2xl">close</span>
                </button>
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-9 h-9 rounded-xl bg-emerald-100 text-[#133B2C] flex items-center justify-center font-bold">
                        <span class="material-symbols-outlined text-xl">electric_bolt</span>
                    </div>
                    <div>
                        <h3 class="font-black text-base text-[#133B2C]">${isKn ? 'ತ್ವರಿತ WhatsApp ಆರ್ಡರ್' : 'Quick WhatsApp Order'}</h3>
                        <p class="text-[11px] text-gray-500 font-semibold">${isKn ? 'ಯಾವುದೇ ಖಾತೆ ಅಥವಾ ನೋಂದಣಿ ಅಗತ್ಯವಿಲ್ಲ' : 'No complex forms needed'}</p>
                    </div>
                </div>

                <!-- Item preview & pricing pill with full delivery breakdown -->
                <div class="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 mb-4">
                    <div class="flex items-center justify-between pb-2.5 border-b border-emerald-100">
                        <div class="flex items-center gap-2.5">
                            <img src="${prod.image}" alt="${prod.name}" class="w-10 h-10 rounded-xl object-cover border border-emerald-200" onerror="if(this.src&&this.src.indexOf('?')!==-1){this.src=this.src.split('?')[0];}else{this.onerror=null;this.src='assets/images/with-skin-chicken.png';}" />
                            <div>
                                <div class="font-extrabold text-xs text-[#133B2C]">${prod.name}</div>
                                <div class="text-[11px] text-emerald-800 font-bold">${qty} Kg${cutText}</div>
                            </div>
                        </div>
                        <div class="font-bold text-xs text-gray-700">₹${sTotal}</div>
                    </div>
                    <div class="pt-2 text-[11px] space-y-1">
                        <div class="flex items-center justify-between text-gray-600">
                            <span>${isKn ? 'ಉತ್ಪನ್ನ ಬೆಲೆ' : 'Item Subtotal'}:</span>
                            <span class="font-semibold text-gray-800">₹${sTotal}</span>
                        </div>
                        <div class="flex items-center justify-between text-gray-600">
                            <span>${isKn ? 'ಮನೆ ಬಾಗಿಲಿಗೆ ಡೆಲಿವರಿ ಶುಲ್ಕ' : 'Delivery Charge'}:</span>
                            <span class="font-bold ${dCharge === 0 ? 'text-emerald-700' : 'text-gray-800'}">${dCharge === 0 ? (isKn ? 'ಉಚಿತ (FREE)' : 'FREE') : '₹' + dCharge}</span>
                        </div>
                        <div class="flex items-center justify-between font-black text-xs text-[#133B2C] pt-1.5 border-t border-emerald-200/60">
                            <span>${isKn ? 'ಒಟ್ಟು ಮೊತ್ತ (Grand Total)' : 'Grand Total'}:</span>
                            <span class="text-sm font-black text-[#133B2C]">₹${gTotal}</span>
                        </div>
                    </div>
                </div>

                <form id="quick-order-form" class="space-y-3">
                    <div>
                        <label class="block text-[11px] font-bold text-gray-700 uppercase mb-1">${isKn ? 'ನಿಮ್ಮ ಹೆಸರು *' : 'Your Name *'}</label>
                        <input type="text" id="quick-name" required placeholder="${isKn ? 'ಉದಾ: ರಾಹುಲ್' : 'e.g. Rahul'}" class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-gray-700 uppercase mb-1">${isKn ? 'ಹಾಸನದ ಡೆಲಿವರಿ ಏರಿಯಾ / ವಿಳಾಸ *' : 'Hassan Delivery Area / Street *'}</label>
                        <input type="text" id="quick-area" required placeholder="${isKn ? 'ಉದಾ: ಸಂತೆಪೇಟೆ / ಕೆ.ಆರ್. ಪುರಂ' : 'e.g. Near Santepet Circle / Vidyanagar'}" class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-gray-700 uppercase mb-1">${isKn ? 'ಫೋನ್ ನಂಬರ್ (ಐಚ್ಛಿಕ)' : 'Phone Number (Optional)'}</label>
                        <input type="tel" id="quick-phone" maxlength="10" placeholder="9876543210" class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />
                    </div>

                    <div class="text-[10px] text-gray-500 flex items-center gap-1 pt-1 font-semibold">
                        <span class="material-symbols-outlined text-sm text-emerald-600">payments</span>
                        <span>${isKn ? 'ಡೆಲಿವರಿ ಸಮಯದಲ್ಲಿ ನಗದು ಅಥವಾ UPI ಮೂಲಕ ಪಾವತಿಸಿ' : 'Pay Cash or UPI upon Doorstep Delivery'}</span>
                    </div>

                    <button type="submit" class="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all mt-2 cursor-pointer">
                        <span class="material-symbols-outlined text-xl">chat</span>
                        <span>${isKn ? 'WhatsApp ನಲ್ಲಿ ಆರ್ಡರ್ ಕಳುಹಿಸಿ' : 'Send Order to WhatsApp ➔'}</span>
                    </button>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');

        const form = document.getElementById('quick-order-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('quick-name').value.trim();
            const area = document.getElementById('quick-area').value.trim();
            const phone = document.getElementById('quick-phone').value.trim();
            if (!name || !area) return;

            // Save profile for future 1-click orders
            try {
                localStorage.setItem('fresh_chicken_customer_profile', JSON.stringify({
                    name, area, street: area, phone, city: 'Hassan', pincode: '573201'
                }));
            } catch(err) {}

            modal.classList.add('hidden');

            sendDirectWhatsAppOrder({
                prodName: prod.name,
                qty: qty,
                cutType: cutType,
                subtotal: sTotal,
                deliveryCharge: dCharge,
                grandTotal: gTotal,
                name: name,
                phone: phone,
                address: `${area}, Hassan`
            });
        };
    }

    // Direct WhatsApp Message Formatter & Sender
    function sendDirectWhatsAppOrder({ prodName, qty, cutType, subtotal, deliveryCharge, grandTotal, total, name, phone, address }) {
        // Fallback calculations for safety
        const sTotal = typeof subtotal === 'number' ? subtotal : (typeof total === 'number' ? total : 0);
        const freeLimit = window.CONFIG?.FREE_DELIVERY_LIMIT || 999;
        const deliveryRate = window.CONFIG?.DELIVERY_CHARGE !== undefined ? window.CONFIG.DELIVERY_CHARGE : 40;
        const dCharge = typeof deliveryCharge === 'number' ? deliveryCharge : (sTotal >= freeLimit ? 0 : deliveryRate);
        const gTotal = typeof grandTotal === 'number' ? grandTotal : Math.round((sTotal + dCharge) * 100) / 100;

        let msg = `Hello ${CONFIG.BUSINESS_NAME || 'Fresh Chicken Hassan'},\n\n`;
        msg += `I would like to place an order:\n\n`;
        msg += `🍗 *ORDERED ITEM*\n`;
        msg += `• ${prodName} - ${qty} Kg${cutType ? ' [' + cutType + ']' : ''} (₹${sTotal})\n\n`;
        msg += `💰 *PAYMENT SUMMARY*\n`;
        msg += `Subtotal: ₹${sTotal}\n`;
        msg += `Delivery Fee: ${dCharge === 0 ? 'FREE (Order >= ₹' + freeLimit + ')' : '₹' + dCharge}\n`;
        msg += `*Total Amount: ₹${gTotal}*\n`;
        msg += `💵 *Payment: Cash / UPI on Delivery*\n\n`;
        msg += `📋 *CUSTOMER DETAILS*\n`;
        msg += `👤 Name: ${name}\n`;
        if (phone) msg += `📞 Phone: ${phone}\n`;
        msg += `📍 Delivery Address: ${address}\n\n`;
        msg += `Please confirm my order and share delivery timing!`;

        const waNum = CONFIG.WHATSAPP_NUMBER || '919148699386';
        const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

        // Save order into history
        if (window.ordersEngine) {
            window.ordersEngine.saveOrder({
                customer: { name, phone, fullAddress: address, area: address, city: 'Hassan' },
                items: [{ name: prodName, quantity: qty, cutType, pricePerKg: Math.round((sTotal / qty) * 100) / 100 }],
                subtotal: sTotal,
                deliveryCharge: dCharge,
                grandTotal: gTotal,
                paymentMethod: 'Cash / UPI on Delivery',
                deliverySlot: 'Express Delivery (30-45 mins)',
                status: 'Order Placed'
            });
        }

        window.location.href = waUrl;
    }
});

// Modern Dynamic Home Promotional Banner Carousel Controller
function renderDynamicHomeBanners() {
    const container = document.getElementById('home-dynamic-banners-container');
    if (!container || !window.bannersEngine) return;

    const banners = window.bannersEngine.getActiveBanners();
    if (!banners || banners.length === 0) {
        container.classList.add('hidden');
        if (window.bannerSlideInterval) {
            clearInterval(window.bannerSlideInterval);
            window.bannerSlideInterval = null;
        }
        return;
    }

    container.classList.remove('hidden');

    let currentSlide = 0;
    const totalSlides = banners.length;

    // Render static carousel shell with sliding track (rendered ONCE, no jumpy re-renders)
    container.innerHTML = `
        <div id="banner-carousel-shell" class="banner-carousel-shell group min-h-[140px] sm:min-h-[130px] relative w-full flex items-center">
            
            <!-- Ambient Modern Lighting Glows -->
            <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Sliding Track containing all slides side-by-side -->
            <div id="banner-carousel-track" class="banner-track h-full items-center">
                ${banners.map(b => `
                    <div class="banner-slide flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 md:px-8 lg:px-10 gap-3 sm:gap-4 relative z-10 h-full box-border">
                        
                        <!-- Left: Info & Badges with strict line clamps to prevent vertical jumping -->
                        <div class="w-full sm:max-w-xl md:max-w-2xl text-left flex flex-col justify-center space-y-1.5 sm:space-y-2">
                            <div class="flex items-center gap-2">
                                ${b.badge ? `
                                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400 text-amber-950 font-black rounded-full text-[10px] uppercase tracking-wider shadow-sm flex-shrink-0">
                                        <span class="material-symbols-outlined text-[13px]">campaign</span>
                                        ${b.badge}
                                    </span>
                                ` : ''}
                                <span class="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300/80 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Hassan Special
                                </span>
                            </div>

                            <h3 class="text-base sm:text-lg md:text-xl font-black text-white leading-snug tracking-tight line-clamp-1 sm:line-clamp-2">
                                ${b.title || 'Fresh Chicken Hassan'}
                            </h3>

                            <p class="text-emerald-100/85 text-xs leading-relaxed line-clamp-2 sm:line-clamp-1">
                                ${b.description || 'Farm-fresh cuts delivered right to your home.'}
                            </p>
                        </div>

                        <!-- Right: Clean, Compact CTA button (No image showcase) -->
                        <div class="w-auto flex items-center justify-start sm:justify-end flex-shrink-0 pt-1 sm:pt-0">
                            <a href="${b.linkUrl || 'products.html'}" class="inline-flex items-center justify-center gap-1.5 bg-[#E53935] hover:bg-[#c62828] active:scale-95 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs shadow-md shadow-red-950/30 hover:shadow-red-600/30 transition-all whitespace-nowrap">
                                <span>${b.linkText || 'Order Now'}</span>
                                <span class="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Modern Navigation Arrow Controls (Visible if multiple slides) -->
            ${totalSlides > 1 ? `
                <button id="banner-prev-btn" aria-label="Previous Slide" class="banner-nav-btn absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl">
                    <span class="material-symbols-outlined text-base sm:text-xl">chevron_left</span>
                </button>
                <button id="banner-next-btn" aria-label="Next Slide" class="banner-nav-btn absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl">
                    <span class="material-symbols-outlined text-base sm:text-xl">chevron_right</span>
                </button>

                <!-- Modern Progress Indicator Dots -->
                <div id="banner-indicators" class="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
                    ${banners.map((_, i) => `
                        <button onclick="window.switchBannerSlide(${i})" aria-label="Go to slide ${i + 1}" class="banner-indicator-dot h-2 rounded-full ${i === 0 ? 'active' : 'w-2 bg-white/35 hover:bg-white/70'}"></button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    const track = document.getElementById('banner-carousel-track');
    const shell = document.getElementById('banner-carousel-shell');
    const prevBtn = document.getElementById('banner-prev-btn');
    const nextBtn = document.getElementById('banner-next-btn');

    function updateTrack() {
        if (!track) return;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        const dots = container.querySelectorAll('.banner-indicator-dot');
        dots.forEach((dot, idx) => {
            if (idx === currentSlide) {
                dot.className = 'banner-indicator-dot h-2 rounded-full active';
            } else {
                dot.className = 'banner-indicator-dot h-2 rounded-full w-2 bg-white/35 hover:bg-white/70';
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateTrack();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateTrack();
    }

    window.switchBannerSlide = function(i) {
        currentSlide = i;
        updateTrack();
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });

    // Touch Swipe Gesture Handling for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    if (shell) {
        shell.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        shell.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const diffX = touchEndX - touchStartX;
            if (Math.abs(diffX) > 40) {
                if (diffX < 0) nextSlide();
                else prevSlide();
            }
            startAutoPlay();
        }, { passive: true });

        // Pause on mouse hover, resume on leave
        shell.addEventListener('mouseenter', stopAutoPlay);
        shell.addEventListener('mouseleave', startAutoPlay);
    }

    function startAutoPlay() {
        if (totalSlides <= 1) return;
        stopAutoPlay();
        window.bannerSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (window.bannerSlideInterval) {
            clearInterval(window.bannerSlideInterval);
            window.bannerSlideInterval = null;
        }
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    startAutoPlay();
}

document.addEventListener('DOMContentLoaded', () => {
    renderDynamicHomeBanners();
});

window.addEventListener('bannersUpdated', () => {
    renderDynamicHomeBanners();
});


