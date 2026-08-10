=const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const challanRoutes = require("./routes/challanRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Mini ERP CRM API is running"
    });
});

// Authentication
app.use("/api/auth", authRoutes);

// CRM
app.use("/api/customers", customerRoutes);

// Products & Inventory
app.use("/api/products", productRoutes);

// Sales Challans
app.use("/api/challans", challanRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});