/**
 * Fresh Chicken - Checkout Controller
 * Handles Order Summary, Delivery Form Validation, GPS Location, Time Slots, WhatsApp Link Encoding, and Order Success Modal.
 */

let userGpsCoords = null; // { lat, lng }
let isSubmittingOrder = false;

document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const orderItemsContainer = document.getElementById('checkout-order-items');
    
    // Ensure cart has items
    if (orderItemsContainer && window.cart) {
        renderOrderSummary();
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    // Auto-fill saved customer profile
    initCustomerProfileAutoFill();

    // Update store live status
    updateCheckoutStoreStatus();

    // Attach delivery slot style toggles
    initDeliverySlotListeners();
});

// Update store status banner
function updateCheckoutStoreStatus() {
    const statusEl = document.getElementById('checkout-status-text');
    if (statusEl && window.CONFIG && window.CONFIG.getStoreStatusInfo) {
        const info = window.CONFIG.getStoreStatusInfo();
        if (info.isOpen) {
            statusEl.innerHTML = `🟢 <strong>Store Open (9:00 AM - 8:00 PM)</strong> • Express Cuts Dispatched Direct from Santepet`;
        } else {
            statusEl.innerHTML = `🌙 <strong>Store Closed (Opens 9:00 AM)</strong> • Pre-order now for 9:00 AM morning fresh delivery`;
        }
    }
}

// Auto-fill customer profile from previous order
function initCustomerProfileAutoFill() {
    try {
        const saved = localStorage.getItem('fresh_chicken_customer_profile');
        if (saved) {
            const p = JSON.parse(saved);
            const nameEl = document.getElementById('cust-name');
            const phoneEl = document.getElementById('cust-phone');
            const streetEl = document.getElementById('cust-street');
            const areaEl = document.getElementById('cust-area');
            const cityEl = document.getElementById('cust-city');
            const pinEl = document.getElementById('cust-pincode');

            if (p.name && nameEl) nameEl.value = p.name;
            if (p.phone && phoneEl) phoneEl.value = p.phone;
            if (p.street && streetEl) streetEl.value = p.street;
            if (p.area && areaEl) areaEl.value = p.area;
            if (p.city && cityEl) cityEl.value = p.city || 'Hassan';
            if (p.pincode && pinEl) pinEl.value = p.pincode || '573201';

            const alertBox = document.getElementById('saved-profile-alert');
            const alertText = document.getElementById('saved-profile-text');
            if (alertBox && alertText && p.name) {
                alertText.innerHTML = `Welcome back <strong>${p.name}</strong>! We've pre-filled your saved delivery address.`;
                alertBox.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error('Error loading saved customer profile', e);
    }
}

// Clear pre-filled profile
function clearSavedProfile() {
    localStorage.removeItem('fresh_chicken_customer_profile');
    const alertBox = document.getElementById('saved-profile-alert');
    if (alertBox) alertBox.classList.add('hidden');

    const form = document.getElementById('checkout-form');
    if (form) {
        form.reset();
        document.getElementById('cust-city').value = 'Hassan';
        document.getElementById('cust-pincode').value = '573201';
    }
}

// Delivery slot radio listeners
function initDeliverySlotListeners() {
    const slotOptions = document.querySelectorAll('.slot-option');
    slotOptions.forEach(opt => {
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', () => {
                slotOptions.forEach(o => {
                    o.classList.remove('border-2', 'border-[#133B2C]', 'bg-emerald-50/50');
                    o.classList.add('border', 'border-gray-200', 'bg-gray-50');
                    const text = o.querySelector('span:first-child');
                    if (text) {
                        text.classList.remove('text-[#133B2C]');
                        text.classList.add('text-gray-900');
                    }
                });

                if (radio.checked) {
                    opt.classList.remove('border', 'border-gray-200', 'bg-gray-50');
                    opt.classList.add('border-2', 'border-[#133B2C]', 'bg-emerald-50/50');
                    const text = opt.querySelector('span:first-child');
                    if (text) {
                        text.classList.remove('text-gray-900');
                        text.classList.add('text-[#133B2C]');
                    }
                }
            });
        }
    });
}

// Detect GPS Location & Auto-populate Street, Area, City, and Pincode
function detectGpsLocation() {
    const btnText = document.getElementById('gps-btn-text');
    const statusBox = document.getElementById('gps-status-box');
    const coordsText = document.getElementById('gps-coords-text');

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    if (btnText) btnText.textContent = 'Detecting GPS...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userGpsCoords = { lat, lng };

            if (btnText) btnText.textContent = 'Fetching Address...';
            if (statusBox) statusBox.classList.remove('hidden');
            if (coordsText) coordsText.textContent = `📍 GPS Attached (${lat.toFixed(4)}, ${lng.toFixed(4)}) — Fetching road and area...`;

            // Reverse Geocoding via OpenStreetMap Nominatim
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.address) {
                        const addr = data.address;
                        const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || '';
                        const building = addr.building || addr.house_number || addr.amenity || addr.shop || '';
                        const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || addr.quarter || addr.village || addr.hamlet || '';
                        const city = addr.city || addr.town || addr.municipality || addr.district || addr.county || 'Hassan';
                        const postcode = addr.postcode || '573201';

                        const streetEl = document.getElementById('cust-street');
                        const areaEl = document.getElementById('cust-area');
                        const cityEl = document.getElementById('cust-city');
                        const pinEl = document.getElementById('cust-pincode');

                        const streetCandidate = [building, road].filter(Boolean).join(', ');
                        if (streetCandidate && streetEl) {
                            streetEl.value = streetCandidate;
                        }

                        const areaCandidate = neighbourhood || road || addr.suburb || 'Santepet / Hassan';
                        if (areaCandidate && areaEl) {
                            areaEl.value = areaCandidate;
                        }

                        if (city && cityEl) {
                            cityEl.value = city;
                        }

                        if (postcode && pinEl) {
                            pinEl.value = postcode;
                        }
                    }
                }
            } catch (geocodeErr) {
                console.warn('Reverse geocoding network error:', geocodeErr);
            }

            if (btnText) btnText.textContent = 'GPS Attached ✔';
            if (coordsText) coordsText.textContent = `📍 GPS Attached (${lat.toFixed(4)}, ${lng.toFixed(4)}) — Delivery boy will receive direct Google Maps Navigation!`;

            if (window.cart && window.cart.showToast) {
                window.cart.showToast('GPS attached & address auto-filled!', 'success');
            }
        },
        (err) => {
            if (btnText) btnText.textContent = 'Use My GPS Location';
            console.warn('Geolocation error:', err);
            alert('Could not access GPS location. Please ensure location permissions are enabled in your browser settings.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Remove attached GPS location
function clearGpsLocation() {
    userGpsCoords = null;
    const btnText = document.getElementById('gps-btn-text');
    const statusBox = document.getElementById('gps-status-box');
    if (btnText) btnText.textContent = 'Use My GPS Location';
    if (statusBox) statusBox.classList.add('hidden');
}

// Toggle display between UPI QR Scanner and Cash on Delivery
function togglePaymentMethodDisplay(type) {
    const scannerContainer = document.getElementById('upi-scanner-container');
    if (!scannerContainer) return;
    if (type === 'upi') {
        scannerContainer.classList.remove('hidden');
    } else {
        scannerContainer.classList.add('hidden');
    }
}

// Copy UPI ID helper function
function copyUpiId() {
    const upiId = CONFIG.UPI_ID || '9148699386@ybl';
    navigator.clipboard.writeText(upiId).then(() => {
        if (window.cart && window.cart.showToast) {
            window.cart.showToast(`Copied UPI ID: ${upiId} to clipboard!`, 'success');
        } else {
            alert(`Copied UPI ID: ${upiId}`);
        }
    }).catch(err => {
        alert(`UPI ID: ${upiId}`);
    });
}

// Render summary of cart items on checkout page
function renderOrderSummary() {
    const container = document.getElementById('checkout-order-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const deliveryEl = document.getElementById('summary-delivery');
    const grandTotalEl = document.getElementById('summary-grand-total');

    if (!container) return;

    const items = window.cart.items;
    if (items.length === 0) {
        container.innerHTML = `
            <div class="py-8 text-center text-gray-500 text-sm">
                Your cart is empty. <a href="products.html" class="text-[#E53935] underline font-bold">Add products</a> before checking out.
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '₹0';
        if (deliveryEl) deliveryEl.textContent = '₹0';
        if (grandTotalEl) grandTotalEl.textContent = '₹0';
        
        const submitBtn = document.getElementById('place-order-btn');
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    container.innerHTML = items.map(item => {
        const cut = item.cutType ? `[${item.cutType}]` : '';
        return `
            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div class="flex items-center gap-3">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                    <div>
                        <h4 class="font-bold text-gray-900 text-sm leading-snug">${item.name}</h4>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="text-xs text-gray-500">${item.quantity} Kg</span>
                            ${cut ? `<span class="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">${cut}</span>` : ''}
                        </div>
                    </div>
                </div>
                <span class="font-bold text-[#133B2C] text-sm">₹${Math.round(item.pricePerKg * item.quantity * 100) / 100}</span>
            </div>
        `;
    }).join('');

    const subtotal = window.cart.getSubtotal();
    const delivery = window.cart.getDeliveryCharge();
    const grandTotal = window.cart.getGrandTotal();

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (deliveryEl) deliveryEl.textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;

    // Dynamic QR code with total amount
    const qrImg = document.getElementById('upi-qr-img');
    if (qrImg) {
        const upiId = CONFIG.UPI_ID || '9148699386@ybl';
        const upiName = encodeURIComponent(CONFIG.UPI_NAME || 'Fresh Chicken Hassan');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${upiId}%26pn=${upiName}%26am=${grandTotal}%26cu=INR`;
    }
}

// Handle Form Submission & WhatsApp Link Generation
function handleCheckoutSubmit(e) {
    e.preventDefault();

    if (isSubmittingOrder) {
        return; // Prevent duplicate rapid submission
    }

    if (!window.cart || window.cart.items.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const name = document.getElementById('cust-name')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const street = document.getElementById('cust-street')?.value.trim();
    const area = document.getElementById('cust-area')?.value.trim();
    const city = document.getElementById('cust-city')?.value.trim();
    const pincode = document.getElementById('cust-pincode')?.value.trim();
    const notes = document.getElementById('cust-notes')?.value.trim();
    
    // Get selected payment method
    const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'Google Pay / UPI Scanner';

    // Get selected delivery slot
    const slotRadio = document.querySelector('input[name="delivery-slot"]:checked');
    const deliverySlot = slotRadio ? slotRadio.value : 'Express Delivery (Within 30-45 Mins)';

    if (!name || !phone || !street || !area || !city || !pincode) {
        alert('Please fill out all required fields.');
        return;
    }

    const fullAddress = `${street}, ${area}, ${city} - ${pincode}`;
    const items = window.cart.items;
    const subtotal = window.cart.getSubtotal();
    const delivery = window.cart.getDeliveryCharge();
    const grandTotal = window.cart.getGrandTotal();

    // Save customer profile for auto-fill on next orders
    try {
        localStorage.setItem('fresh_chicken_customer_profile', JSON.stringify({
            name, phone, street, area, city, pincode
        }));
        localStorage.setItem('fresh_chicken_last_phone', phone);
    } catch (err) {}

    // Construct formatted WhatsApp message
    let message = `Hello ${CONFIG.BUSINESS_NAME},\n\n`;
    message += `I would like to place an order.\n\n`;
    message += `📋 *CUSTOMER DETAILS*\n`;
    message += `👤 Name: ${name}\n`;
    message += `📞 Phone: ${phone}\n`;
    message += `📍 Address: ${fullAddress}\n`;
    
    if (userGpsCoords) {
        message += `🗺️ *GPS Pin:* https://maps.google.com/?q=${userGpsCoords.lat},${userGpsCoords.lng}\n`;
        message += `🚗 *Get Directions (GPS Navigation):* https://www.google.com/maps/dir/?api=1&destination=${userGpsCoords.lat},${userGpsCoords.lng}\n`;
    }
    
    message += `⏰ *Delivery Slot:* ${deliverySlot}\n`;

    if (notes) {
        message += `📝 Notes: ${notes}\n`;
    }

    message += `\n🛒 *ORDERED ITEMS*\n`;

    items.forEach(item => {
        const cutInfo = item.cutType ? ` [${item.cutType}]` : '';
        const itemTotal = Math.round(item.pricePerKg * item.quantity * 100) / 100;
        message += `• ${item.name} - ${item.quantity} Kg${cutInfo} (₹${itemTotal})\n`;
    });

    message += `\n💰 *PAYMENT SUMMARY*\n`;
    message += `Subtotal: ₹${subtotal}\n`;
    message += `Delivery Fee: ${delivery === 0 ? 'FREE' : '₹' + delivery}\n`;
    message += `*Total Amount: ₹${grandTotal}*\n`;
    message += `💳 *Payment Method: ${paymentMethod}*\n`;

    if (paymentMethod.includes('UPI')) {
        message += `📲 Store UPI ID: ${CONFIG.UPI_ID || '9148699386@ybl'}\n\n`;
        message += `⚠️ *IMPORTANT: PLEASE SHARE PAYMENT SCREENSHOT (SS) IN THIS CHAT TO CONFIRM YOUR ONLINE PAYMENT ORDER!*\n`;
    }

    message += `\nPlease confirm my order and share delivery details!`;

    const waNumber = CONFIG.WHATSAPP_NUMBER || '919148699386';
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

    // Disable place order button temporarily to prevent multi-clicking
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.classList.add('opacity-50', 'pointer-events-none');
    }
    isSubmittingOrder = true;

    // Save order into order history & revenue tracker
    if (window.ordersEngine) {
        window.ordersEngine.saveOrder({
            customer: { name, phone, street, area, city, pincode, fullAddress, notes, gps: userGpsCoords },
            items: JSON.parse(JSON.stringify(items)),
            subtotal,
            deliveryCharge: delivery,
            grandTotal,
            paymentMethod,
            deliverySlot,
            status: 'Order Placed'
        });
    }

    // Show Success Modal
    showOrderSuccessModal(waUrl, name, grandTotal, paymentMethod, deliverySlot);
}

// Order Success Overlay Modal before redirecting to WhatsApp
function showOrderSuccessModal(waUrl, name, totalAmount, paymentMethod, deliverySlot) {
    let modal = document.getElementById('order-success-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'order-success-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300';
        document.body.appendChild(modal);
    }

    const upiId = CONFIG.UPI_ID || '9148699386@ybl';
    const isUpi = paymentMethod && paymentMethod.includes('UPI');

    modal.innerHTML = `
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl transform scale-90 transition-transform duration-300">
            <div class="w-16 h-16 bg-green-100 text-[#133B2C] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <span class="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h3 class="text-2xl font-black text-gray-900 mb-1">Order Ready to Send!</h3>
            <p class="text-gray-600 text-xs mb-3">
                Thank you <strong class="text-gray-900">${name}</strong>! Total Amount: <strong class="text-[#133B2C] text-sm">₹${totalAmount}</strong>
            </p>

            <div class="bg-gray-50 border border-gray-100 rounded-xl p-2.5 mb-4 text-xs text-gray-700 font-semibold flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-emerald-600">schedule</span>
                <span>${deliverySlot || 'Express Delivery (30-45 mins)'}</span>
            </div>

            ${isUpi ? `
                <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 space-y-2 text-left">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-[#133B2C] flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm text-emerald-600">qr_code_scanner</span>
                            Google Pay / UPI Details
                        </span>
                        <span class="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">Store UPI</span>
                    </div>
                    <p class="text-[11px] text-gray-600">Pay <strong>₹${totalAmount}</strong> to UPI ID below or scan QR at checkout.</p>
                    <div class="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span class="font-bold text-xs text-[#133B2C] select-all">${upiId}</span>
                        <button onclick="copyUpiId()" class="text-[11px] bg-[#133B2C] text-white px-3 py-1 rounded-lg font-bold">Copy</button>
                    </div>
                </div>

                <div class="p-3 bg-amber-50 border-2 border-amber-400 text-amber-950 rounded-2xl mb-4 text-xs font-black text-center shadow-sm space-y-1">
                    <div class="flex items-center justify-center gap-1 text-amber-700">
                        <span class="material-symbols-outlined text-base">warning</span>
                        <span>IMPORTANT FOR ONLINE PAYMENT</span>
                    </div>
                    <p class="text-[11px] leading-tight">PLEASE ATTACH & SHARE PAYMENT SCREENSHOT (SS) IN THE WHATSAPP CHAT TO CONFIRM YOUR ORDER!</p>
                </div>
            ` : ''}

            <a href="${waUrl}" target="_blank" id="confirm-wa-btn" class="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 mb-3">
                <span class="material-symbols-outlined text-2xl">chat</span>
                <span>Send Order on WhatsApp</span>
            </a>

            <div class="flex items-center justify-center gap-4 text-xs font-semibold">
                <a href="orders.html" class="text-[#133B2C] hover:underline">Track My Orders</a>
                <span class="text-gray-300">•</span>
                <button onclick="closeModalAndClear()" class="text-gray-400 hover:text-gray-600 underline">
                    Return to Store
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-90');
    });

    // Clear cart when user clicks the WhatsApp confirm button
    const confirmBtn = modal.querySelector('#confirm-wa-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            setTimeout(() => {
                if (window.cart) window.cart.clearCart();
                window.location.href = 'orders.html';
            }, 1000);
        });
    }
}

function closeModalAndClear() {
    isSubmittingOrder = false;
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.classList.remove('opacity-50', 'pointer-events-none');
    }
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.remove(), 300);
    }
}
