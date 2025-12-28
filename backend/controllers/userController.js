const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require('../models/userModel');

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400); 
        throw new Error("All fields are mandatory");
    }
    const userAvailable = await User.findOne({ username });
    if (userAvailable) {
        res.status(400);
        throw new Error("Username is already in use");
    }

    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        password: hashedPassword,
    });

    if (user) {
        return res.status(201).json({ _id: user.id, message: 'User created successfully' });
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const user = await User.findOne({ username });

    // compare password with hashedpassword
    if (user && (await bcrypt.compare(password, user.password))) {
        // IMPORTANT: Fallback secret must match your validateToken.js
        const secret = process.env.ACCESS_TOKEN_SECRET || "stat";

        const accessToken = jwt.sign({
            user: {
                username: user.username,
                id: user.id,
            },
        }, secret, { expiresIn: "30d" }); // Added expiration for better security

        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error("email or password is not valid");
    }
});

//@desc Get current user
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };