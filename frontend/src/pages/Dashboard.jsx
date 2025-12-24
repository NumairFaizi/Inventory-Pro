import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import getRequest from '../../services/getRequest';
import { getReq } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [salesHistory, setSalesHistory] = useState({ labels: [], data: [] });
  const [totalProduct, setTotalProduct] = useState(0);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalItemsReceived, setTotalItemsReceived] = useState(0);

  const LOW_STOCK_THRESHOLD = 10;

  useEffect(() => {
    if (!localStorage.getItem('stationary')) {
      navigate('/login');
      return;
    }

    const fetchAllData = async () => {
      try {
        const prodRes = await getRequest('/api/product/');
        if (prodRes.status === 200 && Array.isArray(prodRes.data)) {
          const data = prodRes.data;
          setProducts(data);
          setTotalProduct(data.length);
          setTotalInventoryValue(data.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty || 0)), 0));
          setTotalItemsReceived(data.reduce((sum, item) => sum + Number(item.qty || 0), 0));
          setLowStockCount(data.filter(item => item.qty > 0 && item.qty <= LOW_STOCK_THRESHOLD).length);
          setOutOfStockCount(data.filter(item => item.qty <= 0).length);
        }

        // Inside useEffect fetchAllData:
        const billRes = await getReq('/api/billing/'); // Corrected endpoint
        if (billRes.status === 200) {
          const bills = billRes.data; // Backend now returns array directly
          setTotalRevenue(bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0));
          setSalesHistory(processDailySales(bills));
}
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      }
    };

    fetchAllData();
  }, [navigate]);

  const processDailySales = (bills) => {
    const dailyMap = {};
    const sortedBills = [...bills].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    sortedBills.forEach(bill => {
      const dateKey = bill.date || "Unknown";
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + (bill.grandTotal || 0);
    });
    
    return {
      labels: Object.keys(dailyMap).slice(-7),
      data: Object.values(dailyMap).slice(-7)
    };
  };

  // Chart configs (same as before)
  const barChartData = {
    labels: products.slice(0, 6).map(p => p.name),
    datasets: [{
      label: 'Units in Stock',
      data: products.slice(0, 6).map(p => p.qty),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 1,
    }]
  };

  const lineChartData = {
    labels: salesHistory.labels.length > 0 ? salesHistory.labels : ['No Sales'],
    datasets: [{
      label: 'Revenue (₹)',
      data: salesHistory.data.length > 0 ? salesHistory.data : [0],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8B5CF6'
    }]
  };

  const pieData = {
    labels: ['Healthy', 'Low Stock', 'Out of Stock'],
    datasets: [{
      data: [totalProduct - lowStockCount - outOfStockCount, lowStockCount, outOfStockCount],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white pb-10">
      <div className="flex flex-col items-start w-full bg-gradient-to-r from-indigo-700 to-blue-600 p-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
        <p className="text-blue-100 mt-1 opacity-80">Real-time sales and inventory intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
        {/* Left Sidebar Stats */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Revenue</h3>
            <p className="text-3xl font-extrabold mt-2 text-purple-400">₹ {totalRevenue.toLocaleString()}</p>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Inventory Value</h3>
              <p className="text-2xl font-bold text-green-400">₹ {totalInventoryValue.toLocaleString()}</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Units</span>
                  <span className="font-bold text-blue-400">{totalItemsReceived}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 text-center tracking-widest">Stock Health</h3>
            <div className="h-48">
               <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', padding: 20 } } } }} />
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="col-span-12 md:col-span-9">
          
          {/* NEW CODE: Critical Stock Alerts Banner */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-500/50 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-red-500 p-2 rounded-lg animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-red-400 font-bold">Action Required: Inventory Warnings</h4>
                <p className="text-sm text-gray-400">
                  <span className="text-red-500 font-bold">{outOfStockCount} items</span> are unavailable and <span className="text-yellow-500 font-bold">{lowStockCount} items</span> are below the safety threshold.
                </p>
              </div>
              <button 
                onClick={() => navigate('/inventory')}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-900/40"
              >
                Manage Stock
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card title='Unique Products' count={totalProduct} color="border-blue-500" />
            <Card title='Low Stock' count={lowStockCount} color="border-yellow-500" />
            <Card title='Out of Stock' count={outOfStockCount} color="border-red-500" />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-gray-200 font-bold mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                   Daily Sales Performance
                </h3>
                <div className="h-64">
                    <Line data={lineChartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#374151' } }, x: { grid: { display: false } } } }} />
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-gray-200 font-bold mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                   Top Inventory Items
                </h3>
                <div className="h-64">
                    <Bar data={barChartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#374151' } }, x: { grid: { display: false } } } }} />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;