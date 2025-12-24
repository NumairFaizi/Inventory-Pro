import React, { useState, useEffect } from 'react';
import patchRequest from '../../services/patchRequest';
import notify from '../utils/toast';

const EditProduct = ({ product, closeModal, refreshData }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    qty: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill the form with existing product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        qty: product.qty,
        price: product.price
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { status, data } = await patchRequest(`/api/product/${product._id}`, formData);

    if (status === 200) {
      notify(200, "Product updated successfully!");
      refreshData(); // Refresh the table in Inventory.jsx
      closeModal();
    } else {
      notify(status, data.message || "Update failed");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Product</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock Qty</label>
              <input
                type="number"
                value={formData.qty}
                onChange={(e) => setFormData({...formData, qty: e.target.value})}
                className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 p-3 rounded-xl text-gray-300 border border-gray-600 hover:bg-gray-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 rounded-xl text-white bg-blue-600 hover:bg-blue-500 font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;