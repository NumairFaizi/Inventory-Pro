const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');

// Explicitly point to the .env file in the same directory as server.js
require("dotenv").config({ path: path.join(__dirname, '.env') });

const errorHandler = require("./backend/middleware/errorHandler");
const connectDb = require("./backend/config/dbConnection");

// Receive the writable log path from the Main process or fallback
const logPath = process.env.LOG_PATH || path.join(__dirname, 'backend-log.txt');

const startServer = async () => {
    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Attempting to start server...\n`);

        // Initialize Database
        await connectDb();
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Database connected successfully.\n`);

        const app = express();
        const port = process.env.PORT || 5000;

        // Middleware
        app.use(express.json());
        app.use(cors({
            origin: '*', 
            credentials: true
        }));

        // Routes - verify these match your backend folder structure
        app.use('/api/product', require('./backend/routes/productRoutes'));
        app.use('/api/users', require('./backend/routes/userRoutes'));
        app.use('/api/billing', require('./backend/routes/billingRoutes'));
        app.use('/api/backup', require('./backend/routes/backupRoutes'));

        // Global Error Handler
        app.use(errorHandler);

        app.listen(port, () => {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Backend listening on port ${port}\n`);
            console.log(`Inventory Backend running locally on port ${port}`);
        });

    } catch (error) {
        // Log fatal errors to the writable path so you can debug the .exe
        if (logPath) {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] FATAL STARTUP ERROR: ${error.message}\n`);
        }
        process.exit(1);
    }
};

startServer();