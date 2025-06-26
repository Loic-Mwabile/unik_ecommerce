# Unik E-Commerce Website

A modern e-commerce website built with Node.js, Express, and SQLite.

## Project Structure

```
unik_ecommerce/
├── assets/           # Images and other static assets
├── css/             # Stylesheets
│   └── styles.css   # Main styles
├── js/              # JavaScript files
│   └── main.js      # Frontend functionality
├── server.js        # Backend server
├── ecommerce.db     # SQLite database
├── index.html       # Homepage
├── products.html    # Products page
├── cart.html        # Shopping cart
└── checkout.html    # Checkout page
```

## Features

- **Product Browsing**
  - View all available products
  - Product details including images, descriptions, and prices
  - Responsive product grid layout

- **Shopping Cart**
  - Add/remove products
  - Update quantities
  - View cart total
  - Persistent cart using localStorage

- **Checkout Process**
  - User information collection
  - Order processing
  - Order confirmation

## Technical Stack

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - LocalStorage for cart management

- **Backend**
  - Node.js
  - Express.js
  - SQLite3
  - RESTful API

## Setup Instructions

1. **Prerequisites**
   - Node.js installed
   - npm (Node Package Manager)

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]

   # Navigate to project directory
   cd unik_ecommerce

   # Install dependencies
   npm install
   ```

3. **Running the Server**
   ```bash
   node server.js
   ```
   The server will start at http://localhost:3000

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/cart` - Update cart
- `POST /api/checkout` - Process checkout

## Development

- Created a custom Express server
- Implemented product display functionality
- Set up database connection
- Added cart management system
- Implemented checkout process

## Future Improvements

- User authentication
- Payment gateway integration
- Admin dashboard
- Product search functionality
- User reviews and ratings

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License. 