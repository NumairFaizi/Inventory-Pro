const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
require("dotenv").config(); // Standard way to load .env

// Initialize Database
connectDb();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// IMPORTANT: CORS configuration for Desktop
// This allows your Electron frontend to talk to this Node server
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5000"],
    credentials: true
}));

// Routes
app.use('/api/product', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/backup', require('./routes/backupRoutes'));
// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Inventory Backend running locally on port ${port}`);
});