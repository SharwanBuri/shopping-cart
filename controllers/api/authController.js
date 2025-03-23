const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Product = require("../../models/Product");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const validator = require("validator");
const minLength = 6;
const regex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// Function to insert dummy products
const insertDummyProducts = async () => {
  try {
    await Product.insertMany([
      { name: "Laptop", price: 1200, stock: 1000 },
      { name: "Smartphone", price: 800, stock: 200 },
      { name: "Headphones", price: 150, stock: 500 },
      { name: "Keyboard", price: 100, stock: 300 },
      { name: "Mouse", price: 50, stock: 400 },
    ]);
  } catch (error) {
    console.error("Error inserting dummy data:", error);
  }
};
//insertDummyProducts();
// Call the function

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (
    name === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    return next(new AppError("Required Parameter Messing!", 400));
  }

  if (password.length < minLength) {
    return next(
      new AppError("Password must be at least 6 characters long.", 400)
    );
  }
  if (!regex.test(password)) {
    return next(
      new AppError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        400
      )
    );
  }
  const userInfo = await User.findOne({ email: email });

  if (userInfo) {
    return next(new AppError("Already Exist This Email Address", 400));
  }
  if (password !== confirmPassword) {
    return next(
      new AppError("Password and Confirm Password do not Match!", 400)
    );
  }
  if (validator.isEmail(email) === false) {
    return next(new AppError("Enter Valid Email Address!", 400));
  }
  const user = await User.create({ name, email, password: hashedPassword });
  res.status(201).json({
    status: true,
    message: "User registered",
    data: user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (email === "" || password === "") {
    return next(new AppError("Required Parameter Messing!", 400));
  }
  if (validator.isEmail(email) === false) {
    return next(new AppError("Enter Valid Email Address!", 400));
  }
  if (password.length < minLength) {
    return next(
      new AppError("Password must be at least 6 characters long.", 400)
    );
  }
  if (!regex.test(password)) {
    return next(
      new AppError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        400
      )
    );
  }
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    new AppError("Invalid credentials", 400);
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.status(200).json({
    status: true,
    message: "Login successful",
    data: {
      _id: user.id,
      username: user.name,
      email: user.email, // Do not return the password!
      cart: user.cart, // Do not return the password!
    },
    token,
  });
});
