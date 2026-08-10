import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Challans from "./pages/Challans";
import Navbar from "./components/Navbar";

const ProtectedLayout = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate to="/dashboard" replace />
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedLayout>
                            <Dashboard />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/customers"
                    element={
                        <ProtectedLayout>
                            <Customers />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/products"
                    element={
                        <ProtectedLayout>
                            <Products />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/challans"
                    element={
                        <ProtectedLayout>
                            <Challans />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate to="/dashboard" replace />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default App;