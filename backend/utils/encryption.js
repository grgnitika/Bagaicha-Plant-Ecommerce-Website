const CryptoJS = require("crypto-js");

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
if (!ENCRYPTION_SECRET) {
  throw new Error("ENCRYPTION_SECRET is missing from .env");
}


exports.encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET).toString();
};

exports.decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};
