-- ============================================
-- Library Management System - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- =====================
-- Books Table
-- =====================
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    publish_year INT,
    publisher VARCHAR(150),
    added_date DATE,
    status ENUM('AVAILABLE', 'ISSUED', 'LOST') DEFAULT 'AVAILABLE',
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_category (category)
);

-- =====================
-- Users Table
-- =====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    membership_type ENUM('STUDENT', 'FACULTY', 'PUBLIC') DEFAULT 'STUDENT',
    registration_date DATE,
    membership_expiry DATE,
    status ENUM('ACTIVE', 'SUSPENDED', 'EXPIRED') DEFAULT 'ACTIVE',
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MEMBER') DEFAULT 'MEMBER',
    INDEX idx_email (email),
    INDEX idx_member_id (member_id)
);

-- =====================
-- Transactions Table
-- =====================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    book_title VARCHAR(255),
    user_name VARCHAR(150),
    member_id VARCHAR(20),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status ENUM('ISSUED', 'RETURNED', 'OVERDUE') DEFAULT 'ISSUED',
    fine DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status)
);

-- =====================
-- Default Admin User
-- Password: admin123
-- =====================
INSERT INTO users (member_id, name, email, phone, membership_type, registration_date, membership_expiry, status, password, role)
VALUES ('ADMIN001', 'System Administrator', 'admin@library.com', '9999999999', 'FACULTY', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 10 YEAR), 'ACTIVE', 'admin123', 'ADMIN')
ON DUPLICATE KEY UPDATE name=name;

-- =====================
-- Sample Books Data
-- =====================
INSERT INTO books (isbn, title, author, category, total_copies, available_copies, publish_year, publisher, added_date, status) VALUES
('978-0132350884', 'Clean Code', 'Robert C. Martin', 'Technology', 3, 3, 2008, 'Prentice Hall', CURDATE(), 'AVAILABLE'),
('978-0201633610', 'Design Patterns', 'Gang of Four', 'Technology', 2, 2, 1994, 'Addison-Wesley', CURDATE(), 'AVAILABLE'),
('978-0596517748', 'JavaScript: The Good Parts', 'Douglas Crockford', 'Technology', 4, 4, 2008, 'O\'Reilly Media', CURDATE(), 'AVAILABLE'),
('978-0439708180', 'Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', 'Fiction', 5, 5, 1997, 'Scholastic', CURDATE(), 'AVAILABLE'),
('978-0743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 3, 3, 1925, 'Scribner', CURDATE(), 'AVAILABLE'),
('978-0062315007', 'The Alchemist', 'Paulo Coelho', 'Fiction', 4, 4, 1988, 'HarperOne', CURDATE(), 'AVAILABLE'),
('978-0071771475', 'Database System Concepts', 'Abraham Silberschatz', 'Technology', 2, 2, 2010, 'McGraw Hill', CURDATE(), 'AVAILABLE'),
('978-0131103627', 'The C Programming Language', 'Brian W. Kernighan', 'Technology', 3, 3, 1988, 'Prentice Hall', CURDATE(), 'AVAILABLE'),
('978-0140447934', 'The Odyssey', 'Homer', 'Classics', 2, 2, 800, 'Penguin Classics', CURDATE(), 'AVAILABLE'),
('978-0062457738', 'Sapiens', 'Yuval Noah Harari', 'Non-Fiction', 3, 3, 2011, 'Harper', CURDATE(), 'AVAILABLE')
ON DUPLICATE KEY UPDATE title=title;

-- =====================
-- Sample Member
-- Password: member123
-- =====================
INSERT INTO users (member_id, name, email, phone, membership_type, registration_date, membership_expiry, status, password, role)
VALUES ('MEM001', 'Rahul Sharma', 'rahul@example.com', '9876543210', 'STUDENT', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'ACTIVE', 'member123', 'MEMBER')
ON DUPLICATE KEY UPDATE name=name;

SELECT 'Database setup complete!' AS Message;
SELECT 'Admin login: admin@library.com / admin123' AS Credentials;
SELECT 'Member login: rahul@example.com / member123' AS Sample;
