CREATE DATABASE IF NOT EXISTS mini_erp;

USE mini_erp;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS') DEFAULT 'SALES',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    business_name VARCHAR(150) NOT NULL,
    gst_number VARCHAR(50),
    customer_type ENUM('RETAIL', 'WHOLESALE', 'DISTRIBUTOR') NOT NULL,
    address TEXT NOT NULL,
    status ENUM('LEAD', 'ACTIVE', 'INACTIVE') DEFAULT 'LEAD',
    follow_up_date DATE,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    current_stock INT DEFAULT 0,
    min_stock_quantity INT DEFAULT 0,
    warehouse_location VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    movement_type ENUM('IN', 'OUT') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS challans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    total_quantity INT DEFAULT 0,
    status ENUM('DRAFT', 'CONFIRMED', 'CANCELLED') DEFAULT 'DRAFT',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS challan_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,

    FOREIGN KEY (challan_id) REFERENCES challans(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);