const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        // Use the environment variable if found, otherwise use the local fallback
        const connString = process.env.CONNECTION_STRING || "mongodb://127.0.0.1:27017/inventory_pro";
        
        console.log("Attempting to connect to database..."); 
        
        const connect = await mongoose.connect(connString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(
            "Database Connected Successfully:", 
            connect.connection.host, 
            connect.connection.name
        );
    } catch (err) {
        // This error will be caught and written to your backend-log.txt
        console.error("Database Connection Failed:", err.message);
        process.exit(1); 
    }
}

module.exports = connectDb;