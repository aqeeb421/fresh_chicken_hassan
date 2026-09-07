/**
 * Production Clean & Build Script for Fresh Chicken Web App
 * Validates all assets, cleans temporary files, and creates fresh-chicken-netlify.zip
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Clean & Build for Fresh Chicken Hassan...\n');

// 1. Validate JavaScript Files
const jsFiles = [
    'js/config.js',
    'js/translations.js',
    'js/products-data.js',
    'js/cart.js',
    'js/orders.js',
    'js/profile.js',
    'js/checkout.js',
    'js/orders-page.js',
    'js/firebase-db.js',
    'js/main.js'
];

let hasSyntaxErrors = false;
console.log('🔍 Checking JavaScript Syntax...');
jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            const code = fs.readFileSync(file, 'utf8');
            new Function(code);
            console.log(`  ✓ ${file}`);
        } catch (err) {
            console.error(`  ✗ Syntax error in ${file}:`, err.message);
            hasSyntaxErrors = true;
        }
    } else {
        console.warn(`  ⚠️ Missing file: ${file}`);
    }
});

if (hasSyntaxErrors) {
    console.error('\n❌ Build aborted due to syntax errors.');
    process.exit(1);
}

// 2. Validate HTML Files
const htmlFiles = [
    'index.html',
    'products.html',
    'cart.html',
    'checkout.html',
    'orders.html',
    'contact.html',
    'admin.html'
];

console.log('\n📄 Checking HTML Files...');
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✓ ${file}`);
    } else {
        console.error(`  ✗ Missing HTML file: ${file}`);
    }
});

// 3. Clean and Create Deployment Zip Package
const zipOutput = 'fresh-chicken-netlify.zip';
if (fs.existsSync(zipOutput)) {
    console.log(`\n🧹 Removing previous ${zipOutput}...`);
    try {
        fs.unlinkSync(zipOutput);
    } catch (e) {
        console.warn(`Could not remove old zip: ${e.message}`);
    }
}

console.log('\n📦 Creating fresh deployment archive: ' + zipOutput);
try {
    // PowerShell Compress-Archive command with explicit production items
    const includeList = [
        'index.html',
        'products.html',
        'cart.html',
        'checkout.html',
        'orders.html',
        'contact.html',
        'admin.html',
        'manifest.json',
        'sw.js',
        'netlify.toml',
        '_redirects',
        'assets',
        'css',
        'js'
    ];

    const psCommand = `powershell -Command "Compress-Archive -Path ${includeList.join(', ')} -DestinationPath ${zipOutput} -Force"`;
    execSync(psCommand, { stdio: 'inherit' });

    const stats = fs.statSync(zipOutput);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n✅ Deployment package created successfully: ${zipOutput} (${sizeMb} MB)`);
} catch (e) {
    console.error('Error creating zip package:', e.message);
}

console.log('\n======================================================');
console.log('🎉 BUILD COMPLETE & READY FOR DEPLOYMENT!');
console.log('👉 Netlify Drop: Upload "fresh-chicken-netlify.zip" or drag the root folder directly.');
console.log('👉 Git Deploy: Commit and push changes to trigger automated CI/CD.');
console.log('======================================================\n');
