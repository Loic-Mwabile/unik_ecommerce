// Initialize cart in localStorage if it doesn't exist
if (!localStorage.getItem('cart')) {
  localStorage.setItem('cart', JSON.stringify([]));
}

// Check if we're on the products page
if (window.location.pathname.includes('products.html')) {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
      const productsContainer = document.getElementById('products-container');

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

function addToCart(productId, productName, productPrice) {
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
