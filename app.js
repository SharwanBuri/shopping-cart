"use strict";
const express = require("express");
const path = require("path");
const http = require("http");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./dbconfig");
const session = require("express-session");

//Error Handlers
const AppError = require("./utils/appError");
const errorHandler = require("./middlewares/errorMiddleware");
//Routes
const authRouter = require("./routes/api/authRoutes");
const cartRoutes = require("./routes/api/cartRoutes");
const productRoutes = require("./routes/api/productRoutes");
const app = express();
connectDB();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1000kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(cors());
app.options("*", cors());
app.use(
  session({
    secret: "shoppingtask",
    resave: false,
    saveUninitialized: false,
  })
);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/product", productRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(res, `Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorHandler);
//app.use(globalErrorHandler);

module.exports = app;
