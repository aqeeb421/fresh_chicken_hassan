/**
 * Fresh Chicken - Products Page Controller
 * Handles product catalog rendering, search filter, category filter, and quantity handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return; // Only run on pages with products grid

    let activeCategory = 'All';
    let searchQuery = '';
    const quantityMap = {}; // Stores selected quantity per product ID

    // Render initial products
    renderProducts();

    // Re-render when real-time cloud prices are received from Firebase
    window.addEventListener('pricesUpdatedRealtime', () => {
        renderProducts();
    });

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
        const filtered = PRODUCTS.filter(product => {
            const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                                  product.description.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-300 mb-3">search_off</span>
                    <h3 class="text-xl font-bold text-[#133B2C] mb-1">No products found</h3>
                    <p class="text-gray-500">Try adjusting your search query or category filter.</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filtered.map(product => {
            const currentQty = quantityMap[product.id] || 1;
            const mktPrice = product.marketPricePerKg || (product.pricePerKg + 20);
            const savings = mktPrice - product.pricePerKg;

            return `
                <div class="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_24px_rgba(19,59,44,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(19,59,44,0.12)] transition-all duration-300 flex flex-col h-full group">
                    <!-- Image Container -->
                    <div class="relative w-full aspect-square overflow-hidden bg-gray-50">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80';" />
                        ${product.badge ? `<span class="absolute top-4 left-4 bg-[#E53935] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">${product.badge}</span>` : ''}
                        ${savings > 0 ? `<span class="absolute top-4 right-4 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">Save ₹${savings}/Kg</span>` : ''}
                        <span class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-[#133B2C] text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200">
                            ${product.stockStatus}
                        </span>
                    </div>

                    <!-- Card Body -->
                    <div class="p-6 flex flex-col flex-grow justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-bold text-lg text-gray-900 leading-snug group-hover:text-[#133B2C] transition-colors">${product.name}</h3>
                            </div>
                            <p class="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">${product.description}</p>
                        </div>

                        <div>
                            <!-- DUAL PRICE BOX (Market Rate COT vs Our Best Price) -->
                            <div class="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 mb-4 space-y-1">
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-gray-500 font-medium">Market Price (COT):</span>
                                    <span class="line-through text-gray-400 font-bold">₹${mktPrice} / ${product.unit}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-[#133B2C] flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm text-emerald-600">verified</span>
                                        Our Best Price:
                                    </span>
                                    <span class="text-2xl font-black text-[#133B2C]">₹${product.pricePerKg} <span class="text-xs text-gray-500 font-normal">/ ${product.unit}</span></span>
                                </div>
                            </div>

                            <!-- Quantity & Add to Cart Controls -->
                            <div class="flex items-center gap-3">
                                <!-- Quantity Controller -->
                                <div class="flex items-center border border-gray-200 rounded-xl bg-gray-50/80 p-1">
                                    <button class="qty-btn-minus w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors" data-id="${product.id}">
                                        <span class="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span class="qty-display w-10 text-center font-bold text-sm text-[#133B2C]" id="qty-val-${product.id}">${currentQty} Kg</span>
                                    <button class="qty-btn-plus w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors" data-id="${product.id}">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>

                                <!-- Add to Cart Button -->
                                <button class="add-to-cart-btn flex-1 bg-[#133B2C] hover:bg-[#0b251b] text-white py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" data-id="${product.id}">
                                    <span class="material-symbols-outlined text-lg">add_shopping_cart</span>
                                    <span>Add</span>
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

    // Attach +/- and Add to Cart event handlers
    function attachProductEventListeners() {
        // Minus Button
        document.querySelectorAll('.qty-btn-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.dataset.id;
                let current = quantityMap[id] || 1;
                if (current > 1) {
                    quantityMap[id] = current - 1;
                    const display = document.getElementById(`qty-val-${id}`);
                    if (display) display.textContent = `${quantityMap[id]} Kg`;
                }
            });
        });

        // Plus Button
        document.querySelectorAll('.qty-btn-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.dataset.id;
                let current = quantityMap[id] || 1;
                quantityMap[id] = current + 1;
                const display = document.getElementById(`qty-val-${id}`);
                if (display) display.textContent = `${quantityMap[id]} Kg`;
            });
        });

        // Add to Cart Button
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const qty = quantityMap[id] || 1;
                if (window.cart) {
                    window.cart.addItem(id, qty);
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

