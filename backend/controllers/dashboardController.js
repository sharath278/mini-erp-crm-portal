const db = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {
        const [customerResult] = await db.query(
            "SELECT COUNT(*) AS totalCustomers FROM customers"
        );

        const [productResult] = await db.query(
            "SELECT COUNT(*) AS totalProducts FROM products"
        );

        const [lowStockResult] = await db.query(
            `SELECT COUNT(*) AS lowStockProducts
             FROM products
             WHERE current_stock <= min_stock_quantity`
        );

        const [challanResult] = await db.query(
            "SELECT COUNT(*) AS totalChallans FROM challans"
        );

        const [confirmedChallanResult] = await db.query(
            `SELECT COUNT(*) AS confirmedChallans
             FROM challans
             WHERE status = 'CONFIRMED'`
        );

        const [recentChallans] = await db.query(
            `SELECT
                c.id,
                c.challan_number AS challanNumber,
                cu.name AS customerName,
                c.total_quantity AS totalQuantity,
                c.status,
                c.created_at AS createdAt
             FROM challans c
             JOIN customers cu ON c.customer_id = cu.id
             ORDER BY c.created_at DESC
             LIMIT 5`
        );

        const [lowStockProducts] = await db.query(
            `SELECT
                id,
                name,
                sku,
                current_stock AS currentStock,
                min_stock_quantity AS minStockQuantity
             FROM products
             WHERE current_stock <= min_stock_quantity
             ORDER BY current_stock ASC
             LIMIT 5`
        );

        res.json({
            success: true,
            stats: {
                totalCustomers: customerResult[0].totalCustomers,
                totalProducts: productResult[0].totalProducts,
                lowStockProducts: lowStockResult[0].lowStockProducts,
                totalChallans: challanResult[0].totalChallans,
                confirmedChallans: confirmedChallanResult[0].confirmedChallans
            },
            recentChallans,
            lowStockProducts
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};