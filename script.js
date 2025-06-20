document.addEventListener('DOMContentLoaded', () => {
    // --- Search Bar Functionality ---
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const productCards = document.querySelectorAll('.product-card');

    // Ensure elements exist before adding listeners 
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });

        if (clearSearchButton) {
            clearSearchButton.addEventListener('click', clearSearchAndShowAllProducts);
        }
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();

        // Check if we are on the products page (where productCards exist)
        if (productCards.length > 0) {
            productCards.forEach(card => {
                const title = card.querySelector('.product-title').textContent.toLowerCase();
                const price = card.querySelector('.product-price').textContent.toLowerCase(); // Search by price too

                if (title.includes(searchTerm) || price.includes(searchTerm)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
            // Update URL to reflect search term without reloading
            const newUrl = new URL(window.location.href);
            if (searchTerm) {
                newUrl.searchParams.set('search', searchTerm);
            } else {
                newUrl.searchParams.delete('search');
            }
            history.replaceState({}, '', newUrl.toString());

        } else {
            // If not on the products page, redirect to products page with search term
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }

    function clearSearchAndShowAllProducts() {
        if (searchInput) {
            searchInput.value = ''; // Clear the input field
        }
        if (productCards.length > 0) {
            productCards.forEach(card => {
                card.classList.remove('hidden'); // Show all product cards
            });
        }
        // Clean up the URL by removing the search parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('search');
        history.replaceState({}, '', newUrl.toString()); // Update URL without reloading
    }


    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get('search');
    if (searchTermFromUrl && searchInput) {
        searchInput.value = searchTermFromUrl;
        // Automatically perform search if coming from a redirect and on the products page
        if (productCards.length > 0) {
            performSearch(); 
        }
    }

    // --- Product Image Viewing Functionality (only on products.html) ---
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    const closeButton = document.querySelector('.close-button');
    const productThumbnails = document.querySelectorAll('.product-thumbnail');

    productThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            if (modal && modalImage && captionText) {
                modal.style.display = 'block';
                modalImage.src = this.dataset.largeSrc || this.src; // Use data-large-src if available, else src
                captionText.innerHTML = this.alt; // Display the alt text as caption
            }
        });
    });

    // When the user clicks on (x), close the modal
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    // When the user clicks anywhere outside of the modal content, close it
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Shopping Cart Functionality 
    function getCart() {
        const cartJson = localStorage.getItem('shoppingCart');
        return cartJson ? JSON.parse(cartJson) : [];
    }

    function saveCart(cart) {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    // Add to Cart logic (for products.html buttons)
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productCard = event.target.closest('.product-card');
            if (productCard) {
                
                const productId = productCard.querySelector('.product-title').textContent; 
                const productName = productCard.querySelector('.product-title').textContent;
                const productPriceText = productCard.querySelector('.product-price').textContent;
                // Clean price text (remove 'R' and convert to number)
                const productPrice = parseFloat(productPriceText.replace('R', ''));
                const productImageSrc = productCard.querySelector('.product-thumbnail').src;

                const product = {
                    id: productId, 
                    name: productName,
                    price: productPrice,
                    image: productImageSrc,
                    quantity: 1 // Default quantity when adding
                };
                
                addItemToCart(product);
                alert(`${productName} added to cart!`); // user feedback
            }
        });
    });

    // Function to add item to cart if it exists
    function addItemToCart(productToAdd) {
        let cart = getCart();
        const existingItem = cart.find(item => item.id === productToAdd.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(productToAdd);
        }
        saveCart(cart);
        updateCartDisplay(); // update display on cart page
    }

    // Function to update item quantity in cart
    function updateCartItemQuantity(productId, newQuantity) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity = parseInt(newQuantity);
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove item if quantity is zero or less
            }
            saveCart(cart);
            updateCartDisplay(); 
        }
    }

    // Function to remove an item completely from cart
    function removeItemFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId); // Filter out the item to remove
        saveCart(cart);
        updateCartDisplay(); 
    }

    // Function to clear all items from the cart
    function clearShoppingCart() {
        localStorage.removeItem('shoppingCart'); // Remove cart from local storage
        updateCartDisplay(); 
    }

    // Function to calculate total price of items in cart
    function calculateCartTotal() {
        const cart = getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Function to update the cart display on cart.html
    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotalElement = document.getElementById('cartTotal');
        const cartSummary = document.querySelector('.cart-summary'); 

        // Only proceed if elements exist (i.e., we are on Cart.html)
        if (!cartItemsContainer || !cartTotalElement || !emptyCartMessage || !cartSummary) {
            return;
        }

        const cart = getCart();
        cartItemsContainer.innerHTML = ''; // Clear existing displayed items

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block'; // Show "Your cart is empty" message
            cartSummary.style.display = 'none'; // Hide total and action buttons
        } else {
            emptyCartMessage.style.display = 'none'; // Hide empty message
            cartSummary.style.display = 'flex'; 

            
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.dataset.productId = item.id; // Store product ID for easy access

                // Populate item HTML
                cartItemDiv.innerHTML = `
                    <div class="cart-item-details">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h3>${item.name}</h3>
                            <p>Price: R${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-button decrease-quantity" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="quantity-button increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-price">R${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item-button" data-id="${item.id}">Remove</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        // Update the overall cart total display
        cartTotalElement.textContent = `R${calculateCartTotal().toFixed(2)}`;

        
        // (Quantity change buttons and Remove buttons)
        document.querySelectorAll('.quantity-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                const inputElement = cartItemsContainer.querySelector(`.quantity-input[data-id="${productId}"]`);
                let currentQuantity = parseInt(inputElement.value);

                if (event.target.classList.contains('increase-quantity')) {
                    currentQuantity++;
                } else if (event.target.classList.contains('decrease-quantity')) {
                    currentQuantity--;
                }
                
                // If quantity is 0 or less, remove the item
                if (currentQuantity >= 1) {
                    inputElement.value = currentQuantity; // Update input field
                    updateCartItemQuantity(productId, currentQuantity);
                } else {
                    removeItemFromCart(productId); 
                }
            });
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.dataset.id;
                let newQuantity = parseInt(event.target.value);
                // Ensure quantity is a valid number and at least 1
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1; 
                    event.target.value = 1; // Correct the input field
                }
                updateCartItemQuantity(productId, newQuantity);
            });
        });

        document.querySelectorAll('.remove-item-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                removeItemFromCart(productId);
            });
        });
    }

    // Event listeners for Clear Cart and Checkout buttons on cart.html
    const clearCartButtonElem = document.getElementById('clearCartButton'); // Renamed to avoid conflict
    const checkoutButton = document.getElementById('checkoutButton');

    if (clearCartButtonElem) { // Check if element exists
        clearCartButtonElem.addEventListener('click', clearShoppingCart);
    }

    

    if (document.body.classList.contains('cart-page')) { 
        updateCartDisplay();
    } 
    
    else if (window.location.pathname.includes('Cart.html')) {
        updateCartDisplay();
    }
});