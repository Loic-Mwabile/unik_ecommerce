const form = document.getElementById("checkout-form");
const confirmation = document.getElementById("confirmation");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;

  // Here you'd send the info to a backend or store it
  confirmation.textContent = `Thank you, ${name}! We’ll contact you at ${email} soon.`;

  // Clear cart after checkout
  localStorage.removeItem("cart");
  form.reset();
});
