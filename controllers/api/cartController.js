const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Product = require("../../models/Product");
const CartItem = require("../../models/CartItem");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

exports.add = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  if (productId === "" || quantity === "") {
    return next(new AppError("Required Parameter Messing!", 400));
  }
  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));
  if (req.userId) {
    const user = await User.findById(req.userId);
    let cartItem = await CartItem.findOne({
      user: user._id,
      product: productId,
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        user: user._id,
        product: productId,
        quantity,
      });
      user.cart.push(cartItem._id); // Add to user's cart
      await user.save();
    }

    res.status(201).json({
      status: true,
      message: "Product added to cart",
      data: cartItem,
    });
  } else {
    let cart = req.session.cart;
    const itemIndex = cart.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity += quantity;
    } else {
      cart.push({ _id: uuidv4(), productId, quantity });
    }
    res.status(201).json({
      status: true,
      message: "Product added to cart",
      data: cart,
    });
  }
});

exports.list = catchAsync(async (req, res, next) => {
  if (req.userId) {
    const user = await User.findById(req.userId);
    if (!user) return next(new AppError("User not found", 404));
    const cartWithDetails = await Promise.all(
      user.cart.map(async (item) => {
        const cartInfo = await CartItem.findById(item.toString());
        if (!cartInfo) return null; // Handle case where cart item is not found

        const product = await Product.findById(
          cartInfo.product.toString(),
          "name price"
        );
        if (!product) return null; // Handle case where product is not found

        return {
          _id: cartInfo._id,
          productId: cartInfo.product,
          productName: product.name,
          price: product.price,
          quantity: cartInfo.quantity,
        };
      })
    );

    // Filter out any null values (in case of missing products or cart items)
    const filteredCart = cartWithDetails.filter((item) => item !== null);
    res.status(200).json({
      status: true,
      message: "Cart retrieved successfully",
      data: filteredCart,
    });
  } else {
    let cart = req.session.cart;
    console.log(cart);
    const cartWithDetails = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.findById(item.productId, "name price");
        if (!product) return null; // Handle case where product is not found

        return {
          _id: item._id,
          productId: item.productId,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      })
    );
    // Filter out any null values (in case of missing products or cart items)
    const filteredCart = cartWithDetails.filter((item) => item !== null);
    res.status(200).json({
      status: true,
      message: "Cart retrieved successfully",
      data: filteredCart,
    });
  }
});

exports.remove = catchAsync(async (req, res, next) => {
  if (req.userId) {
    const user = await User.findById(req.userId);
    user.cart = user.cart.filter((item) => item.toString() !== req.params.id);
    await user.save();
    await CartItem.findByIdAndDelete(req.params.id);
  } else {
    let cart = req.session.cart;
    // ✅ Find and remove product by `_id`
    req.session.cart = req.session.cart.filter(
      (item) => item._id !== req.params.id
    );
  }

  res.status(200).json({
    status: true,
    message: "Item removed from cart",
  });
});
