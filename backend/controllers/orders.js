const crypto = require("crypto");
const { uid } = require("uid");
const Order = require("../models/orders");
const Customer = require("../models/customers");
const Payment = require("../models/payment");
const { ProductDetails } = require("../models/product");

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

let orderid;
let customerid;

exports.verifyKhaltiPayment = async (req, res, next) => {
  const { token, amount } = req.body;

  try {
    const response = await fetch('https://khalti.com/api/v2/payment/verify/', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, amount }),
    });

    const data = await response.json();

    if (data && data.idx) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, data });
    }
  } catch (error) {
    next(error);
  }
};

exports.saveOrderAfterStripe = async (req, res) => {
  const { sessionId, formdetails, cart_items } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not verified" });
    }

    const email = session.customer_email;
    const existsemail = await Customer.find({ email: email });

    const cartItems = cart_items.map((item) => ({
      productid: item._id,
      quantity: item.quantity,
    }));

    let order;
    let referenceid = session.id;

    // Save payment record
    const payment = new Payment({
      customerid: existsemail.length > 0 ? existsemail[0]._id : undefined,
      order_email: email,
      gateway: "stripe",
      type: "card",
      amount: session.amount_total / 100,
      stripe_session_id: session.id,
      status: "paid",
    });

    const result_payment = await payment.save();
    if (!result_payment) {
      return res.status(500).json({ error: "Failed to save payment" });
    }

    const commonOrderFields = {
      email: email,
      contact: formdetails.contact.phoneno,
      paymentid: result_payment._id,
      items: cartItems,
      amount: session.amount_total / 100,
      shippingcost: 0,
      tax: 0,
      shipping_address: {
        full_name: formdetails.shippingaddress.fullname,
        address: formdetails.shippingaddress.address,
        city: formdetails.shippingaddress.city,
        state: formdetails.shippingaddress.addressstate,
        country: formdetails.shippingaddress.country,
        zip: formdetails.shippingaddress.pincode,
      },
      billing_address: {
        full_name: formdetails.billingaddress.fullname,
        address: formdetails.billingaddress.address,
        city: formdetails.billingaddress.city,
        state: formdetails.billingaddress.addressstate,
        country: formdetails.billingaddress.country,
        zip: formdetails.billingaddress.pincode,
      },
    };

    if (existsemail.length > 0) {
      order = new Order({
        ...commonOrderFields,
        customerid: existsemail[0]._id,
      });

      // Update orders array in customer
      await Customer.findOneAndUpdate(
        { _id: existsemail[0]._id },
        { $push: { orders: order._id } }
      );
    } else {
      order = new Order(commonOrderFields);
    }

    const result_order = await order.save();

    // Update Product Quantity
    for (const item of cartItems) {
      const existProduct = await ProductDetails.findOne({
        product_id: item.productid,
      });
      if (existProduct?.quantity !== null) {
        existProduct.quantity -= item.quantity;
        await existProduct.save();
      }
    }

    if (existsemail.length > 0) {
      await Customer.findOneAndUpdate(
        { _id: existsemail[0]._id },
        { cart: { items: [] } }
      );
    }

    return res.status(200).json({
      success: true,
      redirectUrl: `${process.env.FRONTEND_URL}/orderpayment?reference=${referenceid}&orderid=${result_order._id}&status=successful`,
    });
  } catch (err) {
    console.error("Stripe verification error:", err);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
};

exports.postCodCheckout = async (req, res, next) => {
  const { amount, formdetails, cart_items } = req.body;

  try {
    if (!formdetails) {
      const error = new Error("Please fill checkout form before proceed.");
      error.statusCode = 400;
      throw error;
    }

    const email = formdetails.contact.email;
    const cartItems = cart_items.map((item) => {
      return {
        productid: item._id,
        quantity: item.quantity,
      };
    });

    const existsemail = await Customer.find({ email: email });

    let order;
    let referenceid;
    let orderid;

    const generatedpaymentid = uid();
    const payment = new Payment({
      customerid: existsemail.length > 0 ? existsemail[0]._id : undefined,
      order_email: email,
      gateway: formdetails.gatewayType || "",
      type: formdetails.paymentType,
      amount: amount,
      cod_id: generatedpaymentid,
    });

    const result_payment = await payment.save();
    if (!result_payment) {
      const error = new Error("Something went wrong saving payment on server");
      error.statusCode = 400;
      throw error;
    }

    referenceid = result_payment.cod_id;

    const commonOrderFields = {
      email: email,
      contact: formdetails.contact.phoneno,
      paymentid: result_payment._id,
      amount: Number(amount),
      items: cartItems,
      shippingcost: 0,
      tax: 0,
      shipping_address: {
        full_name: formdetails.shippingaddress.fullname,
        address: formdetails.shippingaddress.address,
        city: formdetails.shippingaddress.city,
        state: formdetails.shippingaddress.addressstate,
        country: formdetails.shippingaddress.country,
        zip: formdetails.shippingaddress.pincode,
      },
      billing_address: {
        full_name: formdetails.billingaddress.fullname,
        address: formdetails.billingaddress.address,
        city: formdetails.billingaddress.city,
        state: formdetails.billingaddress.addressstate,
        country: formdetails.billingaddress.country,
        zip: formdetails.billingaddress.pincode,
      },
    };

    if (existsemail.length > 0) {
      order = new Order({
        ...commonOrderFields,
        customerid: existsemail[0]._id,
      });

      const result_order = await order.save();
      orderid = result_order._id;

      await Customer.findOneAndUpdate(
        { _id: existsemail[0]._id },
        {
          $push: { orders: result_order._id },
          cart: { items: [] }, 
        }
      );
    } else {
      order = new Order(commonOrderFields);
      const result_order = await order.save();
      orderid = result_order._id;
    }

    // Update product quantity after order
    for (const item of cartItems) {
      const existProduct = await ProductDetails.findOne({
        product_id: item.productid,
      });
      if (existProduct?.quantity !== null) {
        existProduct.quantity -= item.quantity;
        await existProduct.save();
      }
    }

    res.status(200).json({
      redirectUrl: `${process.env.FRONTEND_URL}/orderpayment?reference=${referenceid}&orderid=${orderid}&status=successful`,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
