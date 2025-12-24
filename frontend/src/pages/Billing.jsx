import React, { useState, useEffect } from 'react';
import getRequest from '../../services/getRequest';
import postRequest from '../../services/postRequest';
import { ToastContainer } from 'react-toastify';
import notify from '../utils/toast';

const Billing = () => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [billingProducts, setBillingProducts] = useState([
    { name: '', qty: 1, price: 0, brand: '', totalPrice: 0, availableQty: 0 }
  ]);
  const [discount, setDiscount] = useState('0'); // This is now %
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [SGSTandCGST, setSGSTAndCGST] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { status, data } = await getRequest('/api/product/');
      if (status === 200 && data) {
        setProducts(data);
        const uniqueBrands = [...new Set(data.map((product) => product.brand))];
        setBrands(uniqueBrands);
      }
    };
    fetchData();
  }, []);

  const addProducts = () => {
    setBillingProducts([
      ...billingProducts,
      { name: '', qty: 1, price: 0, brand: '', totalPrice: 0, availableQty: 0 },
    ]);
  };

  const removeProductRow = (index) => {
    if (billingProducts.length > 1) {
      const updated = billingProducts.filter((_, i) => i !== index);
      setBillingProducts(updated);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...billingProducts];

    if (field === 'qty') {
      const requestedQty = Number(value);
      const available = newProducts[index].availableQty;

      if (requestedQty > available) {
        notify(400, `Only ${available} units available in stock!`);
        newProducts[index].qty = available;
      } else {
        newProducts[index].qty = Math.max(1, requestedQty);
      }
      newProducts[index].totalPrice = newProducts[index].qty * newProducts[index].price;
    } else {
      newProducts[index][field] = value;

      const selectedProduct = products.find(
        (p) => p.name === newProducts[index].name && p.brand === newProducts[index].brand
      );

      if (selectedProduct) {
        newProducts[index].price = Number(selectedProduct.price);
        newProducts[index].availableQty = selectedProduct.qty;
        newProducts[index].qty = selectedProduct.qty > 0 ? 1 : 0;
        newProducts[index].totalPrice = newProducts[index].qty * newProducts[index].price;
      }
    }
    setBillingProducts(newProducts);
  };

  const handleReset = () => {
    setCustomerName('');
    setEmail('');
    setDiscount('0');
    setSGSTAndCGST('0');
    setBillingProducts([{ name: '', qty: 1, price: 0, brand: '', totalPrice: 0, availableQty: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const invalidItem = billingProducts.find(p => p.name === "" || p.qty <= 0);
    if (invalidItem) {
      return notify(400, "Please select valid products with available stock.");
    }

    setLoading(true);

    // --- LOGIC REFACTORED FOR % DISCOUNT ---
    const subTotal = billingProducts.reduce((sum, p) => sum + p.totalPrice, 0);
    const discountPercent = Number(discount) || 0;
    const taxRate = Number(SGSTandCGST) || 0;

    // 1. Calculate Discount amount from %
    const discountAmount = (subTotal * discountPercent) / 100;
    const afterDiscount = subTotal - discountAmount;
    
    // 2. Calculate Tax on the net amount
    const CGSTAmount = (afterDiscount * taxRate) / 100;
    const grandTotal = afterDiscount + CGSTAmount;

    const bill = {
      customerName,
      email,
      billingProducts,
      discount: discountPercent, // Stores the % used
      discountAmount: discountAmount, // Stores the actual value deducted
      SGSTandCGST: taxRate,
      CGSTAmount,
      paymentMethod,
      subTotal,
      grandTotal,
      totalItem: billingProducts.length,
      dateAndTime: new Date().toLocaleString()
    };

    const { status, data } = await postRequest('/api/billing/', bill);
    
    if (status === 200 || status === 201) {
      notify(200, data.message || "Bill Generated Successfully");
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach(warning => notify(400, warning));
      }
      handleReset();
    } else {
      notify(status, data.message || "Error saving bill");
    }
    setLoading(false);
  };

  // Intermediate values for UI display
  const currentSubTotal = billingProducts.reduce((sum, p) => sum + p.totalPrice, 0);
  const currentDiscountAmount = (currentSubTotal * (Number(discount) || 0)) / 100;
  const currentGrandTotal = (currentSubTotal - currentDiscountAmount) * (1 + (Number(SGSTandCGST) || 0) / 100);

  return (
    <div className="flex justify-center min-h-screen bg-gray-900 p-4 sm:p-8">
      <ToastContainer theme="dark" />
      <div className="bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-6xl border border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Invoice</h2>
            <p className="text-gray-400 text-sm mt-1">Generate customer billing and update stock</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs uppercase font-bold">Transaction Date</p>
            <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs text-gray-500 font-bold ml-1">Customer Name</label>
              <input type="text" placeholder="John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-white bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition-all" required />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-gray-500 font-bold ml-1">Email Address</label>
              <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-white bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition-all" required />
            </div>
            
            {/* UPDATED LABEL TO % */}
            <div>
              <label className="text-xs text-gray-500 font-bold ml-1">Discount (%)</label>
              <input 
                type="number" 
                placeholder="0" 
                max="100"
                min="0"
                value={discount} 
                onChange={(e) => setDiscount(e.target.value)} 
                className="w-full mt-1 p-3 rounded-xl text-white bg-gray-700 border border-gray-600 outline-none" 
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold ml-1">Tax Config</label>
              <select className="w-full mt-1 p-3 rounded-xl text-white bg-gray-700 border border-gray-600 outline-none cursor-pointer" value={SGSTandCGST} onChange={(e) => setSGSTAndCGST(e.target.value)}>
                <option value="0">0% (Tax Exempt)</option>
                <option value="5">5% (GST)</option>
                <option value="12">12% (GST)</option>
                <option value="18">18% (GST)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold ml-1">Payment</label>
              <select className="w-full mt-1 p-3 rounded-xl text-white bg-gray-700 border border-gray-600 outline-none cursor-pointer" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / Digital</option>
                <option value="Card">Credit/Debit Card</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Billing Items
            </h3>
            
            <div className="space-y-3">
              {billingProducts.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center bg-gray-900/50 p-4 rounded-xl border border-gray-700 relative group transition-all hover:border-gray-600">
                  <button type="button" onClick={() => removeProductRow(index)} className="absolute -left-2 top-1/2 -translate-y-1/2 bg-red-600/20 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <select
                    value={item.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    className="md:col-span-2 p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Search Product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p.name} disabled={p.qty <= 0}>
                        {p.name} {p.qty <= 0 ? '(OUT OF STOCK)' : `(Stock: ${p.qty})`}
                      </option>
                    ))}
                  </select>

                  <select
                    value={item.brand}
                    onChange={(e) => handleProductChange(index, 'brand', e.target.value)}
                    className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700 outline-none"
                    required
                  >
                    <option value="">Brand</option>
                    {brands.map((br, i) => <option key={i} value={br}>{br}</option>)}
                  </select>

                  <div className="flex flex-col">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleProductChange(index, 'qty', e.target.value)}
                      className={`p-2 rounded-lg bg-gray-800 text-white border ${item.availableQty === 0 ? 'border-red-500/50 opacity-40' : 'border-gray-700'} outline-none`}
                      disabled={item.availableQty === 0}
                      required
                    />
                    <span className={`text-[10px] mt-1 px-1 ${item.availableQty < 10 ? 'text-orange-400 font-bold' : 'text-gray-500'}`}>
                      In Stock: {item.availableQty}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm px-2">Unit: ₹{item.price}</p>
                  <p className="text-blue-400 font-bold text-right text-lg">₹{item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <button type="button" onClick={addProducts} className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm transition-all px-2 py-1 rounded-md hover:bg-blue-400/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Row
            </button>
          </div>

          {/* Section: Totals */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t border-gray-700">
            <div className="text-gray-500 text-sm max-w-sm">
              <p>Note: Bill cannot be generated for out-of-stock items. Total items will automatically deduct from inventory upon saving.</p>
            </div>
            
            <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-700 w-full md:w-80 shadow-inner">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal:</span>
                  <span>₹{currentSubTotal.toFixed(2)}</span>
                </div>
                
                {/* UPDATED UI TO SHOW CALCULATED DISCOUNT */}
                <div className="flex justify-between text-red-400 text-sm font-medium">
                  <span>Discount ({discount}%):</span>
                  <span>- ₹{currentDiscountAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Tax ({SGSTandCGST}%):</span>
                  <span>+ ₹{(currentGrandTotal - (currentSubTotal - currentDiscountAmount)).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-2xl font-black text-green-400 border-t border-gray-700 pt-4">
                <span>TOTAL:</span>
                <span>₹{currentGrandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing Transaction...' : 'Generate & Print Invoice'}
            </button>
            <button type="button" onClick={handleReset} className="px-10 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all border border-gray-600">
              Clear All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Billing;