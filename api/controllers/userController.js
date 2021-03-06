// require essential modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { roles } = require("../roles");
const { Permission } = require('accesscontrol');

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

exports.updateUser = async (req, res, next) => {
    try {
        const update = req.body
        const userId = req.params.userId;
        await User.findByIdAndUpdate(userId, update);
        const user = await User.findById(userId)
        res.status(200).json({
            data: user,
            message: "User information has been updated"
        });
    } catch (error) {
        next(error)
    }
}

// ----------------------- delete user -------------------------

exports.deleteUser = async (req, res, next) => {
    try {
        const userId =req.params.userId;
        await User.findByIdAndDelete(userId);
        res.status(200).json({
            data: null,
            message: "User information has been deleted"
        });
    } catch (error) {
        next (error)
    }
}

// ---------------------- access control --------------------------

// ------------- grant access based on type of user ---------------
exports.grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            const permisssion = roles.can(req.user.role)[action](resource);
            if (!Permission.granted) {
                return res.status(401).json({
                    error: "Permission denied"
                });
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}  

// -------------- grant access only to logged in user ---------------
exports.allowLoggedIn = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user) 
            return res.status(401).json({
                error: "Log In to continue"
            });
            req.user = user;
            next();
    } catch (error) {
        next(error);
    }
}