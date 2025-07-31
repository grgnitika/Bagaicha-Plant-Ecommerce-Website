Bagaicha – Secure Plant E-Commerce Website 🌿 
Bagaicha is a full-stack plant e-commerce web application where users can explore, purchase, and manage a wide variety of plants and gardening products online. It supports both customer-facing features and a secure admin dashboard for managing products, orders, and users.

🚀 Technologies Used

Frontend: React.js, Tailwind CSS, FilePond

Backend: Node.js, Express.js, MongoDB

Authentication: JWT, express-session, bcrypt, MFA (for admin)

Security Libraries:
crypto-js (AES encryption)
express-validator, zod (validation)
xss-clean, express-mongo-sanitize (sanitization)
csurf (CSRF protection)

Other Tools: Stripe API for secure transactions, Multer for image uploads

🔐 Key Security Features

AES Encryption: Sensitive user data (email, phone, address) encrypted before DB storage

Strong Password Policy: Regex-enforced complexity, expiry, password history, and strength meter

Multi-Factor Authentication (MFA): Admins require time-based OTP for login

Role-Based Access Control (RBAC): Strict separation of customer and admin routes

Secure File Uploads: MIME type checks on both frontend and backend

Session + JWT Authentication: Flexible and secure user session handling

CSRF Protection: Csurf middleware and token-based request validation

HTTPS with SAN Certificate: Secure communication in both frontend and backend

Audit Logging: All critical user/admin actions logged for traceability
