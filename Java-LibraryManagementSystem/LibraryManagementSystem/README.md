# 📚 LibraSync — Library Management System

A full-featured, Java-based Library Management System with a modern web interface. Automates book inventory, member registration, issue/return tracking, and fine calculation.

---

## 🖥️ Screenshots

> Open `index.html` in browser after setup to see the UI.

| Login Page | Admin Dashboard | Books Management |
|---|---|---|
| Clean login with demo credentials | Stats, recent transactions, overdue alerts | Full CRUD — add, edit, delete books |

| Issue Book | Return & Fine | Member Portal |
|---|---|---|
| Select member + book, auto due-date | Fine auto-calculated at ₹2/day | Member self-service view |

---

## ✨ Features

### Admin Panel
- 📊 **Dashboard** — real-time stats (total books, available, members, overdue)
- 📖 **Book Management** — Add / Edit / Delete books with ISBN, author, category, copies
- 👥 **Member Management** — Register, update, suspend members
- 📤 **Issue Books** — Select member + book, auto-set 14-day due date
- 📥 **Return Books** — Process returns, auto-calculate fine
- ⚠️ **Overdue Tracker** — See all overdue books with accumulated fines
- 💰 **Fine Reports** — Collected vs pending fines
- 🔍 **Search** — By title, author, ISBN, category; member search by name/email/ID

### Member Portal
- 🏠 **Dashboard** — current issues, overdue count, pending fine
- 📚 **Browse Catalog** — search and filter all available books
- 📖 **My Books** — view currently issued books with days remaining
- 🕐 **History** — full borrowing history
- 💰 **Fines** — personal fine records

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Core Java (JDK 11+), Java Servlets (javax.servlet 4.0) |
| **OOP Concepts** | Encapsulation (models), Abstraction (DAO layer), Inheritance, Polymorphism |
| **Database** | MySQL 8.x via JDBC (`mysql-connector-java 8.0.33`) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Fonts** | Google Fonts: Playfair Display + DM Sans |
| **JSON** | Google Gson 2.10.1 |
| **Build** | Apache Maven 3.x |
| **Server** | Apache Tomcat 9.x / 10.x |
| **IDE** | Eclipse / IntelliJ IDEA / VS Code |

---

## 📁 Project Structure

```
LibraryManagementSystem/
├── pom.xml                          # Maven build file
├── database/
│   └── schema.sql                   # MySQL schema + seed data
└── src/
    └── main/
        ├── java/com/library/
        │   ├── model/
        │   │   ├── Book.java         # Book entity (OOP model)
        │   │   ├── User.java         # User/Member entity
        │   │   └── Transaction.java  # Issue/Return transaction
        │   ├── dao/
        │   │   ├── BookDAO.java      # Book CRUD via JDBC
        │   │   ├── UserDAO.java      # User CRUD via JDBC
        │   │   └── TransactionDAO.java # Transaction logic
        │   ├── servlet/
        │   │   ├── LoginServlet.java       # Authentication
        │   │   ├── BookServlet.java        # Book REST API
        │   │   ├── UserServlet.java        # User REST API
        │   │   ├── TransactionServlet.java # Issue/Return API
        │   │   └── DashboardServlet.java   # Stats API
        │   └── util/
        │       ├── DatabaseUtil.java       # JDBC connection pool
        │       └── CharacterEncodingFilter.java
        └── webapp/
            ├── index.html             # Login page
            ├── dashboard.html         # Admin dashboard
            ├── member-dashboard.html  # Member portal
            ├── css/
            │   └── style.css          # Complete design system
            ├── js/
            │   ├── app.js             # Shared utilities + in-memory DB
            │   └── dashboard.js       # All section logic
            └── WEB-INF/
                └── web.xml            # Servlet configuration
```

---

## 🚀 How to Run

### Option A: Open Directly in Browser (No Setup Needed — Recommended for Demo)

> The frontend works fully standalone with an in-memory JavaScript database.

1. Navigate to `src/main/webapp/`
2. Open `index.html` in any browser (Chrome, Firefox, Edge)
3. Use these demo credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@library.com | admin123 |
| **Member** | rahul@example.com | member123 |

✅ All features work — add books, issue, return, fine calculation — everything runs in-browser!

---

### Option B: Full Java Web App with MySQL (Production Mode)

#### Prerequisites
- Java JDK 11+
- Apache Maven 3.6+
- MySQL 8.x
- Apache Tomcat 9.x

#### Step 1 — Set Up Database
```sql
-- In MySQL Workbench or terminal:
mysql -u root -p
source /path/to/database/schema.sql
```
This creates `library_db` with tables and sample data.

#### Step 2 — Configure Database Connection
Edit `src/main/java/com/library/util/DatabaseUtil.java`:
```java
private static final String DB_URL = "jdbc:mysql://localhost:3306/library_db?useSSL=false&serverTimezone=UTC";
private static final String DB_USER = "root";
private static final String DB_PASSWORD = "your_mysql_password";
```

#### Step 3 — Build the Project
```bash
cd LibraryManagementSystem
mvn clean package
```
This generates `target/LibraryManagementSystem.war`

#### Step 4 — Deploy to Tomcat
```bash
# Copy WAR to Tomcat webapps folder:
cp target/LibraryManagementSystem.war /opt/tomcat/webapps/

# Start Tomcat:
/opt/tomcat/bin/startup.sh
```

#### Step 5 — Access the Application
```
http://localhost:8080/LibraryManagementSystem/
```

#### Alternative: Run with Maven Tomcat Plugin
```bash
mvn tomcat7:run
# Then open: http://localhost:8080/library/
```

---

## 🎓 Java OOP Concepts Used

| Concept | Where Used |
|---|---|
| **Encapsulation** | All model classes (`Book`, `User`, `Transaction`) with private fields + getters/setters |
| **Abstraction** | DAO layer abstracts all database operations from servlets |
| **Inheritance** | All Servlets extend `HttpServlet` |
| **Polymorphism** | `doGet()` / `doPost()` method overriding in each servlet |
| **JDBC** | `DatabaseUtil`, all DAO classes use `PreparedStatement` |
| **Collections** | `ArrayList<Book>`, `List<User>`, etc. throughout DAOs |
| **Exception Handling** | try-catch in every DAO and servlet method |
| **Design Pattern** | **DAO Pattern** — separates data access from business logic |

---

## 🗄️ SQL Concepts Used

| SQL Concept | Where Used |
|---|---|
| **DDL** | `CREATE TABLE`, `CREATE DATABASE` in schema.sql |
| **DML** | `INSERT`, `UPDATE`, `DELETE` in all DAOs |
| **Joins** | Transactions reference Books and Users via foreign keys |
| **Indexes** | On `title`, `author`, `email`, `member_id` for fast search |
| **Constraints** | `UNIQUE`, `NOT NULL`, `FOREIGN KEY`, `ON DELETE CASCADE` |
| **Aggregate Functions** | `COUNT(*)`, `SUM()` for dashboard stats |
| **LIKE Operator** | Used in search queries for partial matches |
| **ENUM** | For `status`, `role`, `membership_type` fields |

---

## 💡 Interview Talking Points

1. **Why DAO Pattern?** Separates database logic from servlet logic → easier to maintain and test
2. **Fine Calculation Logic?** `Transaction.calculateFine()` uses `ChronoUnit.DAYS.between(dueDate, returnDate) * 2.0`
3. **Session Management?** `HttpSession` stores userId, userName, role after login
4. **Prepared Statements?** Used everywhere to prevent SQL injection
5. **Why Gson?** Converts Java objects to JSON for REST-style API responses consumed by frontend JS
6. **Frontend without JSP?** Pure HTML/CSS/JS frontend communicates via fetch() to servlets — clean separation

---

## 📜 License
MIT License — Free to use for educational purposes.

---

*Built with ❤️ for library automation — LibraSync v1.0*
