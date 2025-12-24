const fs = require('fs');
const path = require('path');
const asyncHandler = require("express-async-handler");
const Bill = require("../models/billingModel");

const runManualBackup = asyncHandler(async (req, res) => {
    const { backupPath } = req.body; // e.g., "C:/backups/inventory/"
    
    // 1. Fetch all data for this user
    const data = await Bill.find({ user_id: req.user.id });

    // 2. Ensure directory exists
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }

    // 3. Create filename with timestamp
    const fileName = `Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const fullPath = path.join(backupPath, fileName);

    // 4. Write File
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 4));

    res.status(200).json({ 
        message: "Backup successful", 
        path: fullPath 
    });
});

module.exports = { runManualBackup };