const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeSession = async (req, res) => {
  const { cart_items, customer_info } = req.body;

  try {
    // Add full logging for debug
    console.log("🧾 cart_items:", cart_items);
    console.log("👤 customer_info:", customer_info);

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      throw new Error("Missing or invalid cart_items");
    }
    if (!customer_info || !customer_info.email) {
      throw new Error("Missing customer_info or email");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
     line_items: cart_items.map((item) => ({
  price_data: {
    currency: "npr",
    product_data: {
      name: item.name || item.productname || "Unnamed Product",
    },
    unit_amount: Math.round(item.price * 100),
  },
  quantity: item.qty,
})),

      customer_email: customer_info.email,
      metadata: {
        customer_name: customer_info.name || "",
        customer_phone: customer_info.phone || "",
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe session error:", error); // full object for debugging
    res.status(500).json({ error: "Stripe session failed" });
  }
};

const verifyStripeSession = async (req, res) => {
  const { session_id } = req.query;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session && session.payment_status === "paid") {
      return res.status(200).json({ success: true, session });
    } else {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("❌ Stripe verification error:", error);
    return res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

module.exports = {
  createStripeSession,
  verifyStripeSession,
};
