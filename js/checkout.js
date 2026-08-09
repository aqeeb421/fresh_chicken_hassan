/**
 * Fresh Chicken - Checkout Controller
 * Handles Order Summary, Delivery Form Validation, WhatsApp Link Encoding, and Order Success Modal.
 */

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
});

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

    container.innerHTML = items.map(item => `
        <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center gap-3">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                <div>
                    <h4 class="font-bold text-gray-900 text-sm">${item.name}</h4>
                    <p class="text-xs text-gray-500">${item.quantity} Kg x ₹${item.pricePerKg}/Kg</p>
                </div>
            </div>
            <span class="font-bold text-[#133B2C] text-sm">₹${item.pricePerKg * item.quantity}</span>
        </div>
    `).join('');

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

    if (!name || !phone || !street || !area || !city || !pincode) {
        alert('Please fill out all required fields.');
        return;
    }

    const fullAddress = `${street}, ${area}, ${city} - ${pincode}`;
    const items = window.cart.items;
    const subtotal = window.cart.getSubtotal();
    const delivery = window.cart.getDeliveryCharge();
    const grandTotal = window.cart.getGrandTotal();

    // Save customer phone for My Orders lookup
    localStorage.setItem('fresh_chicken_last_phone', phone);

    // Construct formatted WhatsApp message
    let message = `Hello ${CONFIG.BUSINESS_NAME},\n\n`;
    message += `I would like to place an order.\n\n`;
    message += `📋 *CUSTOMER DETAILS*\n`;
    message += `👤 Name: ${name}\n`;
    message += `📞 Phone: ${phone}\n`;
    message += `📍 Address: ${fullAddress}\n`;
    if (notes) {
        message += `📝 Notes: ${notes}\n`;
    }
    message += `\n🛒 *ORDERED ITEMS*\n`;

    items.forEach(item => {
        message += `• ${item.name} - ${item.quantity} Kg (₹${item.pricePerKg * item.quantity})\n`;
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

    // Save order into order history & revenue tracker
    if (window.ordersEngine) {
        window.ordersEngine.saveOrder({
            customer: { name, phone, street, area, city, pincode, fullAddress, notes },
            items: JSON.parse(JSON.stringify(items)),
            subtotal,
            deliveryCharge: delivery,
            grandTotal,
            paymentMethod,
            status: 'Order Placed'
        });
    }

    // Show Success Modal
    showOrderSuccessModal(waUrl, name, grandTotal, paymentMethod);
}

// Order Success Overlay Modal before redirecting to WhatsApp
function showOrderSuccessModal(waUrl, name, totalAmount, paymentMethod) {
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
            <p class="text-gray-600 text-xs mb-4">
                Thank you <strong class="text-gray-900">${name}</strong>! Total Amount: <strong class="text-[#133B2C] text-sm">₹${totalAmount}</strong>
            </p>

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
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.remove(), 300);
    }
}
