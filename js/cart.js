/**
 * Fresh Chicken - Cart Management Engine
 * Uses localStorage to store cart items persistently.
 */

const STORAGE_KEY = 'fresh_chicken_cart_v1';

class CartEngine {
    constructor() {
        this.items = this.loadCart();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading cart from localStorage', e);
            return [];
        }
    }

    // Save cart state to localStorage
    saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
            this.notifyListeners();
        } catch (e) {
            console.error('Error saving cart to localStorage', e);
        }
    }

    // Notify UI listeners (e.g. badge update)
    notifyListeners() {
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                cart: this.items,
                count: this.getTotalCount(),
                subtotal: this.getSubtotal()
            }
        }));
    }

    // Add product to cart with specified quantity in Kg
    addItem(productId, qty = 1) {
        const quantity = parseInt(qty);
        if (isNaN(quantity) || quantity <= 0) return false;

        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return false;

        const existingIndex = this.items.findIndex(item => item.id === productId);
        if (existingIndex > -1) {
            this.items[existingIndex].quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                pricePerKg: product.pricePerKg,
                image: product.image,
                unit: product.unit || '1 Kg',
                quantity: quantity
            });
        }

        this.saveCart();
        this.showToast(`Added ${quantity} Kg of "${product.name}" to your cart!`, 'success');
        return true;
    }

    // Update product quantity directly
    updateQuantity(productId, newQty) {
        const qty = parseInt(newQty);
        const index = this.items.findIndex(item => item.id === productId);
        if (index === -1) return;

        if (qty <= 0) {
            this.removeItem(productId);
        } else {
            this.items[index].quantity = qty;
            this.saveCart();
        }
    }

    // Increase quantity by 1
    increment(productId) {
        const item = this.items.find(i => i.id === productId);
        if (item) {
            this.updateQuantity(productId, item.quantity + 1);
        } else {
            this.addItem(productId, 1);
        }
    }

    // Decrease quantity by 1
    decrement(productId) {
        const item = this.items.find(i => i.id === productId);
        if (item) {
            this.updateQuantity(productId, item.quantity - 1);
        }
    }

    // Remove item completely
    removeItem(productId) {
        const item = this.items.find(i => i.id === productId);
        const name = item ? item.name : 'Item';
        this.items = this.items.filter(i => i.id !== productId);
        this.saveCart();
        this.showToast(`Removed "${name}" from cart.`, 'info');
    }

    // Clear entire cart
    clearCart() {
        this.items = [];
        this.saveCart();
    }

    // Total number of items (sum of quantities)
    getTotalCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Subtotal amount in ₹
    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
    }

    // Calculate delivery charge
    getDeliveryCharge() {
        const subtotal = this.getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= (window.CONFIG?.FREE_DELIVERY_LIMIT || 500) ? 0 : (window.CONFIG?.DELIVERY_CHARGE || 40);
    }

    // Grand total
    getGrandTotal() {
        return this.getSubtotal() + this.getDeliveryCharge();
    }

    // Toast notification helper
    showToast(message, type = 'success') {
        if (typeof document === 'undefined') return;
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-[#133B2C]' : 'bg-[#E53935]';
        toast.className = `${bgColor} text-white px-5 py-3.5 rounded-xl shadow-lg flex items-center justify-between gap-3 text-sm font-medium transform translate-y-4 opacity-0 transition-all duration-300 pointer-events-auto`;
        
        const iconName = type === 'success' ? 'check_circle' : 'info';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">${iconName}</span>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white">
                <span class="material-symbols-outlined text-base">close</span>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-4', 'opacity-0');
        });

        // Auto remove after 3.5s
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

// Global instance
window.cart = new CartEngine();
