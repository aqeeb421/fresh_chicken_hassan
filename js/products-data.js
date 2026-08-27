/**
 * Fresh Chicken - Product Catalog Data
 * Contains all chicken & poultry cuts with image paths, pricing per Kg, descriptions, and categories.
 */

const DEFAULT_PRODUCTS = [
    {
        id: 'prod-whole-chicken',
        name: 'Chicken (With Skin)',
        category: 'Whole',
        marketPricePerKg: 240,
        pricePerKg: 220,
        unit: '1 Kg',
        description: 'Fresh, farm-raised chicken with skin intact. Ideal for roasting, grilling, or traditional whole curry.',
        image: 'assets/images/with-skin-chicken.png?v=1.0.5',
        badge: 'Best Seller',
        stockStatus: 'In Stock (Fresh Cut Daily)'
    },
    {
        id: 'prod-skinless-chicken',
        name: 'Chicken (Skinless)',
        category: 'Whole',
        marketPricePerKg: 260,
        pricePerKg: 240,
        unit: '1 Kg',
        description: 'Cleaned, dressed, and skinless whole chicken. Low fat, tender, and ready for all home recipes.',
        image: 'assets/images/skinless-chicken.png?v=1.0.5',
        badge: 'Popular',
        stockStatus: 'In Stock'
    },
    {
        id: 'prod-boneless',
        name: 'Boneless Chicken',
        category: 'Boneless',
        marketPricePerKg: 360,
        pricePerKg: 340,
        unit: '1 Kg',
        description: '100% tender, lean boneless chicken breast and thigh meat. Perfect for tikka, stir-fries, and pasta.',
        image: 'assets/images/boneless-chicken.png?v=1.0.5',
        badge: 'High Protein',
        stockStatus: 'In Stock'
    },
    {
        id: 'prod-wings',
        name: 'Chicken Wings',
        category: 'Special Cuts',
        marketPricePerKg: 300,
        pricePerKg: 280,
        unit: '1 Kg',
        description: 'Juicy chicken wings cut into drums and flats. Perfect for hot wings, BBQ grills, and crunchy snacks.',
        image: 'assets/images/chicken-wings.png?v=1.0.5',
        badge: 'Snack Special',
        stockStatus: 'In Stock'
    },
    {
        id: 'prod-drumsticks',
        name: 'Chicken Legs',
        category: 'Special Cuts',
        marketPricePerKg: 330,
        pricePerKg: 310,
        unit: '1 Kg',
        description: 'Fleshy, juicy leg drumsticks & leg cuts with bone-in richness. Great for tandoori, broasting, and thick curries.',
        image: 'assets/images/chicken-legs.png?v=1.0.5',
        badge: 'Kid Favorite',
        stockStatus: 'In Stock'
    },
    {
        id: 'prod-breast-fillet',
        name: 'Chicken Breast',
        category: 'Boneless',
        marketPricePerKg: 400,
        pricePerKg: 380,
        unit: '1 Kg',
        description: 'Ultra-lean boneless chicken breast fillets. High protein, zero skin, trimmed cleanly for fitness diets.',
        image: 'assets/images/chicken-breast.png?v=1.0.5',
        badge: 'Fitness Pick',
        stockStatus: 'In Stock'
    },
    {
        id: 'prod-mince',
        name: 'Chicken Keema (Mince)',
        category: 'Boneless',
        marketPricePerKg: 380,
        pricePerKg: 360,
        unit: '1 Kg',
        description: 'Finely minced fresh chicken breast meat. Excellent for kebabs, keema curry, and burgers.',
        image: 'assets/images/chicken-keema.png?v=1.0.5',
        badge: 'Premium Cut',
        stockStatus: 'In Stock'
    },
    {
        id: 'prod-lollipop',
        name: 'Chicken Lollipop',
        category: 'Special Cuts',
        marketPricePerKg: 350,
        pricePerKg: 320,
        unit: '1 Kg',
        description: 'French-trimmed chicken wing drums shaped into juicy lollipops. Ready for appetizers & Indo-Chinese dishes.',
        image: 'assets/images/chicken-lollipop.png?v=1.0.5',
        badge: 'Party Favorite',
        stockStatus: 'In Stock'
    },
    {
        id: 'prod-liver-special',
        name: 'Chicken Liver (Special)',
        category: 'Special Cuts',
        marketPricePerKg: 220,
        pricePerKg: 200,
        unit: '1 Kg',
        description: 'Fresh, cleaned special chicken liver & gizzard. High iron & nutrition for traditional fry recipes.',
        image: 'assets/images/chicken-liver.png?v=1.0.5',
        badge: 'Nutrient Rich',
        stockStatus: 'In Stock'
    }
];

const COMING_SOON_PRODUCTS = [
    {
        id: 'cs-nati-koli',
        name: 'Nati Koli (Country Chicken)',
        category: 'Coming Soon',
        description: 'Authentic free-range country chicken. Rich flavor, lean meat, and traditional Karnataka taste.',
        image: 'assets/images/nati-koli.png?v=1.0.3',
        badge: 'Coming Soon'
    },
    {
        id: 'cs-nati-koli-eggs',
        name: 'Nati Koli Eggs',
        category: 'Coming Soon',
        description: '100% natural, farm-reared country chicken eggs packed with protein and vitamins.',
        image: 'assets/images/nati-koli-eggs.png?v=1.0.3',
        badge: 'Coming Soon'
    },
    {
        id: 'cs-barbeque-chicken',
        name: 'Barbeque Chicken',
        category: 'Coming Soon',
        description: 'Chef marinated juicy chicken cuts with exotic spices, ready for BBQ grill & tandoor.',
        image: 'assets/images/barbeque-chicken.png?v=1.0.3',
        badge: 'Coming Soon'
    }
];

// Deep copy default products
let PRODUCTS = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));

window.initDefaultProducts = function () {
    window.PRODUCTS = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
};

if (typeof window !== 'undefined') {
    window.PRODUCTS = PRODUCTS;
    window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
    window.COMING_SOON_PRODUCTS = COMING_SOON_PRODUCTS;
}

const DEFAULT_BANNERS = [
    {
        id: 'banner-1',
        title: 'Free Doorstep Delivery Above ₹500!',
        description: 'Order fresh chicken cuts worth ₹500 or more and enjoy instant FREE doorstep delivery straight from Santepet Circle to your home in Hassan.',
        badge: 'Special Offer',
        image: 'assets/images/hero-banner.png',
        linkUrl: 'products.html',
        linkText: 'Order Now & Save Delivery',
        active: true,
        createdAt: '2026-08-09T00:00:00.000Z'
    },
    {
        id: 'banner-2',
        title: 'Sunday Farm Fresh Special!',
        description: 'Pre-order your favorite curry cuts and boneless fillets for Sunday family meals. Sourced fresh every morning at 7:00 AM.',
        badge: 'Weekend Deal',
        image: 'assets/images/chicken-curry-cut.png',
        linkUrl: 'products.html',
        linkText: 'Explore Products Catalog',
        active: true,
        createdAt: '2026-08-09T00:00:00.000Z'
    }
];

class BannersEngine {
    constructor() {
        this.storageKey = 'fresh_chicken_banners_v1';
        this.banners = this.loadBanners();

        if (window.cloudDb) {
            window.cloudDb.listenToRealtimeBanners(cloudBanners => {
                if (cloudBanners && Array.isArray(cloudBanners) && cloudBanners.length > 0) {
                    this.banners = cloudBanners;
                    localStorage.setItem(this.storageKey, JSON.stringify(cloudBanners));
                    window.dispatchEvent(new CustomEvent('bannersUpdated', { detail: cloudBanners }));
                }
            });
        }
    }

    loadBanners() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error('Error loading banners from storage:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_BANNERS));
    }

    getBanners() {
        return this.banners || DEFAULT_BANNERS;
    }

    getActiveBanners() {
        const list = this.getBanners();
        return list.filter(b => b.active !== false);
    }

    saveBanners(bannersList) {
        this.banners = bannersList;
        localStorage.setItem(this.storageKey, JSON.stringify(bannersList));
        if (window.cloudDb) {
            window.cloudDb.saveBannersToCloud(bannersList);
        }
        window.dispatchEvent(new CustomEvent('bannersUpdated', { detail: bannersList }));
        return true;
    }

    addBanner(data) {
        const newBanner = {
            id: 'banner-' + Date.now(),
            title: data.title || '',
            description: data.description || '',
            badge: data.badge || 'Promo',
            image: data.image || 'assets/images/hero-banner.png',
            linkUrl: data.linkUrl || 'products.html',
            linkText: data.linkText || 'Order Now',
            active: true,
            createdAt: new Date().toISOString()
        };

        const current = this.getBanners();
        const updated = [newBanner, ...current];
        return this.saveBanners(updated);
    }

    deleteBanner(id) {
        const current = this.getBanners();
        const updated = current.filter(b => b.id !== id);
        return this.saveBanners(updated);
    }

    toggleBannerStatus(id) {
        const current = this.getBanners();
        const updated = current.map(b => {
            if (b.id === id) {
                return { ...b, active: !b.active };
            }
            return b;
        });
        return this.saveBanners(updated);
    }

    resetDefaultBanners() {
        return this.saveBanners(JSON.parse(JSON.stringify(DEFAULT_BANNERS)));
    }
}

window.bannersEngine = new BannersEngine();
window.DEFAULT_BANNERS = DEFAULT_BANNERS;

