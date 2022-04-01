// require essential modules
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// ------------- utilities -------------------------

// TODO: generate salt
const encryptPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

const validatePassword = async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash);
}

// -------------- user sign up ----------------------
exports.signup = async (req, res, next) => {
    try {
        const { email, password, role } = req.body
        const passwordHash = await encryptPassword(password);
        const newUser = new User({ email, password: passwordHash, role: role || "normalUser" });
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        newUser.accessToken = accessToken;
        await newUser.save();
        res.json({
            data: newUser,
            accessToken
        })
    } catch (error) {
        next(error)
    }
}

// -------------- user login --------------------
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return next(new Error('Email does not exist'));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        await User.findByIdAndUpdate(user._id, { accessToken })
        res.status(200).json({
            data: { email: user.email, role: user.role },
            accessToken
        })
    } catch (error) {
        next(error);
    }
}

// ------------------- route logic -------------------------

// ------------------- get all users -----------------------

exports.getUsers = async (req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        data: users
    });
}


// -------------------- get user by specific id ---------------

exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) return next(new Error("User not found"));
        res.status(200).json({
            data: user
        });
    } catch (error) {
        next(error)
    }
}

// ------------------- update user details ---------------------

