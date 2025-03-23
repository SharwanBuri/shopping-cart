const express = require("express");
const cartController = require("../../controllers/api/cartController");
const auth = require("../../middlewares/authMiddleware");
const cartMiddleware = require("../../middlewares/cartMiddleware"); // ✅ Ensures cart ID
const router = express.Router();
router.use(cartMiddleware);

router.post("/add", auth, cartController.add);
router.get("/fetch", auth, cartController.list);
router.delete("/remove/:id", auth, cartController.remove);

module.exports = router;
