const asyncHandler = require('express-async-handler');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../models/userModel');

//@desc Register a user
//@route POST /api/user/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400); s
        throw new Error("All fields are mandatory");
    }
    const userAvailable = await User.findOne({ username });
    if (userAvailable) {
        res.status(400);
        throw new Error("Username is already in use");
    }

    //Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Passwords;", hashedPassword);
    const user = await User.create({
        username,
        password: hashedPassword,
    });

    console.log(`User created ${user}`)
    if (user) {
        return res.status(201).json({ _id: user.id, message: 'User created successfully' })
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }

});

//@desc Login user
//@route POST /api/user/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // console.log(req.body)

    if (!username || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const user = await User.findOne({ username });
    //compare password with hashedpassword
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,

                username: user.username,
                id: user.id,
            },
        }, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({ accessToken });
    } else {
        return res.status(401).json({ message: "Invalid Credentials!!" })
        throw new Error("Invalid Credentials!!");
    }
});

//@desc Get current user
//@route GET /api/user/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
