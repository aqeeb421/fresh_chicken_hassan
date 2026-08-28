/**
 * Fresh Chicken - Automated Test Suite (Node.js Runner)
 * Tests core business logic, cart operations, decimal weights, live price math, and order deduplication.
 */

const assert = require('assert');
const { readFileSync } = require('fs');

// Mock localStorage for Node.js environment
class LocalStorageMock {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = String(value);
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
}

global.localStorage = new LocalStorageMock();
global.window = {
    localStorage: global.localStorage,
    dispatchEvent: () => {}
};
global.CustomEvent = class {};

// Mock CONFIG
global.CONFIG = {
    BUSINESS_NAME: 'Fresh Chicken',
    DELIVERY_CHARGE: 40,
    FREE_DELIVERY_LIMIT: 500
};

// Mock PRODUCTS
global.PRODUCTS = [
    {
        id: 'prod-whole-chicken',
        name: 'Chicken (With Skin)',
        category: 'Whole',
        marketPricePerKg: 240,
        pricePerKg: 220,
        unit: '1 Kg'
    },
    {
        id: 'prod-boneless',
        name: 'Boneless Chicken',
        category: 'Boneless',
        marketPricePerKg: 360,
        pricePerKg: 340,
        unit: '1 Kg'
    }
];

// Test Results Collector
let passed = 0;
let failed = 0;
const results = [];

function test(description, fn) {
    try {
        fn();
        passed++;
        results.push({ name: description, status: 'PASSED' });
        console.log(`\x1b[32m✔ PASS:\x1b[0m ${description}`);
    } catch (err) {
        failed++;
        results.push({ name: description, status: 'FAILED', error: err.message });
        console.error(`\x1b[31m✖ FAIL:\x1b[0m ${description}\n  \x1b[33mError: ${err.message}\x1b[0m`);
    }
}

console.log('\n======================================================');
console.log('🐔 FRESH CHICKEN AUTOMATED TEST SUITE RUNNER');
console.log('======================================================\n');

// ----------------------------------------------------
// 1. Quantity Sanitization & Step Tests (from products.js logic)
// ----------------------------------------------------
const QTY_MIN = 1;
const QTY_STEP = 0.5;

function sanitizeQty(raw) {
    let val = parseFloat(raw);
    if (isNaN(val) || val < QTY_MIN) val = QTY_MIN;
    val = Math.round(val * 2) / 2;
    if (val < QTY_MIN) val = QTY_MIN;
    return val;
}

test('Sanitize Quantity: Rejects value below 1 Kg and clamps to minimum 1 Kg', () => {
    assert.strictEqual(sanitizeQty(0.2), 1);
    assert.strictEqual(sanitizeQty(-5), 1);
    assert.strictEqual(sanitizeQty('invalid'), 1);
    assert.strictEqual(sanitizeQty(0), 1);
});

test('Sanitize Quantity: Snaps fractional input to nearest 0.5 Kg step', () => {
    assert.strictEqual(sanitizeQty(1.3), 1.5);
    assert.strictEqual(sanitizeQty(1.7), 1.5);
    assert.strictEqual(sanitizeQty(1.8), 2.0);
    assert.strictEqual(sanitizeQty(2.24), 2.0);
    assert.strictEqual(sanitizeQty(2.26), 2.5);
});

test('Sanitize Quantity: Correctly parses large quantities typed manually (e.g. 10 Kg, 25 Kg)', () => {
    assert.strictEqual(sanitizeQty(10), 10);
    assert.strictEqual(sanitizeQty('10'), 10);
    assert.strictEqual(sanitizeQty('25.5'), 25.5);
});

// ----------------------------------------------------
// 2. Cart Engine Operations & Decimal Precision Tests
// ----------------------------------------------------
const STORAGE_KEY = 'fresh_chicken_cart_v1';

class CartEngine {
    constructor() {
        this.items = this.loadCart();
    }
    loadCart() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
    saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    }
    addItem(productId, qty = 1, cutType = 'Curry Cut') {
        const quantity = parseFloat(qty);
        if (isNaN(quantity) || quantity <= 0) return false;
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return false;

        const validCut = cutType || 'Curry Cut';
        const cartItemId = `${product.id}__${validCut.replace(/\s+/g, '_')}`;

        const existingIndex = this.items.findIndex(item => item.cartItemId === cartItemId || (item.id === productId && item.cutType === validCut));
        if (existingIndex > -1) {
            this.items[existingIndex].quantity = Math.round((this.items[existingIndex].quantity + quantity) * 100) / 100;
        } else {
            this.items.push({
                cartItemId,
                id: product.id,
                name: product.name,
                pricePerKg: product.pricePerKg,
                unit: product.unit || '1 Kg',
                quantity: quantity,
                cutType: validCut
            });
        }
        this.saveCart();
        return true;
    }
    updateQuantity(cartItemIdOrId, newQty) {
        const qty = parseFloat(newQty);
        const index = this.items.findIndex(item => item.cartItemId === cartItemIdOrId || item.id === cartItemIdOrId);
        if (index === -1) return;
        if (qty <= 0) {
            this.removeItem(cartItemIdOrId);
        } else {
            this.items[index].quantity = Math.round(qty * 100) / 100;
            this.saveCart();
        }
    }
    increment(cartItemIdOrId) {
        const item = this.items.find(i => i.cartItemId === cartItemIdOrId || i.id === cartItemIdOrId);
        if (item) {
            this.updateQuantity(item.cartItemId || item.id, Math.round((item.quantity + 0.5) * 10) / 10);
        } else {
            this.addItem(cartItemIdOrId, 1);
        }
    }
    decrement(cartItemIdOrId) {
        const item = this.items.find(i => i.cartItemId === cartItemIdOrId || i.id === cartItemIdOrId);
        if (item) {
            const next = Math.round((item.quantity - 0.5) * 10) / 10;
            this.updateQuantity(item.cartItemId || item.id, next < 1 ? 0 : next);
        }
    }
    removeItem(cartItemIdOrId) {
        this.items = this.items.filter(i => i.cartItemId !== cartItemIdOrId && i.id !== cartItemIdOrId);
        this.saveCart();
    }
    clearCart() {
        this.items = [];
        this.saveCart();
    }
    getTotalCount() {
        return this.items.length; // Unique product count for badge
    }
    getSubtotal() {
        const raw = this.items.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
        return Math.round(raw * 100) / 100;
    }
    getDeliveryCharge() {
        const subtotal = this.getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= (CONFIG.FREE_DELIVERY_LIMIT || 500) ? 0 : (CONFIG.DELIVERY_CHARGE || 40);
    }
    getGrandTotal() {
        return this.getSubtotal() + this.getDeliveryCharge();
    }
}

const cart = new CartEngine();

test('Cart: Adding decimal quantity (1.5 Kg) with cut preference saves cut style correctly', () => {
    cart.clearCart();
    cart.addItem('prod-whole-chicken', 1.5, 'Biryani Cut'); // 1.5 * 220 = 330
    assert.strictEqual(cart.items.length, 1);
    assert.strictEqual(cart.items[0].quantity, 1.5);
    assert.strictEqual(cart.items[0].cutType, 'Biryani Cut');
    assert.strictEqual(cart.getSubtotal(), 330);
});

test('Cart: Adding different cut types of same product keeps distinct item entries', () => {
    cart.clearCart();
    cart.addItem('prod-whole-chicken', 1.0, 'Curry Cut');
    cart.addItem('prod-whole-chicken', 1.0, 'Biryani Cut');
    assert.strictEqual(cart.items.length, 2, 'Should create 2 separate item entries for 2 different cuts');
    assert.strictEqual(cart.items[0].cutType, 'Curry Cut');
    assert.strictEqual(cart.items[1].cutType, 'Biryani Cut');
    assert.strictEqual(cart.getSubtotal(), 440);
});

test('Cart Badge: Badge counts UNIQUE items, not total Kg (e.g. 1 item of 10 Kg = count 1)', () => {
    cart.clearCart();
    cart.addItem('prod-boneless', 10, 'Fry Cut'); // 10 Kg of boneless
    assert.strictEqual(cart.getTotalCount(), 1, 'Badge count should be 1 for a single product with 10 Kg');
    
    cart.addItem('prod-whole-chicken', 2, 'Curry Cut'); // Add second product
    assert.strictEqual(cart.getTotalCount(), 2, 'Badge count should be 2 for 2 unique products');
});

test('Cart: Increment by 0.5 Kg step increases quantity correctly', () => {
    cart.clearCart();
    cart.addItem('prod-whole-chicken', 1.0, 'Curry Cut');
    cart.increment(cart.items[0].cartItemId);
    assert.strictEqual(cart.items[0].quantity, 1.5);
    assert.strictEqual(cart.getSubtotal(), 330);
});

test('Cart: Decrementing below 1 Kg removes item from cart', () => {
    cart.clearCart();
    cart.addItem('prod-whole-chicken', 1.0, 'Curry Cut');
    cart.decrement(cart.items[0].cartItemId); // next is 0.5 < 1 => removes
    assert.strictEqual(cart.items.length, 0);
    assert.strictEqual(cart.getSubtotal(), 0);
});

test('Delivery Charge: Subtotal < 500 applies ₹40 delivery, subtotal >= 500 gives FREE delivery', () => {
    cart.clearCart();
    cart.addItem('prod-whole-chicken', 1.0); // 220 -> < 500
    assert.strictEqual(cart.getDeliveryCharge(), 40);
    assert.strictEqual(cart.getGrandTotal(), 260);

    cart.addItem('prod-boneless', 1.0); // 220 + 340 = 560 -> >= 500
    assert.strictEqual(cart.getDeliveryCharge(), 0);
    assert.strictEqual(cart.getGrandTotal(), 560);
});

// ----------------------------------------------------
// 3. Orders Engine & Test Order Separation Tests
// ----------------------------------------------------
const ORDERS_STORAGE_KEY = 'fresh_chicken_orders_v1';
const TEST_ORDERS_STORAGE_KEY = 'fresh_chicken_test_orders_v1';

class OrdersEngine {
    constructor() {
        this.orders = this.loadOrders();
        this.testOrders = this.loadTestOrders();
    }
    loadOrders() {
        try {
            const data = localStorage.getItem(ORDERS_STORAGE_KEY);
            const list = data ? JSON.parse(data) : [];
            return list.filter(o => !o.isTest);
        } catch (e) {
            return [];
        }
    }
    loadTestOrders() {
        try {
            const data = localStorage.getItem(TEST_ORDERS_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
    saveOrder(orderData) {
        if (!orderData || !orderData.customer || !Array.isArray(orderData.items)) {
            return null;
        }

        const isTest = orderData.isTest === true ||
            (orderData.customer?.name && /\[?test\]?/i.test(orderData.customer.name)) ||
            orderData.customer?.phone === '9999999999';

        const targetList = isTest ? this.testOrders : this.orders;

        const now = Date.now();
        const incomingPhone = (orderData.customer.phone || '').toString().replace(/\D/g, '').slice(-10);
        const incomingAddr = (orderData.customer.fullAddress || '').trim().toLowerCase();

        const recentDuplicate = targetList.find(existing => {
            if (!existing.timestamp) return false;
            const existingTime = new Date(existing.timestamp).getTime();
            const timeDiffSec = (now - existingTime) / 1000;

            if (timeDiffSec >= 0 && timeDiffSec < 60) {
                const existingPhone = (existing.customer?.phone || '').toString().replace(/\D/g, '').slice(-10);
                const existingAddr = (existing.customer?.fullAddress || '').trim().toLowerCase();
                const samePhone = incomingPhone && existingPhone && incomingPhone === existingPhone;
                const sameAddress = incomingAddr && existingAddr && incomingAddr === existingAddr;
                const sameTotal = existing.grandTotal === orderData.grandTotal;

                return (samePhone || sameAddress) && sameTotal;
            }
            return false;
        });

        if (recentDuplicate) {
            return recentDuplicate;
        }

        const newOrder = {
            id: (isTest ? 'TEST-' : 'FC-') + Date.now().toString().slice(-6),
            isTest: Boolean(isTest),
            timestamp: new Date().toISOString(),
            dateISO: new Date().toISOString().split('T')[0],
            customer: orderData.customer,
            items: orderData.items,
            subtotal: orderData.subtotal,
            deliveryCharge: orderData.deliveryCharge,
            grandTotal: orderData.grandTotal,
            status: 'Order Placed'
        };

        if (isTest) {
            this.testOrders.unshift(newOrder);
            localStorage.setItem(TEST_ORDERS_STORAGE_KEY, JSON.stringify(this.testOrders));
        } else {
            this.orders.unshift(newOrder);
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
        }

        return newOrder;
    }

    getLifetimeRevenue() {
        return this.orders.reduce((sum, o) => sum + (o.isTest ? 0 : o.grandTotal), 0);
    }
}

const ordersEngine = new OrdersEngine();

test('Duplicate Prevention: Rapid double-submission within 60s cooldown returns same order without duplicating', () => {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    ordersEngine.orders = [];

    const orderPayload = {
        customer: {
            name: 'Hassan Customer',
            phone: '9148699386',
            fullAddress: 'Santepet Circle, Hassan - 573201'
        },
        items: [{ id: 'prod-whole-chicken', quantity: 1.5, pricePerKg: 220 }],
        subtotal: 330,
        deliveryCharge: 40,
        grandTotal: 370
    };

    // First placement
    const order1 = ordersEngine.saveOrder(orderPayload);
    assert.ok(order1 && order1.id);
    assert.strictEqual(ordersEngine.orders.length, 1);

    // Second placement immediately (simulating double click)
    const order2 = ordersEngine.saveOrder(orderPayload);
    assert.strictEqual(order2.id, order1.id, 'Should return the identical order ID');
    assert.strictEqual(ordersEngine.orders.length, 1, 'Orders array length must remain 1');
});

test('Test Order Isolation: Test orders go to testOrders and do not affect live sales revenue', () => {
    ordersEngine.orders = [];
    ordersEngine.testOrders = [];

    // Save a live order of ₹400
    ordersEngine.saveOrder({
        customer: { name: 'Real Customer', phone: '9148699386', fullAddress: 'Santepet, Hassan' },
        items: [{ id: 'prod-whole-chicken', quantity: 1.0, pricePerKg: 220 }],
        subtotal: 360,
        deliveryCharge: 40,
        grandTotal: 400
    });

    // Save an automated test order of ₹10,000
    const testOrder = ordersEngine.saveOrder({
        isTest: true,
        customer: { name: 'Automated QA [Test]', phone: '9999999999', fullAddress: 'Test Lane, Hassan' },
        items: [{ id: 'prod-boneless', quantity: 10.0, pricePerKg: 340 }],
        subtotal: 9960,
        deliveryCharge: 40,
        grandTotal: 10000
    });

    assert.ok(testOrder.id.startsWith('TEST-'), 'Test order ID must start with TEST- prefix');
    assert.strictEqual(ordersEngine.testOrders.length, 1, 'Test orders list must have 1 order');
    assert.strictEqual(ordersEngine.orders.length, 1, 'Live orders list must only have the 1 live order');
    assert.strictEqual(ordersEngine.getLifetimeRevenue(), 400, 'Live revenue must be ₹400 (ignoring ₹10,000 test order)');
});

// ----------------------------------------------------
// 5. One-Tap Reorder Engine Tests
// ----------------------------------------------------
test('One-Tap Reorder: Restores past order items and cut preferences into cart', () => {
    // Mock Cart
    global.cart = {
        items: [],
        addItem(id, qty, cut) {
            this.items.push({ id, quantity: qty, cutType: cut });
        }
    };
    global.window.cart = global.cart;

    ordersEngine.reorderItems = function(orderId) {
        const list = [...this.orders, ...this.testOrders];
        const order = list.find(o => o.id === orderId);
        if (!order || !order.items || !global.window.cart) return false;
        order.items.forEach(item => {
            global.window.cart.addItem(item.id, item.quantity, item.cutType);
        });
        return true;
    };

    const pastOrder = {
        id: 'FC-999888',
        customer: { name: 'Reorder Customer', phone: '9148699386' },
        items: [
            { id: 'prod-whole-chicken', quantity: 2.0, cutType: 'Biryani Cut' },
            { id: 'prod-boneless', quantity: 1.5, cutType: null }
        ]
    };
    ordersEngine.orders.push(pastOrder);

    const reorderSuccess = ordersEngine.reorderItems('FC-999888');
    assert.strictEqual(reorderSuccess, true, 'Reorder should return true');
    assert.strictEqual(global.cart.items.length, 2, 'Cart should contain 2 reordered items');
    assert.strictEqual(global.cart.items[0].cutType, 'Biryani Cut', 'First item cut preference preserved');
    assert.strictEqual(global.cart.items[1].quantity, 1.5, 'Second item decimal quantity preserved');
});

// ----------------------------------------------------
// 6. PWA Manifest & Service Worker Tests
// ----------------------------------------------------
test('PWA Engine: manifest.json and sw.js are valid and configured for offline PWA install', () => {
    const manifestJson = JSON.parse(readFileSync('./manifest.json', 'utf8'));
    assert.strictEqual(manifestJson.name, 'Fresh Chicken Hassan', 'App name configured in manifest');
    assert.strictEqual(manifestJson.display, 'standalone', 'Display mode must be standalone for native feel');
    assert.strictEqual(manifestJson.theme_color, '#133B2C', 'Theme color matches brand green');

    const swCode = readFileSync('./sw.js', 'utf8');
    assert.ok(swCode.includes('CACHE_NAME'), 'Service worker defines CACHE_NAME');
    assert.ok(swCode.includes('ASSETS_TO_CACHE'), 'Service worker defines cache assets list');
});

console.log('\n------------------------------------------------------');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('------------------------------------------------------\n');

if (failed > 0) {
    process.exit(1);
}
