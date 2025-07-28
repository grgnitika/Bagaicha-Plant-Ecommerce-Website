const express = require("express");
const router = express.Router();

const authControllers = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

router.post("/register", authControllers.registerAccount);

router.post("/login", authControllers.loginAccount);

router.get("/profile/:userid", isAuth, authControllers.getUserDetail);

router.post("/update-password", isAuth, authControllers.updatePassword);

module.exports = router;
