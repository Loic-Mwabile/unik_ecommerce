document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("checkout-form");
  const confirmation = document.getElementById("confirmation");

  // Display order summary from cart
  function renderOrderSummary() {
    const orderSummaryDiv = document.getElementById("order-summary");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      orderSummaryDiv.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
    let total = 0;
    let summaryHtml = '<h4>Order Summary</h4><ul>';
    cart.forEach(item => {
      const price = typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^\d.]/g, ""))
        : item.price;
      total += price;
      summaryHtml += `<li>${item.name} x1 - Rs. ${price}</li>`;
    });
    summaryHtml += `</ul><strong>Total: Rs. ${total}</strong>`;
    orderSummaryDiv.innerHTML = summaryHtml;
  }

  renderOrderSummary();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.getElementById("payment-method").value;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      confirmation.textContent = "Your cart is empty.";
      return;
    }

    // Prepare order data
    const items = cart.map(item => ({ name: item.name, price: item.price }));
    const total = items.reduce((sum, item) => {
      const price = typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^\d.]/g, ""))
        : item.price;
      return sum + price;
    }, 0);

    const order = {
      name,
      phone,
      email,
      address,
      payment_method: paymentMethod,
      items,
      total
    };

    // Send order to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(order)
      });
      const data = await response.json();
      console.log('Checkout response:', data);
      if (data.success) {
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
        const waNumber = "243858680157"; // without +
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;
        window.open(waUrl, "_blank");
        confirmation.textContent =
          "Thank you for your order! We've received it and will contact you soon to arrange payment & delivery.";
        localStorage.removeItem("cart");
        form.reset();
        renderOrderSummary();
      } else {
        confirmation.textContent = data.error || "Order failed. Please try again.";
      }
    } catch (err) {
      confirmation.textContent = "Order failed. Please try again.";
    }
  });
});
