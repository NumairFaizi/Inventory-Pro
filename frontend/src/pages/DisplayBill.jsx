import React, { useEffect, useRef, useState } from 'react';
import getRequest from '../../services/getRequest';

const DisplayBill = () => {
    const [searchString, setSearchString] = useState('');
    const [billingData, setBillingData] = useState([]);
    const [isBill, setIsBill] = useState(false);
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const invoiceRefs = useRef({});

    const fetchData = async (url) => {
        setLoading(true);
        try {
            const { status, data } = await getRequest(url);
            
            // Backend now returns array directly. Check both for safety.
            const actualList = Array.isArray(data) ? data : (data?.billingData || []);

            if (status === 200 && actualList.length > 0) {
                setIsBill(true);
                setBillingData(actualList);
            } else {
                setIsBill(false);
                setBillingData([]);
            }
        } catch (error) {
            console.error("Fetch Bills Error:", error);
            setIsBill(false);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = async (e, type) => {
        const value = e.target.value;
        let url = '';

        if (type === 'text') {
            setSearchString(value);
            // Matches router.get("/search/:searchString")
            url = value ? `/api/billing/search/${value}` : '/api/billing/';
        } else if (type === 'date') {
            setDate(value);
            url = value ? `/api/billing/search/${value}` : '/api/billing/';
        }
        fetchData(url);
    }

    useEffect(() => {
        // Initial load: matches router.get("/")
        fetchData('/api/billing/'); 
    }, [])

    const generatePDF = (invoiceId, elementRef) => {
        const element = elementRef.current;
        if (window.html2pdf) {
            window.html2pdf().from(element).save(`Invoice_${invoiceId.slice(-6)}.pdf`);
        } else {
            window.print();
        }
    }

    return (
        <div className="flex justify-center min-h-screen bg-gray-900 p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-5xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Invoice Explorer</h2>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row w-full gap-4 mb-8">
                    <div className='flex-1 relative'>
                        <input
                            type="text"
                            placeholder="Search by Email or Customer Name..."
                            value={searchString}
                            onChange={(e) => handleChange(e, 'text')}
                            className="w-full p-3 rounded-lg text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none pl-10"
                        />
                        <span className="absolute left-3 top-3.5 text-gray-500">🔍</span>
                    </div>
                    <div className='w-full md:w-48'>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => handleChange(e, 'date')}
                            className="w-full p-3 rounded-lg text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Bills List */}
                <div className='space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar'>
                    {loading ? (
                        <p className="text-center text-gray-500 py-10 italic">Searching ledger...</p>
                    ) : isBill ? (
                        billingData.map((bill) => {
                            if (!invoiceRefs.current[bill._id]) {
                                invoiceRefs.current[bill._id] = React.createRef();
                            }
                            return (
                                <div key={bill._id} ref={invoiceRefs.current[bill._id]} className="bg-gray-750 text-white rounded-xl p-8 border border-gray-700">
                                    <div className="flex justify-between border-b border-gray-600 pb-4 mb-6">
                                        <h1 className="text-2xl font-black text-blue-400 uppercase tracking-tighter">Invoice</h1>
                                        <div className="text-right text-sm">
                                            <p className="font-bold">Date: {bill.date}</p>
                                            <p className="text-gray-400">{bill.time}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 mb-6">
                                        <div>
                                            <p className="text-blue-500 text-xs font-bold uppercase">Customer</p>
                                            <p className="font-bold">{bill.customerName}</p>
                                            <p className="text-xs text-gray-400">{bill.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-blue-500 text-xs font-bold uppercase">Method</p>
                                            <p className="font-bold">{bill.paymentMethod}</p>
                                        </div>
                                    </div>

                                    <table className="w-full text-left text-sm mb-6">
                                        <thead className="text-gray-400 uppercase text-xs border-b border-gray-600">
                                            <tr>
                                                <th className="py-2">Item</th>
                                                <th className="py-2 text-center">Qty</th>
                                                <th className="py-2 text-right">Price</th>
                                                <th className="py-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bill.billingProducts.map((p, i) => (
                                                <tr key={i} className="border-b border-gray-700/50">
                                                    <td className="py-3">{p.name} <span className="text-[10px] block text-gray-500">{p.brand}</span></td>
                                                    <td className="py-3 text-center">{p.qty}</td>
                                                    <td className="py-3 text-right">₹{p.price}</td>
                                                    <td className="py-3 text-right font-bold text-blue-400">₹{p.totalPrice}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="flex justify-end border-t border-gray-600 pt-4">
                                        <div className="w-48 space-y-1">
                                            <div className="flex justify-between text-xs text-gray-400"><span>Subtotal:</span><span>₹{bill.subTotal}</span></div>
                                            <div className="flex justify-between text-lg font-bold text-green-400"><span>Total:</span><span>₹{bill.grandTotal}</span></div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end print:hidden">
                                        <button onClick={() => generatePDF(bill._id, invoiceRefs.current[bill._id])} className="bg-blue-600 px-4 py-2 rounded font-bold text-xs hover:bg-blue-500">Download PDF</button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 text-gray-600 italic">No matching records found.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DisplayBill;