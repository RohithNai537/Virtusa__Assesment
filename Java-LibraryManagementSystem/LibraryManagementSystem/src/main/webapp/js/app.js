// ===================================================
// LibraSync - Shared App Utilities
// ===================================================

// ---- In-Memory Data Store (works without backend) ----
const DB = {
    books: [
        { id: 1, isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', totalCopies: 3, availableCopies: 2, publishYear: 2008, publisher: 'Prentice Hall', status: 'AVAILABLE' },
        { id: 2, isbn: '978-0201633610', title: 'Design Patterns', author: 'Gang of Four', category: 'Technology', totalCopies: 2, availableCopies: 2, publishYear: 1994, publisher: 'Addison-Wesley', status: 'AVAILABLE' },
        { id: 3, isbn: '978-0596517748', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Technology', totalCopies: 4, availableCopies: 3, publishYear: 2008, publisher: "O'Reilly Media", status: 'AVAILABLE' },
        { id: 4, isbn: '978-0439708180', title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', category: 'Fiction', totalCopies: 5, availableCopies: 4, publishYear: 1997, publisher: 'Scholastic', status: 'AVAILABLE' },
        { id: 5, isbn: '978-0743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', totalCopies: 3, availableCopies: 3, publishYear: 1925, publisher: 'Scribner', status: 'AVAILABLE' },
        { id: 6, isbn: '978-0062315007', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', totalCopies: 4, availableCopies: 4, publishYear: 1988, publisher: 'HarperOne', status: 'AVAILABLE' },
        { id: 7, isbn: '978-0071771475', title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Technology', totalCopies: 2, availableCopies: 1, publishYear: 2010, publisher: 'McGraw Hill', status: 'AVAILABLE' },
        { id: 8, isbn: '978-0131103627', title: 'The C Programming Language', author: 'Brian W. Kernighan', category: 'Technology', totalCopies: 3, availableCopies: 3, publishYear: 1988, publisher: 'Prentice Hall', status: 'AVAILABLE' },
        { id: 9, isbn: '978-0140447934', title: 'The Odyssey', author: 'Homer', category: 'Classics', totalCopies: 2, availableCopies: 2, publishYear: -800, publisher: 'Penguin Classics', status: 'AVAILABLE' },
        { id: 10, isbn: '978-0062457738', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Non-Fiction', totalCopies: 3, availableCopies: 2, publishYear: 2011, publisher: 'Harper', status: 'AVAILABLE' }
    ],
    users: [
        { id: 1, memberId: 'ADMIN001', name: 'System Administrator', email: 'admin@library.com', phone: '9999999999', address: 'Library Building', membershipType: 'FACULTY', registrationDate: '2024-01-01', membershipExpiry: '2034-01-01', status: 'ACTIVE', role: 'ADMIN' },
        { id: 2, memberId: 'MEM001', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', address: '123 Main St, Hyderabad', membershipType: 'STUDENT', registrationDate: '2024-06-01', membershipExpiry: '2025-06-01', status: 'ACTIVE', role: 'MEMBER' },
        { id: 3, memberId: 'MEM002', name: 'Priya Singh', email: 'priya@example.com', phone: '9876543211', address: '456 Park Ave, Hyderabad', membershipType: 'FACULTY', registrationDate: '2024-03-15', membershipExpiry: '2025-03-15', status: 'ACTIVE', role: 'MEMBER' },
        { id: 4, memberId: 'MEM003', name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', address: '789 Lake View, Mumbai', membershipType: 'STUDENT', registrationDate: '2024-04-10', membershipExpiry: '2025-04-10', status: 'ACTIVE', role: 'MEMBER' }
    ],
    transactions: [
        { id: 1, bookId: 1, userId: 2, bookTitle: 'Clean Code', userName: 'Rahul Sharma', memberId: 'MEM001', issueDate: '2025-03-20', dueDate: '2025-04-03', returnDate: '2025-04-01', status: 'RETURNED', fine: 0 },
        { id: 2, bookId: 7, userId: 3, bookTitle: 'Database System Concepts', userName: 'Priya Singh', memberId: 'MEM002', issueDate: '2025-03-25', dueDate: '2025-04-08', returnDate: null, status: 'OVERDUE', fine: 12 },
        { id: 3, bookId: 3, userId: 4, bookTitle: 'JavaScript: The Good Parts', userName: 'Amit Kumar', memberId: 'MEM003', issueDate: '2026-04-05', dueDate: '2026-04-19', returnDate: null, status: 'ISSUED', fine: 0 },
        { id: 4, bookId: 10, userId: 2, bookTitle: 'Sapiens', userName: 'Rahul Sharma', memberId: 'MEM001', issueDate: '2026-04-10', dueDate: '2026-04-24', returnDate: null, status: 'ISSUED', fine: 0 }
    ],
    nextBookId: 11,
    nextUserId: 5,
    nextTxId: 5
};

// ---- Section Navigation ----
function showSection(name) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('section-' + name)?.classList.add('active');
    document.getElementById('nav-' + name)?.classList.add('active');

    const titles = {
        dashboard: ['Dashboard', 'Overview of library operations'],
        books: ['Books Catalog', 'Manage book inventory'],
        members: ['Members', 'Manage library members'],
        issue: ['Issue Book', 'Issue books to members'],
        return: ['Return Book', 'Process book returns'],
        transactions: ['Transactions', 'All issue/return records'],
        overdue: ['Overdue Books', 'Books past their due date'],
        fines: ['Fines & Penalties', 'Fine records and collection']
    };
    const [t, d] = titles[name] || ['Dashboard', ''];
    document.getElementById('pageTitle').textContent = t;
    document.getElementById('pageDesc').textContent = d;

    // Load section data
    if (name === 'books') loadBooks();
    else if (name === 'members') loadMembers();
    else if (name === 'issue') loadIssueSection();
    else if (name === 'return') loadReturnSection();
    else if (name === 'transactions') loadTransactions();
    else if (name === 'overdue') loadOverdue();
    else if (name === 'fines') loadFines();
    else if (name === 'dashboard') loadDashboard();
}

// ---- Modal Utilities ----
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// ---- Toast Notifications ----
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// ---- Date Utilities ----
function today() { return new Date().toISOString().split('T')[0]; }
function dueDate14() {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
}
function formatDate(s) {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function daysBetween(d1, d2) {
    return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
}
function calcFine(dueDate, returnDate) {
    const ret = returnDate || today();
    const days = daysBetween(dueDate, ret);
    return days > 0 ? days * 2 : 0;
}

// ---- Category Badge ----
function catBadge(cat) {
    const map = { 'Technology': 'cat-technology', 'Fiction': 'cat-fiction', 'Non-Fiction': 'cat-nonfiction', 'Classics': 'cat-classics' };
    return `<span class="badge ${map[cat] || 'cat-default'}">${cat||'General'}</span>`;
}

// ---- Status Badge ----
function statusBadge(status) {
    const cls = { AVAILABLE: 'badge-available', ISSUED: 'badge-issued', OVERDUE: 'badge-overdue', RETURNED: 'badge-returned', ACTIVE: 'badge-active', SUSPENDED: 'badge-suspended', STUDENT: 'badge-student', FACULTY: 'badge-faculty', PUBLIC: 'badge-public' };
    return `<span class="badge ${cls[status]||'badge-returned'}">${status}</span>`;
}

// ---- Logout ----
function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        window.location.href = 'index.html';
    }
}

// ---- Toggle Sidebar (Mobile) ----
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ---- Set Topbar Date ----
function setTopbarDate() {
    const el = document.getElementById('topbarDate');
    if (el) {
        el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    }
}
setTopbarDate();
