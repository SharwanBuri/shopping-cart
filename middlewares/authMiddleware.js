const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return next();
  // if (!token)
  //   return res.status(401).json({ status: true, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    next();
    //res.status(401).json({ status: true, message: "Invalid token" });
  }
};

module.exports = verifyToken;
