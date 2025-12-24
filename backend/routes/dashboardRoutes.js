const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const validateToken = require("../middleware/validateTokenHandler");

router.get("/stats", validateToken, getDashboardStats);

module.exports = router;