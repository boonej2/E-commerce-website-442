// Cart functionality using localStorage
class Cart {
    constructor() {
        this.items = this.loadCart();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('ecommerce-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('ecommerce-cart', JSON.stringify(this.items));
    }

    // Add item to cart
    addItem(id, name, price, quantity = 1, options = {}) {
        const existingItem = this.items.find(item => 
            item.id === id && 
            item.size === options.size && 
            item.color === options.color
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id,
                name,
                price,
                quantity,
                size: options.size || '',
                color: options.color || ''
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
    }

    // Remove item from cart
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartDisplay();
    }

    // Update item quantity
    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(id);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
        this.updateCartDisplay();
    }

    // Get total number of items in cart
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get total price
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    // Get all items
    getItems() {
        return this.items;
    }

    // Update cart display across all pages
    updateCartDisplay() {
        // Update cart count in navigation
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = this.getTotalItems();
        });

        // Update checkout page if it exists
        if (window.location.pathname.includes('checkout.html')) {
            this.renderCheckoutPage();
        }
    }

    // Render checkout page
    renderCheckoutPage() {
        const cartItemsContainer = document.getElementById('cart-items');
        const orderSummaryContainer = document.getElementById('order-summary');
        
        if (cartItemsContainer) {
            if (this.items.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <h3>Your cart is empty</h3>
                        <p>Add some items to your cart to continue shopping.</p>
                        <a href="store.html" class="btn btn-primary">Continue Shopping</a>
                    </div>
                `;
                return;
            }

            cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">${item.name.charAt(0)}</div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        ${item.size ? `<div class="cart-item-option">Size: ${item.size}</div>` : ''}
                        ${item.color ? `<div class="cart-item-option">Color: ${item.color}</div>` : ''}
                        <div class="cart-item-price">$${item.price}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="cart.removeItem('${item.id}')">Remove</button>
                </div>
            `).join('');
        }

        if (orderSummaryContainer) {
            const subtotal = parseFloat(this.getTotalPrice());
            const shipping = subtotal > 0 ? 5.99 : 0;
            const tax = subtotal * 0.08; // 8% tax
            const total = subtotal + shipping + tax;

            orderSummaryContainer.innerHTML = `
                <div class="summary-item">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Shipping:</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Tax:</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="placeOrder()">
                    Place Order
                </button>
            `;
        }
    }
}

// Initialize cart
const cart = new Cart();

// Global functions for HTML onclick events
function addToCart(id, name, price, quantity = 1, options = {}) {
    cart.addItem(id, name, price, quantity, options);
    showNotification('Item added to cart!');
}

function updateCartCount() {
    cart.updateCartDisplay();
}

function removeFromCart(id) {
    cart.removeItem(id);
    showNotification('Item removed from cart');
}

function placeOrder() {
    if (cart.getTotalItems() === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Simulate order processing
    const orderNumber = Math.floor(Math.random() * 1000000);
    alert(`Order placed successfully!\nOrder #${orderNumber}\nTotal: $${(parseFloat(cart.getTotalPrice()) + 5.99 + (parseFloat(cart.getTotalPrice()) * 0.08)).toFixed(2)}`);
    
    // Clear cart after successful order
    cart.clearCart();
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize cart display when page loads
document.addEventListener('DOMContentLoaded', function() {
    cart.updateCartDisplay();
});