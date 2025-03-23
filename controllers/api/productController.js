const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Product = require("../../models/Product");
const CartItem = require("../../models/CartItem");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const validator = require("validator");

exports.list = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  // Query filter (e.g., filtering by category)
  let filter = {};
  // Sorting (e.g., by price ascending/descending)
  let sort = {};
  // Fetch products with pagination
  const products = await Product.find(filter)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const totalProducts = await Product.countDocuments(filter);

  res.status(200).json({
    status: true,
    message: "Products retrieved successfully",
    data: products,
    pagination: {
      total: totalProducts,
      page: parseInt(page),
      limit: parseInt(limit),
    },
  });
});
