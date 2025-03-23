const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  if (!req.session.cartId) {
    req.session.cartId = uuidv4(); // ✅ Generate a unique cart ID for guests
  }

  if (!req.session.cart) {
    req.session.cart = []; // ✅ Initialize empty cart array
  }

  next();
};
