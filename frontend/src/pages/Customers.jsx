import { useEffect, useState } from "react";
import api from "../services/api";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        businessName: "",
        gstNumber: "",
        customerType: "RETAIL",
        address: "",
        status: "LEAD",
        followUpDate: "",
        notes: ""
    });

    const [editingId, setEditingId] = useState(null);

    const getCustomers = async () => {
        try {
            const response = await api.get(
                `/customers?search=${search}`
            );

            setCustomers(response.data.customers);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getCustomers();
    }, [search]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            mobile: "",
            email: "",
            businessName: "",
            gstNumber: "",
            customerType: "RETAIL",
            address: "",
            status: "LEAD",
            followUpDate: "",
            notes: ""
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await api.put(
                    `/customers/${editingId}`,
                    formData
                );
            } else {
                await api.post(
                    "/customers",
                    formData
                );
            }

            resetForm();
            getCustomers();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    const handleEdit = (customer) => {
        setEditingId(customer.id);

        setFormData({
            name: customer.name || "",
            mobile: customer.mobile || "",
            email: customer.email || "",
            businessName: customer.businessName || "",
            gstNumber: customer.gstNumber || "",
            customerType: customer.customerType || "RETAIL",
            address: customer.address || "",
            status: customer.status || "LEAD",
            followUpDate: customer.followUpDate
                ? customer.followUpDate.substring(0, 10)
                : "",
            notes: customer.notes || ""
        });
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Customers</h1>
                    <p>
                        Manage customer relationships and follow-ups.
                    </p>
                </div>
            </div>

            <div className="content-grid">

                <div className="form-card">

                    <h2>
                        {editingId
                            ? "Edit Customer"
                            : "Add Customer"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            name="name"
                            placeholder="Customer Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="mobile"
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <input
                            name="businessName"
                            placeholder="Business Name"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="gstNumber"
                            placeholder="GST Number"
                            value={formData.gstNumber}
                            onChange={handleChange}
                        />

                        <select
                            name="customerType"
                            value={formData.customerType}
                            onChange={handleChange}
                        >
                            <option value="RETAIL">
                                Retail
                            </option>

                            <option value="WHOLESALE">
                                Wholesale
                            </option>

                            <option value="DISTRIBUTOR">
                                Distributor
                            </option>
                        </select>

                        <textarea
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="LEAD">
                                Lead
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>
                        </select>

                        <input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleChange}
                        />

                        <textarea
                            name="notes"
                            placeholder="Follow-up notes"
                            value={formData.notes}
                            onChange={handleChange}
                        />

                        <div className="form-buttons">

                            <button type="submit">
                                {editingId
                                    ? "Update Customer"
                                    : "Add Customer"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </div>

                <div className="table-card">

                    <div className="table-header">

                        <h2>Customer List</h2>

                        <input
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                    <div className="table-wrapper">

                        <table>

                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Business</th>
                                    <th>Mobile</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id}>

                                            <td>
                                                {customer.name}
                                            </td>

                                            <td>
                                                {customer.businessName}
                                            </td>

                                            <td>
                                                {customer.mobile}
                                            </td>

                                            <td>
                                                {customer.customerType}
                                            </td>

                                            <td>
                                                {customer.status}
                                            </td>

                                            <td>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>
                                            </td>

                                        </tr>
                                    ))
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Customers;