const express = require("express");
const { 
    registerUser, 
    loginUser, 
    currentUser,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

// @route POST /api/users/register
// Public: Used to create the initial admin account
router.post("/register", registerUser);

// @route POST /api/users/login
// Public: Authenticates the user and returns a JWT for the desktop session
router.post("/login", loginUser);

// @route GET /api/users/current
// Private: Retrieves the profile of the logged-in admin
router.get("/current", validateToken, currentUser);

module.exports = router;