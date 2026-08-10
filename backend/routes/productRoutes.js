const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    getStockMovements
} = require("../controllers/productController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"),
    getProducts
);

router.get(
    "/movements",
    authenticate,
    authorize("ADMIN", "WAREHOUSE"),
    getStockMovements
);

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"),
    getProductById
);

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "WAREHOUSE"),
    createProduct
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "WAREHOUSE"),
    updateProduct
);

module.exports = router;