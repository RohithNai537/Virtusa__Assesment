package com.library.servlet;

import com.library.dao.UserDAO;
import com.library.model.User;
import com.google.gson.*;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.List;

@WebServlet("/UserServlet")
public class UserServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class,
                    (JsonSerializer<LocalDate>) (src, type, ctx) -> new JsonPrimitive(src.toString()))
            .create();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");
        String keyword = request.getParameter("q");

        try {
            if ("search".equals(action) && keyword != null) {
                List<User> users = userDAO.searchUsers(keyword);
                out.print(gson.toJson(users));
            } else {
                List<User> users = userDAO.getAllUsers();
                out.print(gson.toJson(users));
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

            if ("register".equals(action)) {
                String name = request.getParameter("name");
                String email = request.getParameter("email");

                if (userDAO.isEmailExists(email)) {
                    result.addProperty("success", false);
                    result.addProperty("message", "Email already registered.");
                } else {
                    // Generate member ID
                    String memberId = "MEM" + System.currentTimeMillis() % 10000;
                    User user = new User(memberId, name, email,
                            request.getParameter("phone"),
                            request.getParameter("membershipType"),
                            request.getParameter("password"),
                            "MEMBER");
                    user.setAddress(request.getParameter("address"));
                    boolean success = userDAO.registerUser(user);
                    result.addProperty("success", success);
                    result.addProperty("message", success ? "Member registered! ID: " + memberId : "Registration failed.");
                    if (success) result.addProperty("memberId", memberId);
                }

            } else if ("update".equals(action)) {
                User user = new User();
                user.setId(Integer.parseInt(request.getParameter("id")));
                user.setName(request.getParameter("name"));
                user.setEmail(request.getParameter("email"));
                user.setPhone(request.getParameter("phone"));
                user.setAddress(request.getParameter("address"));
                user.setMembershipType(request.getParameter("membershipType"));
                user.setStatus(request.getParameter("status"));
                user.setMembershipExpiry(LocalDate.parse(request.getParameter("membershipExpiry")));
                boolean success = userDAO.updateUser(user);
                result.addProperty("success", success);
                result.addProperty("message", success ? "Member updated!" : "Update failed.");

            } else if ("delete".equals(action)) {
                int id = Integer.parseInt(request.getParameter("id"));
                boolean success = userDAO.deleteUser(id);
                result.addProperty("success", success);
                result.addProperty("message", success ? "Member deleted!" : "Delete failed.");
            }

        } catch (Exception e) {
            result.addProperty("success", false);
            result.addProperty("message", "Error: " + e.getMessage());
        }

        out.print(result.toString());
    }
}
