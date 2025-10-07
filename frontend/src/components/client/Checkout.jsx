/**
 * Checkout Component
 * Checkout process and order confirmation
 */

import React, { useState } from 'react';
import { formatCurrency } from '../../utils/generateRandomOrder';
import { useServer } from '../../context/ServerContext';

const Checkout = ({ cart, onBack, onOrderComplete }) => {
  const { placeOrder } = useServer();
  const [processing, setProcessing] = useState(false);

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);

    // Process each cart item as a separate order
    for (const item of cart) {
      const orderData = {
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity
      };

      placeOrder(orderData);
    }

    // Simulate processing time
    setTimeout(() => {
      setProcessing(false);
      onOrderComplete();
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Checkout</h2>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
            disabled={processing}
          >
            ← Back to Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(item.price)} × {item.quantity}
                  </div>
                </div>
                <div className="font-bold">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(getTotalPrice())}
            </span>
          </div>
        </div>

        {/* Customer Info (Simplified) */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border rounded px-4 py-2"
              disabled={processing}
            />
            <input
              type="email"
              placeholder="Email"
              className="border rounded px-4 py-2"
              disabled={processing}
            />
            <input
              type="text"
              placeholder="Phone"
              className="border rounded px-4 py-2"
              disabled={processing}
            />
            <input
              type="text"
              placeholder="City"
              className="border rounded px-4 py-2"
              disabled={processing}
            />
          </div>
          <textarea
            placeholder="Shipping Address"
            className="border rounded px-4 py-2 w-full mt-4"
            rows="3"
            disabled={processing}
          ></textarea>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
          <div className="flex items-start">
            <span className="text-xl mr-3">ℹ️</span>
            <div className="text-sm text-blue-700">
              <strong>Distributed System Simulation:</strong> Your order will be processed by the current leader server and replicated to all active servers. Watch the Admin Dashboard to see the distributed system in action!
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={processing}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors ${
            processing
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="animate-spin">⏳</span>
              <span>Processing Order...</span>
            </span>
          ) : (
            '✓ Place Order'
          )}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
