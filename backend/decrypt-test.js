const CryptoJS = require("crypto-js");

const ENCRYPTION_SECRET = "cg3suNUKssebRmndZjvUy8h8XN4rFw55"; 

const encryptedEmail = "U2FsdGVkX1/a1v+G18GQEWTsqEqLFANMykW3E3gH+OQiDTIw4962+OK12UxTdivT";

const bytes = CryptoJS.AES.decrypt(encryptedEmail, ENCRYPTION_SECRET);
const decryptedEmail = bytes.toString(CryptoJS.enc.Utf8);

console.log("Decrypted Email:", decryptedEmail);
