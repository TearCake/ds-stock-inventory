/**
 * Product List Component
 * Displays all products available for purchase
 */

import React from 'react';
import { useServer } from '../../context/ServerContext';
import ProductCard from './ProductCard';

const ProductList = ({ onAddToCart }) => {
  const { products, loading } = useServer();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Available</h3>
        <p className="text-gray-600">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
        <div className="text-sm text-gray-600">
          {products.length} products available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
