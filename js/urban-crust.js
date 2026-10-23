// ***** Preloader: Fast, responsive fade-out ***** //
$(window).on("load", function() {
    $('#preloader').fadeOut(300);
});
// Fallback in case window.load already completed or is delayed
setTimeout(function() {
    if ($('#preloader').is(':visible')) {
        $('#preloader').fadeOut(300);
    }
}, 1000);

// ***** Toast Notification Utility ***** //
window.showUCToast = function(message, type, iconClass) {
    var $container = $('.uc-toast-container');
    if ($container.length === 0) {
        $container = $('<div class="uc-toast-container" aria-live="polite"></div>').appendTo('body');
    }
    type = type || 'info';
    iconClass = iconClass || (type === 'success' ? 'fa fa-check-circle' : (type === 'alert' ? 'fa fa-exclamation-circle' : 'fa fa-info-circle'));
    
    var $toast = $('<div class="uc-toast ' + type + '"><i class="' + iconClass + '" aria-hidden="true"></i><span>' + message + '</span></div>');
    $container.append($toast);
    
    setTimeout(function() {
        $toast.addClass('show');
    }, 50);

    setTimeout(function() {
        $toast.removeClass('show');
        setTimeout(function() {
            $toast.remove();
        }, 350);
    }, 3500);
};

// ***** Centralized Cart & Shop Engine ***** //
var UrbanCrustCart = (function() {
    // Initial mock cart items aligned with template
    var items = [
        { id: 1, name: "Truffle Burrata Margherita", price: 449, qty: 1, image: "images/pizza-1.png" },
        { id: 2, name: "Smoked Chicken Tikka", price: 499, qty: 1, image: "images/pizza-2.png" },
        { id: 3, name: "Wild Forest Mushroom & Truffle", price: 479, qty: 1, image: "images/pizza-3.png" }
    ];
    var discountPercent = 0;
    var shippingCost = 50;

    function getSubtotal() {
        var sub = 0;
        items.forEach(function(item) {
            sub += item.price * item.qty;
        });
        return sub;
    }

    function getTotalCount() {
        var count = 0;
        items.forEach(function(item) {
            count += item.qty;
        });
        return count;
    }

    function updateHeaderBadge() {
        var count = getTotalCount();
        $('.cart-count').text(count);
    }

    function updateDrawerTotals() {
        var sub = getSubtotal();
        $('.cart-drawer .sprice').text('₹' + sub.toLocaleString('en-IN'));
        updateHeaderBadge();
    }

    function updateCartPageTotals() {
        if ($('.cart-totals').length === 0) return;
        var sub = getSubtotal();
        var discountAmount = Math.round(sub * (discountPercent / 100));
        var discountedSub = sub - discountAmount;
        var total = sub > 0 ? discountedSub + shippingCost : 0;

        $('.cart-totals tr:nth-child(1) .right-price').text('₹' + sub.toLocaleString('en-IN'));
        
        if (discountPercent > 0) {
            if ($('.cart-totals tr.discount-row').length === 0) {
                $('.cart-totals tr:nth-child(1)').after('<tr class="discount-row"><td>Promo Discount (' + discountPercent + '%)</td><td class="right-price text-success">-₹' + discountAmount.toLocaleString('en-IN') + '</td></tr>');
            } else {
                $('.cart-totals tr.discount-row td.right-price').text('-₹' + discountAmount.toLocaleString('en-IN'));
            }
        } else {
            $('.cart-totals tr.discount-row').remove();
        }

        $('.cart-totals tr:contains("Shipping") .right-price').text(sub > 0 ? '₹' + shippingCost : '₹0');
        $('.cart-totals tr:contains("Order Total") .right-price').text('₹' + total.toLocaleString('en-IN'));
    }

    function updateCheckoutPageTotals() {
        if ($('.checkout-total').length === 0) return;
        var sub = getSubtotal();
        var total = sub > 0 ? sub + shippingCost : 0;
        $('.checkout-total .subtotal-amount').first().text('₹' + sub.toLocaleString('en-IN'));
        $('.checkout-total .total-amount').text('₹' + total.toLocaleString('en-IN'));
    }

    function removeItem(index) {
        if (index >= 0 && index < items.length) {
            var removed = items.splice(index, 1)[0];
            updateDrawerTotals();
            updateCartPageTotals();
            updateCheckoutPageTotals();
            return removed;
        }
        return null;
    }

    function addItem(name, price, image) {
        var existing = items.find(function(i) { return i.name.toLowerCase() === name.toLowerCase(); });
        if (existing) {
            existing.qty += 1;
        } else {
            items.push({
                id: Date.now(),
                name: name,
                price: price || 449,
                qty: 1,
                image: image || "images/pizza-1.png"
            });
        }
        updateDrawerTotals();
        updateCartPageTotals();
        updateCheckoutPageTotals();
    }

    return {
        items: items,
        getSubtotal: getSubtotal,
        getTotalCount: getTotalCount,
        updateHeaderBadge: updateHeaderBadge,
        updateDrawerTotals: updateDrawerTotals,
        updateCartPageTotals: updateCartPageTotals,
        updateCheckoutPageTotals: updateCheckoutPageTotals,
        removeItem: removeItem,
        addItem: addItem,
        applyCoupon: function(code) {
            if (code && code.trim().toUpperCase() === 'CRUST10') {
                discountPercent = 10;
                updateCartPageTotals();
                return { success: true, message: "Coupon CRUST10 applied! 10% discount added." };
            } else if (code && code.trim().toUpperCase() === 'URBAN20') {
                discountPercent = 20;
                updateCartPageTotals();
                return { success: true, message: "VIP Coupon URBAN20 applied! 20% discount added." };
            }
            return { success: false, message: "Invalid coupon code. Try 'CRUST10' for demo discount!" };
        }
    };
})();

$(function() {
    "use strict";

    $(document).ready(function(){

        // Initialize header cart count
        UrbanCrustCart.updateHeaderBadge();

        // ***** Sticky Header ***** //
        $(window).scroll(function(){
            if ($(this).scrollTop() > 0) {
                $('header').addClass('fixed');
            } else {
                $('header').removeClass('fixed');
            }
        });

        // ***** Menu Toggle ***** //
        $(".menu-toggle,.sidemenu-close").click(function(){
            $(".menu").slideToggle();
            $(".dropdown-content").slideUp(200);
            $(".opener").removeClass("active");
        });

        $(".opener").on("click", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(this).siblings(".dropdown-content").slideUp(200);
            } else {
                $(".opener").removeClass("active");
                $(this).addClass("active");
                $(".dropdown-content").slideUp(200);
                $(this).siblings(".dropdown-content").slideDown(300);
            }
        });

        // ***** Search Header ***** //
        $(".icon-menu ul li.search > a, .search-form button.close, .search-overlay").on("click", function(){
            $(".search-popup").toggleClass("open");
            if ($(".search-popup").hasClass("open")) {
                $(".search-input").focus();
            }
        });

        // Search submit handler
        $(".search-form form").on("submit", function(e) {
            e.preventDefault();
            var query = $(this).find('input[name="search"]').val().trim();
            if (query) {
                window.location.href = "shop-list.html?search=" + encodeURIComponent(query);
            } else {
                window.showUCToast("Please enter a search term (e.g., Margherita, Truffle, Burrata)", "info");
            }
        });

        // ***** Cart Drawer Toggle ***** //
        $(".icon-menu > ul > li.cart-slide > a, .cart-header .close, .cart-drawer .bg-overlay").on("click", function(){
            $(".cart-drawer").toggleClass("open");
        });

        // ***** Shop Sidebar Toggle ***** //
        $(".filter-btn a, .shop-header .close, .shop-sidebar .bg-overlay").on("click", function(){
            $(".shop-sidebar").toggleClass("open");
        });

        // ***** Container Spacing ***** //
        container_spacer();
        bannerround();
        jQuery('.left-padding, .right-padding').css('opacity', 1);

        $(window).resize(function(){
            container_spacer();
            bannerround();
        });

        // ***** Tab Switching ***** //
        $('.tab-link li a').on('click', function(){
            var target = $(this).attr('data-tab');
            $('.tab-link li a').removeClass('active');
            $(this).addClass('active');
            $("#"+target).fadeIn(600).siblings(".tab-panel").hide();
            return false;
        });

        // ***** Cart Drawer Plus / Minus Quantity Controls ***** //
        $('.cart-drawer').on('click', '.plus', function(e) {
            e.preventDefault();
            var $input = $(this).siblings('input');
            var val = parseInt($input.val()) || 1;
            val = Math.min(val + 1, 10);
            $input.val(val);

            var itemIdx = $(this).closest('.cart-item').index();
            if (UrbanCrustCart.items[itemIdx]) {
                UrbanCrustCart.items[itemIdx].qty = val;
            }
            UrbanCrustCart.updateDrawerTotals();
        });

        $('.cart-drawer').on('click', '.minus', function(e) {
            e.preventDefault();
            var $input = $(this).siblings('input');
            var val = parseInt($input.val()) || 1;
            val = Math.max(val - 1, 1);
            $input.val(val);

            var itemIdx = $(this).closest('.cart-item').index();
            if (UrbanCrustCart.items[itemIdx]) {
                UrbanCrustCart.items[itemIdx].qty = val;
            }
            UrbanCrustCart.updateDrawerTotals();
        });

        // Cart Drawer Remove Item
        $('.cart-drawer').on('click', '.item-remove', function(e) {
            e.preventDefault();
            var $item = $(this).closest('.cart-item');
            var itemIdx = $item.index();
            var removed = UrbanCrustCart.removeItem(itemIdx);
            $item.slideUp(250, function() {
                $(this).remove();
                if ($('.cart-drawer .cart-item').length === 0) {
                    $('.cart-drawer .cart-list-inner').html('<div class="p-4 text-center text-muted"><p>Your shopping cart is empty.</p><a href="shop-list.html" class="btn-ct btn-small mt-2">Explore Menu</a></div>');
                }
            });
            if (removed) {
                window.showUCToast(removed.name + " removed from cart.", "info");
            }
        });

        // ***** Cart Page (cart.html) Handlers ***** //
        if ($('.cart').length > 0) {
            $('.cart').on('click', '.plus', function(e) {
                e.preventDefault();
                var $row = $(this).closest('tr');
                var $input = $(this).siblings('input');
                var val = parseInt($input.val()) || 1;
                val = Math.min(val + 1, 10);
                $input.val(val);

                var rowIdx = $row.index();
                if (UrbanCrustCart.items[rowIdx]) {
                    UrbanCrustCart.items[rowIdx].qty = val;
                    var lineTotal = UrbanCrustCart.items[rowIdx].price * val;
                    $row.find('td.price').last().text('₹' + lineTotal.toLocaleString('en-IN'));
                }
                UrbanCrustCart.updateCartPageTotals();
                UrbanCrustCart.updateDrawerTotals();
            });

            $('.cart').on('click', '.minus', function(e) {
                e.preventDefault();
                var $row = $(this).closest('tr');
                var $input = $(this).siblings('input');
                var val = parseInt($input.val()) || 1;
                val = Math.max(val - 1, 1);
                $input.val(val);

                var rowIdx = $row.index();
                if (UrbanCrustCart.items[rowIdx]) {
                    UrbanCrustCart.items[rowIdx].qty = val;
                    var lineTotal = UrbanCrustCart.items[rowIdx].price * val;
                    $row.find('td.price').last().text('₹' + lineTotal.toLocaleString('en-IN'));
                }
                UrbanCrustCart.updateCartPageTotals();
                UrbanCrustCart.updateDrawerTotals();
            });

            $('.cart').on('click', '.item-remove', function(e) {
                e.preventDefault();
                var $row = $(this).closest('tr');
                var rowIdx = $row.index();
                var removed = UrbanCrustCart.removeItem(rowIdx);
                $row.fadeOut(250, function() {
                    $(this).remove();
                    if ($('.cart tbody tr').length === 0) {
                        $('.cart tbody').html('<tr><td colspan="5" class="text-center py-5"><h4>Your cart is empty</h4><p class="text-muted">Browse our handcrafted sourdough pizzas.</p><a href="shop-list.html" class="btn-ct btn-small mt-3">Order Now</a></td></tr>');
                    }
                });
                if (removed) {
                    window.showUCToast(removed.name + " removed.", "info");
                }
            });

            $('.apply-coupon form').on('submit', function(e) {
                e.preventDefault();
                var code = $(this).find('input').val();
                var res = UrbanCrustCart.applyCoupon(code);
                window.showUCToast(res.message, res.success ? "success" : "alert");
            });

            $('.update-cart button').on('click', function(e) {
                e.preventDefault();
                UrbanCrustCart.updateCartPageTotals();
                window.showUCToast("Cart recalculated and up to date!", "success");
            });
        }

        // ***** Shop Detail Quantity Controls (shop-detail.html) ***** //
        if ($('.shop-detail').length > 0) {
            // Fix +/- handler on product detail
            $('.shop-detail .minus').on('click', function(e) {
                e.preventDefault();
                var $input = $(this).siblings('input');
                var count = parseInt($input.val()) || 1;
                count = Math.max(count - 1, 1);
                $input.val(count);
            });
            $('.shop-detail .plus').on('click', function(e) {
                e.preventDefault();
                var $input = $(this).siblings('input');
                var count = parseInt($input.val()) || 1;
                count = Math.min(count + 1, 10);
                $input.val(count);
            });

            // Add to cart from shop-detail
            $('.shop-detail .cart-button a').on('click', function(e) {
                e.preventDefault();
                var title = $('.shop-detail .product-title').text().trim() || "Truffle Burrata Margherita";
                var qty = parseInt($('.shop-detail .add-cart-box input').val()) || 1;
                UrbanCrustCart.addItem(title, 449, "images/pizza-1.png");
                window.showUCToast("Added " + qty + " × " + title + " to your cart!", "success");
                setTimeout(function() {
                    $(".cart-drawer").addClass("open");
                }, 400);
            });

            // Wishlist button demo toggle
            $('.shop-detail .wish-btn').on('click', function(e) {
                e.preventDefault();
                var $icon = $(this).find('i');
                if ($icon.hasClass('fa-heart-o')) {
                    $icon.removeClass('fa-heart-o').addClass('fa-heart text-danger');
                    window.showUCToast("Saved to your favorites wishlist!", "success");
                } else {
                    $icon.removeClass('fa-heart text-danger').addClass('fa-heart-o');
                    window.showUCToast("Removed from your favorites.", "info");
                }
            });
        }

        // Add to Cart from menu cards ("Order Now" buttons)
        $(document).on('click', '.menu-item-order a', function(e) {
            e.preventDefault();
            var $box = $(this).closest('.menu-item-box');
            var title = $box.find('.menu-item-title h5 a').text().trim() || "Artisanal Pizza";
            var priceStr = $box.find('.menu-item-price span').text().replace(/[^0-9]/g, '');
            var price = parseInt(priceStr) || 449;
            var img = $box.find('.menu-item-img img').attr('src') || "images/pizza-1.png";

            UrbanCrustCart.addItem(title, price, img);
            window.showUCToast("Added " + title + " (₹" + price + ") to cart!", "success");
            
            // Brief visual highlight on cart icon
            $('.icon-menu .cart-slide').addClass('animated wobble');
            setTimeout(function() {
                $('.icon-menu .cart-slide').removeClass('animated wobble');
            }, 1000);
        });

        // ***** Checkout Page (checkout.html) Handlers ***** //
        if ($('.checkout').length > 0) {
            $('.checkout form').on('submit', function(e) {
                e.preventDefault();
                var firstName = $('input[placeholder*="First Name"]').val().trim() || "Valued Customer";
                var city = $('input[placeholder*="City"]').val().trim() || "New Delhi";
                var orderId = 'UC-' + Math.floor(100000 + Math.random() * 900000);
                
                var orderHtml = '<div class="alert alert-success mt-4 p-4 radius-20 shadow-sm">' +
                    '<h4 class="mb-2"><i class="fa fa-check-circle me-2"></i> Order Received Successfully!</h4>' +
                    '<p class="mb-1">Thank you, <strong>' + firstName + '</strong>. Your demo order <strong>#' + orderId + '</strong> is scheduled for fast doorstep delivery in <strong>' + city + '</strong> (Est. 30–40 mins).</p>' +
                    '<hr><p class="small text-muted mb-0"><em>Portfolio Demo Mode: No financial transaction was executed and no backend database record was altered.</em></p>' +
                    '</div>';

                $('.billing-detail').prepend(orderHtml);
                $('html, body').animate({ scrollTop: $('.checkout').offset().top - 80 }, 400);
                window.showUCToast("Demo Order #" + orderId + " placed!", "success");
            });
        }

        // ***** Reservation Form Handlers (index.html, book-now.html) ***** //
        $('.book-form').not('.contactfrm').on('submit', function(e) {
            e.preventDefault();
            var $form = $(this);
            var name = $form.find('input[placeholder*="Name"]').val().trim() || "Guest";
            var guests = $form.find('input[placeholder*="Guest"]').val().trim() || "2";
            var date = $form.find('input[placeholder*="Date"]').val().trim() || "Upcoming date";
            var time = $form.find('input[placeholder*="Time"]').val().trim() || "Dinner";

            var $feedback = $form.siblings('.form-feedback-alert');
            if ($feedback.length === 0) {
                $feedback = $('<div class="form-feedback-alert">' +
                    '<h5><i class="fa fa-check-circle" aria-hidden="true"></i> Table Reservation Requested</h5>' +
                    '<p class="booking-text"></p>' +
                    '<div class="demo-note">Portfolio Demonstration: In live production, this request confirms via your table management system (e.g. SevenRooms, Resy, or SMS webhook).</div>' +
                    '</div>').insertBefore($form);
            }

            $feedback.find('.booking-text').html('Thank you, <strong>' + name + '</strong>! Your table for <strong>' + guests + ' guests</strong> on <strong>' + date + '</strong> at <strong>' + time + '</strong> has been reserved at Urban Crust.');
            $feedback.slideDown(400);
            window.showUCToast("Table reserved for " + name + "!", "success");
            $form[0].reset();
        });

        // ***** Contact Form Handler (contact-us.html) ***** //
        $('.contactfrm').on('submit', function(e) {
            e.preventDefault();
            var $form = $(this);
            $('.contactfrmmsg').slideDown('slow');
            window.showUCToast("Your message has been sent to our team!", "success");
            $form[0].reset();
        });

        // ***** Newsletter Footer Sign-Up ***** //
        $('.footer-sign-up a').on('click', function(e) {
            e.preventDefault();
            var email = prompt("Enter your email to receive secret menu drops & chef specials in Delhi & Bengaluru:");
            if (email && email.indexOf('@') > -1) {
                window.showUCToast("Welcome! " + email + " is subscribed to Urban Crust specials.", "success");
            } else if (email) {
                window.showUCToast("Please enter a valid email address.", "alert");
            }
        });

        // ***** Policy & Terms Demonstration Modal / Toast ***** //
        $('.policy-menu a').on('click', function(e) {
            e.preventDefault();
            var policyName = $(this).text().trim();
            window.showUCToast(policyName + " (Demo): Urban Crust complies with standard food safety & privacy best practices.", "info");
        });

        // App store links demo feedback
        $('.app-list a').on('click', function(e) {
            e.preventDefault();
            window.showUCToast("Urban Crust Mobile App (Demo): Coming soon to iOS App Store & Google Play!", "info");
        });

        // Social links demo feedback
        $('.footer-social a, .team-social a').on('click', function(e) {
            if ($(this).attr('href') === '#') {
                e.preventDefault();
                window.showUCToast("Connect with @UrbanCrustPizza on social media! (Demo link)", "info");
            }
        });

        // ***** Price Range Slider in Shop Sidebar ***** //
        if ($(".range-slider").length > 0) {
            const settings = {
                fill: '#fbb200',
                background: '#e4ded9'
            };

            const sliders = document.querySelectorAll('.range-slider');
            Array.prototype.forEach.call(sliders, function(slider) {
                const input = slider.querySelector('input');
                const span = slider.querySelector('span');

                input.addEventListener('input', function(event) {
                    span.innerHTML = event.target.value;
                    applyFill(event.target);
                });
                applyFill(input);
            });

            function applyFill(slider) {
                const percentage = 100 * (slider.value - slider.min) / (slider.max - slider.min);
                const bg = `linear-gradient(90deg, ${settings.fill} ${percentage}%, ${settings.background} ${percentage + 0.1}%)`;
                slider.style.background = bg;
            }

            // Filter button inside shop sidebar
            $('.price-filter-btn button').on('click', function(e) {
                e.preventDefault();
                var maxPrice = parseInt($('.range-slider-range').val()) || 200;
                // Slider scale ranges ₹250 to ₹(250 + value*3)
                var threshold = 250 + (maxPrice * 2);
                
                var matched = 0;
                $('.shop-list .menu-item-box').each(function() {
                    var priceText = $(this).find('.menu-item-price span').text().replace(/[^0-9]/g, '');
                    var price = parseInt(priceText) || 0;
                    if (price <= threshold) {
                        $(this).closest('.col-xl-4, .col-lg-4').fadeIn(250);
                        matched++;
                    } else {
                        $(this).closest('.col-xl-4, .col-lg-4').fadeOut(250);
                    }
                });
                $('.shop-filter .results').text('Showing ' + matched + ' filtered dishes (under ₹' + threshold + ')');
                $('.shop-sidebar').removeClass('open');
                window.showUCToast("Filtered " + matched + " items under ₹" + threshold, "info");
            });
        }

        // ***** Shop List Sorting & Search Query Filter (shop-list.html) ***** //
        if ($('.shop-list').length > 0) {
            // Check for ?search= in URL
            var urlParams = new URLSearchParams(window.location.search);
            var searchParam = urlParams.get('search');
            if (searchParam) {
                searchParam = decodeURIComponent(searchParam).toLowerCase();
                var matchCount = 0;
                $('.shop-list .menu-item-box').each(function() {
                    var title = $(this).find('.menu-item-title h5 a').text().toLowerCase();
                    var desc = $(this).find('.menu-item-des p').text().toLowerCase();
                    if (title.indexOf(searchParam) > -1 || desc.indexOf(searchParam) > -1) {
                        $(this).closest('.col-xl-4, .col-lg-4').show();
                        matchCount++;
                    } else {
                        $(this).closest('.col-xl-4, .col-lg-4').hide();
                    }
                });
                $('.shop-filter .results').text('Showing ' + matchCount + ' results for "' + searchParam + '"');
            }

            // Sorting dropdown
            $('.fillter-dropdown select').on('change', function() {
                var val = $(this).val();
                var $container = $('.shop-list .tab-panel .row');
                var $items = $container.children('.col-xl-4, .col-lg-4').get();

                if (val === 'A - Z') {
                    $items.sort(function(a, b) {
                        var titleA = $(a).find('.menu-item-title h5 a').text().toUpperCase();
                        var titleB = $(b).find('.menu-item-title h5 a').text().toUpperCase();
                        return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0;
                    });
                } else if (val === 'Z - A') {
                    $items.sort(function(a, b) {
                        var titleA = $(a).find('.menu-item-title h5 a').text().toUpperCase();
                        var titleB = $(b).find('.menu-item-title h5 a').text().toUpperCase();
                        return (titleA > titleB) ? -1 : (titleA < titleB) ? 1 : 0;
                    });
                } else {
                    // Default
                    return;
                }

                $.each($items, function(idx, itm) {
                    $container.append(itm);
                });
                window.showUCToast("Dishes sorted: " + val, "info");
            });
        }

        // ***** Our Menu Slider ***** //
        if ($(".menu-slider").length > 0){
            $('.menu-slider').owlCarousel({
                loop: true,
                nav: true,
                dots: false,
                items: 4,
                margin: 40,
                smartSpeed: 900,
                autoplayTimeout: 5000,
                autoplaySpeed: 1000,
                responsive: {
                    0: { items: 1, nav: false, dots: true },
                    600: { items: 2, nav: false, dots: true },
                    768: { items: 2 },
                    992: { items: 3 },
                    1300: { items: 4 }
                }
            });
        }

        // ***** Testimonials Slider ***** //
        if ($(".testimonials-slider").length > 0){
            $('.testimonials-slider').owlCarousel({
                loop: true,
                nav: true,
                dots: false,
                items: 4,
                margin: 40,
                smartSpeed: 900,
                autoplayTimeout: 5000,
                autoplaySpeed: 1000,
                responsive: {
                    0: { items: 1, nav: false, dots: true },
                    700: { items: 2, nav: false, dots: true },
                    1000: { items: 3 },
                    1300: { items: 4 }
                }
            });
        }

    });

    // ***** Container Spacing ***** //
    function container_spacer(){
        var win = jQuery(window).width();
        var con = jQuery('.container').width();
        var total = Math.max((win - con) / 2, 15);

        jQuery('.left-padding').css('padding-left', total);
        jQuery('.right-padding').css('padding-right', total);
    }

    // ***** Slider Round ***** //
    function bannerround(){
        var bannerround = jQuery('.slider-round').width();
        if (bannerround) {
            jQuery('.slider-round').css('height', bannerround);
        }
    }

});
