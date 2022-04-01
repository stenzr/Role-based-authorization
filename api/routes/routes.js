const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// ----------- api endpoints ------------

router.post("/signup", userController.signup);

router.post("/login", userController.login);

router.get("/user/:userId", userController.allowLoggedIn, userController.getUser);

router.get("/users", userController.allowLoggedIn, userController.grantAccess("readAny", "profile"), userController.getUsers);

router.put("/user/:userId", userController.allowLoggedIn, userController.grantAccess("updateAny", "profile"), userController.updateUser);

router.delete("/user/:userId", userController.allowLoggedIn, userController.grantAccess("deleteAny", "profile"), userController.deleteUser);

module.exports = router;