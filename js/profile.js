/**
 * Fresh Chicken Hassan - Customer Profile & Identity Engine
 * Manages customer logins, saved delivery addresses (street, landmark, area, city, pincode),
 * real-time Firebase sync (users/{phone}/profile), and cross-device order history restoration.
 * Exposes: window.customerProfile
 */
(function () {
    'use strict';
    var PROFILE_KEY = 'fresh_chicken_customer_profile';
    var LAST_PHONE_KEY = 'fresh_chicken_last_phone';
    var _profile = null;

    function _loadLocal() {
        try {
            var r = localStorage.getItem(PROFILE_KEY);
            if (r) return JSON.parse(r);
            var legacy = localStorage.getItem('fresh_chicken_user_profile_v1');
            if (legacy) return JSON.parse(legacy);
            return null;
        } catch (e) {
            return null;
        }
    }

    function _saveLocal(p) {
        try {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
            localStorage.setItem('fresh_chicken_user_profile_v1', JSON.stringify(p));
            if (p && p.phone) {
                localStorage.setItem(LAST_PHONE_KEY, p.phone);
            }
        } catch (e) {}
    }

    function _syncToCloud(p) {
        if (!p || !p.phone) return;
        if (window.cloudDb && window.cloudDb.saveUserToCloud) {
            window.cloudDb.saveUserToCloud(p).catch(function () {});
        }
    }

    function _fetchCloudOrders(phone) {
        if (!phone || !window.cloudDb || !window.cloudDb.fetchUserOrdersFromCloud) return;
        window.cloudDb.fetchUserOrdersFromCloud(phone).then(function (cloudOrders) {
            if (cloudOrders && cloudOrders.length > 0 && window.ordersEngine) {
                var localOrders = window.ordersEngine.orders || [];
                var map = {};
                localOrders.forEach(function (o) { if (o && o.id) map[o.id] = o; });
                cloudOrders.forEach(function (o) { if (o && o.id) map[o.id] = o; });
                var merged = Object.values(map).sort(function (a, b) {
                    return (b.timestamp || '').localeCompare(a.timestamp || '');
                });
                window.ordersEngine.orders = merged;
                try {
                    localStorage.setItem('fresh_chicken_orders_v1', JSON.stringify(merged));
                } catch (e) {}
                window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: merged }));
            }
        }).catch(function () {});
    }

    function _renderSlots(p) {
        document.querySelectorAll('.customer-profile-slot').forEach(function (slot) {
            if (p && p.name && p.phone) {
                var firstName = p.name.trim().split(' ')[0] || 'Customer';
                slot.innerHTML =
                    '<button type="button" onclick="window.customerProfile.openModal()" class="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm cursor-pointer" title="Manage Profile">' +
                    '<span class="material-symbols-outlined text-lg text-[#133B2C]">account_circle</span>' +
                    '<span class="text-xs font-black text-[#133B2C] max-w-[80px] truncate">' + firstName + '</span>' +
                    '</button>';
            } else {
                slot.innerHTML =
                    '<button type="button" onclick="window.customerProfile.openModal()" class="flex items-center gap-1.5 bg-gray-100 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 px-3 py-1.5 rounded-2xl transition-all shadow-sm cursor-pointer" title="Sign In">' +
                    '<span class="material-symbols-outlined text-lg text-gray-600">login</span>' +
                    '<span class="text-xs font-bold text-gray-700">Sign In</span>' +
                    '</button>';
            }
        });
    }

    function _buildModal() {
        if (document.getElementById('profile-modal')) return;
        var m = document.createElement('div');
        m.id = 'profile-modal';
        m.className = 'fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden';
        m.innerHTML =
            '<div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">' +
            '<button type="button" onclick="window.customerProfile.closeModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer">' +
            '<span class="material-symbols-outlined text-base">close</span>' +
            '</button>' +
            '<div class="text-center mb-5">' +
            '<div class="w-14 h-14 mx-auto mb-2 bg-emerald-50 text-[#133B2C] rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100">' +
            '<span class="material-symbols-outlined text-3xl">account_circle</span>' +
            '</div>' +
            '<h2 class="font-black text-xl text-[#133B2C]">Customer Profile &amp; Address</h2>' +
            '<p class="text-xs text-gray-400 mt-0.5">Quick 1-click checkout &amp; order tracking across devices</p>' +
            '</div>' +
            '<form id="profile-form" onsubmit="window.customerProfile.saveProfile(event)" class="space-y-3.5">' +
            '<div>' +
            '<label class="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">Full Name *</label>' +
            '<input id="profile-name" type="text" required maxlength="50" placeholder="e.g. Ramesh Kumar" class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />' +
            '</div>' +
            '<div>' +
            '<label class="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">Mobile Number (WhatsApp) *</label>' +
            '<div class="relative">' +
            '<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">+91</span>' +
            '<input id="profile-phone" type="tel" required maxlength="10" pattern="[0-9]{10}" placeholder="10-digit mobile number" class="w-full pl-11 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />' +
            '</div>' +
            '</div>' +
            '<div class="pt-2 border-t border-gray-100">' +
            '<span class="text-[11px] font-extrabold text-[#133B2C] uppercase tracking-wider block mb-2">Saved Delivery Address in Hassan</span>' +
            '<div class="space-y-2.5">' +
            '<div>' +
            '<label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">House / Building / Street</label>' +
            '<input id="profile-street" type="text" placeholder="e.g. #45, 2nd Main, Near Lakshmi Temple" class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-2">' +
            '<div>' +
            '<label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Landmark</label>' +
            '<input id="profile-landmark" type="text" placeholder="e.g. Santepet Circle" class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />' +
            '</div>' +
            '<div>' +
            '<label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Area / Layout</label>' +
            '<input id="profile-area" type="text" placeholder="e.g. KR Puram / Vidyanagar" class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#133B2C] focus:bg-white transition-colors" />' +
            '</div>' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-2">' +
            '<div>' +
            '<label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">City</label>' +
            '<input id="profile-city" type="text" value="Hassan" readonly class="w-full px-3.5 py-2 bg-emerald-50/60 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold cursor-not-allowed" />' +
            '</div>' +
            '<div>' +
            '<label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Pincode</label>' +
            '<input id="profile-pincode" type="text" value="573201" maxlength="6" class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#133B2C]" />' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div id="profile-error" class="hidden text-xs text-red-600 font-semibold bg-red-50 px-3 py-2 rounded-xl text-center"></div>' +
            '<button type="submit" class="w-full mt-3 bg-[#133B2C] hover:bg-[#0b251b] text-white py-3 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">' +
            '<span class="material-symbols-outlined text-base">save</span>' +
            '<span>Save Details</span>' +
            '</button>' +
            '<div id="profile-logout-row" class="hidden pt-2 text-center">' +
            '<button type="button" onclick="window.customerProfile.logout()" class="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors cursor-pointer">Sign Out / Switch Account</button>' +
            '</div>' +
            '</form>' +
            '</div>';
        document.body.appendChild(m);
        m.addEventListener('click', function (e) {
            if (e.target === m) window.customerProfile.closeModal();
        });
    }

    var customerProfile = {
        getProfile: function () {
            if (!_profile) _profile = _loadLocal();
            return _profile;
        },
        isLoggedIn: function () {
            var p = this.getProfile();
            return Boolean(p && p.name && p.phone && p.phone.length === 10);
        },
        openModal: function () {
            _buildModal();
            var p = this.getProfile();
            var n = document.getElementById('profile-name'),
                ph = document.getElementById('profile-phone'),
                st = document.getElementById('profile-street'),
                lm = document.getElementById('profile-landmark'),
                ar = document.getElementById('profile-area'),
                pc = document.getElementById('profile-pincode'),
                lr = document.getElementById('profile-logout-row'),
                er = document.getElementById('profile-error');

            if (p) {
                if (n) n.value = p.name || '';
                if (ph) ph.value = p.phone || '';
                if (st) st.value = p.street || '';
                if (lm) lm.value = p.landmark || '';
                if (ar) ar.value = p.area || '';
                if (pc) pc.value = p.pincode || '573201';
                if (lr) lr.classList.remove('hidden');
            } else {
                var sp = localStorage.getItem(LAST_PHONE_KEY) || '';
                if (ph && sp) ph.value = sp;
                if (lr) lr.classList.add('hidden');
            }
            if (er) er.classList.add('hidden');
            document.getElementById('profile-modal').classList.remove('hidden');
            if (n) setTimeout(function () { n.focus(); }, 100);
        },
        closeModal: function () {
            var m = document.getElementById('profile-modal');
            if (m) m.classList.add('hidden');
        },
        updateFromCheckout: function (checkoutData) {
            if (!checkoutData || !checkoutData.name || !checkoutData.phone) return;
            var current = this.getProfile() || {};
            var cleanPhone = checkoutData.phone.toString().replace(/\D/g, '').slice(-10);
            var updated = {
                name: checkoutData.name.trim(),
                phone: cleanPhone,
                street: checkoutData.street || current.street || '',
                landmark: checkoutData.landmark || current.landmark || '',
                area: checkoutData.area || current.area || '',
                city: checkoutData.city || 'Hassan',
                pincode: checkoutData.pincode || '573201',
                updatedAt: new Date().toISOString()
            };
            _profile = updated;
            _saveLocal(updated);
            _syncToCloud(updated);
            _renderSlots(updated);
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updated }));
        },
        saveProfile: function (e) {
            if (e && e.preventDefault) e.preventDefault();
            var n = document.getElementById('profile-name'),
                ph = document.getElementById('profile-phone'),
                st = document.getElementById('profile-street'),
                lm = document.getElementById('profile-landmark'),
                ar = document.getElementById('profile-area'),
                pc = document.getElementById('profile-pincode'),
                er = document.getElementById('profile-error');

            var name = (n && n.value.trim()) || '';
            var phone = (ph && ph.value.trim().replace(/\D/g, '').slice(-10)) || '';
            var street = (st && st.value.trim()) || '';
            var landmark = (lm && lm.value.trim()) || '';
            var area = (ar && ar.value.trim()) || '';
            var pincode = (pc && pc.value.trim()) || '573201';

            if (!name || name.length < 2) {
                if (er) { er.textContent = 'Please enter your full name.'; er.classList.remove('hidden'); }
                return;
            }
            if (!phone || phone.length !== 10) {
                if (er) { er.textContent = 'Please enter a valid 10-digit mobile number.'; er.classList.remove('hidden'); }
                return;
            }

            var p = {
                name: name,
                phone: phone,
                street: street,
                landmark: landmark,
                area: area,
                city: 'Hassan',
                pincode: pincode,
                updatedAt: new Date().toISOString()
            };

            _profile = p;
            _saveLocal(p);
            _syncToCloud(p);
            _renderSlots(p);
            _fetchCloudOrders(phone);
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: p }));
            this.closeModal();
            if (window.cart && window.cart.showToast) {
                window.cart.showToast('Welcome ' + name.split(' ')[0] + '! Profile saved.', 'success');
            }
        },
        logout: function () {
            _profile = null;
            try {
                localStorage.removeItem(PROFILE_KEY);
                localStorage.removeItem('fresh_chicken_user_profile_v1');
                localStorage.removeItem(LAST_PHONE_KEY);
            } catch (e) {}
            _renderSlots(null);
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: null }));
            this.closeModal();
            if (window.cart && window.cart.showToast) {
                window.cart.showToast('Signed out.', 'info');
            }
        },
        init: function () {
            _profile = _loadLocal();
            document.addEventListener('DOMContentLoaded', function () {
                _buildModal();
                _renderSlots(_profile);
                if (_profile && _profile.phone) {
                    _fetchCloudOrders(_profile.phone);
                }
            });
        }
    };

    customerProfile.init();
    window.customerProfile = customerProfile;
})();

