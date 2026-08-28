/**
 * Fresh Chicken - Application Configuration Constants
 * Central location for business details and delivery settings.
 */

const CONFIG = {
    BUSINESS_NAME: 'Fresh Chicken',
    SLOGAN: 'Farm Fresh • Hygienic • Same Day Delivery',
    WHATSAPP_NUMBER: '919148699386',
    PHONE_NUMBER: '+91 91486 99386',
    EMAIL: 'freshchicken@gmail.com',
    ADDRESS: 'Fresh Poultry Market, santepet circle, Hassan, Pin - 573201',
    BUSINESS_HOURS: 'Mon - Sun: 9:00 AM - 8:00 PM',
    OPEN_HOUR: 9,   // 9:00 AM
    CLOSE_HOUR: 20, // 8:00 PM (20:00)
    CURRENCY_SYMBOL: '₹',
    DELIVERY_CHARGE: 40,
    FREE_DELIVERY_LIMIT: 500,
    UPI_ID: '9148699386-2@ybl',
    UPI_NAME: 'Fresh Chicken Hassan',
    INSTAGRAM_URL: 'https://instagram.com',
    FACEBOOK_URL: 'https://facebook.com',

    // Helper: Check if store is currently open (9:00 AM - 8:00 PM)
    isStoreOpen() {
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour >= this.OPEN_HOUR && currentHour < this.CLOSE_HOUR;
    },

    // Helper: Get human-readable store status message
    getStoreStatusInfo() {
        const isOpen = this.isStoreOpen();
        if (isOpen) {
            return {
                isOpen: true,
                badge: 'Open Now',
                message: 'Accepting orders for Express Delivery (30-45 mins)',
                class: 'bg-emerald-500 text-white'
            };
        } else {
            return {
                isOpen: false,
                badge: 'Store Closed (Opens 9:00 AM)',
                message: 'Pre-order now for fresh morning delivery at 9:00 AM',
                class: 'bg-amber-500 text-gray-950'
            };
        }
    },

    // Firebase Realtime Cloud Database Configuration
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyCxTasfW4mGS6zWGDRZDL-5WI3icEwglbA",
        authDomain: "my-work-c68d9.firebaseapp.com",
        databaseURL: "https://my-work-c68d9.firebaseio.com",
        projectId: "my-work-c68d9",
        storageBucket: "my-work-c68d9.firebasestorage.app",
        messagingSenderId: "233649114123",
        appId: "1:233649114123:web:06523d44af7c8c9ae74b0e"
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
