package com.library.servlet;

import com.library.dao.BookDAO;
import com.library.dao.TransactionDAO;
import com.library.dao.UserDAO;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/DashboardServlet")
public class DashboardServlet extends HttpServlet {

    private final BookDAO bookDAO = new BookDAO();
    private final UserDAO userDAO = new UserDAO();
    private final TransactionDAO txDAO = new TransactionDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            JsonObject stats = new JsonObject();
            stats.addProperty("totalBooks", bookDAO.getTotalBooks());
            stats.addProperty("availableBooks", bookDAO.getAvailableBooks());
            stats.addProperty("totalMembers", userDAO.getTotalMembers());
            stats.addProperty("issuedBooks", txDAO.getTotalIssuedBooks());
            stats.addProperty("overdueCount", txDAO.getOverdueCount());
            stats.addProperty("totalFines", txDAO.getTotalFinesCollected());
            out.print(stats.toString());
        } catch (Exception e) {
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
