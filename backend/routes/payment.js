const express = require("express");
const router = express.Router();
const { initiateKhaltiPayment } = require("../controllers/paymentController");
const { createStripeSession, verifyStripeSession } = require("../controllers/stripeController");
const { saveOrderAfterStripe } = require("../controllers/orders");

router.post("/khalti/initiate", initiateKhaltiPayment);

router.post("/stripe/checkout-session", createStripeSession);

router.get("/stripe/verify", verifyStripeSession);

router.post("/stripe/save", saveOrderAfterStripe);

module.exports = router;
