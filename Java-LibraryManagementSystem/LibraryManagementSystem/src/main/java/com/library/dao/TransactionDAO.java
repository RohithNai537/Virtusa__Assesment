package com.library.dao;

import com.library.model.Transaction;
import com.library.util.DatabaseUtil;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransactionDAO {

    public boolean issueBook(Transaction transaction) {
        String sql = "INSERT INTO transactions (book_id, user_id, book_title, user_name, member_id, issue_date, due_date, status, fine) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, transaction.getBookId());
            stmt.setInt(2, transaction.getUserId());
            stmt.setString(3, transaction.getBookTitle());
            stmt.setString(4, transaction.getUserName());
            stmt.setString(5, transaction.getMemberId());
            stmt.setDate(6, Date.valueOf(transaction.getIssueDate()));
            stmt.setDate(7, Date.valueOf(transaction.getDueDate()));
            stmt.setString(8, "ISSUED");
            stmt.setDouble(9, 0.0);
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                ResultSet keys = stmt.getGeneratedKeys();
                if (keys.next()) transaction.setId(keys.getInt(1));
                // Update available copies
                updateAvailableCopies(conn, transaction.getBookId(), -1);
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean returnBook(int transactionId) {
        String sql = "UPDATE transactions SET return_date=?, status=?, fine=? WHERE id=?";
        try (Connection conn = DatabaseUtil.getConnection()) {
            // Get transaction first
            Transaction t = getTransactionById(transactionId);
            if (t == null) return false;
            LocalDate returnDate = LocalDate.now();
            t.setReturnDate(returnDate);
            double fine = t.calculateFine();
            String status = fine > 0 ? "OVERDUE" : "RETURNED";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setDate(1, Date.valueOf(returnDate));
            stmt.setString(2, status);
            stmt.setDouble(3, fine);
            stmt.setInt(4, transactionId);
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                updateAvailableCopies(conn, t.getBookId(), 1);
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private void updateAvailableCopies(Connection conn, int bookId, int delta) throws SQLException {
        String sql = "UPDATE books SET available_copies = available_copies + ? WHERE id=?";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, delta);
        stmt.setInt(2, bookId);
        stmt.executeUpdate();
    }

    public Transaction getTransactionById(int id) {
        String sql = "SELECT * FROM transactions WHERE id=?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return mapTransaction(rs);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Transaction> getAllTransactions() {
        List<Transaction> list = new ArrayList<>();
        String sql = "SELECT * FROM transactions ORDER BY issue_date DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapTransaction(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Transaction> getActiveTransactions() {
        List<Transaction> list = new ArrayList<>();
        String sql = "SELECT * FROM transactions WHERE status='ISSUED' ORDER BY due_date";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapTransaction(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Transaction> getOverdueTransactions() {
        List<Transaction> list = new ArrayList<>();
        String sql = "SELECT * FROM transactions WHERE status='ISSUED' AND due_date < CURDATE()";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Transaction t = mapTransaction(rs);
                t.calculateFine();
                list.add(t);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Transaction> getTransactionsByUser(int userId) {
        List<Transaction> list = new ArrayList<>();
        String sql = "SELECT * FROM transactions WHERE user_id=? ORDER BY issue_date DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) list.add(mapTransaction(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public int getTotalIssuedBooks() {
        String sql = "SELECT COUNT(*) FROM transactions WHERE status='ISSUED'";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getOverdueCount() {
        String sql = "SELECT COUNT(*) FROM transactions WHERE status='ISSUED' AND due_date < CURDATE()";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public double getTotalFinesCollected() {
        String sql = "SELECT SUM(fine) FROM transactions WHERE fine > 0 AND status != 'ISSUED'";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getDouble(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0.0;
    }

    private Transaction mapTransaction(ResultSet rs) throws SQLException {
        Transaction t = new Transaction();
        t.setId(rs.getInt("id"));
        t.setBookId(rs.getInt("book_id"));
        t.setUserId(rs.getInt("user_id"));
        t.setBookTitle(rs.getString("book_title"));
        t.setUserName(rs.getString("user_name"));
        t.setMemberId(rs.getString("member_id"));
        Date issue = rs.getDate("issue_date");
        if (issue != null) t.setIssueDate(issue.toLocalDate());
        Date due = rs.getDate("due_date");
        if (due != null) t.setDueDate(due.toLocalDate());
        Date ret = rs.getDate("return_date");
        if (ret != null) t.setReturnDate(ret.toLocalDate());
        t.setStatus(rs.getString("status"));
        t.setFine(rs.getDouble("fine"));
        return t;
    }
}
