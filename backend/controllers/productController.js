const db = require("../config/db");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            unitPrice,
            currentStock,
            minStockQuantity,
            warehouseLocation
        } = req.body;

        if (
            !name ||
            !sku ||
            !category ||
            unitPrice === undefined ||
            currentStock === undefined ||
            minStockQuantity === undefined ||
            !warehouseLocation
        ) {
            return res.status(400).json({
                success: false,
                message: "All product fields are required"
            });
        }

        const [existingProduct] = await db.query(
            "SELECT id FROM products WHERE sku = ?",
            [sku]
        );

        if (existingProduct.length > 0) {
            return res.status(400).json({
                success: false,
                message: "SKU already exists"
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (
                name,
                sku,
                category,
                unit_price,
                current_stock,
                min_stock_quantity,
                warehouse_location
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                sku,
                category,
                unitPrice,
                currentStock,
                minStockQuantity,
                warehouseLocation
            ]
        );

        // Record initial stock movement
        if (Number(currentStock) > 0) {
            await db.query(
                `INSERT INTO stock_movements
                (
                    product_id,
                    quantity,
                    movement_type,
                    reason,
                    created_by
                )
                VALUES (?, ?, 'IN', ?, ?)`,
                [
                    result.insertId,
                    currentStock,
                    "Initial stock",
                    req.user.id
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
};


const getProducts = async (req, res) => {
    try {
        const { search } = req.query;

        let query = `
            SELECT
                id,
                name,
                sku,
                category,
                unit_price AS unitPrice,
                current_stock AS currentStock,
                min_stock_quantity AS minStockQuantity,
                warehouse_location AS warehouseLocation,
                created_at AS createdAt
            FROM products
        `;

        const values = [];

        if (search) {
            query += `
                WHERE name LIKE ?
                OR sku LIKE ?
                OR category LIKE ?
            `;

            const searchValue = `%${search}%`;

            values.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        query += " ORDER BY created_at DESC";

        const [products] = await db.query(query, values);

        res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};


const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(
            `SELECT
                id,
                name,
                sku,
                category,
                unit_price AS unitPrice,
                current_stock AS currentStock,
                min_stock_quantity AS minStockQuantity,
                warehouse_location AS warehouseLocation,
                created_at AS createdAt
             FROM products
             WHERE id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            product: products[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            sku,
            category,
            unitPrice,
            currentStock,
            minStockQuantity,
            warehouseLocation
        } = req.body;

        const [products] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const oldStock = products[0].current_stock;

        await db.query(
            `UPDATE products
             SET
                name = ?,
                sku = ?,
                category = ?,
                unit_price = ?,
                current_stock = ?,
                min_stock_quantity = ?,
                warehouse_location = ?
             WHERE id = ?`,
            [
                name,
                sku,
                category,
                unitPrice,
                currentStock,
                minStockQuantity,
                warehouseLocation,
                id
            ]
        );

        const stockDifference =
            Number(currentStock) - Number(oldStock);

        if (stockDifference !== 0) {
            const movementType =
                stockDifference > 0 ? "IN" : "OUT";

            await db.query(
                `INSERT INTO stock_movements
                (
                    product_id,
                    quantity,
                    movement_type,
                    reason,
                    created_by
                )
                VALUES (?, ?, ?, ?, ?)`,
                [
                    id,
                    Math.abs(stockDifference),
                    movementType,
                    "Manual stock adjustment",
                    req.user.id
                ]
            );
        }

        res.json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};


const getStockMovements = async (req, res) => {
    try {
        const [movements] = await db.query(
            `SELECT
                sm.id,
                sm.product_id AS productId,
                p.name AS productName,
                p.sku,
                sm.quantity,
                sm.movement_type AS movementType,
                sm.reason,
                u.name AS createdBy,
                sm.created_at AS createdAt
             FROM stock_movements sm
             JOIN products p ON sm.product_id = p.id
             LEFT JOIN users u ON sm.created_by = u.id
             ORDER BY sm.created_at DESC`
        );

        res.json({
            success: true,
            count: movements.length,
            movements
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock movements"
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    getStockMovements
};