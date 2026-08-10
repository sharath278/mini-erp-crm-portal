const db = require("../config/db");

const createChallan = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            customerId,
            items
        } = req.body;

        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Customer and at least one product are required"
            });
        }

        await connection.beginTransaction();

        // Check customer
        const [customers] = await connection.query(
            "SELECT id FROM customers WHERE id = ?",
            [customerId]
        );

        if (customers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const challanNumber = `CH-${Date.now()}`;

        let totalQuantity = 0;

        const preparedItems = [];

        for (const item of items) {

            if (!item.productId || !item.quantity || item.quantity <= 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Invalid product or quantity"
                });
            }

            const [products] = await connection.query(
                `SELECT
                    id,
                    name,
                    sku,
                    unit_price,
                    current_stock
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [item.productId]
            );

            if (products.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }

            const product = products[0];

            if (product.current_stock < item.quantity) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available stock: ${product.current_stock}`
                });
            }

            totalQuantity += Number(item.quantity);

            preparedItems.push({
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                unitPrice: product.unit_price,
                quantity: Number(item.quantity)
            });
        }

        // Create challan as DRAFT
        const [challanResult] = await connection.query(
            `INSERT INTO challans
            (
                challan_number,
                customer_id,
                total_quantity,
                status,
                created_by
            )
            VALUES (?, ?, ?, 'DRAFT', ?)`,
            [
                challanNumber,
                customerId,
                totalQuantity,
                req.user.id
            ]
        );

        const challanId = challanResult.insertId;

        // Save product snapshot
        for (const item of preparedItems) {
            await connection.query(
                `INSERT INTO challan_items
                (
                    challan_id,
                    product_id,
                    product_name,
                    sku,
                    unit_price,
                    quantity
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    challanId,
                    item.productId,
                    item.productName,
                    item.sku,
                    item.unitPrice,
                    item.quantity
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Challan created successfully",
            challanId,
            challanNumber,
            status: "DRAFT"
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create challan"
        });

    } finally {
        connection.release();
    }
};


const getChallans = async (req, res) => {
    try {

        const [challans] = await db.query(
            `SELECT
                c.id,
                c.challan_number AS challanNumber,
                c.customer_id AS customerId,
                cu.name AS customerName,
                cu.business_name AS businessName,
                c.total_quantity AS totalQuantity,
                c.status,
                u.name AS createdBy,
                c.created_at AS createdAt
             FROM challans c
             JOIN customers cu ON c.customer_id = cu.id
             LEFT JOIN users u ON c.created_by = u.id
             ORDER BY c.created_at DESC`
        );

        res.json({
            success: true,
            count: challans.length,
            challans
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch challans"
        });

    }
};


const getChallanById = async (req, res) => {
    try {

        const { id } = req.params;

        const [challans] = await db.query(
            `SELECT
                c.id,
                c.challan_number AS challanNumber,
                c.customer_id AS customerId,
                cu.name AS customerName,
                cu.business_name AS businessName,
                c.total_quantity AS totalQuantity,
                c.status,
                u.name AS createdBy,
                c.created_at AS createdAt
             FROM challans c
             JOIN customers cu ON c.customer_id = cu.id
             LEFT JOIN users u ON c.created_by = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (challans.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        const [items] = await db.query(
            `SELECT
                id,
                product_id AS productId,
                product_name AS productName,
                sku,
                unit_price AS unitPrice,
                quantity
             FROM challan_items
             WHERE challan_id = ?`,
            [id]
        );

        res.json({
            success: true,
            challan: {
                ...challans[0],
                items
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch challan"
        });

    }
};


const confirmChallan = async (req, res) => {
    const connection = await db.getConnection();

    try {

        const { id } = req.params;

        await connection.beginTransaction();

        const [challans] = await connection.query(
            `SELECT *
             FROM challans
             WHERE id = ?
             FOR UPDATE`,
            [id]
        );

        if (challans.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        const challan = challans[0];

        if (challan.status !== "DRAFT") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: `Challan cannot be confirmed because its status is ${challan.status}`
            });
        }

        const [items] = await connection.query(
            `SELECT *
             FROM challan_items
             WHERE challan_id = ?`,
            [id]
        );

        if (items.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Challan has no products"
            });
        }

        // Check stock again before deduction
        for (const item of items) {

            const [products] = await connection.query(
                `SELECT
                    id,
                    name,
                    current_stock
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [item.product_id]
            );

            if (products.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product_id} not found`
                });
            }

            const product = products[0];

            if (product.current_stock < item.quantity) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available stock: ${product.current_stock}`
                });
            }
        }

        // Deduct stock
        for (const item of items) {

            await connection.query(
                `UPDATE products
                 SET current_stock = current_stock - ?
                 WHERE id = ?`,
                [
                    item.quantity,
                    item.product_id
                ]
            );

            // Create stock movement
            await connection.query(
                `INSERT INTO stock_movements
                (
                    product_id,
                    quantity,
                    movement_type,
                    reason,
                    created_by
                )
                VALUES (?, ?, 'OUT', ?, ?)`,
                [
                    item.product_id,
                    item.quantity,
                    `Sales Challan ${challan.challan_number}`,
                    req.user.id
                ]
            );
        }

        // Confirm challan
        await connection.query(
            `UPDATE challans
             SET status = 'CONFIRMED'
             WHERE id = ?`,
            [id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Challan confirmed and stock updated successfully"
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to confirm challan"
        });

    } finally {
        connection.release();
    }
};


const cancelChallan = async (req, res) => {
    try {

        const { id } = req.params;

        const [challans] = await db.query(
            "SELECT status FROM challans WHERE id = ?",
            [id]
        );

        if (challans.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        if (challans[0].status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only draft challans can be cancelled"
            });
        }

        await db.query(
            `UPDATE challans
             SET status = 'CANCELLED'
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Challan cancelled successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to cancel challan"
        });

    }
};


module.exports = {
    createChallan,
    getChallans,
    getChallanById,
    confirmChallan,
    cancelChallan
};