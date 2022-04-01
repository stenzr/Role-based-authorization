// require essential modules
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// TODO: generate salt
const encryptPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

const validateFunction = async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash);
}

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

