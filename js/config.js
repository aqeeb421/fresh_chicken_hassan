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
    BUSINESS_HOURS: 'Mon - Sun: 7:00 AM - 9:00 PM',
    CURRENCY_SYMBOL: '₹',
    DELIVERY_CHARGE: 40,
    FREE_DELIVERY_LIMIT: 500,
    UPI_ID: '9148699386-2@ybl',
    UPI_NAME: 'Fresh Chicken Hassan',
    INSTAGRAM_URL: 'https://instagram.com',
    FACEBOOK_URL: 'https://facebook.com',

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
