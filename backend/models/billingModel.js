const mongoose = require("mongoose");

const billItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
});

const billingSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    customerName: { type: String, required: [true, "Customer name is required"] },
    email: { type: String, required: [true, "Customer email is required"] },
    billingProducts: [billItemSchema],
    
    // Updated for % logic
    discount: { 
        type: Number, 
        default: 0 // This will now store the PERCENTAGE (e.g., 10 for 10%)
    },
    discountAmount: { 
        type: Number, 
        default: 0 // This stores the actual currency value deducted (Subtotal * discount / 100)
    },
    
    SGSTandCGST: { type: Number, default: 0 },
    CGSTAmount: { type: Number, default: 0 },
    subTotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Card"], default: "Cash" },
    totalItem: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Bill", billingSchema);