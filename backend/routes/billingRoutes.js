const express = require("express");
const router = express.Router();
const { addBill, getBills, billBySearchString } = require("../controllers/billingController");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken);

// This matches: GET /api/billing/ and POST /api/billing/
router.route("/")
    .get(getBills)
    .post(addBill);

// This matches: GET /api/billing/search/:searchString
router.get("/search/:searchString", billBySearchString);

module.exports = router;