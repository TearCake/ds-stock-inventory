/**
 * Cart Component
 * Shopping cart display and management
 */

import React from 'react';
import { formatCurrency } from '../../utils/generateRandomOrder';

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <span>🛒</span>
          <span>Shopping Cart</span>
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-600">Your cart is empty</p>
          <p className="text-sm text-gray-500 mt-2">Add some products to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <span>🛒</span>
        <span>Shopping Cart ({getTotalItems()})</span>
      </h2>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="border-b pb-4">
            <div className="flex items-start space-x-3">
              {/* Product Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📦</span>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                <p className="text-xs text-gray-600">{formatCurrency(item.price)} each</p>
                <p className="text-xs text-gray-500">Stock: {item.stock}</p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-600 hover:text-red-800 flex-shrink-0"
                title="Remove from cart"
              >
                <span className="text-lg">🗑️</span>
              </button>
            </div>

            {/* Quantity Controls and Price */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center font-bold text-sm"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center font-bold text-sm"
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div className="font-bold text-base text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(getTotalPrice())}
          </span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold text-lg transition-colors"
        >
          ✓ Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
