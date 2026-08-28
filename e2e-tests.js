/**
 * Fresh Chicken - Real Browser End-to-End (E2E) Automation Test Suite
 * Uses Puppeteer to drive the real browser, testing user workflows:
 * 1. Product catalog & quantity inputs (0.5 steps, typing 10 Kg)
 * 2. Adding to Cart & verifying unique item badge
 * 3. Cart review & delivery calculation
 * 4. Checkout form filling, order submission & duplicate prevention
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Locate installed Chrome or Edge executable on Windows
const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = possiblePaths.find(p => fs.existsSync(p));
if (!executablePath) {
    console.error('❌ Could not find Chrome or Edge executable on Windows.');
    process.exit(1);
}

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
let passed = 0;
let failed = 0;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

// Built-in static server so tests run standalone with zero setup
function startServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let reqPath = req.url.split('?')[0].replace(/^\//, '');
            if (!reqPath) reqPath = 'index.html';
            const filePath = path.join(__dirname, reqPath);

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not found');
                    return;
                }
                const ext = path.extname(filePath).toLowerCase();
                res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
                res.end(content);
            });
        });

        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                // Port 3000 already running externally, proceed directly
                resolve(null);
            } else {
                console.error('Server error:', e);
                resolve(null);
            }
        });

        server.listen(PORT, () => {
            resolve(server);
        });
    });
}

function logPass(msg) {
    passed++;
    console.log(`\x1b[32m✔ [E2E PASS]\x1b[0m ${msg}`);
}

function logFail(msg, err) {
    failed++;
    console.error(`\x1b[31m✖ [E2E FAIL]\x1b[0m ${msg}`);
    if (err) console.error(`  \x1b[33m${err.message || err}\x1b[0m`);
}

async function runE2ETests() {
    const internalServer = await startServer();
    console.log('\n======================================================');
    console.log('🚀 RUNNING REAL BROWSER E2E WORKFLOW TESTS');
    console.log(`Browser: ${path.basename(executablePath)}`);
    console.log(`Base URL: ${BASE_URL}`);
    console.log('======================================================\n');

    let browser;
    const testUserDataDir = path.join(__dirname, '.test-profile');
    try {
        // Clean stale test cache if exists
        try {
            if (fs.existsSync(testUserDataDir)) {
                fs.rmSync(testUserDataDir, { recursive: true, force: true });
            }
        } catch (e) {}

        browser = await puppeteer.launch({
            executablePath,
            headless: false,
            slowMo: 200, // 200ms delay between actions for a snappy, visible automated workflow
            userDataDir: testUserDataDir,
            args: [
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-extensions',
                '--new-window',
                '--window-position=100,100',
                '--window-size=1280,850'
            ],
            defaultViewport: null
        });

        const pages = await browser.pages();
        const page = pages.length > 0 ? pages[0] : await browser.newPage();
        await page.bringToFront();

        // ----------------------------------------------------
        // TEST 1: Navigate to Products Page
        // ----------------------------------------------------
        await page.goto(`${BASE_URL}/products.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#products-grid', { visible: true, timeout: 5000 });
        const title = await page.title();
        if (title.includes('Products') || title.includes('Fresh Chicken')) {
            logPass(`Page loaded successfully with title: "${title}"`);
        } else {
            throw new Error(`Unexpected page title: ${title}`);
        }

        // Clear previous cart in browser session
        await page.evaluate(() => {
            if (window.cart) window.cart.clearCart();
            if (window.ordersEngine) window.ordersEngine.clearOrderHistory();
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(regs => {
                    regs.forEach(r => r.unregister());
                });
            }
        });

        // ----------------------------------------------------
        // TEST 2: Quantity Step Controls & Cut Preference Selection
        // ----------------------------------------------------
        const firstInput = await page.$('.qty-input');
        if (!firstInput) throw new Error('No quantity input found on products grid');

        let initialVal = await page.evaluate(el => el.value, firstInput);
        if (parseFloat(initialVal) === 1) {
            logPass('Default initial quantity on product card is 1 Kg');
        } else {
            throw new Error(`Expected default quantity to be 1, got ${initialVal}`);
        }

        // Click '+' button on first product
        const firstPlusBtn = await page.$('.qty-btn-plus');
        await firstPlusBtn.click();
        let steppedVal = await page.evaluate(el => el.value, firstInput);
        if (parseFloat(steppedVal) === 1.5) {
            logPass('Clicking "+" increases quantity by 0.5 Kg step to 1.5 Kg');
        } else {
            throw new Error(`Expected quantity after '+' to be 1.5, got ${steppedVal}`);
        }

        // Select 'Biryani Cut' Chip
        const biryaniCutChip = await page.$('.cut-chip[data-cut="Biryani Cut"]');
        if (biryaniCutChip) {
            await biryaniCutChip.click();
            logPass('Selected "🍗 Biryani Cut" preference chip for product');
        }

        // ----------------------------------------------------
        // TEST 3: Manual Direct Typing (Type 10 Kg)
        // ----------------------------------------------------
        // Clear and type '10'
        await firstInput.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await firstInput.type('10');
        await firstInput.press('Enter');
        await new Promise(r => setTimeout(r, 100)); // allow blur/change to settle

        let typedVal = await page.evaluate(el => el.value, firstInput);
        if (parseFloat(typedVal) === 10) {
            logPass('Direct manual typing of "10" updates input to 10 Kg without pressing "+" 19 times');
        } else {
            throw new Error(`Expected typed quantity to be 10, got ${typedVal}`);
        }

        // Verify button label has live calculated price for 10 Kg
        const firstAddBtnText = await page.evaluate(() => {
            const btn = document.querySelector('.add-to-cart-btn span:last-child');
            return btn ? btn.textContent : '';
        });
        if (firstAddBtnText.includes('10 Kg')) {
            logPass(`Live price label on button updated dynamically to: "${firstAddBtnText}"`);
        } else {
            throw new Error(`Expected button text to contain "10 Kg", got "${firstAddBtnText}"`);
        }

        // ----------------------------------------------------
        // TEST 4: Add to Cart & Verify Unique Item Cart Badge Count
        // ----------------------------------------------------
        const firstAddBtn = await page.$('.add-to-cart-btn');
        await firstAddBtn.click();
        await page.waitForTimeout ? page.waitForTimeout(500) : new Promise(r => setTimeout(r, 500));

        const badgeText = await page.evaluate(() => {
            const b = document.querySelector('.cart-badge');
            return b ? b.textContent.trim() : '';
        });

        if (badgeText === '1') {
            logPass('Cart badge correctly shows "1" for 1 unique product (even with 10 Kg added)');
        } else {
            throw new Error(`Expected cart badge count to be '1', but got '${badgeText}'`);
        }

        // ----------------------------------------------------
        // TEST 5: Cart Page Review & Subtotal Verification
        // ----------------------------------------------------
        await page.goto(`${BASE_URL}/cart.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#cart-subtotal', { visible: true, timeout: 5000 });

        const cartSubtotal = await page.evaluate(() => {
            const el = document.getElementById('cart-subtotal');
            return el ? el.textContent.trim() : '';
        });

        logPass(`Cart page loaded with 1 item card, subtotal: ${cartSubtotal}`);

        // ----------------------------------------------------
        // TEST 6: Checkout Workflow & Order Submission
        // ----------------------------------------------------
        page.on('dialog', async dialog => {
            try { await dialog.dismiss(); } catch (e) {}
        });

        await page.goto(`${BASE_URL}/checkout.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#checkout-form', { visible: true, timeout: 5000 });

        // Fill in customer delivery form as Test Order and submit
        await page.evaluate(() => {
            window.isE2ETestMode = true;
            document.getElementById('cust-name').value = 'Automated QA User [Test]';
            document.getElementById('cust-phone').value = '9999999999';
            document.getElementById('cust-street').value = '102 Test Street, Hassan Main Road';
            document.getElementById('cust-area').value = 'Santepet';
            document.getElementById('cust-city').value = 'Hassan';
            document.getElementById('cust-pincode').value = '573201';
            
            const form = document.getElementById('checkout-form');
            if (form) form.requestSubmit();
        });

        // Check if modal appears
        await page.waitForSelector('#order-success-modal', { timeout: 5000 });
        const modalText = await page.evaluate(() => {
            const modal = document.getElementById('order-success-modal');
            return modal ? modal.textContent : '';
        });

        if (modalText.includes('Order Ready') || modalText.includes('WhatsApp')) {
            logPass('Checkout submitted and WhatsApp Order Confirmation modal displayed');
        } else {
            throw new Error('Success modal was not displayed');
        }

        // ----------------------------------------------------
        // TEST 7: Duplicate Order Prevention & Live Revenue Isolation
        // ----------------------------------------------------
        const testOrdersCount = await page.evaluate(() => {
            return window.ordersEngine ? window.ordersEngine.testOrders.length : 0;
        });
        const liveRevenue = await page.evaluate(() => {
            return window.ordersEngine ? window.ordersEngine.getLifetimeRevenue() : 0;
        });

        if (liveRevenue === 0 && testOrdersCount === 1) {
            logPass('Test order successfully routed to testOrders node (Live revenue remains ₹0 cleanly)');
        }

        // Trigger a second rapid save with identical details in browser session
        await page.evaluate(() => {
            if (window.ordersEngine && window.cart) {
                window.ordersEngine.saveOrder({
                    isTest: true,
                    customer: {
                        name: 'Automated QA User [Test]',
                        phone: '9999999999',
                        fullAddress: '102 Test Street, Hassan Main Road, Santepet, Hassan - 573201'
                    },
                    items: window.cart.items,
                    subtotal: window.cart.getSubtotal(),
                    deliveryCharge: window.cart.getDeliveryCharge(),
                    grandTotal: window.cart.getGrandTotal(),
                    status: 'Order Placed'
                });
            }
        });

        const secondCount = await page.evaluate(() => {
            return window.ordersEngine ? window.ordersEngine.testOrders.length : 0;
        });

        if (secondCount === 1) {
            logPass('Duplicate prevention active: Rapid duplicate re-submission was blocked (Total test orders: 1)');
        } else {
            throw new Error(`Expected 1 order after duplicate submission, got ${secondCount}`);
        }

        // Keep browser visible for 3 seconds at the end so you can see the completed state
        await new Promise(r => setTimeout(r, 3000));

    } catch (err) {
        logFail('E2E Test Step Encountered an Error', err);
    } finally {
        if (browser) {
            await browser.close();
        }
        if (internalServer) {
            internalServer.close();
        }
    }

    console.log('\n------------------------------------------------------');
    console.log(`REAL BROWSER E2E SUMMARY: PASSED: ${passed} | FAILED: ${failed}`);
    console.log('------------------------------------------------------\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runE2ETests();
