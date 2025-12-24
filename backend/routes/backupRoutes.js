const express = require("express");
const router = express.Router();
const { runManualBackup } = require("../controllers/backupController");
const validateToken = require("../middleware/validateTokenHandler");

router.post("/run", validateToken, runManualBackup);

module.exports = router;