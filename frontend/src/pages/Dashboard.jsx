import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalChallans: 0,
        confirmedChallans: 0
    });

    const [recentChallans, setRecentChallans] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    const getDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/dashboard/stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStats(response.data.stats);
            setRecentChallans(response.data.recentChallans);
            setLowStockProducts(response.data.lowStockProducts);

        } catch (error) {
            console.error("Failed to load dashboard", error);
        }
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    return (
        <div className="dashboard-page">

            <header className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Welcome back, {user.name || "User"}
                    </p>
                </div>

                <div className="user-role">
                    {user.role || "USER"}
                </div>
            </header>

            <div className="stats-grid">

                <div className="stat-card">
                    <h3>Total Customers</h3>
                    <h2>{stats.totalCustomers}</h2>
                </div>

                <div className="stat-card">
                    <h3>Total Products</h3>
                    <h2>{stats.totalProducts}</h2>
                </div>

                <div className="stat-card">
                    <h3>Low Stock</h3>
                    <h2>{stats.lowStockProducts}</h2>
                </div>

                <div className="stat-card">
                    <h3>Total Challans</h3>
                    <h2>{stats.totalChallans}</h2>
                </div>

                <div className="stat-card">
                    <h3>Confirmed Challans</h3>
                    <h2>{stats.confirmedChallans}</h2>
                </div>

            </div>

            <div className="dashboard-sections">

                <section className="dashboard-section">

                    <h2>Recent Challans</h2>

                    {recentChallans.length === 0 ? (
                        <p>No challans available.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Challan</th>
                                    <th>Customer</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentChallans.map((challan) => (
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                </section>

                <section className="dashboard-section">

                    <h2>Low Stock Products</h2>

                    {lowStockProducts.length === 0 ? (
                        <p>All products have sufficient stock.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Current Stock</th>
                                    <th>Minimum</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lowStockProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            {product.name}
                                        </td>

                                        <td>
                                            {product.sku}
                                        </td>

                                        <td>
                                            {product.currentStock}
                                        </td>

                                        <td>
                                            {product.minStockQuantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                </section>

            </div>

        </div>
    );
};

export default Dashboard;