/**
 * Product Card Component
 * Individual product display for client shop
 */

import React from 'react';
import { formatCurrency } from '../../utils/generateRandomOrder';

const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 20;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <span className="text-6xl">📦</span>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{product.name}</h3>
          {isLowStock && !isOutOfStock && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
              Low Stock
            </span>
          )}
          {isOutOfStock && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
              Out of Stock
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3">{product.category}</p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-gray-600">
            Stock: <span className="font-semibold">{product.stock}</span>
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isOutOfStock ? '❌ Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
