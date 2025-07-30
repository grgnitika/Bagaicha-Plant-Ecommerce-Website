require("dotenv").config(); // Load .env variables

const https = require("https");
const fs = require("fs");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const paymentRoutes = require("./routes/payment");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const csurf = require("csurf");

const app = express();

// CORS Configuration
app.use(cors({
  origin: "https://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitizaton middlewares
app.use(mongoSanitize());
app.use(xss());

// Session Middleware for tracking login attempts
app.use(session({
  secret: process.env.SESSION_SECRET || "bagaichaSecretSessionKey", 
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 60 * 1000, // 10-minute session window
    secure: false, // Set to true if using HTTPS in production
    httpOnly: true,
  },
}));

// CSRF Protection Middleware
const csrfProtection = csurf({
  cookie: false, 
});
app.use(csrfProtection);

app.get("/csrf-token", (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/payment", paymentRoutes);

const shopRoute = require("./routes/shop");
const authRoute = require("./routes/auth");
const AdminshopRoute = require("./routes/admin");

// Use Routes
app.use("/", shopRoute);
app.use("/auth", authRoute);
app.use("/admin", AdminshopRoute);

// Error Handling Middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const data = error.data;
  res.status(statusCode).json({
    message: error.message,
    status: statusCode,
    data: data,
  });
});

// MongoDB Options
const options = {
  minPoolSize: 1,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
};

// Connect to MongoDB and Start Server
mongoose
  .connect(process.env.MONGODB_SERVER_KEY, options)
  .then(() => {
    console.log("mongodb connected");
    const sslOptions = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem"),
};

https.createServer(sslOptions, app).listen(5000, () => {
  console.log("🔐 HTTPS Backend running on port 5000");
});

  })
  .catch((err) => console.log(err));
