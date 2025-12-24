const asyncHandler = require("express-async-handler");
const Products = require("../models/productsModel");

// @desc Get all products for the logged-in user
// @route GET /api/product
// @access private
const getProducts = asyncHandler(async (req, res) => {
    // Modified to only show products belonging to the logged-in user
    const products = await Products.find({ user_id: req.user.id });
    res.status(200).json(products);
});

// @desc Get single product
// @route GET /api/product/:id
// @access private
const getProduct = asyncHandler(async (req, res) => {
    const product = await Products.findById(req.params.id);
    if (!product || product.user_id.toString() !== req.user.id) {
        res.status(404);
        throw new Error("Product not found");
    }
    res.status(200).json(product);
});

// @desc Create NEW product or increment existing one
// @route POST /api/product
// @access private
const createProduct = asyncHandler(async (req, res) => {
    const { name, qty, price, brand } = req.body;

    if (!name || qty === undefined || !price || !brand) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    // Check if product with same name, brand, and price exists for this user
    const existingProduct = await Products.findOne({
        name,
        brand,
        price,
        user_id: req.user.id
    });

    if (existingProduct) {
        // Update quantity (Increment)
        existingProduct.qty += Number(qty);
        await existingProduct.save();
        res.status(200).json({ 
            product: existingProduct, 
            message: `Inventory updated. Added ${qty} to existing stock.` 
        });
    } else {
        // Create new record
        const product = await Products.create({
            name,
            qty: Number(qty),
            price,
            brand,
            user_id: req.user.id
        });
        res.status(201).json({ product, message: "New product added to inventory" });
    }
});

// @desc Update product
// @route PUT/PATCH /api/product/:id
// @access private
const updateProduct = asyncHandler(async (req, res) => {
    const { name, qty, price, brand } = req.body;

    // 1. Find the product first
    const product = await Products.findById(req.params.id);
    
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // 2. Ownership Check
    if (product.user_id.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User doesn't have permission to update this product");
    }

    // 3. Prepare the update data 
    // We ensure qty is a Number to prevent math errors in the DB
    const updateData = {
        name,
        brand,
        price,
        qty: qty !== undefined ? Number(qty) : product.qty
    };

    // 4. Update the record
    const updatedProduct = await Products.findByIdAndUpdate(
        req.params.id,
        updateData,
        { 
            new: true,           // Returns the updated doc, not the old one
            runValidators: true  // Ensures the new values follow your model rules
        }
    );

    // 5. Send back the updated product directly
    // This makes it easier for your frontend state to update
    res.status(200).json(updatedProduct);
});
// @desc Delete product
// @route DELETE /api/product/:id
// @access private
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Products.findById(req.params.id);
    
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Ensure user owns the product before deleting
    if (product.user_id.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User doesn't have permission to delete this product");
    }

    await Products.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: "Product removed from stock" });
});

module.exports = { createProduct, updateProduct, getProducts, getProduct, deleteProduct };