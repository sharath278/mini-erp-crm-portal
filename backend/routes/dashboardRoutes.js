const express = require("express");

const {
    getDashboardStats
} = require("../controllers/dashboardController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/stats",
    authenticate,
    authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
    getDashboardStats
);

module.exports = router;