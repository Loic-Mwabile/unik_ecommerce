const products = [
    {
      id: 1,
      name: "Unik T-Shirt",
      description: "Comfy, clean design. 100% cotton.",
      price: "Rs. 499",
      image: "https://via.placeholder.com/300x200?text=Unik+T-Shirt"
    },
    {
      id: 2,
      name: "Unik Hoodie",
      description: "Stay warm with our cozy hoodie.",
      price: "Rs. 999",
      image: "https://via.placeholder.com/300x200?text=Unik+Hoodie"
    },
    {
      id: 3,
      name: "Unik Mug",
      description: "Sip your coffee the Unik way.",
      price: "Rs. 299",
      image: "https://via.placeholder.com/300x200?text=Unik+Mug"
    }
  ];
  
  const productList = document.getElementById("product-list");
  
  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
  
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price">${product.price}</div>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
  
    productList.appendChild(card);
  });
  
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  }
    // You can later expand this to actually manage cart in localStorage
  