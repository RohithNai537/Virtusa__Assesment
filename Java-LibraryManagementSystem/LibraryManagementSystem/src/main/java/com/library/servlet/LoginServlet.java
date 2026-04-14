package com.library.servlet;

import com.library.dao.UserDAO;
import com.library.model.User;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String email = request.getParameter("email");
        String password = request.getParameter("password");

        JsonObject json = new JsonObject();

        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            json.addProperty("success", false);
            json.addProperty("message", "Email and password are required.");
            out.print(json.toString());
            return;
        }

        try {
            User user = userDAO.login(email.trim(), password.trim());

            if (user != null) {
                HttpSession session = request.getSession();
                session.setAttribute("userId", user.getId());
                session.setAttribute("userName", user.getName());
                session.setAttribute("userRole", user.getRole());
                session.setAttribute("memberId", user.getMemberId());
                session.setMaxInactiveInterval(3600); // 1 hour

                json.addProperty("success", true);
                json.addProperty("role", user.getRole());
                json.addProperty("name", user.getName());
                json.addProperty("message", "Login successful");
            } else {
                json.addProperty("success", false);
                json.addProperty("message", "Invalid email or password. Please try again.");
            }
        } catch (Exception e) {
            // Fallback for demo (no database)
            json.addProperty("success", false);
            json.addProperty("message", "Database connection error. Use frontend demo mode.");
        }

        out.print(json.toString());
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect("index.html");
    }
}
