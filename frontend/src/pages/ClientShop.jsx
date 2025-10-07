/**
 * Client Shop Page
 * E-commerce interface for customers
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/client/ProductList';
import Cart from '../components/client/Cart';
import Checkout from '../components/client/Checkout';
import OrderConfirmation from '../components/client/OrderConfirmation';

const ClientShop = () => {
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('products'); // 'products', 'checkout', 'confirmation'

  // Add product to cart
  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove item from cart
  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Proceed to checkout
  const handleCheckout = () => {
    setView('checkout');
  };

  // Complete order
  const handleOrderComplete = () => {
    setView('confirmation');
    setCart([]);
  };

  // Continue shopping
  const handleContinueShopping = () => {
    setView('products');
  };

  // Go back to cart
  const handleBackToCart = () => {
    setView('products');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🛍️ Stock Inventory Shop</h1>
              <p className="text-sm text-gray-600">Distributed System Simulation - Client Interface</p>
            </div>
            <div className="flex items-center space-x-4">
              {view !== 'confirmation' && (
                <div className="relative">
                  <span className="text-3xl">🛒</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
              )}
              <Link
                to="/admin"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                Admin Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products */}
            <div className="lg:col-span-2">
              <ProductList onAddToCart={handleAddToCart} />
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Cart
                  cart={cart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        )}

        {view === 'checkout' && (
          <Checkout
            cart={cart}
            onBack={handleBackToCart}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {view === 'confirmation' && (
          <OrderConfirmation onContinueShopping={handleContinueShopping} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>🎓 Educational Demo - Distributed Systems Course</p>
            <p className="mt-1">
              This shop simulates a client interface that interacts with a distributed backend system
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientShop;
