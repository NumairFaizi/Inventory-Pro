import React, { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import getRequest from '../../services/getRequest';
import deleteRequest from '../../services/deleteRequest';
import notify from '../utils/toast';
// Import the new Modal component
import EditProduct from '../components/EditProduct'; 

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { status, data } = await getRequest('/api/product');
      if (status === 200) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        notify(status, data.message || "Failed to fetch inventory");
      }
    } catch (error) {
      console.error("Inventory Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Search Logic
  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleDownloadExcel = () => {
    if (products.length === 0) return notify(400, "No data to export");
    const excelData = products.map(({ _id, user_id, __v, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory_Stock");
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Inventory_Report_${date}.xlsx`);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to remove this item from stock?")) {
      const { status, data } = await deleteRequest(`/api/product/${productId}`);
      if (status === 200) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        notify(200, 'Product removed successfully');
      } else {
        notify(status, data.message || 'Error deleting product');
      }
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto border border-gray-700">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Current Stock Inventory</h2>
            <p className="text-gray-400 text-sm">Manage and monitor your shop resources</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Quick Search Bar */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Search by name or brand..."
                className="bg-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-600 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            <button
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm"
            >
              Export (.xlsx)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full text-left">
            <thead className="bg-gray-700 text-gray-300 uppercase text-xs">
              <tr>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Brand</th>
                <th className="py-4 px-6">Stock Qty</th>
                <th className="py-4 px-6">Unit Price</th>
                <th className="py-4 px-6">Total Value</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading inventory...</td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="text-gray-300 hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6 font-medium">{product.name}</td>
                    <td className="py-4 px-6">{product.brand}</td>
                    <td className={`py-4 px-6 font-bold ${product.qty < 10 ? 'text-red-400' : 'text-green-400'}`}>
                      {product.qty}
                    </td>
                    <td className="py-4 px-6">₹{product.price}</td>
                    <td className="py-4 px-6 text-blue-400 font-bold">₹{(product.price * product.qty).toLocaleString()}</td>
                    <td className="py-4 px-6 flex gap-3">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                        title="Edit Item"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                        title="Delete Item"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    {searchTerm ? "No products match your search." : "Your inventory is empty."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditional Rendering of the Edit Modal */}
      {isEditModalOpen && (
        <EditProduct 
          product={selectedProduct} 
          closeModal={() => setIsEditModalOpen(false)} 
          refreshData={fetchProducts} 
        />
      )}
    </div>
  );
};

export default Inventory;