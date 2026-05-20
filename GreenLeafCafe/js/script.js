// Dynamic copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// Menu category tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const categories = document.querySelectorAll('.menu-category');

if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categories.forEach(cat => {
                cat.classList.remove('active-category');
                if (cat.id === category) {
                    cat.classList.add('active-category');
                }
            });
        });
    });
}

// ========== SHOPPING CART FUNCTIONALITY ==========
let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('greenleafCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
        updateCartCount();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('greenleafCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    saveCart();
    updateCartDisplay();
    updateCartCount();
    
    // Show notification
    showNotification(`${name} added to cart!`);
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Update cart sidebar display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
        if (cartTotalSpan) cartTotalSpan.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    let html = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="decrease-qty" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-qty" data-index="${index}">+</button>
                    <button class="remove-item" data-index="${index}">🗑️</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    if (cartTotalSpan) cartTotalSpan.textContent = `$${total.toFixed(2)}`;
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            saveCart();
            updateCartDisplay();
            updateCartCount();
        });
    });
    
    document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            cart[index].quantity += 1;
            saveCart();
            updateCartDisplay();
            updateCartCount();
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            cart.splice(index, 1);
            saveCart();
            updateCartDisplay();
            updateCartCount();
        });
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2e7d32;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        animation: fadeOut 2s ease forwards;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Cart sidebar toggle
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');

function openCart() {
    if (cartSidebar) cartSidebar.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('show');
}

function closeCartFunc() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('show');
}

if (cartIcon) {
    cartIcon.addEventListener('click', openCart);
}
if (closeCart) {
    closeCart.addEventListener('click', closeCartFunc);
}
if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartFunc);
}

// Checkout / Place Order
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        showNotification(`Order placed! Total: $${total.toFixed(2)}. Thank you!`);
        cart = [];
        saveCart();
        updateCartDisplay();
        updateCartCount();
        closeCartFunc();
    });
}

// Add to cart buttons
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuItem = btn.closest('.menu-item');
        const name = menuItem.dataset.name;
        const price = parseFloat(menuItem.dataset.price);
        addToCart(name, price);
    });
});

// Load cart on page load
loadCart();

// Feedback form handling
const form = document.getElementById('feedbackForm');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (form.checkValidity()) {
            const msg = document.getElementById('formMessage');
            msg.textContent = '✅ Thank you! Your feedback has been sent.';
            msg.style.color = '#2e7d32';
            form.reset();
        } else {
            form.reportValidity();
        }
    });
}

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateY(0); }
        70% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); visibility: hidden; }
    }
`;
document.head.appendChild(style);
