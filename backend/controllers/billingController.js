const billingModel = require("../models/billingModel");
const asyncHandler = require("express-async-handler");
const productsModel = require('../models/productsModel');

// Create new bill and deduct stock
const addBill = asyncHandler(async (req, res) => {
    const { billingProducts, dateAndTime, ...billDetails } = req.body;

    let date = "";
    let time = "";
    const now = new Date();
    date = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    time = now.toLocaleTimeString();

    // Deduct stock and verify
    for (const item of billingProducts) {
        const product = await productsModel.findOne({ name: item.name, brand: item.brand, user_id: req.user.id });
        if (!product || product.qty < item.qty) {
            res.status(400);
            throw new Error(`Insufficient stock for ${item.name}`);
        }
    }

    const newBill = new billingModel({ 
        ...billDetails, 
        billingProducts,
        date, 
        time, 
        user_id: req.user.id 
    });

    const savedBill = await newBill.save();

    // Atomic Deduct
    for (const item of billingProducts) {
        await productsModel.findOneAndUpdate(
            { name: item.name, brand: item.brand, user_id: req.user.id },
            { $inc: { qty: -Number(item.qty) } }
        );
    }

    res.status(201).json({ message: 'Bill generated successfully', billId: savedBill._id });
});

const getBills = asyncHandler(async (req, res) => {
    const billingData = await billingModel.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(billingData);
});

const billBySearchString = asyncHandler(async (req, res) => {
    const { searchString } = req.params;
    const billingData = await billingModel.find({
        user_id: req.user.id,
        $or: [
            { date: { $regex: searchString, $options: 'i' } },
            { email: { $regex: searchString, $options: 'i' } },
            { customerName: { $regex: searchString, $options: 'i' } }
        ]
    }).sort({ createdAt: -1 });
    res.status(200).json(billingData);
});

module.exports = { addBill, billBySearchString, getBills };