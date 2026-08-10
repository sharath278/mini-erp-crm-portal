import { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        unitPrice: "",
        currentStock: "",
        minStockQuantity: "",
        warehouseLocation: ""
    });

    const [editingId, setEditingId] = useState(null);

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    const getProducts = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/products?search=${search}`,
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
        getProducts();
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
            sku: "",
            category: "",
            unitPrice: "",
            currentStock: "",
            minStockQuantity: "",
            warehouseLocation: ""
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/products/${editingId}`,
                    {
                        ...formData,
                        unitPrice: Number(formData.unitPrice),
                        currentStock: Number(formData.currentStock),
                        minStockQuantity: Number(formData.minStockQuantity)
                    },
                    {
                        headers
                    }
                );
            } else {
                await axios.post(
                    "http://localhost:5000/api/products",
                    {
                        ...formData,
                        unitPrice: Number(formData.unitPrice),
                        currentStock: Number(formData.currentStock),
                        minStockQuantity: Number(formData.minStockQuantity)
                    },
                    {
                        headers
                    }
                );
            }

            resetForm();
            getProducts();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);

        setFormData({
            name: product.name || "",
            sku: product.sku || "",
            category: product.category || "",
            unitPrice: product.unitPrice || "",
            currentStock: product.currentStock || "",
            minStockQuantity: product.minStockQuantity || "",
            warehouseLocation: product.warehouseLocation || ""
        });
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Products & Inventory</h1>
                    <p>
                        Manage products, stock and warehouse information.
                    </p>
                </div>
            </div>

            <div className="content-grid">

                <div className="form-card">

                    <h2>
                        {editingId
                            ? "Edit Product"
                            : "Add Product"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            name="name"
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="sku"
                            placeholder="SKU / Product Code"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="category"
                            placeholder="Category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            name="unitPrice"
                            placeholder="Unit Price"
                            value={formData.unitPrice}
                            onChange={handleChange}
                            min="0"
                            required
                        />

                        <input
                            type="number"
                            name="currentStock"
                            placeholder="Current Stock"
                            value={formData.currentStock}
                            onChange={handleChange}
                            min="0"
                            required
                        />

                        <input
                            type="number"
                            name="minStockQuantity"
                            placeholder="Minimum Stock Alert"
                            value={formData.minStockQuantity}
                            onChange={handleChange}
                            min="0"
                            required
                        />

                        <input
                            name="warehouseLocation"
                            placeholder="Warehouse Location"
                            value={formData.warehouseLocation}
                            onChange={handleChange}
                            required
                        />

                        <div className="form-buttons">

                            <button type="submit">
                                {editingId
                                    ? "Update Product"
                                    : "Add Product"}
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

                        <h2>Product List</h2>

                        <input
                            placeholder="Search products..."
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
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Minimum</th>
                                    <th>Location</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {

                                        const isLowStock =
                                            product.currentStock <=
                                            product.minStockQuantity;

                                        return (
                                            <tr key={product.id}>

                                                <td>
                                                    {product.name}
                                                </td>

                                                <td>
                                                    {product.sku}
                                                </td>

                                                <td>
                                                    {product.category}
                                                </td>

                                                <td>
                                                    ₹{product.unitPrice}
                                                </td>

                                                <td>
                                                    {product.currentStock}
                                                </td>

                                                <td>
                                                    {product.minStockQuantity}
                                                </td>

                                                <td>
                                                    {product.warehouseLocation}
                                                </td>

                                                <td>

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(product)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    {isLowStock && (
                                                        <span className="low-stock">
                                                            Low Stock
                                                        </span>
                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    })
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Products;