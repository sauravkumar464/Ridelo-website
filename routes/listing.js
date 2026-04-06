const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const Razorpay = require("razorpay");

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,       // stored safely in .env
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    // amount will come from frontend (in paise)
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount, // amount in paise (100 INR = 10000)
      currency: "INR",
      receipt: "order_rcptid_" + Math.floor(Math.random() * 10000),
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);
    res.json(order);
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// ✅ Routes for listings
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// ✅ New Listing Form (must come before dynamic route)
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// ✅ Show / Edit / Delete routes
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// ✅ Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

module.exports = router;
