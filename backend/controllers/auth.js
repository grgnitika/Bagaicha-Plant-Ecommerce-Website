const Customers = require("../models/customers");
const AdminAccount = require("../models/adminuser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { encrypt } = require("../utils/encryption");
const { decrypt } = require("../utils/encryption");
const { logToFile } = require("../utils/logger");

// Customer Registration
exports.registerAccount = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      const error = new Error("Incomplete input.");
      error.statusCode = 422;
      throw error;
    }

   const encryptedEmail = encrypt(email);
const emailLookup = email.toLowerCase().trim();

const existsAccount = await Customers.findOne({ emailLookup });
if (existsAccount) {
  const error = new Error("Email Account already exists. Please sign in.");
  error.statusCode = 409;
  throw error;
}
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    
    if (!passwordRegex.test(password)) {
      const error = new Error(
        "Password must be 8–16 characters long and include uppercase, lowercase, number, and special character."
      );
      error.statusCode = 400;
      throw error;
    }

    const hashedPass = await bcrypt.hash(password, 12);
    const user = new Customers({
      full_name: name,
      emailEncrypted: encryptedEmail,
      emailLookup: email.toLowerCase().trim(),
      hashedpassword: hashedPass,
      previousPasswords: [hashedPass],
      passwordCreatedAt: new Date(),
    });

    const result = await user.save();

    if (result) {
      const isAdmin = false;
      const token = generateToken(isAdmin, {
        _id: result.id,
        name: result.full_name,
        email,
      });

      logToFile(`New user registered: ${email}`);

      res.status(200).json({
        message: "Successfully Registered." + token,
        userdata: {
          name: result.full_name,
          email,
          id: result._id,
        },
        token,
      });
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.loginAccount = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Initialize failed login attempts in session if not already
    if (!req.session.failedLoginAttempts) {
      req.session.failedLoginAttempts = {};
    }

    if (!email || !password) {
      throw new Error("Incomplete input.");
    }

    // Check if this email has failed too many times
    const failCount = req.session.failedLoginAttempts[email] || 0;
    if (failCount >= 3) {
      return res.status(429).json({
        message: "Too many failed attempts. Please wait and try again.",
        locked: true,
      });
    }

    const emailLookup = email.toLowerCase().trim();
    //console.log("Login email lookup:", emailLookup);
    
    const checkuser = await Customers.findOne({ emailLookup });
    //console.log("Matched user from DB:", checkuser);

    if (!checkuser) {
      req.session.failedLoginAttempts[email] = failCount + 1;
      throw new Error("This account doesn't exist!");
    }

    const checkpass = await bcrypt.compare(password, checkuser.hashedpassword);


    if (!checkpass) {
      req.session.failedLoginAttempts[email] = failCount + 1;
      throw new Error("Incorrect email or password.");
    }

    // Password Expiry Check
    const passwordCreated = new Date(checkuser.passwordCreatedAt);
    const daysSinceCreation = Math.floor(
      (Date.now() - passwordCreated.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation > 15) {
      return res.status(403).json({
        message: "Your password has expired. Please update your password.",
        expired: true,
      });
    }

    req.session.failedLoginAttempts[email] = 0;

    const decryptedEmail = decrypt(checkuser.emailEncrypted);

    const token = generateToken(false, {
      _id: checkuser._id,
      name: checkuser.full_name,
      email: decryptedEmail, 
    });

    logToFile(`User login successful: ${checkuser.emailLookup}`);

    res.status(200).json({
  message: "Successfully signed in",
  userdata: {
    name: checkuser.full_name,
    email: decryptedEmail,
    id: checkuser._id,
  },
  token,
});

  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};



// Admin Login
exports.adminLoginAccount = async (req, res, next) => {
  const { email, password } = req.body;
  const validationerror = validationResult(req);

  try {
    if (!validationerror.isEmpty()) {
      const error = new Error("Validation Failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = validationerror.array();
      return next(error);
    }

    const checkExistsAdminAccount = await AdminAccount.findOne({ email });
    if (!checkExistsAdminAccount) {
      const error = new Error("This account doesn't exists!");
      error.statusCode = 401;
      throw error;
    }

    const checkAdminPassword = await bcrypt.compare(
      password,
      checkExistsAdminAccount.hashedpassword
    );
    if (!checkAdminPassword) {
      const error = new Error("Incorrect email or password.");
      error.statusCode = 401;
      throw error;
    }

    const isAdminProfile = true;
    const token = generateToken(isAdminProfile, {
      _id: checkExistsAdminAccount._id,
      email: checkExistsAdminAccount.email,
      isAdmin: checkExistsAdminAccount.isAdmin,
    });

    res.status(200).json({
      message: "Sucessful signed in",
      adminuserData: {
        email,
        id: checkExistsAdminAccount._id,
        isAdmin: checkExistsAdminAccount.isAdmin,
      },
      token,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// Get User Details
exports.getUserDetail = async (req, res, next) => {
  const { userid } = req.params;

  try {
    if (!userid) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    const userdetail = await Customers.findById(userid).select(
      "full_name email createdAt status"
    );

    if (!userdetail) {
      const error = new Error("Couldn't find resource.");
      error.statusCode = 400;
      throw error;
    }
    
    // Decrypt email before sending it
    const decryptedEmail = decrypt(userdetail.email);
    
    res.status(200).json({
      full_name: userdetail.full_name,
      email: decryptedEmail,
      createdAt: userdetail.createdAt,
      status: userdetail.status,
    });

    if (!userdetail || userdetail.length === 0) {
      const error = new Error("Couldn't find resource.");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json(userdetail);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// Token Generator
const generateToken = (isAdminProfile, data) => {
  if (isAdminProfile) {
    return jwt.sign(data, process.env.ADMIN_JWT_TOKEN_SECRET_MESSAGE, {
      expiresIn: "24hr",
    });
  }
  return jwt.sign(data, process.env.JWT_TOKEN_SECRET_MESSAGE, {
    expiresIn: "24hr",
  });
};

// Admin Registration
exports.registerAdminAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin already exists
    const existing = await AdminAccount.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    // Generate secret for MFA
    const secret = speakeasy.generateSecret({
  name: `Bagaicha (${email})`,
  issuer: "Bagaicha Admin Panel",
});

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save admin with correct field names
    const newAdmin = new AdminAccount({
      email,
      hashedpassword: hashedPassword,   
      mfaSecret: secret.base32,         
    });

    await newAdmin.save();

    // Generate QR code from MFA URL
    const otpAuthUrl = secret.otpauth_url;

    const qrDataURL = await qrcode.toDataURL(otpAuthUrl);

    res.status(201).json({
      message: "Admin registered. Scan QR for MFA.",
      email: newAdmin.email,
      qr: qrDataURL,
    });
  } catch (error) {
    //console.error("Register admin failed:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// update password
exports.updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  try {
    const user = await Customers.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.hashedpassword);
    if (!isMatch) {
      const error = new Error("Current password is incorrect.");
      error.statusCode = 401;
      throw error;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      const error = new Error(
        "New password must be 8–16 characters long and include uppercase, lowercase, number, and special character."
      );
      error.statusCode = 400;
      throw error;
    }

    // Prevent reuse
    const isReused = await Promise.all(
      user.previousPasswords.map(async (oldHash) => {
        return await bcrypt.compare(newPassword, oldHash);
      })
    );

    if (isReused.includes(true)) {
      const error = new Error("You cannot reuse a previously used password.");
      error.statusCode = 400;
      throw error;
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    user.previousPasswords.push(newHashedPassword);
    user.hashedpassword = newHashedPassword;
    user.passwordCreatedAt = new Date();

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// Validate email & password
exports.adminLoginStepOne = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const admin = await AdminAccount.findOne({ email });
    if (!admin) throw new Error("Invalid email or password");

    const match = await bcrypt.compare(password, admin.hashedpassword);
    if (!match) throw new Error("Invalid email or password");

    // Password correct, ask for OTP next
    res.status(200).json({
      message: "Password valid. Please enter OTP.",
      tempAdminId: admin._id,
    });
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

exports.adminLoginStepTwo = async (req, res, next) => {
  const { tempAdminId, otp } = req.body;
  //console.log("Received tempAdminId:", tempAdminId);
  //console.log("Received OTP:", otp);

  try {
    const admin = await AdminAccount.findById(tempAdminId);
    //console.log("Admin found:", admin);

    if (!admin || !admin.mfaSecret) {
      const error = new Error("Unauthorized access");
      error.statusCode = 401;
      throw error;
    }

    const isValid = speakeasy.totp.verify({
      secret: admin.mfaSecret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!isValid) {
      //console.log("Invalid OTP:", otp);
      const error = new Error("Invalid OTP. Try again.");
      error.statusCode = 401;
      throw error;
    }

    logToFile(`Admin MFA login success: ${admin.email}`);

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: admin._id,
        email: admin.email,
        isAdmin: true,
      },
      process.env.ADMIN_JWT_TOKEN_SECRET_MESSAGE,
      { expiresIn: "24h" }
    );

    // Structured adminData for Redux
    const adminData = {
      _id: admin._id,
      email: admin.email,
      isAdmin: admin.isAdmin || true,
    };

    res.status(200).json({
      message: "MFA Login successful",
      token,
      adminData, 
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
