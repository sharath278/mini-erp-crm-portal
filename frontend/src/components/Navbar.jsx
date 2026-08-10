import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="navbar-brand">
                <Link to="/dashboard">
                    Mini ERP
                </Link>
            </div>

            <div className="navbar-links">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/customers">
                    Customers
                </Link>

                <Link to="/products">
                    Products
                </Link>

                <Link to="/challans">
                    Challans
                </Link>

            </div>

            <div className="navbar-user">

                <span>
                    {user.name || "User"}
                </span>

                <span className="navbar-role">
                    {user.role || "USER"}
                </span>

                <button onClick={logout}>
                    Logout
                </button>

            </div>

        </nav>
    );
};

export default Navbar;