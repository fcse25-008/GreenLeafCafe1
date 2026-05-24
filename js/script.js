// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== CART FUNCTIONALITY ==========
    let cart = [];
    
    // Get cart from localStorage if exists
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch(e) {
            console.error('Error parsing cart:', e);
            cart = [];
        }
    }
    
    // Get DOM elements with error checking
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const closeCartBtn = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartIcon = document.querySelector('.cart-icon');
    
    // Function to update cart display - FIXED VERSION
    function updateCartDisplay() {
        // Update cart count if element exists
        if (cartCountSpan) {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            cartCountSpan.innerText = totalItems;
        }
        
        // Update cart items container if element exists
        if (cartItemsContainer) {
            if (!cart || cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
                if (cartTotalSpan) cartTotalSpan.innerText = 'BWP 0.00';
                return;
            }
            
            // Build cart items HTML
            let itemsHtml = '';
            let total = 0;
            
            cart.forEach((item, index) => {
                const quantity = item.quantity || 1;
                const itemTotal = (item.price || 0) * quantity;
                total += itemTotal;
                
                itemsHtml += `
                    <div class="cart-item" data-index="${index}">
                        <div class="cart-item-info">
                            <h4>${escapeHtml(item.name || 'Unknown Item')}</h4>
                            <p>BWP ${(item.price || 0).toFixed(2)}</p>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="decrease-qty" data-index="${index}">-</button>
                            <span>${quantity}</span>
                            <button class="increase-qty" data-index="${index}">+</button>
                            <button class="remove-item" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            cartItemsContainer.innerHTML = itemsHtml;
            if (cartTotalSpan) cartTotalSpan.innerText = `BWP ${total.toFixed(2)}`;
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.decrease-qty').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (!isNaN(index) && cart[index]) {
                        if (cart[index].quantity > 1) {
                            cart[index].quantity -= 1;
                        } else {
                            cart.splice(index, 1);
                        }
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartDisplay();
                    }
                });
            });
            
            document.querySelectorAll('.increase-qty').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (!isNaN(index) && cart[index]) {
                        cart[index].quantity = (cart[index].quantity || 1) + 1;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartDisplay();
                    }
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (!isNaN(index) && cart[index]) {
                        cart.splice(index, 1);
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartDisplay();
                    }
                });
            });
        }
    }
    
    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Function to extract numeric price from BWP string
    function extractPrice(priceText) {
        if (!priceText) return 0;
        // Remove "BWP" and extra spaces, then convert to number
        let price = priceText.replace('BWP', '').replace('P', '').trim();
        price = parseFloat(price);
        return isNaN(price) ? 0 : price;
    }
    
    // Show notification
    function showNotification(message, isError = false) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = isError ? '#f44336' : '#2e7d32';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '10000';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.innerText = message;
        
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (notification && notification.remove) {
                notification.remove();
            }
        }, 2000);
    }
    
    // Open cart function
    function openCart() {
        if (cartSidebar) cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('show');
    }
    
    // Close cart function
    function closeCart() {
        if (cartSidebar) cartSidebar.classList.remove('open');
        if (cartOverlay) cartOverlay.classList.remove('show');
    }
    
    // Add to cart functionality
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the menu item container
            const menuItem = this.closest('.menu-item');
            if (!menuItem) {
                showNotification('Error adding item to cart', true);
                return;
            }
            
            // Get item details
            const nameElement = menuItem.querySelector('h3');
            const priceElement = menuItem.querySelector('.price');
            
            if (!nameElement || !priceElement) {
                showNotification('Error: Missing item information', true);
                return;
            }
            
            const name = nameElement.innerText;
            const priceText = priceElement.innerText;
            const price = extractPrice(priceText);
            
            if (price === 0) {
                showNotification('Error: Invalid price', true);
                return;
            }
            
            // Check if item already in cart
            const existingItem = cart.find(item => item.name === name);
            
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }
            
            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update display
            updateCartDisplay();
            
            // Show feedback
            showNotification(`${name} added to cart!`);
        });
    });
    
    // Initialize cart display
    updateCartDisplay();
    
    // Cart icon to open sidebar
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
    
    // Close cart functions
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Place Order functionality
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!cart || cart.length === 0) {
                showNotification('Your cart is empty!', true);
                return;
            }
            
            // Calculate total
            const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
            
            // Create order summary
            let orderDetails = "Order Summary:\n\n";
            cart.forEach(item => {
                const quantity = item.quantity || 1;
                const itemTotal = (item.price || 0) * quantity;
                orderDetails += `${item.name} x ${quantity} = BWP ${itemTotal.toFixed(2)}\n`;
            });
            orderDetails += `\nTotal: BWP ${total.toFixed(2)}`;
            orderDetails += `\n\nThank you for your order!`;
            
            // Show confirmation dialog
            const confirmed = confirm(`${orderDetails}\n\nPlace this order?`);
            
            if (confirmed) {
                showNotification(`Order placed successfully! Total: BWP ${total.toFixed(2)}`);
                
                // Clear cart
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
                closeCart();
            }
        });
    }
    
    // ========== MENU TABS FUNCTIONALITY ==========
    const tabBtns = document.querySelectorAll('.tab-btn');
    const categories = document.querySelectorAll('.menu-category');
    
    if (tabBtns.length > 0 && categories.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get category
                const category = this.getAttribute('data-category');
                
                // Hide all categories
                categories.forEach(cat => {
                    cat.classList.remove('active-category');
                });
                
                // Show selected category
                const selectedCategory = document.getElementById(category);
                if (selectedCategory) {
                    selectedCategory.classList.add('active-category');
                }
            });
        });
    }
    
    // ========== HAMBURGER MENU ==========
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }
    
    // ========== SET CURRENT YEAR IN FOOTER ==========
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }
});
