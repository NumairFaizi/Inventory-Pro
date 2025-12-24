import React, { useState } from 'react';
import postRequest from '../../services/postRequest'
import { ToastContainer } from 'react-toastify';
import notify from '../utils/toast';

const Add_product = ({ closeModal }) => {
    const [productName, setProductName] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const HandleAddProduct = async (event) => {
        event.preventDefault();
        setLoading(true);

        const product = {
            name: productName,
            brand,
            qty: parseInt(quantity),
            price: parseFloat(price)
        };

        // Basic validation for desktop data integrity
        if (product.qty < 0 || product.price < 0) {
            notify(400, "Price and Quantity cannot be negative.");
            setLoading(false);
            return;
        }

        try {
            const { status, data } = await postRequest('/api/product/', product);
            
            notify(status, data.message);

            if (status === 201 || status === 200) {
                // Clear form fields
                setProductName('');
                setBrand('');
                setPrice('');
                setQuantity('');
                
                // In a desktop UX, users often add multiple items at once.
                // We keep the modal open but notify success, or close it if preferred.
                setTimeout(() => {
                    closeModal();
                }, 1500);
            }
        } catch (error) {
            notify(500, "Failed to connect to backend server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700 animate-in fade-in zoom-in duration-200">
                
                {/* Close Button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Add New Stock</h1>
                    <p className="text-gray-400 text-sm">Enter product details to update inventory.</p>
                </div>

                <form className="space-y-4" onSubmit={HandleAddProduct}>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
                        <input
                            type="text"
                            placeholder="e.g. A4 Paper Rim"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Brand</label>
                        <input
                            type="text"
                            placeholder="e.g. JK Copier"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
                            className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Unit Price (₹)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Initial Qty</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                className="w-full p-3 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 p-3 rounded-xl text-gray-300 border border-gray-600 hover:bg-gray-700 transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 p-3 rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-900/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Adding...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Add_product;