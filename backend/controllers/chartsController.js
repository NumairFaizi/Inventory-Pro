const asyncHandler = require("express-async-handler");
const Product = require("../models/productsModel");
const Bill = require("../models/billingModel");

const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Total Inventory Value (Price * Qty)
    const products = await Product.find({ user_id: req.user.id });
    const totalInventoryValue = products.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const lowStockCount = products.filter(p => p.qty < 10).length;

    // 2. Total Sales (Grand Total)
    const bills = await Bill.find({ user_id: req.user.id });
    const totalSales = bills.reduce((acc, curr) => acc + curr.grandTotal, 0);
    const totalOrders = bills.length;

    // 3. Data for Charts (Last 7 Days Sales)
    // Grouping sales by date
    const salesByDate = bills.reduce((acc, bill) => {
        acc[bill.date] = (acc[bill.date] || 0) + bill.grandTotal;
        return acc;
    }, {});

    res.status(200).json({
        widgets: {
            totalSales,
            totalInventoryValue,
            totalOrders,
            lowStockCount
        },
        chartData: salesByDate
    });
});

module.exports = { getDashboardStats };