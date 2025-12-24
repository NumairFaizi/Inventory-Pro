const express = require("express");
const router = express.Router();
const {
    getProduct,
    getProducts, 
    deleteProduct, 
    createProduct, 
    updateProduct
} = require("../controllers/productController");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken);

// Routes for /api/product
router.route("/")
    .get(getProducts)
    .post(createProduct);

// Routes for /api/product/:id
router.route("/:id")
    .get(getProduct)
    .put(updateProduct) 
    .patch(updateProduct) // ADD THIS LINE to handle the frontend's patchRequest
    .delete(deleteProduct);

module.exports = router;