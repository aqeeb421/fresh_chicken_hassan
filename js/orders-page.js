/**
 * Fresh Chicken Hassan - Customer Orders Page Controller
 * Handles secure, private per-user order history rendering, real-time tracking,
 * 1-click reorder, printable tax invoice generation, and private cloud sync.
 * (Zero data leakage: queries only the verified customer's phone node).
 */
(function () {
    'use strict';

    var activeCustomerOrders = [];
    var activeUserPhone = '';

    function getActiveProfile() {
        if (window.customerProfile && typeof window.customerProfile.getProfile === 'function') {
            return window.customerProfile.getProfile();
        }
        try {
            var raw = localStorage.getItem('fresh_chicken_profile_v1');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function getStatusBadgeClass(status) {
        var s = (status || '').toLowerCase();
        if (s.indexOf('delivered') !== -1) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (s.indexOf('out for delivery') !== -1 || s.indexOf('transit') !== -1) return 'bg-purple-100 text-purple-800 border-purple-300';
        if (s.indexOf('preparing') !== -1 || s.indexOf('cut') !== -1) return 'bg-amber-100 text-amber-800 border-amber-300';
        if (s.indexOf('confirmed') !== -1) return 'bg-blue-100 text-blue-800 border-blue-300';
        if (s.indexOf('cancel') !== -1) return 'bg-red-100 text-red-800 border-red-300';
        return 'bg-emerald-50 text-[#133B2C] border-emerald-200';
    }

    function renderCustomerAccountBanner() {
        var banner = document.getElementById('customer-account-banner');
        if (!banner) return;

        var isKn = localStorage.getItem('fresh_chicken_lang') === 'kn';
        var profile = getActiveProfile();

        if (profile && profile.phone) {
            activeUserPhone = profile.phone.replace(/\D/g, '').slice(-10);
            var addrSummary = [profile.street, profile.landmark, profile.area, profile.city].filter(Boolean).join(', ');

            banner.innerHTML =
                '<div class="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/40 to-white">'
                + '<div class="flex items-center gap-4">'
                + '<div class="w-14 h-14 rounded-2xl bg-[#133B2C] text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">'
                + (profile.name ? profile.name.charAt(0).toUpperCase() : '👤')
                + '</div>'
                + '<div>'
                + '<div class="flex items-center gap-2 flex-wrap">'
                + '<h3 class="font-black text-lg text-[#133B2C]">' + (profile.name || (isKn ? 'ಗ್ರಾಹಕರು' : 'Customer Profile')) + '</h3>'
                + '<span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs border border-emerald-200">🔒 ' + (isKn ? 'ಪರಿಶೀಲಿಸಿದ ಖಾತೆ' : 'Verified Profile') + '</span>'
                + '</div>'
                + '<p class="text-xs font-bold text-gray-700 mt-0.5">📞 +91 ' + activeUserPhone + '</p>'
                + (addrSummary ? '<p class="text-[11px] text-gray-500 mt-0.5 line-clamp-1">📍 ' + addrSummary + '</p>' : '')
                + '</div></div>'
                + '<div class="flex items-center gap-2.5 self-end sm:self-center">'
                + '<button onclick="window.customerProfile.openProfileModal()" class="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 shadow-sm transition-all flex items-center gap-1.5">'
                + '<span class="material-symbols-outlined text-sm">edit</span>'
                + '<span>' + (isKn ? 'ವಿಳಾಸ ಬದಲಿಸಿ' : 'Edit Profile') + '</span>'
                + '</button>'
                + '<button onclick="window.ordersPage.refreshOrders()" class="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1" title="Refresh Orders">'
                + '<span class="material-symbols-outlined text-sm">refresh</span>'
                + '</button>'
                + '</div></div>';
        } else {
            activeUserPhone = '';
            banner.innerHTML =
                '<div class="bg-white rounded-3xl p-8 border-2 border-dashed border-emerald-200 shadow-sm text-center max-w-xl mx-auto space-y-4">'
                + '<div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#133B2C] shadow-inner">'
                + '<span class="material-symbols-outlined text-3xl">lock</span>'
                + '</div>'
                + '<div>'
                + '<h3 class="font-black text-xl text-[#133B2C]">' + (isKn ? 'ನಿಮ್ಮ ಆರ್ಡರ್ ಇತಿಹಾಸ ನೋಡಲು ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign in to View Your Orders') + '</h3>'
                + '<p class="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">'
                + (isKn
                    ? 'ನಿಮ್ಮ ಆರ್ಡರ್ ವಿವರಗಳು ಮತ್ತು ವಿಳಾಸದ ಗೌಪ್ಯತೆಯನ್ನು ರಕ್ಷಿಸಲು, ನಿಮ್ಮ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.'
                    : 'To protect customer privacy and personal delivery details, please sign in with your mobile number to view and track your orders.')
                + '</p>'
                + '</div>'
                + '<button onclick="window.customerProfile.openProfileModal()" class="inline-flex items-center gap-2 bg-[#133B2C] hover:bg-[#0b251b] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all">'
                + '<span class="material-symbols-outlined text-lg">account_circle</span>'
                + '<span>' + (isKn ? 'ಸೈನ್ ಇನ್ / ಪ್ರೊಫೈಲ್ ರಚಿಸಿ' : 'Sign In / Enter Mobile Number') + '</span>'
                + '</button>'
                + '</div>';
        }
    }

    function renderCustomerOrders() {
        var container = document.getElementById('customer-orders-container');
        if (!container) return;

        var isKn = localStorage.getItem('fresh_chicken_lang') === 'kn';

        if (!activeUserPhone) {
            container.innerHTML = '';
            return;
        }

        // Get orders for this specific phone number only
        var localOrders = window.ordersEngine ? window.ordersEngine.getOrdersByPhone(activeUserPhone) : [];
        var combinedMap = {};

        localOrders.forEach(function (o) {
            if (o && o.id) combinedMap[o.id] = o;
        });

        activeCustomerOrders.forEach(function (o) {
            if (o && o.id) combinedMap[o.id] = o;
        });

        var orders = Object.values(combinedMap).sort(function (a, b) {
            return (b.timestamp || b.dateISO || '').localeCompare(a.timestamp || a.dateISO || '');
        });

        if (orders.length === 0) {
            container.innerHTML =
                '<div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">'
                + '<div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">'
                + '<span class="material-symbols-outlined text-3xl">receipt_long</span>'
                + '</div>'
                + '<h4 class="font-bold text-gray-900 text-lg mb-1">' + (isKn ? 'ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Orders Found Yet') + '</h4>'
                + '<p class="text-xs text-gray-500 mb-6">' + (isKn ? 'ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್ ಮಾಡಿಲ್ಲ.' : 'You haven\'t placed any orders with this number (+91 ' + activeUserPhone + ') yet.') + '</p>'
                + '<a href="products.html" class="inline-flex items-center gap-2 bg-[#133B2C] hover:bg-[#0b251b] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all">'
                + '<span class="material-symbols-outlined text-lg">shopping_basket</span>'
                + '<span>' + (isKn ? 'ಚಿಕನ್ ಆರ್ಡರ್ ಮಾಡಿ' : 'Order Fresh Chicken Now') + '</span>'
                + '</a>'
                + '</div>';
            return;
        }

        var html = '';
        for (var idx = 0; idx < orders.length; idx++) {
            var order = orders[idx];
            var isUPI = order.paymentMethod && order.paymentMethod.indexOf('UPI') !== -1;
            var isDelivered = order.status && order.status.indexOf('Delivered') !== -1;
            var isOut = order.status && order.status.indexOf('Out') !== -1;
            var isPrep = order.status && (order.status.indexOf('Preparing') !== -1 || isOut || isDelivered);
            var isConf = order.status && (order.status.indexOf('Confirmed') !== -1 || isPrep || isOut || isDelivered);

            html += '<div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-6">';

            // Header
            html += '<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">';
            html += '<div><div class="flex items-center gap-2">';
            html += '<span class="font-black text-[#133B2C] text-lg">' + order.id + '</span>';
            html += '<span class="px-3 py-1 text-xs font-bold rounded-full border ' + getStatusBadgeClass(order.status) + ' flex items-center gap-1">';
            html += '<span class="w-2 h-2 rounded-full bg-current animate-ping"></span>' + (order.status || 'Order Placed') + '</span>';
            html += '</div>';
            html += '<span class="text-xs text-gray-400 font-medium block mt-1">📅 ' + (order.dateString || order.dateISO) + '</span>';
            html += '</div>';

            html += '<div class="text-left sm:text-right">';
            html += '<span class="text-xs text-gray-400 uppercase font-bold block">Grand Total</span>';
            html += '<span class="font-black text-2xl text-[#133B2C]">₹' + order.grandTotal + '</span>';
            html += '<span class="text-[11px] text-gray-500 block font-medium">💳 ' + (order.paymentMethod || 'Cash / UPI') + '</span>';
            html += '</div></div>';

            // Details Grid
            html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">';
            html += '<div class="bg-gray-50 p-4 rounded-2xl space-y-1.5">';
            html += '<span class="font-bold text-gray-900 block text-sm mb-1">🛒 Ordered Items</span>';
            if (Array.isArray(order.items)) {
                for (var j = 0; j < order.items.length; j++) {
                    var item = order.items[j];
                    var itemTotal = Math.round(item.pricePerKg * item.quantity * 100) / 100;
                    var cut = item.cutType ? ' (' + item.cutType + ')' : '';
                    html += '<div class="flex justify-between items-center py-1 border-b border-gray-200/50 last:border-0">';
                    html += '<span class="text-gray-700 font-medium">• ' + item.name + cut + ' (' + item.quantity + ' Kg)</span>';
                    html += '<span class="font-bold text-gray-900">₹' + itemTotal + '</span>';
                    html += '</div>';
                }
            }
            html += '</div>';

            html += '<div class="bg-gray-50 p-4 rounded-2xl space-y-1.5">';
            html += '<span class="font-bold text-gray-900 block text-sm mb-1">📍 Delivery Address</span>';
            html += '<p class="text-gray-800 font-bold">' + (order.customer ? order.customer.name : '') + '</p>';
            html += '<p class="text-gray-600">📞 ' + (order.customer ? order.customer.phone : '') + '</p>';
            html += '<p class="text-gray-600 leading-relaxed">' + (order.customer ? order.customer.fullAddress : '') + '</p>';
            if (order.customer && order.customer.notes) {
                html += '<p class="text-emerald-800 font-semibold mt-1">📝 Notes: ' + order.customer.notes + '</p>';
            }
            html += '</div></div>';

            // Live Status Tracker Steps
            html += '<div class="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-4">';
            html += '<div class="flex items-center justify-between">';
            html += '<span class="text-xs font-bold text-[#133B2C] uppercase tracking-wider block">Live Order Tracking</span>';
            html += '<span class="text-[11px] font-semibold text-emerald-800">Auto-Refreshes in Real-Time</span>';
            html += '</div>';

            html += '<div class="grid grid-cols-4 gap-2 text-center text-[11px]">';
            // Step 1: Placed
            html += '<div class="flex flex-col items-center"><div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1 shadow-sm">1</div><span class="font-bold text-gray-800">Placed</span></div>';
            // Step 2: Confirmed
            html += '<div class="flex flex-col items-center"><div class="w-8 h-8 rounded-full ' + (isConf ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500') + ' flex items-center justify-center font-bold mb-1 shadow-sm">2</div><span class="font-bold text-gray-800">Confirmed</span></div>';
            // Step 3: Fresh Cut
            html += '<div class="flex flex-col items-center"><div class="w-8 h-8 rounded-full ' + (isPrep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500') + ' flex items-center justify-center font-bold mb-1 shadow-sm">3</div><span class="font-bold text-gray-800">Fresh Cut</span></div>';
            // Step 4: Delivered
            html += '<div class="flex flex-col items-center"><div class="w-8 h-8 rounded-full ' + (isDelivered ? 'bg-emerald-600 text-white' : (isOut ? 'bg-purple-600 text-white animate-bounce' : 'bg-gray-200 text-gray-500')) + ' flex items-center justify-center font-bold mb-1 shadow-sm">4</div><span class="font-bold text-gray-800">Delivered</span></div>';
            html += '</div></div>';

            // Actions & Reorder
            html += '<div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">';
            html += '<div class="space-y-1 text-center sm:text-left">';
            html += '<span class="text-xs text-gray-500 block">' + (isKn ? 'ಆರ್ಡರ್ ವಿವರಗಳನ್ನು ಮರುಪರಿಶೀಲಿಸಿ ಅಥವಾ ಮರು ಆರ್ಡರ್ ಮಾಡಿ:' : 'Manage your fresh cuts order or reorder in one click:') + '</span>';
            if (isUPI) {
                html += '<span class="text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md inline-block">📸 ⚠️ ' + (isKn ? 'ಆನ್‌ಲೈನ್ ಪಾವತಿ ದೃಢೀಕರಣಕ್ಕಾಗಿ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಲಗತ್ತಿಸಿ!' : 'Please attach payment screenshot (SS) in WhatsApp chat to confirm order!') + '</span>';
            }
            html += '</div>';

            html += '<div class="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">';
            // Reorder
            html += '<button onclick="window.ordersPage.handleReorder(\'' + order.id + '\')" class="bg-[#133B2C] hover:bg-[#0b251b] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all"><span class="material-symbols-outlined text-base">sync</span><span>' + (isKn ? 'ಮರು ಆರ್ಡರ್' : 'Reorder') + '</span></button>';
            // Invoice / Receipt
            html += '<button onclick="window.ordersPage.downloadInvoice(\'' + order.id + '\')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all" title="Download Official Invoice"><span class="material-symbols-outlined text-base">download</span><span>' + (isKn ? 'ಇನ್ವಾಯ್ಸ್' : 'Invoice') + '</span></button>';
            // Print Slip
            html += '<button onclick="window.ordersPage.printOrderReceipt(\'' + order.id + '\')" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-gray-200 shadow-sm transition-all" title="Print Slip"><span class="material-symbols-outlined text-base">print</span></button>';
            // WhatsApp
            html += '<button onclick="window.ordersPage.resendOrderToWhatsApp(\'' + order.id + '\')" class="bg-[#25D366] hover:bg-[#1ebd59] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md hover:shadow-lg transition-all"><span class="material-symbols-outlined text-base">chat</span><span>WhatsApp</span></button>';
            html += '</div></div>';

            html += '</div>';
        }

        container.innerHTML = html;
    }

    function handleReorder(orderId) {
        var list = activeCustomerOrders.concat(window.ordersEngine ? window.ordersEngine.getAllOrders(true) : []);
        var order = list.find(function (o) { return o.id === orderId; });
        if (!order || !order.items) return;

        if (window.cart) {
            order.items.forEach(function (item) {
                window.cart.addItem(item.id, item.quantity, item.cutType);
            });
            if (window.cart.showToast) {
                window.cart.showToast('Added items from ' + orderId + ' to cart!', 'success');
            }
            setTimeout(function () {
                window.location.href = 'cart.html';
            }, 400);
        }
    }

    function downloadInvoice(orderId) {
        var list = activeCustomerOrders.concat(window.ordersEngine ? window.ordersEngine.getAllOrders(true) : []);
        var order = list.find(function (o) { return o.id === orderId; });
        if (!order) return;

        var invoiceWindow = window.open('', '_blank', 'width=700,height=900');
        if (!invoiceWindow) {
            alert('Please allow popups to view & download invoice.');
            return;
        }

        var itemsRows = '';
        if (Array.isArray(order.items)) {
            for (var i = 0; i < order.items.length; i++) {
                var it = order.items[i];
                var cut = it.cutType ? ' (' + it.cutType + ')' : '';
                var tot = Math.round(it.pricePerKg * it.quantity * 100) / 100;
                itemsRows += '<tr>'
                    + '<td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">' + (i + 1) + '</td>'
                    + '<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">' + it.name + cut + '</td>'
                    + '<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">' + it.quantity + ' Kg</td>'
                    + '<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹' + it.pricePerKg + '</td>'
                    + '<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">₹' + tot + '</td>'
                    + '</tr>';
            }
        }

        var delivText = order.deliveryCharge === 0 ? '<span style="color: #16a34a; font-weight: bold;">FREE</span>' : '₹' + order.deliveryCharge;

        var html = '<!DOCTYPE html><html><head>'
            + '<title>Tax Invoice - ' + order.id + ' - Fresh Chicken Hassan</title>'
            + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            + '<style>'
            + 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 0; padding: 24px; background: #f9fafb; }'
            + '.invoice-card { max-width: 620px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }'
            + '.header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #133B2C; padding-bottom: 16px; margin-bottom: 20px; }'
            + '.brand { font-size: 22px; font-weight: 900; color: #133B2C; letter-spacing: -0.5px; }'
            + '.badge { display: inline-block; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; border: 1px solid #a7f3d0; margin-top: 4px; }'
            + '.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 13px; }'
            + '.box { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 10px; padding: 12px; }'
            + '.box-title { font-weight: bold; color: #133B2C; font-size: 11px; text-transform: uppercase; margin-bottom: 6px; }'
            + 'table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }'
            + 'th { background: #133B2C; color: #fff; padding: 10px 8px; text-align: left; font-size: 12px; }'
            + '.totals { max-width: 260px; margin-left: auto; margin-bottom: 20px; font-size: 13px; }'
            + '.total-row { display: flex; justify-content: space-between; padding: 4px 0; }'
            + '.grand-total { border-top: 2px solid #133B2C; padding-top: 6px; font-size: 16px; font-weight: 900; color: #133B2C; }'
            + '.actions { display: flex; gap: 10px; margin-top: 20px; }'
            + '.btn { flex: 1; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 13px; border: none; cursor: pointer; text-align: center; text-decoration: none; }'
            + '.btn-print { background: #133B2C; color: #fff; }'
            + '.btn-wa { background: #25D366; color: #fff; }'
            + '@media print { body { background: #fff; padding: 0; } .invoice-card { border: none; box-shadow: none; padding: 0; } .actions { display: none; } }'
            + '</style></head><body>'
            + '<div class="invoice-card">'
            + '<div class="header">'
            + '<div><div class="brand">FRESH CHICKEN HASSAN</div><div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Premium Farm-Fresh Halal Poultry Cuts</div><div class="badge">OFFICIAL TAX INVOICE / BILL</div></div>'
            + '<div style="text-align: right; font-size: 12px; color: #4b5563;">'
            + '<div style="font-weight: bold; color: #133B2C; font-size: 14px;">' + order.id + '</div>'
            + '<div>Date: ' + (order.dateString || order.dateISO) + '</div>'
            + '<div>Status: <b>' + (order.status || 'Confirmed') + '</b></div>'
            + '</div></div>'
            + '<div class="grid">'
            + '<div class="box"><div class="box-title">Billed To (Customer)</div><b>' + (order.customer ? order.customer.name : 'Customer') + '</b><br/>Phone: ' + (order.customer ? order.customer.phone : '') + '<br/>Address: ' + (order.customer ? order.customer.fullAddress : '') + (order.customer && order.customer.notes ? '<br/><i>Notes: ' + order.customer.notes + '</i>' : '') + '</div>'
            + '<div class="box"><div class="box-title">Seller Details</div><b>Fresh Chicken Hassan</b><br/>Santepet Main Road, Hassan, Karnataka 573201<br/>Helpline: +91 9148699386<br/>UPI: 9148699386@ybl</div>'
            + '</div>'
            + '<table><thead><tr><th>#</th><th>Item Description</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Rate / Kg</th><th style="text-align: right;">Total</th></tr></thead><tbody>'
            + itemsRows
            + '</tbody></table>'
            + '<div class="totals">'
            + '<div class="total-row"><span>Items Subtotal:</span><span>₹' + order.subtotal + '</span></div>'
            + '<div class="total-row"><span>Delivery Charge:</span><span>' + delivText + '</span></div>'
            + '<div class="total-row grand-total"><span>Grand Total:</span><span>₹' + order.grandTotal + '</span></div>'
            + '<div class="total-row" style="font-size: 11px; color: #6b7280; margin-top: 4px;"><span>Payment:</span><b>' + (order.paymentMethod || 'Cash / UPI') + '</b></div>'
            + '</div>'
            + '<div style="font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 12px;">This is a computer-generated invoice from Fresh Chicken Hassan. Thank you for your business! 🍗</div>'
            + '<div class="actions">'
            + '<button class="btn btn-print" onclick="window.print()">🖨️ Download / Print PDF</button>'
            + '</div>'
            + '</div>'
            + '<script>setTimeout(function(){ window.print(); }, 400);</script>'
            + '</body></html>';

        invoiceWindow.document.write(html);
        invoiceWindow.document.close();
    }

    function printOrderReceipt(orderId) {
        var list = activeCustomerOrders.concat(window.ordersEngine ? window.ordersEngine.getAllOrders(true) : []);
        var order = list.find(function (o) { return o.id === orderId; });
        if (!order) return;

        var slipWhatsAppText = '🧾 *FRESH CHICKEN HASSAN - BILL RECEIPT*\n'
            + '----------------------------------------\n'
            + '📋 *Order ID:* ' + order.id + '\n'
            + '📅 *Date:* ' + (order.dateString || order.dateISO) + '\n\n'
            + '👤 *Customer:* ' + (order.customer ? order.customer.name : '') + '\n'
            + '📞 *Phone:* ' + (order.customer ? order.customer.phone : '') + '\n'
            + '📍 *Delivery Address:* ' + (order.customer ? order.customer.fullAddress : '') + '\n';
        if (order.customer && order.customer.notes) {
            slipWhatsAppText += '📝 *Notes:* ' + order.customer.notes + '\n';
        }
        slipWhatsAppText += '\n----------------------------------------\n🛒 *ORDERED ITEMS*\n';
        if (Array.isArray(order.items)) {
            for (var i = 0; i < order.items.length; i++) {
                var it = order.items[i];
                var cut = it.cutType ? ' (' + it.cutType + ')' : '';
                slipWhatsAppText += '• ' + it.name + cut + ' - ' + it.quantity + ' Kg: ₹' + (Math.round(it.pricePerKg * it.quantity * 100) / 100) + '\n';
            }
        }
        slipWhatsAppText += '----------------------------------------\n'
            + 'Subtotal: ₹' + order.subtotal + '\n'
            + 'Delivery Fee: ' + (order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge) + '\n'
            + '*GRAND TOTAL: ₹' + order.grandTotal + '*\n'
            + '💳 *Payment Method:* ' + (order.paymentMethod || 'Cash') + '\n'
            + '----------------------------------------\n'
            + '✨ *Thank you for ordering with Fresh Chicken Hassan!* 🍗\n'
            + '📞 Store Helpline: +91 9148699386';

        var encodedText = encodeURIComponent(slipWhatsAppText);
        var printWindow = window.open('', '_blank', 'width=450,height=700');
        if (!printWindow) return;

        var itemsHtml = '';
        if (Array.isArray(order.items)) {
            for (var j = 0; j < order.items.length; j++) {
                var item = order.items[j];
                itemsHtml += '<tr><td>' + item.name + (item.cutType ? ' (' + item.cutType + ')' : '') + '</td><td style="text-align: center;">' + item.quantity + ' Kg</td><td style="text-align: right;">₹' + (Math.round(item.pricePerKg * item.quantity * 100) / 100) + '</td></tr>';
            }
        }

        printWindow.document.write(
            '<!DOCTYPE html><html><head><title>Order Receipt - ' + order.id + '</title>'
            + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            + '<style>'
            + 'body { font-family: monospace, -apple-system, sans-serif; padding: 15px; max-width: 380px; margin: 0 auto; color: #111; }'
            + '.text-center { text-align: center; } .border-top { border-top: 1px dashed #444; margin: 10px 0; }'
            + '.flex { display: flex; justify-content: space-between; } .bold { font-weight: bold; }'
            + '.items-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }'
            + '.items-table td { padding: 3px 0; } .title { font-size: 18px; font-weight: bold; margin-bottom: 2px; }'
            + '.btn { background: #133B2C; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; margin-top: 10px; width: 100%; font-weight: bold; font-size: 13px; }'
            + '.btn-wa { background: #25D366; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; margin-top: 8px; width: 100%; font-weight: bold; font-size: 13px; text-decoration: none; display: block; text-align: center; box-sizing: border-box; }'
            + '@media print { .no-print { display: none; } }'
            + '</style></head><body>'
            + '<div class="text-center"><div class="title">FRESH CHICKEN</div><div style="font-size: 11px;">Santepet, Hassan • Ph: 9148699386</div><div style="font-size: 12px; margin-top: 4px;" class="bold">PACKING SLIP / BILL</div></div>'
            + '<div class="border-top"></div>'
            + '<div class="flex" style="font-size: 12px;"><span>Order ID: <b>' + order.id + '</b></span><span>' + (order.dateISO || '') + '</span></div>'
            + '<div style="font-size: 12px; margin-top: 4px;">Customer: <b>' + (order.customer ? order.customer.name : '') + '</b> (' + (order.customer ? order.customer.phone : '') + ')<br/>Address: ' + (order.customer ? order.customer.fullAddress : '') + '</div>'
            + '<div class="border-top"></div>'
            + '<table class="items-table"><tr class="bold" style="border-bottom: 1px dashed #444;"><td>Item (Cut)</td><td style="text-align: center;">Qty</td><td style="text-align: right;">Total</td></tr>'
            + itemsHtml
            + '</table>'
            + '<div class="border-top"></div>'
            + '<div class="flex" style="font-size: 12px;"><span>Subtotal:</span> <span>₹' + order.subtotal + '</span></div>'
            + '<div class="flex" style="font-size: 12px;"><span>Delivery Fee:</span> <span>' + (order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge) + '</span></div>'
            + '<div class="flex bold" style="font-size: 15px; margin-top: 4px;"><span>GRAND TOTAL:</span> <span>₹' + order.grandTotal + '</span></div>'
            + '<div class="flex" style="font-size: 12px; margin-top: 4px;"><span>Payment:</span> <b>' + (order.paymentMethod || 'Cash') + '</b></div>'
            + '<div class="border-top"></div>'
            + '<div class="text-center" style="font-size: 11px;">Thank you for choosing Fresh Chicken Hassan! 🍗</div>'
            + '<div class="no-print">'
            + '<button class="btn" onclick="window.print()">🖨️ Print Slip</button>'
            + '<a class="btn-wa" href="https://api.whatsapp.com/send?text=' + encodedText + '" target="_blank">📲 Share Slip on WhatsApp</a>'
            + '</div></body></html>'
        );
        printWindow.document.close();
    }

    function resendOrderToWhatsApp(orderId) {
        var list = activeCustomerOrders.concat(window.ordersEngine ? window.ordersEngine.getAllOrders(true) : []);
        var order = list.find(function (o) { return o.id === orderId; });
        if (!order) return;

        var message = 'Hello ' + (CONFIG.BUSINESS_NAME || 'Fresh Chicken') + ',\n\n'
            + 'Resending Order *' + order.id + '*\n\n'
            + '📋 *CUSTOMER DETAILS*\n'
            + '👤 Name: ' + (order.customer ? order.customer.name : '') + '\n'
            + '📞 Phone: ' + (order.customer ? order.customer.phone : '') + '\n'
            + '📍 Address: ' + (order.customer ? order.customer.fullAddress : '') + '\n';
        if (order.customer && order.customer.notes) {
            message += '📝 Notes: ' + order.customer.notes + '\n';
        }
        message += '\n🛒 *ORDERED ITEMS*\n';
        if (Array.isArray(order.items)) {
            for (var i = 0; i < order.items.length; i++) {
                var it = order.items[i];
                message += '• ' + it.name + ' - ' + it.quantity + ' Kg (₹' + (it.pricePerKg * it.quantity) + ')\n';
            }
        }
        message += '\n💰 *PAYMENT SUMMARY*\n'
            + 'Subtotal: ₹' + order.subtotal + '\n'
            + 'Delivery Fee: ' + (order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge) + '\n'
            + '*Total Amount: ₹' + order.grandTotal + '*\n'
            + '💳 *Payment Method: ' + (order.paymentMethod || 'Cash / UPI') + '*\n';
        if (order.paymentMethod && order.paymentMethod.indexOf('UPI') !== -1) {
            message += '📲 Store UPI ID: ' + (CONFIG.UPI_ID || '9148699386@ybl') + '\n\n'
                + '⚠️ *IMPORTANT: PLEASE SHARE PAYMENT SCREENSHOT (SS) IN THIS CHAT TO CONFIRM YOUR ONLINE PAYMENT ORDER!*\n';
        }
        message += '\nPlease confirm my order!';

        var waNumber = CONFIG.WHATSAPP_NUMBER || '919148699386';
        var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
        window.open(waUrl, '_blank');
    }

    function syncUserOrders(phone) {
        var cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);
        if (!cleanPhone) {
            activeCustomerOrders = [];
            renderCustomerOrders();
            return;
        }

        if (window.cloudDb && typeof window.cloudDb.listenToUserRealtimeOrders === 'function') {
            window.cloudDb.listenToUserRealtimeOrders(cleanPhone, function (cloudOrders) {
                if (Array.isArray(cloudOrders)) {
                    activeCustomerOrders = cloudOrders;
                    renderCustomerOrders();
                }
            });
        } else if (window.cloudDb && typeof window.cloudDb.fetchUserOrdersFromCloud === 'function') {
            window.cloudDb.fetchUserOrdersFromCloud(cleanPhone).then(function (cloudOrders) {
                if (Array.isArray(cloudOrders)) {
                    activeCustomerOrders = cloudOrders;
                    renderCustomerOrders();
                }
            });
        } else {
            renderCustomerOrders();
        }
    }

    function refreshOrders() {
        renderCustomerAccountBanner();
        if (activeUserPhone) {
            syncUserOrders(activeUserPhone);
        }
        if (window.cart && typeof window.cart.showToast === 'function') {
            window.cart.showToast('Refreshing your orders...', 'info');
        }
    }

    function init() {
        renderCustomerAccountBanner();
        if (activeUserPhone) {
            syncUserOrders(activeUserPhone);
        } else {
            renderCustomerOrders();
        }

        window.addEventListener('profileUpdated', function (ev) {
            renderCustomerAccountBanner();
            var p = ev.detail || getActiveProfile();
            if (p && p.phone) {
                var clean = p.phone.replace(/\D/g, '').slice(-10);
                activeUserPhone = clean;
                syncUserOrders(clean);
            } else {
                activeUserPhone = '';
                activeCustomerOrders = [];
                renderCustomerOrders();
            }
        });

        window.addEventListener('ordersUpdated', function () {
            if (activeUserPhone) {
                renderCustomerOrders();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ordersPage = {
        renderCustomerAccountBanner: renderCustomerAccountBanner,
        renderCustomerOrders: renderCustomerOrders,
        refreshOrders: refreshOrders,
        handleReorder: handleReorder,
        downloadInvoice: downloadInvoice,
        printOrderReceipt: printOrderReceipt,
        resendOrderToWhatsApp: resendOrderToWhatsApp
    };

    // Keep backwards compatibility
    window.handleReorder = handleReorder;
    window.printOrderReceipt = printOrderReceipt;
    window.resendOrderToWhatsApp = resendOrderToWhatsApp;
    window.downloadInvoice = downloadInvoice;
})();
