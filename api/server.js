const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path")
const User = require("./models/userModel");
const routes = require("./routes/route.js");
const { append } = require("express/lib/response");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.mongo_dev_url)
    .then(() => {
        console.log("Database connection successful");
    });

append.use(bodyParser.urlencoded({ extended: true }));

append.use(async (req, res, next) => {
    if (req.headers["x-access-token"]) {
        const accessToken = req.headers["x-access-token"];
        const { userId, expiryToken } = await jwt.verify(accessToken, process.env.JWT_SECRET);

        if (expiryToken < Date.now().valueOf() / 1000) {
            return res.status(401).json({ error: "token expired, login again" });
        }
        res.locals.loggedInUser = await User.findById(userId);
        next();
    } else {
        next();
    }
});

app.use("/", routes); 
app.listen(PORT, () => {
    console.log("Server listening in Port:", PORT)
})