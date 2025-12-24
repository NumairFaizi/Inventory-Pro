import React, { useState, useEffect } from "react";
import getRequest from "../../services/getRequest";
import postRequest from "../../services/postRequest";
import notify from "../utils/toast";
import { ToastContainer } from "react-toastify";
import * as XLSX from "xlsx"; 

const Backup = () => {
  const [records, setRecords] = useState([]);
  const [backupPath, setBackupPath] = useState("C:/Inventory_Backups");
  const [currentPage, setCurrentPage] = useState(1);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchBillingRecords = async () => {
      const { status, data } = await getRequest("/api/billing/");
      // Assuming data is the array of bills
      if (status === 200) setRecords(data);
    };
    fetchBillingRecords();
  }, []);

  // --- ACTIVE FEATURE: EXCEL EXPORT ---
  const exportToExcel = () => {
    if (records.length === 0) return notify(400, "No records to export");

    // Flattening data for spreadsheet compatibility
    const worksheetData = records.map((bill) => ({
      "Invoice ID": bill._id.slice(-6).toUpperCase(),
      "Date": bill.date,
      "Time": bill.time,
      "Customer": bill.customerName,
      "Email/Contact": bill.email,
      "Items": bill.totalItem,
      "Subtotal (₹)": bill.subTotal,
      "Discount (₹)": bill.discount,
      "Tax (%)": bill.SGSTandCGST,
      "Grand Total (₹)": bill.grandTotal,
      "Payment Method": bill.paymentMethod,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales_Ledger");

    // Auto-generate filename with date
    const dateStamp = new Date().toISOString().split("T")[0];
    const fileName = `Inventory_Ledger_${dateStamp}.xlsx`;
    
    // Save the file to the local system
    XLSX.writeFile(workbook, fileName);
    
    notify(200, "Excel Ledger exported successfully!");
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const { status, data } = await postRequest("/api/backup/run", { backupPath });
      if (status === 200) notify(200, `Full JSON Backup Saved to: ${data.filePath}`);
    } catch (error) {
      notify(500, "Local backup service unreachable.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Ledger & Data Center</h1>
            <p className="text-gray-500 text-sm">Manage your historical sales and system backups</p>
          </div>
          
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-95"
          >
            <span className="text-lg">📊</span> Export to Excel (.xlsx)
          </button>
        </div>

        {/* System JSON Backup Card */}
        <div className="bg-gray-800 p-6 rounded-2xl mb-8 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-400">Database System Backup</h2>
            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-800 font-bold uppercase tracking-widest">
              Security Protocol
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <span className="absolute left-3 top-3 text-gray-500">📂</span>
                <input
                type="text"
                value={backupPath}
                onChange={(e) => setBackupPath(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all"
                placeholder="D:\NBA_SALES_RECORD"
                />
            </div>
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-30 flex items-center gap-2"
            >
              {isBackingUp ? "Saving Data..." : "Run System JSON Backup"}
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-gray-750">
             <h3 className="text-sm font-bold text-gray-400">Transaction History</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Customer Details</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {currentRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-750/50 transition-colors">
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-200">{record.date}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{record.time}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold">{record.customerName}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{record.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black px-2 py-1 bg-gray-900 border border-gray-700 rounded text-blue-400 uppercase tracking-tighter">
                      {record.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-green-400 font-black text-lg">₹{record.grandTotal.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-600 italic">No sales records found in the system ledger.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Footer */}
          <div className="p-4 bg-gray-800/80 border-t border-gray-700 flex justify-between items-center">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="text-xs font-bold text-gray-400 hover:text-white disabled:opacity-20 transition-colors"
            >
              ← PREVIOUS
            </button>
            <span className="text-[10px] font-black text-gray-500 tracking-[0.2em]">PAGE {currentPage}</span>
            <button 
              disabled={indexOfLastRecord >= records.length}
              onClick={() => setCurrentPage(p => p + 1)}
              className="text-xs font-bold text-gray-400 hover:text-white disabled:opacity-20 transition-colors"
            >
              NEXT →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;