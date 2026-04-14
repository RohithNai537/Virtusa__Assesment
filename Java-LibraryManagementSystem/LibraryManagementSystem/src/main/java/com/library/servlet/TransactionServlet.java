package com.library.servlet;

import com.library.dao.TransactionDAO;
import com.library.model.Transaction;
import com.google.gson.*;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/TransactionServlet")
public class TransactionServlet extends HttpServlet {

    private final TransactionDAO txDAO = new TransactionDAO();
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(java.time.LocalDate.class,
                    (JsonSerializer<java.time.LocalDate>) (src, type, ctx) -> new JsonPrimitive(src.toString()))
            .create();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        try {
            if ("active".equals(action)) {
                List<Transaction> list = txDAO.getActiveTransactions();
                out.print(gson.toJson(list));
            } else if ("overdue".equals(action)) {
                List<Transaction> list = txDAO.getOverdueTransactions();
                out.print(gson.toJson(list));
            } else if ("stats".equals(action)) {
                JsonObject stats = new JsonObject();
                stats.addProperty("totalIssued", txDAO.getTotalIssuedBooks());
                stats.addProperty("overdueCount", txDAO.getOverdueCount());
                stats.addProperty("totalFines", txDAO.getTotalFinesCollected());
                out.print(stats.toString());
            } else {
                List<Transaction> list = txDAO.getAllTransactions();
                out.print(gson.toJson(list));
            }
        } catch (Exception e) {
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        JsonObject result = new JsonObject();

        try {
            String action = request.getParameter("action");

            if ("issue".equals(action)) {
                int bookId = Integer.parseInt(request.getParameter("bookId"));
                int userId = Integer.parseInt(request.getParameter("userId"));
                String bookTitle = request.getParameter("bookTitle");
                String userName = request.getParameter("userName");
                String memberId = request.getParameter("memberId");

                Transaction tx = new Transaction(bookId, userId, bookTitle, userName, memberId);
                boolean success = txDAO.issueBook(tx);
                result.addProperty("success", success);
                result.addProperty("message", success ? "Book issued successfully! Due: " + tx.getDueDate() : "Failed to issue book.");
                if (success) {
                    result.addProperty("txId", tx.getId());
                    result.addProperty("dueDate", tx.getDueDate().toString());
                }

            } else if ("return".equals(action)) {
                int txId = Integer.parseInt(request.getParameter("txId"));
                boolean success = txDAO.returnBook(txId);
                result.addProperty("success", success);
                result.addProperty("message", success ? "Book returned successfully!" : "Return failed.");

                if (success) {
                    Transaction t = txDAO.getTransactionById(txId);
                    if (t != null) {
                        result.addProperty("fine", t.getFine());
                    }
                }
            }
        } catch (Exception e) {
            result.addProperty("success", false);
            result.addProperty("message", "Error: " + e.getMessage());
        }

        out.print(result.toString());
    }
}
