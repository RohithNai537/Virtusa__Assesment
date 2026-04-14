package com.library.model;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class Transaction {
    private int id;
    private int bookId;
    private int userId;
    private String bookTitle;
    private String userName;
    private String memberId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status; // ISSUED, RETURNED, OVERDUE
    private double fine;
    private static final double FINE_PER_DAY = 2.0; // Rs. 2 per day

    public Transaction() {}

    public Transaction(int bookId, int userId, String bookTitle, String userName, String memberId) {
        this.bookId = bookId;
        this.userId = userId;
        this.bookTitle = bookTitle;
        this.userName = userName;
        this.memberId = memberId;
        this.issueDate = LocalDate.now();
        this.dueDate = LocalDate.now().plusDays(14); // 14 days lending period
        this.status = "ISSUED";
        this.fine = 0.0;
    }

    public double calculateFine() {
        if (returnDate != null && returnDate.isAfter(dueDate)) {
            long daysLate = ChronoUnit.DAYS.between(dueDate, returnDate);
            this.fine = daysLate * FINE_PER_DAY;
        } else if (returnDate == null && LocalDate.now().isAfter(dueDate)) {
            long daysLate = ChronoUnit.DAYS.between(dueDate, LocalDate.now());
            this.fine = daysLate * FINE_PER_DAY;
        }
        return this.fine;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBookId() { return bookId; }
    public void setBookId(int bookId) { this.bookId = bookId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getFine() { return fine; }
    public void setFine(double fine) { this.fine = fine; }

    public static double getFinePerDay() { return FINE_PER_DAY; }
}
