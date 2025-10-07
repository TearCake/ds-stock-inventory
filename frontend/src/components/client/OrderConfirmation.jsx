/**
 * Order Confirmation Component
 * Success message after order placement
 */

import React from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmation = ({ onContinueShopping }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="text-sm text-gray-600 mb-2">Order Number</div>
          <div className="text-2xl font-bold text-blue-600 mb-4">
            ORD-{Date.now()}
          </div>
          <div className="text-sm text-gray-600">
            You will receive a confirmation email shortly.
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6 text-left">
          <div className="flex items-start">
            <span className="text-xl mr-3">🎓</span>
            <div className="text-sm text-blue-700">
              <strong>Behind the Scenes:</strong>
              <ul className="mt-2 ml-4 list-disc">
                <li>Your order was processed by the current leader server</li>
                <li>Data was replicated across all active servers</li>
                <li>Inventory was updated consistently across the distributed system</li>
              </ul>
              <div className="mt-3">
                <Link to="/admin" className="text-blue-800 font-semibold hover:underline">
                  → View Admin Dashboard to see distributed system events
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onContinueShopping}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            Continue Shopping
          </button>
          <Link
            to="/admin/orders"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            View All Orders (Admin)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
