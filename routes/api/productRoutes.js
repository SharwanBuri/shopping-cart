const express = require("express");
const productController = require("../../controllers/api/productController");

const router = express.Router();

router.get("/fetch", productController.list);

module.exports = router;
