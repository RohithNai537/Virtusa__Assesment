package com.library.servlet;

import com.library.dao.BookDAO;
import com.library.model.Book;
import com.google.gson.*;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/BookServlet")
public class BookServlet extends HttpServlet {

    private final BookDAO bookDAO = new BookDAO();
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
        String keyword = request.getParameter("q");
        String category = request.getParameter("category");

        try {
            if ("search".equals(action) && keyword != null) {
                List<Book> books = bookDAO.searchBooks(keyword);
                out.print(gson.toJson(books));
            } else if ("category".equals(action) && category != null) {
                List<Book> books = bookDAO.getBooksByCategory(category);
                out.print(gson.toJson(books));
            } else {
                List<Book> books = bookDAO.getAllBooks();
                out.print(gson.toJson(books));
            }
        } catch (Exception e) {
            JsonObject err = new JsonObject();
            err.addProperty("error", e.getMessage());
            out.print(err.toString());
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

            if ("add".equals(action)) {
                Book book = new Book(
                        request.getParameter("isbn"),
                        request.getParameter("title"),
                        request.getParameter("author"),
                        request.getParameter("category"),
                        Integer.parseInt(request.getParameter("totalCopies")),
                        Integer.parseInt(request.getParameter("publishYear")),
                        request.getParameter("publisher")
                );
                boolean success = bookDAO.addBook(book);
                result.addProperty("success", success);
                result.addProperty("message", success ? "Book added successfully!" : "Failed to add book.");
                if (success) result.addProperty("id", book.getId());

            } else if ("update".equals(action)) {
                Book book = new Book();
                book.setId(Integer.parseInt(request.getParameter("id")));
                book.setIsbn(request.getParameter("isbn"));
                book.setTitle(request.getParameter("title"));
                book.setAuthor(request.getParameter("author"));
                book.setCategory(request.getParameter("category"));
                book.setTotalCopies(Integer.parseInt(request.getParameter("totalCopies")));
                book.setAvailableCopies(Integer.parseInt(request.getParameter("availableCopies")));
                book.setPublishYear(Integer.parseInt(request.getParameter("publishYear")));
                book.setPublisher(request.getParameter("publisher"));
                book.setStatus(request.getParameter("status"));
                boolean success = bookDAO.updateBook(book);
                result.addProperty("success", success);
                result.addProperty("message", success ? "Book updated!" : "Update failed.");

            } else if ("delete".equals(action)) {
                int id = Integer.parseInt(request.getParameter("id"));
                boolean success = bookDAO.deleteBook(id);
                result.addProperty("success", success);
                result.addProperty("message", success ? "Book deleted!" : "Delete failed.");
            }
        } catch (Exception e) {
            result.addProperty("success", false);
            result.addProperty("message", "Error: " + e.getMessage());
        }

        out.print(result.toString());
    }
}
