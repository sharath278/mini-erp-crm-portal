const express = require("express");

const {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer
} = require("../controllers/customerController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "SALES"),
    getCustomers
);

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "SALES"),
    getCustomerById
);

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES"),
    createCustomer
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "SALES"),
    updateCustomer
);

module.exports = router;