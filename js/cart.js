const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

function displayCart() {
  cartContainer.innerHTML = "";
  let total = 0;

  if (cartItems.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty 🥲</p>";
    cartTotal.textContent = "";
    return;
  }

  cartItems.forEach((item, index) => {
    total += parseFloat(item.price.replace("Rs. ", ""));

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.price}</p>
      </div>
      <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
    `;

    cartContainer.appendChild(cartItem);
  });

  cartTotal.textContent = `Total: Rs. ${total}`;
}

function removeItem(index) {
  cartItems.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  displayCart();
}

displayCart();
