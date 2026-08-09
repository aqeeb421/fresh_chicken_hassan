# Fresh Chicken - Premium Poultry Delivery Web Application

**Fresh Chicken** is a complete, production-ready, highly responsive food delivery web application built with HTML5, Tailwind CSS, Vanilla JavaScript, and direct WhatsApp order integration.

---

## 🌟 Key Features

1. **Modern Premium Aesthetic**:
   - Palette: Dark Forest Green (`#133B2C`), Vibrant Red (`#E53935`), Pure White (`#FFFFFF`).
   - Fonts: Montserrat (Headings) & Inter (Body Text).
   - Glassmorphism navigation bar, micro-animations, rounded card elevation, and responsive design for mobile, tablet, and desktop.

2. **WhatsApp Order Flow**:
   - Zero complex backend setup or payment gateway required.
   - Customers fill in their delivery information (Name, Phone, Address, Pincode, Notes).
   - Order summary & total amount generated automatically.
   - Generates a beautifully formatted WhatsApp order text and opens `https://wa.me/YOUR_NUMBER?text=ENCODED_MESSAGE`.

3. **Product Catalog & Controls**:
   - Whole Chicken, Skinless Chicken, Curry Cut, Boneless, Wings, Drumsticks, Mince, and Breast Fillet.
   - Live Search Query filtering.
   - Category Filter Chips (`All`, `Whole`, `Cuts`, `Boneless`, `Special Cuts`).
   - Per-product quantity selector (`+` / `-` Kg) and interactive Add to Cart toast alerts.

4. **Persistent Shopping Cart**:
   - Stored in `localStorage`.
   - Real-time badge counter on sticky navbar.
   - Free delivery progress banner (free delivery above ₹500).
   - Empty cart illustration and shopping CTA.

5. **Centralized Configuration**:
   - Change `WHATSAPP_NUMBER`, `BUSINESS_NAME`, `PHONE_NUMBER`, `ADDRESS`, `DELIVERY_CHARGE`, and `FREE_DELIVERY_LIMIT` easily inside `js/config.js`.

---

## 📁 File & Code Structure

```
Fresh Chiken/
├── index.html          # Home Page (Hero, Features, Featured Products)
├── products.html       # Full Product Catalog with Search & Filter
├── cart.html           # Shopping Cart Page
├── checkout.html       # Customer Delivery Form & WhatsApp Generator
├── contact.html        # Contact Page & Inquiry Form
├── README.md           # Project Documentation
├── css/
│   └── styles.css      # Custom Animations, Design Tokens & Styling
└── js/
    ├── config.js       # Central Business Constants
    ├── products-data.js# Catalog Items Data Array
    ├── cart.js         # Cart Engine & localStorage Manager
    ├── main.js         # Navigation Drawer, Sticky Header, Badge Update
    ├── products.js     # Catalog Search & Filter Controller
    └── checkout.js     # Form Validation & WhatsApp Order Encoder
```

---

## ⚙️ Configuration & Customization

Open `js/config.js` to change your store details:

```javascript
const CONFIG = {
    BUSINESS_NAME: 'Fresh Chicken',
    WHATSAPP_NUMBER: '919876543210', // <-- Replace with your WhatsApp number (Country code + number without + or spaces)
    PHONE_NUMBER: '+91 98765 43210',
    ADDRESS: '123 Fresh Poultry Market, City - 560001',
    BUSINESS_HOURS: 'Mon - Sun: 7:00 AM - 9:00 PM',
    CURRENCY_SYMBOL: '₹',
    DELIVERY_CHARGE: 40,
    FREE_DELIVERY_LIMIT: 500
};
```

---

## 🚀 Deployment Instructions

### 1. Netlify
1. Drag and drop the `Fresh Chiken` folder into the Netlify Deploy dashboard.
2. Deployment completes instantly.

### 2. Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside the `Fresh Chiken` root folder.

### 3. Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Run `firebase login` and `firebase init hosting` (set public directory to `.`).
3. Run `firebase deploy`.

---

&copy; 2026 Fresh Chicken. All rights reserved.
