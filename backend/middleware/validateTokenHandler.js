const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    // Use the environment variable if available, otherwise use a hardcoded fallback for production
    const secret = process.env.ACCESS_TOKEN_SECRET || "stat";

    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];

        try {
            // Verify using the secret
            const decoded = jwt.verify(token, secret);
            req.user = decoded.user;
            next();
        } catch (err) {
            res.status(401);
            // Added more descriptive error for your backend-log.txt
            throw new Error(`User is not authorized: ${err.message}`);
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("User is not authorized or token is missing");
    }
});

module.exports = validateToken;