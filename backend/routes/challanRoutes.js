const express = require("express");

const {
    createChallan,
    getChallans,
    getChallanById,
    confirmChallan,
    cancelChallan
} = require("../controllers/challanController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create draft challan
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES"),
    createChallan
);

// Get all challans
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
    getChallans
);

// Get single challan
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
    getChallanById
);

// Confirm challan and reduce stock
router.put(
    "/:id/confirm",
    authenticate,
    authorize("ADMIN", "SALES"),
    confirmChallan
);

// Cancel draft challan
router.put(
    "/:id/cancel",
    authenticate,
    authorize("ADMIN", "SALES"),
    cancelChallan
);

module.exports = router;