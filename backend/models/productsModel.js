const mongoose = require("mongoose");

const productsSchema = mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User", // Links each product to the specific Admin/User who created it
    },
    name: {
        type: String,
        required: [true, "Please add the Product name"],
        trim: true // Removes accidental spaces
    },
    brand: {
        type: String,
        required: [true, "Please add the Brand name"],
        trim: true
    },
    qty: {
        type: Number,
        required: [true, "Please add the Product Quantity"],
        min: [0, "Quantity cannot be less than zero"],
        default: 0
    },
    price: {
        type: Number, // Changed from String to Number for math operations
        required: [true, "Please add the Product Price"],
        min: [0, "Price cannot be negative"]
    },
}, {
    timestamps: true // Tracks when products were added or updated
});

module.exports = mongoose.model("Product", productsSchema);