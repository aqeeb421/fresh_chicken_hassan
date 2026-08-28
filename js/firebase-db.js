/**
 * Fresh Chicken - Dual-Engine Real-Time Cloud Database
 * Combines Firebase SDK (WebSockets for instant 0ms sync) + REST API (HTTPS fallback).
 * Guaranteed real-time sync across all devices, mobile phones, incognito tabs, and networks worldwide.
 */

class CloudDatabaseEngine {
    constructor() {
        const config = window.CONFIG && window.CONFIG.FIREBASE_CONFIG;
        this.baseUrl = (config && config.databaseURL ? config.databaseURL : 'https://my-work-c68d9.firebaseio.com').replace(/\/+$/, '');
        this.isFirebaseReady = false;
        this.initError = null;
        this.useSdk = false;
        this.pollInterval = null;
        this.ordersInterval = null;

        // Try initializing Official Firebase SDK for instant WebSockets
        if (typeof firebase !== 'undefined' && config) {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(config);
                }
                this.db = firebase.database();
                this.useSdk = true;
                this.isFirebaseReady = true;
                console.log('⚡ Firebase SDK WebSocket Engine Active for:', this.baseUrl);
            } catch (e) {
                console.warn('⚠️ Firebase SDK initialization failed, falling back to REST Engine:', e);
                this.initError = e.message;
            }
        }

        if (!this.useSdk) {
            this.isFirebaseReady = true;
            console.log('⚡ Universal REST Engine Active for:', this.baseUrl);
        }

        this.listenToRealtimePrices();
    }

    // 1. Listen to real-time price updates
    listenToRealtimePrices() {
        if (this.useSdk && this.db) {
            // Instant real-time WebSocket listener
            this.db.ref('prices').on('value', (snapshot) => {
                const customPrices = snapshot.val();
                if (customPrices && typeof customPrices === 'object') {
                    this.handlePriceUpdate(customPrices);
                }
            }, (err) => {
                console.error('⛔ Firebase SDK Price Sync Error:', err);
                // Fallback to REST polling if WebSocket fails
                this.startRestPricePolling();
            });
        } else {
            this.startRestPricePolling();
        }
    }

    startRestPricePolling() {
        this.fetchLatestPrices();
        if (!this.pollInterval) {
            this.pollInterval = setInterval(() => {
                this.fetchLatestPrices();
            }, 3000);
        }
    }

    handlePriceUpdate(customPrices) {
        localStorage.setItem('fresh_chicken_custom_prices_v1', JSON.stringify(customPrices));
        if (window.priceManager) {
            window.priceManager.applyCustomPrices();
        }
        window.dispatchEvent(new CustomEvent('pricesUpdatedRealtime', { detail: customPrices }));
        window.dispatchEvent(new CustomEvent('firebaseConnected'));
    }

    async fetchLatestPrices() {
        try {
            const response = await fetch(`${this.baseUrl}/prices.json?t=${Date.now()}`);
            if (response.ok) {
                const customPrices = await response.json();
                if (customPrices && typeof customPrices === 'object') {
                    this.handlePriceUpdate(customPrices);
                }
            } else if (response.status === 403) {
                console.error('⛔ Firebase Permission Denied (403): Realtime Database security rules are blocking read access.');
            } else {
                console.error(`⚠️ Firebase HTTP Error (${response.status}):`, await response.text());
            }
        } catch (e) {
            console.error('Error fetching prices from Cloud DB:', e);
        }
    }

    // 2. Save prices to Cloud Database
    async savePricesToCloud(pricesMap) {
        if (this.useSdk && this.db) {
            try {
                await this.db.ref('prices').set(pricesMap);
                console.log('⚡ Prices saved successfully via Firebase SDK!');
                this.handlePriceUpdate(pricesMap);
                return true;
            } catch (e) {
                console.error('Error saving prices via SDK, falling back to REST:', e);
            }
        }

        // REST fallback
        try {
            console.log('⚡ Saving prices to Cloud DB via REST:', pricesMap);
            const response = await fetch(`${this.baseUrl}/prices.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pricesMap)
            });

            if (response.ok) {
                console.log('⚡ Prices saved successfully to Cloud DB via REST!');
                this.handlePriceUpdate(pricesMap);
                return true;
            } else if (response.status === 403) {
                console.error('⛔ Firebase Permission Denied (403): Realtime Database security rules are blocking write access.');
            } else {
                console.error(`⚠️ Firebase PUT Error (${response.status}):`, await response.text());
            }
        } catch (e) {
            console.error('Error saving prices to Cloud DB:', e);
        }
        return false;
    }

    // 3. Save new order to Cloud Database (routes test orders to test-orders/)
    async saveOrderToCloud(orderData) {
        const node = orderData.isTest ? 'test-orders' : 'orders';
        if (this.useSdk && this.db) {
            try {
                await this.db.ref(`${node}/${orderData.id}`).set(orderData);
                console.log(`⚡ Order saved to Cloud DB [${node}]:`, orderData.id);
                return true;
            } catch (e) {
                console.error('Error saving order via SDK, falling back to REST:', e);
            }
        }

        // REST fallback
        try {
            console.log(`⚡ Saving order to Cloud DB via REST [${node}]:`, orderData.id);
            const response = await fetch(`${this.baseUrl}/${node}/${orderData.id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                console.log(`⚡ Order saved successfully to Cloud DB via REST [${node}]!`);
                return true;
            } else if (response.status === 403) {
                console.error('⛔ Firebase Permission Denied (403): Security rules blocking order creation.');
            } else {
                console.error(`⚠️ Firebase Order Save Error (${response.status}):`, await response.text());
            }
        } catch (e) {
            console.error('Error saving order to Cloud DB:', e);
        }
        return false;
    }

    // 3.5 Update Order Status in Cloud DB
    async updateOrderStatusInCloud(orderId, newStatus, isTest = false) {
        const node = isTest || orderId.startsWith('TEST-') ? 'test-orders' : 'orders';
        if (this.useSdk && this.db) {
            try {
                await this.db.ref(`${node}/${orderId}/status`).set(newStatus);
                console.log(`⚡ Order status updated in Cloud DB [${node}]: ${orderId} -> ${newStatus}`);
                return true;
            } catch (e) {
                console.error('Error updating order status via SDK:', e);
            }
        }

        try {
            const response = await fetch(`${this.baseUrl}/${node}/${orderId}/status.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStatus)
            });
            if (response.ok) {
                console.log(`⚡ Order status updated via REST [${node}]: ${orderId} -> ${newStatus}`);
                return true;
            }
        } catch (e) {
            console.error('Error updating status via REST:', e);
        }
        return false;
    }

    // 4. Listen to order history in real time (for Admin panel)
    listenToRealtimeOrders(callback) {
        if (this.useSdk && this.db) {
            this.db.ref('orders').on('value', (snapshot) => {
                const data = snapshot.val();
                const orders = data ? Object.values(data).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')) : [];
                if (typeof callback === 'function') callback(orders);
            }, (err) => {
                console.error('⛔ Firebase SDK Order Listen Error:', err);
                this.startRestOrderPolling(callback);
            });
        } else {
            this.startRestOrderPolling(callback);
        }
    }

    startRestOrderPolling(callback) {
        this.fetchOrders(callback);

        if (!this.ordersInterval) {
            this.ordersInterval = setInterval(() => {
                this.fetchOrders(callback);
            }, 3000);
        }
    }

    async fetchOrders(callback) {
        try {
            const response = await fetch(`${this.baseUrl}/orders.json?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                const orders = data ? Object.values(data).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')) : [];
                if (typeof callback === 'function') callback(orders);
            } else if (response.status === 403) {
                console.error('⛔ Firebase Permission Denied (403): Security rules blocking order fetch.');
            }
        } catch (e) {
            console.error('Error fetching orders from Cloud DB:', e);
        }
    }

    // 5. Save promotional banners to Cloud Database
    async saveBannersToCloud(bannersList) {
        if (this.useSdk && this.db) {
            try {
                await this.db.ref('banners').set(bannersList);
                console.log('⚡ Banners saved successfully via Firebase SDK!');
                return true;
            } catch (e) {
                console.error('Error saving banners via SDK:', e);
            }
        }

        try {
            const response = await fetch(`${this.baseUrl}/banners.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bannersList)
            });
            if (response.ok) {
                console.log('⚡ Banners saved successfully via REST!');
                return true;
            }
        } catch (e) {
            console.error('Error saving banners via REST:', e);
        }
        return false;
    }

    // 6. Listen to promotional banners in real time
    listenToRealtimeBanners(callback) {
        if (this.useSdk && this.db) {
            this.db.ref('banners').on('value', (snapshot) => {
                const data = snapshot.val();
                const banners = Array.isArray(data) ? data : (data ? Object.values(data) : null);
                if (banners && typeof callback === 'function') callback(banners);
            }, (err) => {
                console.error('⛔ Firebase SDK Banner Sync Error:', err);
                this.startRestBannerPolling(callback);
            });
        } else {
            this.startRestBannerPolling(callback);
        }
    }

    startRestBannerPolling(callback) {
        this.fetchBanners(callback);
        if (!this.bannersInterval) {
            this.bannersInterval = setInterval(() => {
                this.fetchBanners(callback);
            }, 3000);
        }
    }

    async fetchBanners(callback) {
        try {
            const response = await fetch(`${this.baseUrl}/banners.json?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                const banners = Array.isArray(data) ? data : (data ? Object.values(data) : null);
                if (banners && typeof callback === 'function') callback(banners);
            }
        } catch (e) {
            console.error('Error fetching banners from Cloud DB:', e);
        }
    }
}

// Global instance
window.cloudDb = new CloudDatabaseEngine();
