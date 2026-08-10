
import { useEffect, useState } from "react";
import axios from "axios";

const Challans = () => {
    const [challans, setChallans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [customerId, setCustomerId] = useState("");
    const [items, setItems] = useState([
        {
            productId: "",
            quantity: 1
        }
    ]);

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    const getChallans = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/challans",
                {
                    headers
                }
            );

            setChallans(response.data.challans);
        } catch (error) {
            console.error(error);
        }
    };

    const getCustomers = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/customers",
                {
                    headers
                }
            );

            setCustomers(response.data.customers);
        } catch (error) {
            console.error(error);
        }
    };

    const getProducts = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/products",
                {
                    headers
                }
            );

            setProducts(response.data.products);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getChallans();
        getCustomers();
        getProducts();
    }, []);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];

        updatedItems[index][field] = value;

        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                productId: "",
                quantity: 1
            }
        ]);
    };

    const removeItem = (index) => {
        if (items.length === 1) {
            return;
        }

        const updatedItems = items.filter(
            (_, itemIndex) => itemIndex !== index
        );

        setItems(updatedItems);
    };

    const resetForm = () => {
        setCustomerId("");

        setItems([
            {
                productId: "",
                quantity: 1
            }
        ]);
    };

    const createChallan = async (e) => {
        e.preventDefault();

        try {
            const formattedItems = items.map((item) => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity)
            }));

            await axios.post(
                "http://localhost:5000/api/challans",
                {
                    customerId: Number(customerId),
                    items: formattedItems
                },
                {
                    headers
                }
            );

            alert("Draft challan created successfully");

            resetForm();
            getChallans();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to create challan"
            );
        }
    };

    const confirmChallan = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/challans/${id}/confirm`,
                {},
                {
                    headers
                }
            );

            alert(
                "Challan confirmed and stock updated successfully"
            );

            getChallans();
            getProducts();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to confirm challan"
            );
        }
    };

    const cancelChallan = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/challans/${id}/cancel`,
                {},
                {
                    headers
                }
            );

            alert("Challan cancelled successfully");

            getChallans();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to cancel challan"
            );
        }
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Sales Challans</h1>

                    <p>
                        Create and manage customer sales challans.
                    </p>
                </div>
            </div>

            <div className="form-card challan-form">

                <h2>Create Sales Challan</h2>

                <form onSubmit={createChallan}>

                    <div className="form-group">

                        <label>Customer</label>

                        <select
                            value={customerId}
                            onChange={(e) =>
                                setCustomerId(e.target.value)
                            }
                            required
                        >
                            <option value="">
                                Select Customer
                            </option>

                            {customers.map((customer) => (
                                <option
                                    key={customer.id}
                                    value={customer.id}
                                >
                                    {customer.name} -{" "}
                                    {customer.businessName}
                                </option>
                            ))}
                        </select>

                    </div>

                    <h3>Products</h3>

                    {items.map((item, index) => (

                        <div
                            className="challan-item"
                            key={index}
                        >

                            <select
                                value={item.productId}
                                onChange={(e) =>
                                    handleItemChange(
                                        index,
                                        "productId",
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">
                                    Select Product
                                </option>

                                {products.map((product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name} - Stock:{" "}
                                        {product.currentStock}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleItemChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    removeItem(index)
                                }
                            >
                                Remove
                            </button>

                        </div>

                    ))}

                    <div className="form-buttons">

                        <button
                            type="button"
                            onClick={addItem}
                        >
                            + Add Product
                        </button>

                        <button type="submit">
                            Create Draft
                        </button>

                    </div>

                </form>

            </div>

            <div className="table-card">

                <div className="table-header">

                    <h2>Challan List</h2>

                </div>

                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>
                                <th>Challan Number</th>
                                <th>Customer</th>
                                <th>Total Quantity</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {challans.length === 0 ? (

                                <tr>
                                    <td colSpan="6">
                                        No challans found.
                                    </td>
                                </tr>

                            ) : (

                                challans.map((challan) => (

                                    <tr key={challan.id}>

                                        <td>
                                            {challan.challanNumber}
                                        </td>

                                        <td>
                                            {challan.customerName}
                                        </td>

                                        <td>
                                            {challan.totalQuantity}
                                        </td>

                                        <td>
                                            {challan.status}
                                        </td>

                                        <td>
                                            {challan.createdBy || "-"}
                                        </td>

                                        <td>

                                            {challan.status === "DRAFT" && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            confirmChallan(
                                                                challan.id
                                                            )
                                                        }
                                                    >
                                                        Confirm
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            cancelChallan(
                                                                challan.id
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default Challans;