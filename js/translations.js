/**
 * Fresh Chicken - Kannada & English Localization (i18n) Engine
 * Provides authentic, natural Kannada translations across the entire customer application.
 */

const TRANSLATIONS = {
    en: {
        // Brand & Header
        'brand_name': 'Fresh Chicken',
        'brand_subtitle': 'Hassan • Farm Fresh Cuts',
        'nav_home': 'Home',
        'nav_products': 'All Products',
        'nav_orders': 'My Orders',
        'nav_cart': 'Cart',
        'nav_contact': 'Contact Us',
        'order_fresh_meat': 'Order Fresh Meat',
        'search_placeholder': 'Search chicken, cuts, boneless...',
        
        // Store Status
        'store_open_title': 'Open Now',
        'store_open_hours': '(9:00 AM - 8:00 PM) • Express Delivery in 30-45 Mins',
        'store_closed_title': 'Store Closed (Opens 9:00 AM)',
        'store_closed_hours': 'Pre-order now for 9:00 AM morning fresh delivery',
        
        // Free Delivery Progress
        'free_delivery_progress': 'Free Doorstep Delivery on orders above ₹500',
        'free_delivery_unlocked': '🎉 Congratulations! You unlocked FREE Doorstep Delivery!',
        'free_delivery_need_more': 'Add ₹{amount} more chicken for FREE Delivery!',
        
        // Product Details & Pricing
        'market_price': 'Market Price (COT):',
        'our_best_price': 'Our Best Price:',
        'save_per_kg': 'Save ₹{amount}/Kg',
        'in_stock': 'In Stock (Fresh Cut Daily)',
        'cut_prep_style': 'Cut & Prep Style:',
        'add_to_cart': 'Add to Cart',
        'add_qty_kg': 'Add {qty} Kg • ₹{total}',
        'popular': 'Popular',
        'best_seller': 'Best Seller',
        'high_protein': 'High Protein',
        'fitness_pick': 'Fitness Pick',
        'snack_special': 'Snack Special',
        'kid_favorite': 'Kid Favorite',
        'party_favorite': 'Party Favorite',
        'nutrient_rich': 'Nutrient Rich',

        // Cut Names
        'cut_curry': '🥘 Curry Cut',
        'cut_biryani': '🍗 Biryani Cut',
        'cut_fry': '🍳 Fry Cut',
        'cut_standard': '🔪 Standard',

        // Categories
        'cat_all': 'All Cuts',
        'cat_whole': 'Whole Chicken',
        'cat_boneless': 'Boneless & Fillets',
        'cat_special': 'Specialty Cuts',

        // Cart Page
        'cart_title': 'Your Fresh Cart',
        'cart_empty_title': 'Your Cart is Empty',
        'cart_empty_desc': 'Looks like you haven\'t added any fresh chicken cuts to your cart yet.',
        'explore_products': 'Explore Products',
        'continue_shopping': 'Continue Shopping',
        'order_summary': 'Order Summary',
        'subtotal': 'Subtotal',
        'delivery_fee': 'Delivery Fee',
        'total_amount': 'Total Amount',
        'free': 'FREE',
        'proceed_to_checkout': 'Proceed to Checkout',
        'remove': 'Remove',
        'direct_order_wa': 'Direct Order via Official WhatsApp',

        // Checkout Page
        'checkout_title': 'Checkout & Delivery',
        'checkout_subtitle': 'Provide your delivery address and choose your payment method.',
        'delivery_info': 'Delivery Information',
        'use_gps_btn': 'Use My GPS Location',
        'detecting_gps': 'Detecting GPS...',
        'fetching_address': 'Fetching Address...',
        'gps_attached': 'GPS Attached ✔',
        'remove_gps': 'Remove',
        'cust_name': 'Customer Name *',
        'cust_phone': 'Phone Number *',
        'cust_street': 'House / Building / Street *',
        'cust_area': 'Area / Locality *',
        'cust_city': 'City *',
        'cust_pincode': 'Pincode *',
        'cust_notes': 'Order / Cutting Instructions (Optional)',
        'delivery_slot_title': 'Select Delivery Time Slot (9:00 AM - 8:00 PM)',
        'slot_express': '⚡ Express Delivery',
        'slot_express_desc': 'Fresh cut & dispatched in 30-45 mins',
        'slot_morning': '🌅 Morning Slot',
        'slot_morning_desc': '9:00 AM - 12:00 PM',
        'slot_afternoon': '☀️ Afternoon Slot',
        'slot_afternoon_desc': '12:00 PM - 4:00 PM',
        'slot_evening': '🌆 Evening Slot',
        'slot_evening_desc': '4:00 PM - 8:00 PM',
        'payment_method_title': 'Select Payment Method',
        'pay_upi': 'Google Pay / UPI Scanner',
        'pay_upi_desc': 'Scan QR Code or copy UPI ID',
        'pay_cod': 'Cash / UPI on Delivery',
        'pay_cod_desc': 'Pay cash or UPI upon doorstep delivery',
        'place_order_btn': 'Confirm & Place Order on WhatsApp',
        'order_ready_title': 'Order Ready to Send!',
        'send_wa_btn': 'Send Order on WhatsApp',

        // Footer & Contact
        'footer_desc': 'Farm fresh, hygienic poultry cuts delivered directly to your doorstep in Hassan. Simple, quick WhatsApp ordering.',
        'quick_links': 'Quick Links',
        'contact_details': 'Contact Details',
        'instant_order': 'Instant Order',
        'wa_order_btn': 'WhatsApp Order',
        'rights_reserved': 'All rights reserved.'
    },

    kn: {
        // Brand & Header
        'brand_name': 'ಫ್ರೆಶ್ ಚಿಕನ್',
        'brand_subtitle': 'ಹಾಸನ • ತಾಜಾ ಫಾರ್ಮ್ ಕೋಳಿ ಮಾಂಸ',
        'nav_home': 'ಮುಖಪುಟ',
        'nav_products': 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು',
        'nav_orders': 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
        'nav_cart': 'ಕಾರ್ಟ್',
        'nav_contact': 'ಸಂಪರ್ಕಿಸಿ',
        'order_fresh_meat': 'ತಾಜಾ ಚಿಕನ್ ಆರ್ಡರ್ ಮಾಡಿ',
        'search_placeholder': 'ಚಿಕನ್, ಬೋನ್ಲೆಸ್, ಕಟ್ಸ್ ಹುಡುಕಿ...',

        // Store Status
        'store_open_title': 'ಅಂಗಡಿ ತೆರೆದಿದೆ',
        'store_open_hours': '(ಬೆಳಿಗ್ಗೆ 9:00 - ರಾತ್ರಿ 8:00) • 30-45 ನಿಮಿಷಗಳಲ್ಲಿ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಡೆಲಿವರಿ',
        'store_closed_title': 'ಅಂಗಡಿ ಮುಚ್ಚಿದೆ (ಬೆಳಿಗ್ಗೆ 9:00 ಕ್ಕೆ ತೆರೆಯುತ್ತದೆ)',
        'store_closed_hours': 'ಮುಂಜಾನೆ 9:00 ಗಂಟೆಯ ತಾಜಾ ಡೆಲಿವರಿಗಾಗಿ ಈಗಲೇ ಮುಂಗಡ ಆರ್ಡರ್ ಮಾಡಿ',

        // Free Delivery Progress
        'free_delivery_progress': '₹500 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ಮನೆ ಬಾಗಿಲಿಗೆ ಡೆಲಿವರಿ',
        'free_delivery_unlocked': '🎉 ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಆರ್ಡರ್‌ಗೆ ಉಚಿತ ಹೋಮ್ ಡೆಲಿವರಿ ಲಭ್ಯವಾಗಿದೆ!',
        'free_delivery_need_more': 'ಉಚಿತ ಡೆಲಿವರಿ ಪಡೆಯಲು ಇನ್ನೂ ₹{amount} ಮೊತ್ತದ ಚಿಕನ್ ಸೇರಿಸಿ!',

        // Product Details & Pricing
        'market_price': 'ಮಾರುಕಟ್ಟೆ ದರ (COT):',
        'our_best_price': 'ನಮ್ಮ ಉತ್ತಮ ಬೆಲೆ:',
        'save_per_kg': 'ಪ್ರತಿ ಕೆ.ಜಿಗೆ ₹{amount} ಉಳಿತಾಯ',
        'in_stock': 'ದಾಸ್ತಾನು ಲಭ್ಯವಿದೆ (ದಿನವೂ ತಾಜಾ ಕಟಿಂಗ್)',
        'cut_prep_style': 'ಕಟಿಂಗ್ ಶೈಲಿ:',
        'add_to_cart': 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
        'add_qty_kg': '{qty} ಕೆ.ಜಿ ಸೇರಿಸಿ • ₹{total}',
        'popular': 'ಜನಪ್ರಿಯ',
        'best_seller': 'ಅತ್ಯುತ್ತಮ ಮಾರಾಟ',
        'high_protein': 'ಹೆಚ್ಚಿನ ಪ್ರೋಟೀನ್',
        'fitness_pick': 'ಫಿಟ್ನೆಸ್ ಆಯ್ಕೆ',
        'snack_special': 'ಸ್ನ್ಯಾಕ್ಸ್ ಸ್ಪೆಷಲ್',
        'kid_favorite': 'ಮಕ್ಕಳ ಅಚ್ಚುಮೆಚ್ಚು',
        'party_favorite': 'ಪಾರ್ಟಿ ಸ್ಪೆಷಲ್',
        'nutrient_rich': 'ಪೋಷಕಾಂಶ ಭರಿತ',

        // Cut Names
        'cut_curry': '🥘 ಸಾರು ಕಟ್ (Curry Cut)',
        'cut_biryani': '🍗 ಬಿರಿಯಾನಿ ಕಟ್ (Biryani Cut)',
        'cut_fry': '🍳 ಫ್ರೈ ಕಟ್ (Fry Cut)',
        'cut_standard': '🔪 ಸಾಮಾನ್ಯ ಕಟ್ (Standard)',

        // Categories
        'cat_all': 'ಎಲ್ಲಾ ಮಾದರಿಗಳು',
        'cat_whole': 'ಸಂಪೂರ್ಣ ಚಿಕನ್',
        'cat_boneless': 'ಬೋನ್ಲೆಸ್ & ಫಿಲೆಟ್',
        'cat_special': 'ವಿಶೇಷ ಕಟ್ಸ್',

        // Cart Page
        'cart_title': 'ನಿಮ್ಮ ಕಾರ್ಟ್',
        'cart_empty_title': 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
        'cart_empty_desc': 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ತಾಜಾ ಚಿಕನ್ ತುಂಡುಗಳನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿಲ್ಲ.',
        'explore_products': 'ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ',
        'continue_shopping': 'ಇನ್ನಷ್ಟು ಖರೀದಿಸಿ',
        'order_summary': 'ಆರ್ಡರ್ ಸಾರಾಂಶ',
        'subtotal': 'ಉತ್ಪನ್ನಗಳ ಮೊತ್ತ',
        'delivery_fee': 'ಡೆಲಿವರಿ ಶುಲ್ಕ',
        'total_amount': 'ಪಾವತಿಸಬೇಕಾದ ಒಟ್ಟು ಮೊತ್ತ',
        'free': 'ಉಚಿತ (FREE)',
        'proceed_to_checkout': 'ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ',
        'remove': 'ತೆಗೆದುಹಾಕಿ',
        'direct_order_wa': 'ಅಧಿಕೃತ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ನೇರ ಆರ್ಡರ್',

        // Checkout Page
        'checkout_title': 'ಚೆಕ್‌ಔಟ್ ಮತ್ತು ಡೆಲಿವರಿ',
        'checkout_subtitle': 'ನಿಮ್ಮ ಡೆಲಿವರಿ ವಿಳಾಸ ನಮೂದಿಸಿ ಮತ್ತು ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
        'delivery_info': 'ಡೆಲಿವರಿ ವಿವರಗಳು',
        'use_gps_btn': '📍 ನನ್ನ ಜಿಪಿಎಸ್ ಸ್ಥಳ ಬಳಸಿ',
        'detecting_gps': 'ಜಿಪಿಎಸ್ ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
        'fetching_address': 'ವಿಳಾಸ ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
        'gps_attached': 'ಜಿಪಿಎಸ್ ಲಗತ್ತಿಸಲಾಗಿದೆ ✔',
        'remove_gps': 'ತೆಗೆದುಹಾಕಿ',
        'cust_name': 'ಗ್ರಾಹಕರ ಹೆಸರು *',
        'cust_phone': 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *',
        'cust_street': 'ಮನೆ / ಕಟ್ಟಡ / ರಸ್ತೆ *',
        'cust_area': 'ಬಡಾವಣೆ / ಏರಿಯಾ *',
        'cust_city': 'ನಗರ (ಹಾಸನ) *',
        'cust_pincode': 'ಪಿನ್‌ಕೋಡ್ *',
        'cust_notes': 'ಕಟಿಂಗ್ ಅಥವಾ ಡೆಲಿವರಿ ಸೂಚನೆಗಳು (ಐಚ್ಛಿಕ)',
        'delivery_slot_title': 'ಡೆಲಿವರಿ ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಬೆಳಿಗ್ಗೆ 9:00 - ರಾತ್ರಿ 8:00)',
        'slot_express': '⚡ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಡೆಲಿವರಿ',
        'slot_express_desc': 'ತಾಜಾ ಕಟ್ ಮಾಡಿ 30-45 ನಿಮಿಷಗಳಲ್ಲಿ ರವಾನೆ',
        'slot_morning': '🌅 ಮುಂಜಾನೆ ಸಮಯ',
        'slot_morning_desc': '9:00 AM - 12:00 PM',
        'slot_afternoon': '☀️ ಮಧ್ಯಾಹ್ನದ ಸಮಯ',
        'slot_afternoon_desc': '12:00 PM - 4:00 PM',
        'slot_evening': '🌆 ಸಂಜೆಯ ಸಮಯ',
        'slot_evening_desc': '4:00 PM - 8:00 PM',
        'payment_method_title': 'ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'pay_upi': 'ಗೂಗಲ್ ಪೇ / ಯುಪಿಐ ಸ್ಕ್ಯಾನರ್',
        'pay_upi_desc': 'ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಯುಪಿಐ ಐಡಿ ಬಳಸಿ',
        'pay_cod': 'ಕ್ಯಾಶ್ / ಯುಪಿಐ ಆನ್ ಡೆಲಿವರಿ',
        'pay_cod_desc': 'ಮನೆ ಬಾಗಿಲಿಗೆ ಬಂದಾಗ ನಗದು ಅಥವಾ ಯುಪಿಐ ಮೂಲಕ ಪಾವತಿಸಿ',
        'place_order_btn': 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಿ',
        'order_ready_title': 'ಆರ್ಡರ್ ಕಳುಹಿಸಲು ಸಿದ್ಧವಾಗಿದೆ!',
        'send_wa_btn': 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ಕಳುಹಿಸಿ',

        // Footer & Contact
        'footer_desc': 'ಹಾಸನದಲ್ಲಿ ಫಾರ್ಮ್‌ನಿಂದ ನೇರವಾಗಿ ತಾಜಾ ಹಾಗೂ ಶುಚಿಯಾದ ಚಿಕನ್ ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ ತಲುಪಿಸಲಾಗುತ್ತದೆ. ಸುಲಭ ಹಾಗೂ ವೇಗದ ವಾಟ್ಸಾಪ್ ಆರ್ಡರ್.',
        'quick_links': 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
        'contact_details': 'ಸಂಪರ್ಕ ವಿವರಗಳು',
        'instant_order': 'ತ್ವರಿತ ಆರ್ಡರ್',
        'wa_order_btn': 'ವಾಟ್ಸಾಪ್ ಆರ್ಡರ್',
        'rights_reserved': 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.'
    }
};

// Current active language ('en' or 'kn')
let currentLanguage = localStorage.getItem('fresh_chicken_lang') || 'en';

// Helper function to get translated text
function t(key, fallback = '') {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en'];
    return dict[key] !== undefined ? dict[key] : (TRANSLATIONS['en'][key] || fallback || key);
}

// Set active language and apply across the DOM
function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'kn') lang = 'en';
    currentLanguage = lang;
    localStorage.setItem('fresh_chicken_lang', lang);

    // Apply translations to DOM elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text) {
            el.innerHTML = text;
        }
    });

    // Apply translations to placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = t(key);
        if (text) {
            el.placeholder = text;
        }
    });

    // Update active state of language toggle buttons
    updateLanguageToggleUI();

    // Dispatch global event for pages with dynamic content (products, cart, checkout)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLanguage } }));
}

// Update the visual appearance of the Language Switcher button
function updateLanguageToggleUI() {
    document.querySelectorAll('.lang-btn-en').forEach(btn => {
        if (currentLanguage === 'en') {
            btn.classList.add('bg-[#133B2C]', 'text-white', 'shadow-sm');
            btn.classList.remove('text-gray-700', 'hover:bg-gray-100');
        } else {
            btn.classList.remove('bg-[#133B2C]', 'text-white', 'shadow-sm');
            btn.classList.add('text-gray-700', 'hover:bg-gray-100');
        }
    });

    document.querySelectorAll('.lang-btn-kn').forEach(btn => {
        if (currentLanguage === 'kn') {
            btn.classList.add('bg-[#133B2C]', 'text-white', 'shadow-sm');
            btn.classList.remove('text-gray-700', 'hover:bg-gray-100');
        } else {
            btn.classList.remove('bg-[#133B2C]', 'text-white', 'shadow-sm');
            btn.classList.add('text-gray-700', 'hover:bg-gray-100');
        }
    });
}

// Toggle language between EN and KN
function toggleLanguage() {
    setLanguage(currentLanguage === 'en' ? 'kn' : 'en');
}

// Auto-initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setLanguage(currentLanguage);
    });
}

window.t = t;
window.setLanguage = setLanguage;
window.toggleLanguage = toggleLanguage;
window.currentLanguage = currentLanguage;
