/**
 * Generate random order for testing purposes
 */
export function generateRandomOrder(products) {
  if (!products || products.length === 0) {
    return null;
  }

  // Select random product
  const product = products[Math.floor(Math.random() * products.length)];
  
  // Generate random quantity (1-5)
  const quantity = Math.floor(Math.random() * 5) + 1;
  
  // Calculate total price
  const totalPrice = product.price * quantity;

  return {
    productId: product.id,
    productName: product.name,
    quantity,
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
