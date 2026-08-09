/**
 * Fresh Chicken - Orders & Analytics Engine
 * Manages order history logging, daily revenue calculations, and price overrides in localStorage.
 */

const ORDERS_STORAGE_KEY = 'fresh_chicken_orders_v1';
const PRICES_STORAGE_KEY = 'fresh_chicken_custom_prices_v1';

class OrdersEngine {
    constructor() {
        this.orders = this.loadOrders();
    }

    // Load orders from localStorage
    loadOrders() {
        try {
            const data = localStorage.getItem(ORDERS_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading order history', e);
            return [];
        }
    }

    // Save order to history
    saveOrder(orderData) {
        if (!orderData || !orderData.customer || !Array.isArray(orderData.items)) {
            console.error('Invalid order data submitted');
            return null;
        }

        const newOrder = {
            id: 'FC-' + Date.now().toString().slice(-6),
            timestamp: new Date().toISOString(),
            dateString: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            dateISO: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            customer: orderData.customer,
            items: orderData.items,
            subtotal: orderData.subtotal,
            deliveryCharge: orderData.deliveryCharge,
            grandTotal: orderData.grandTotal,
            paymentMethod: orderData.paymentMethod || 'WhatsApp / Cash',
            status: orderData.status || 'Order Placed'
        };

        this.orders.unshift(newOrder); // newest first
        try {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
            if (orderData.customer && orderData.customer.phone) {
                localStorage.setItem('fresh_chicken_last_phone', orderData.customer.phone);
            }
        } catch (e) {
            console.error('Error saving order', e);
        }

        // Sync with Cloud DB if available
        if (window.cloudDb) {
            window.cloudDb.saveOrderToCloud(newOrder);
        }

        return newOrder;
    }

    // Update order status (Admin function)
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            try {
                localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
            } catch (e) {
                console.error('Error saving updated order status', e);
            }

            if (window.cloudDb) {
                window.cloudDb.updateOrderStatusInCloud(orderId, newStatus);
            }
            window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: this.orders }));
            return true;
        }
        return false;
    }

    // Get orders filtered by customer phone number
    getOrdersByPhone(phone) {
        if (!phone) return [];
        const cleanPhone = phone.toString().trim().replace(/\D/g, '').slice(-10);
        return this.orders.filter(order => {
            if (!order.customer || !order.customer.phone) return false;
            const p = order.customer.phone.toString().trim().replace(/\D/g, '').slice(-10);
            return p === cleanPhone;
        });
    }

    // Get all orders
    getAllOrders() {
        return this.orders;
    }

    // Get orders for today
    getTodayOrders() {
        const todayISO = new Date().toISOString().split('T')[0];
        return this.orders.filter(order => order.dateISO === todayISO);
    }

    // Get today's total revenue in ₹
    getTodayRevenue() {
        return this.getTodayOrders().reduce((sum, order) => sum + order.grandTotal, 0);
    }

    // Get lifetime total revenue in ₹
    getLifetimeRevenue() {
        return this.orders.reduce((sum, order) => sum + order.grandTotal, 0);
    }

    // Get day-wise revenue summary
    getDayWiseRevenue() {
        const dayMap = {};

        this.orders.forEach(order => {
            const dayKey = order.dateISO || order.timestamp.split('T')[0];
            if (!dayMap[dayKey]) {
                dayMap[dayKey] = {
                    dateISO: dayKey,
                    dateString: order.dateString ? order.dateString.split(',')[0] : dayKey,
                    count: 0,
                    revenue: 0,
                    itemsSoldKg: 0
                };
            }
            dayMap[dayKey].count += 1;
            dayMap[dayKey].revenue += order.grandTotal;
            dayMap[dayKey].itemsSoldKg += order.items.reduce((k, i) => k + i.quantity, 0);
        });

        return Object.values(dayMap).sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    }

    // Clear all order history (Admin tool)
    clearOrderHistory() {
        this.orders = [];
        localStorage.removeItem(ORDERS_STORAGE_KEY);
    }
}

// Global instance
window.ordersEngine = new OrdersEngine();

// Price Management Helpers
window.priceManager = {
    // Get custom daily prices dictionary { "prod-whole-chicken": { pricePerKg: 220, marketPricePerKg: 240 } }
    getCustomPrices() {
        try {
            const data = localStorage.getItem(PRICES_STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    // Save updated prices dictionary
    saveCustomPrices(pricesMap) {
        if (!pricesMap || typeof pricesMap !== 'object' || Array.isArray(pricesMap)) {
            console.error('Invalid price object input');
            return false;
        }

        // Validate values (reject negative numbers, NaNs, or non-numeric inputs)
        for (const key of Object.keys(pricesMap)) {
            const val = pricesMap[key];
            if (typeof val === 'number') {
                if (isNaN(val) || val <= 0) return false;
            } else if (val && typeof val === 'object') {
                if (val.pricePerKg !== undefined && (isNaN(val.pricePerKg) || val.pricePerKg <= 0)) return false;
                if (val.marketPricePerKg !== undefined && (isNaN(val.marketPricePerKg) || val.marketPricePerKg <= 0)) return false;
            } else {
                return false;
            }
        }

        try {
            localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(pricesMap));
            this.applyCustomPrices();

            // Sync real-time with Firebase Cloud DB
            if (window.cloudDb) {
                window.cloudDb.savePricesToCloud(pricesMap);
            }
            return true;
        } catch (e) {
            console.error('Error saving custom prices', e);
            return false;
        }
    },

    // Apply custom prices to global PRODUCTS array
    applyCustomPrices() {
        const customPrices = this.getCustomPrices();
        if (window.PRODUCTS && Array.isArray(window.PRODUCTS)) {
            window.PRODUCTS.forEach(product => {
                const val = customPrices[product.id];
                if (val !== undefined && val !== null) {
                    if (typeof val === 'object') {
                        if (val.pricePerKg !== undefined) product.pricePerKg = parseFloat(val.pricePerKg);
                        if (val.marketPricePerKg !== undefined) product.marketPricePerKg = parseFloat(val.marketPricePerKg);
                    } else {
                        product.pricePerKg = parseFloat(val);
                    }
                }
            });
        }
    },

    // Reset prices to default catalog values
    resetDefaultPrices() {
        localStorage.removeItem(PRICES_STORAGE_KEY);
        if (typeof window.initDefaultProducts === 'function') {
            window.initDefaultProducts();
        }
    }
};

// Apply custom prices on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.priceManager.applyCustomPrices();
    });
}
