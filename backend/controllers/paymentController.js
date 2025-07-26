const axios = require("axios");

exports.initiateKhaltiPayment = async (req, res, next) => {
  const {
    amount,
    order_id,
    order_name,
    return_url,
    customer_info,
    products,
  } = req.body;

  try {
    const payload = {
      return_url,
      website_url: process.env.FRONTEND_URL,
      amount,
      purchase_order_id: order_id,
      purchase_order_name: order_name,
      customer_info,
      product_details: products,
    };

    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      payload,
      { headers }
    );

    return res.status(200).json(response.data); 
  } catch (error) {
    console.error("Khalti initiation error:", error.response?.data || error);
    return res.status(500).json({ error: "Khalti initiation failed" });
  }
};
