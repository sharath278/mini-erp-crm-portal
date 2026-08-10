const db = require("../config/db");

const createCustomer = async (req, res) => {
    try {
        const {
            name,
            mobile,
            email,
            businessName,
            gstNumber,
            customerType,
            address,
            status,
            followUpDate,
            notes
        } = req.body;

        if (!name || !mobile || !businessName || !customerType || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, mobile, business name, customer type and address are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO customers
            (name, mobile, email, business_name, gst_number,
             customer_type, address, status, follow_up_date, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                mobile,
                email || null,
                businessName,
                gstNumber || null,
                customerType,
                address,
                status || "LEAD",
                followUpDate || null,
                notes || null,
                req.user.id
            ]
        );

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customerId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create customer"
        });
    }
};


const getCustomers = async (req, res) => {
    try {
        const { search } = req.query;

        let query = `
            SELECT
                id,
                name,
                mobile,
                email,
                business_name AS businessName,
                gst_number AS gstNumber,
                customer_type AS customerType,
                address,
                status,
                follow_up_date AS followUpDate,
                notes,
                created_at AS createdAt
            FROM customers
        `;

        const values = [];

        if (search) {
            query += `
                WHERE name LIKE ?
                OR mobile LIKE ?
                OR business_name LIKE ?
                OR email LIKE ?
            `;

            const searchValue = `%${search}%`;

            values.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        query += " ORDER BY created_at DESC";

        const [customers] = await db.query(query, values);

        res.json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};


const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const [customers] = await db.query(
            `SELECT
                id,
                name,
                mobile,
                email,
                business_name AS businessName,
                gst_number AS gstNumber,
                customer_type AS customerType,
                address,
                status,
                follow_up_date AS followUpDate,
                notes,
                created_at AS createdAt
             FROM customers
             WHERE id = ?`,
            [id]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.json({
            success: true,
            customer: customers[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};


const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            mobile,
            email,
            businessName,
            gstNumber,
            customerType,
            address,
            status,
            followUpDate,
            notes
        } = req.body;

        const [result] = await db.query(
            `UPDATE customers
             SET
                name = ?,
                mobile = ?,
                email = ?,
                business_name = ?,
                gst_number = ?,
                customer_type = ?,
                address = ?,
                status = ?,
                follow_up_date = ?,
                notes = ?
             WHERE id = ?`,
            [
                name,
                mobile,
                email || null,
                businessName,
                gstNumber || null,
                customerType,
                address,
                status,
                followUpDate || null,
                notes || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.json({
            success: true,
            message: "Customer updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update customer"
        });
    }
};


module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer
};