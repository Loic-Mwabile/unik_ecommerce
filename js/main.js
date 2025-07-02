// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname.includes('products.html')) {
        window.location.href = 'auth.html';
    }
}

// Add token to fetch requests
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
}

// Initialize cart in localStorage if it doesn't exist
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

// Check if we're on the products page
if (window.location.pathname.includes('products.html')) {
    fetchWithAuth('http://localhost:3000/api/products')
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (response.status === 401 || response.status === 403) {
                window.location.href = 'auth.html';
                return;
            }
            return response.json();
        })
        .then(products => {
            if (!products) return; // Si la réponse est vide (redirection)
            
            console.log('Raw API Response:', products);
            console.log('Type of products:', typeof products);
            console.log('Is Array?', Array.isArray(products));
            const productsContainer = document.getElementById('products-container');

            if (!Array.isArray(products)) {
                console.error('Products is not an array:', products);
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image || 'assets/placeholder.jpg'}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <p class="product-price">$${product.price}</p>
                        <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                            Add to Cart
                        </button>
                    </div>
                `;
                productsContainer.appendChild(productCard);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Modal HTML for login prompt
function createLoginModal() {
    if (document.getElementById('loginModal')) return; // Prevent duplicates
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.innerHTML = `
        <div style="background: white; padding: 2rem 2.5rem; border-radius: 10px; box-shadow: 0 2px 20px #0002; text-align: center; max-width: 350px;">
            <h2>Login Required</h2>
            <p>You need to be logged in to add items to your cart.</p>
            <button id="goToLoginBtn" style="background: #0481a0; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; font-size: 1rem; cursor: pointer;">Login</button>
            <br><br>
            <button id="closeLoginModal" style="background: #eee; color: #333; border: none; padding: 0.5rem 1rem; border-radius: 5px; font-size: 0.9rem; cursor: pointer;">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('goToLoginBtn').onclick = function() {
        window.location.href = 'auth.html';
    };
    document.getElementById('closeLoginModal').onclick = function() {
        modal.remove();
    };
}

function addToCart(productId, productName, productPrice) {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        createLoginModal();
        return;
    }
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // If product exists, increase quantity
        existingItem.quantity += 1;
    } else {
        // If product doesn't exist, add new item
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    showNotification(`${productName} added to cart!`);
    
    // Update cart count in navbar
    updateCartCount();
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart count in navbar
    const cartLink = document.querySelector('a[href="cart.html"]');
    if (cartLink) {
        cartLink.innerHTML = `Cart (${totalItems})`;
    }
}

// Update cart count when page loads
updateCartCount();

// --- Page-specific initialization functions ---

function initCartPage() {
  // Cart logic from cart.html
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const checkoutBtn = document.getElementById('checkout-btn');

  function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;
    if (!cartItemsContainer || !cartTotalAmount) return;
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
      if (checkoutBtn) checkoutBtn.style.display = 'none';
    } else {
      cartItemsContainer.innerHTML = '';
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p>Price: $${item.price}</p>
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <p>Total: $${itemTotal.toFixed(2)}</p>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
      });
      cartTotalAmount.textContent = total.toFixed(2);
      if (checkoutBtn) checkoutBtn.style.display = 'inline-block';
    }
  }

  window.updateQuantity = function(productId, newQuantity) {
    if (newQuantity < 1) {
      window.removeFromCart(productId);
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart'));
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
      cart[itemIndex].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartDisplay();
    }
  };

  window.removeFromCart = function(productId) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartDisplay();
  };

  updateCartDisplay();

  // Auth menu logic
  updateAuthMenu();
}

function initProductsPage() {
  // Auth menu logic
  updateAuthMenu();
}

function initCheckoutPage() {
  // Checkout logic from js/checkout.js
  const form = document.getElementById('checkout-form');
  const confirmation = document.getElementById('confirmation');
  let waUrl = '';
  if (!form) return;

  // Change button text
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Place Order via WhatsApp';

  function renderOrderSummary() {
    const orderSummaryDiv = document.getElementById('order-summary');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!orderSummaryDiv) return;
    if (cart.length === 0) {
      orderSummaryDiv.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
    let total = 0;
    let summaryHtml = '<h4>Order Summary</h4><ul>';
    cart.forEach(item => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
      total += price;
      summaryHtml += `<li>${item.name} x1 - Rs. ${price}</li>`;
    });
    summaryHtml += `</ul><strong>Total: Rs. ${total}</strong>`;
    orderSummaryDiv.innerHTML = summaryHtml;
  }

  renderOrderSummary();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      confirmation.textContent = 'Your cart is empty.';
      return;
    }
    const items = cart.map(item => ({ name: item.name, price: item.price }));
    const total = items.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price;
      return sum + price;
    }, 0);
    // WhatsApp message
    const waMsg =
      `📦 NEW ORDER\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `🚚 Delivery: Home Delivery\n` +
      `📍 Address: ${address}\n` +
      `💸 Payment: ${paymentMethod}\n` +
      `🛒 Items:\n` +
      items.map(i => `- ${i.name} x1`).join("\n") +
      `\nTotal: Rs. ${total}`;
    const waNumber = '243858680157';
    waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;
    // Open WhatsApp
    window.open(waUrl, '_blank');
    // Show prompt to confirm after sending
    confirmation.innerHTML =
      "Once you have sent your order on WhatsApp, click the button below to confirm your order.<br><br>" +
      `<button id='waConfirmBtn' style='background:#25D366;color:white;padding:0.7rem 1.5rem;border:none;border-radius:5px;font-size:1rem;cursor:pointer;'>I have sent my order</button>`;
    // Add event listener for confirmation button
    setTimeout(() => {
      const waConfirmBtn = document.getElementById('waConfirmBtn');
      if (waConfirmBtn) {
        waConfirmBtn.onclick = function() {
          confirmation.innerHTML = "Thank you for your order! We've received it and will contact you soon to arrange payment & delivery.";
          localStorage.removeItem('cart');
          form.reset();
          renderOrderSummary();
        };
      }
    }, 0);
  });
}

function updateAuthMenu() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userInfo = document.getElementById('userInfo');
  const authButtons = document.getElementById('authButtons');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  if (user && token) {
    if (userInfo) userInfo.style.display = 'flex';
    if (authButtons) authButtons.style.display = 'none';
    if (userName) userName.textContent = user.username;
    if (userAvatar) userAvatar.textContent = user.username.charAt(0).toUpperCase();
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (authButtons) authButtons.style.display = 'flex';
  }
}

// Make logout globally available for HTML onclick
window.logout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
};

// --- Unified DOMContentLoaded handler ---
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  if (path.includes('cart.html')) {
    initCartPage();
  } else if (path.includes('products.html')) {
    initProductsPage();
  } else if (path.includes('checkout.html')) {
    initCheckoutPage();
  } else {
    updateAuthMenu();
  }
  // Hamburger menu logic (always run)
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
    // Diagnostic: log if hamburger is present and its computed display
    const style = window.getComputedStyle(hamburger);
    console.log('[DIAG] Hamburger present:', true, 'Display:', style.display, 'Width:', style.width, 'Height:', style.height);
  } else {
    console.log('[DIAG] Hamburger present:', false);
  }
});
