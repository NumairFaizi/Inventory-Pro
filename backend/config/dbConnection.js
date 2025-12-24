const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        const connString = process.env.CONNECTION_STRING;
        
        if (!connString) {
            console.error("Error: CONNECTION_STRING is missing in .env file");
            process.exit(1);
        }

        const connect = await mongoose.connect(connString);
        
        console.log(
            "Database Connected Successfully:", 
            connect.connection.host, 
            connect.connection.name
        );
    } catch (err) {
        console.error("Database Connection Failed:", err.message);
        // In a desktop app, we want to exit if the DB isn't available
        process.exit(1);
    }
}

module.exports = connectDb;