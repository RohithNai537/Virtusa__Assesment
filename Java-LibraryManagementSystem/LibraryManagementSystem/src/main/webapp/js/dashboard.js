// ===================================================
// LibraSync - Dashboard Logic (All Sections)
// ===================================================

// ============ DASHBOARD ============
function loadDashboard() {
    const members = DB.users.filter(u => u.role === 'MEMBER');
    const overdue = DB.transactions.filter(t => t.status === 'ISSUED' && new Date(t.dueDate) < new Date());
    const issued = DB.transactions.filter(t => t.status === 'ISSUED');
    const available = DB.books.reduce((a, b) => a + b.availableCopies, 0);

    document.getElementById('stat-totalBooks').textContent = DB.books.length;
    document.getElementById('stat-availBooks').textContent = available;
    document.getElementById('stat-members').textContent = members.length;
    document.getElementById('stat-overdue').textContent = overdue.length;

    // Recent transactions
    const recentTx = [...DB.transactions].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 6);
    const tbody = document.getElementById('recentTxTable');
    tbody.innerHTML = recentTx.length ? recentTx.map(t => `
        <tr>
            <td><strong>${t.bookTitle}</strong></td>
            <td>${t.userName}</td>
            <td>${formatDate(t.issueDate)}</td>
            <td>${statusBadge(t.status)}</td>
        </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8">No transactions yet</td></tr>';

    // Overdue summary
    const overdueItems = DB.transactions.filter(t => t.status === 'ISSUED' && new Date(t.dueDate) < new Date());
    const overdueEl = document.getElementById('overdueTableDash');
    overdueEl.innerHTML = overdueItems.length ? overdueItems.slice(0, 5).map(t => {
        const fine = calcFine(t.dueDate, null);
        return `<tr class="overdue-row">
            <td><strong>${t.bookTitle}</strong></td>
            <td>${t.userName}</td>
            <td>${formatDate(t.dueDate)}</td>
            <td class="fine-amount">₹${fine}</td>
        </tr>`;
    }).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8">No overdue books 🎉</td></tr>';
}

// ============ BOOKS ============
let allBooks = [];
function loadBooks() {
    allBooks = [...DB.books];
    renderBooks(allBooks);
}

function renderBooks(books) {
    const tbody = document.getElementById('booksTable');
    if (!books.length) {
        tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📚</div><h3>No books found</h3><p>Add your first book to get started</p></div></td></tr>';
        return;
    }
    tbody.innerHTML = books.map((b, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><code style="font-size:11px;background:#f1f5f9;padding:2px 6px;border-radius:4px">${b.isbn}</code></td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td>${catBadge(b.category)}</td>
            <td>${b.totalCopies}</td>
            <td>
                <span style="color:${b.availableCopies > 0 ? 'var(--success)' : 'var(--danger)'};font-weight:700">
                    ${b.availableCopies}
                </span>
            </td>
            <td>${b.publishYear > 0 ? b.publishYear : 'Ancient'}</td>
            <td>${statusBadge(b.availableCopies > 0 ? 'AVAILABLE' : 'ISSUED')}</td>
            <td>
                <div style="display:flex;gap:5px">
                    <button class="btn btn-outline btn-sm btn-icon" title="Edit" onclick="editBook(${b.id})">✏️</button>
                    <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="deleteBook(${b.id})">🗑</button>
                </div>
            </td>
        </tr>`).join('');
}

function filterBooks() {
    const q = document.getElementById('bookSearch').value.toLowerCase();
    const cat = document.getElementById('catFilter').value;
    renderBooks(allBooks.filter(b =>
        (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q)) &&
        (!cat || b.category === cat)
    ));
}

function openAddBook() {
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    document.getElementById('bookId').value = '';
    ['bookIsbn', 'bookTitle', 'bookAuthor', 'bookPublisher'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('bookCategory').value = '';
    document.getElementById('bookCopies').value = '1';
    document.getElementById('bookYear').value = new Date().getFullYear();
    openModal('bookModal');
}

function editBook(id) {
    const b = DB.books.find(x => x.id === id);
    if (!b) return;
    document.getElementById('bookModalTitle').textContent = 'Edit Book';
    document.getElementById('bookId').value = b.id;
    document.getElementById('bookIsbn').value = b.isbn;
    document.getElementById('bookTitle').value = b.title;
    document.getElementById('bookAuthor').value = b.author;
    document.getElementById('bookCategory').value = b.category;
    document.getElementById('bookCopies').value = b.totalCopies;
    document.getElementById('bookYear').value = b.publishYear;
    document.getElementById('bookPublisher').value = b.publisher;
    openModal('bookModal');
}

function saveBook() {
    const id = document.getElementById('bookId').value;
    const isbn = document.getElementById('bookIsbn').value.trim();
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const category = document.getElementById('bookCategory').value;
    const copies = parseInt(document.getElementById('bookCopies').value);
    const year = parseInt(document.getElementById('bookYear').value);
    const publisher = document.getElementById('bookPublisher').value.trim();

    if (!isbn || !title || !author || !category) { showToast('Please fill in all required fields', 'error'); return; }

    if (id) {
        const idx = DB.books.findIndex(b => b.id == id);
        const diff = copies - DB.books[idx].totalCopies;
        DB.books[idx] = { ...DB.books[idx], isbn, title, author, category, totalCopies: copies, availableCopies: Math.max(0, DB.books[idx].availableCopies + diff), publishYear: year, publisher };
        showToast('Book updated successfully!', 'success');
    } else {
        DB.books.push({ id: DB.nextBookId++, isbn, title, author, category, totalCopies: copies, availableCopies: copies, publishYear: year, publisher, status: 'AVAILABLE' });
        showToast('Book added successfully!', 'success');
    }
    closeModal('bookModal');
    loadBooks();
}

function deleteBook(id) {
    const b = DB.books.find(x => x.id === id);
    if (!b) return;
    if (!confirm(`Delete "${b.title}"? This action cannot be undone.`)) return;
    const active = DB.transactions.find(t => t.bookId === id && t.status === 'ISSUED');
    if (active) { showToast('Cannot delete — this book has active issues!', 'error'); return; }
    DB.books = DB.books.filter(x => x.id !== id);
    showToast('Book deleted successfully', 'success');
    loadBooks();
}

// ============ MEMBERS ============
let allMembers = [];
function loadMembers() {
    allMembers = DB.users.filter(u => u.role === 'MEMBER');
    renderMembers(allMembers);
}

function renderMembers(members) {
    const tbody = document.getElementById('membersTable');
    if (!members.length) {
        tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">👥</div><h3>No members found</h3></div></td></tr>';
        return;
    }
    tbody.innerHTML = members.map(m => `
        <tr>
            <td><code style="font-size:11px;background:#f1f5f9;padding:2px 6px;border-radius:4px">${m.memberId}</code></td>
            <td><strong>${m.name}</strong></td>
            <td>${m.email}</td>
            <td>${m.phone}</td>
            <td>${statusBadge(m.membershipType)}</td>
            <td>${formatDate(m.registrationDate)}</td>
            <td>${formatDate(m.membershipExpiry)}</td>
            <td>${statusBadge(m.status)}</td>
            <td>
                <div style="display:flex;gap:5px">
                    <button class="btn btn-outline btn-sm btn-icon" title="Edit" onclick="editMember(${m.id})">✏️</button>
                    <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="deleteMember(${m.id})">🗑</button>
                </div>
            </td>
        </tr>`).join('');
}

function filterMembers() {
    const q = document.getElementById('memberSearch').value.toLowerCase();
    renderMembers(allMembers.filter(m =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.memberId.toLowerCase().includes(q)
    ));
}

function openAddMember() {
    document.getElementById('memberModalTitle').textContent = 'Add New Member';
    document.getElementById('memberId_field').value = '';
    ['memberName', 'memberEmail', 'memberPhone', 'memberPassword', 'memberAddress'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('memberType').value = 'STUDENT';
    document.getElementById('memberStatus').value = 'ACTIVE';
    openModal('memberModal');
}

function editMember(id) {
    const m = DB.users.find(x => x.id === id);
    if (!m) return;
    document.getElementById('memberModalTitle').textContent = 'Edit Member';
    document.getElementById('memberId_field').value = m.id;
    document.getElementById('memberName').value = m.name;
    document.getElementById('memberEmail').value = m.email;
    document.getElementById('memberPhone').value = m.phone;
    document.getElementById('memberType').value = m.membershipType;
    document.getElementById('memberStatus').value = m.status;
    document.getElementById('memberAddress').value = m.address || '';
    document.getElementById('memberPassword').value = '(unchanged)';
    openModal('memberModal');
}

function saveMember() {
    const id = document.getElementById('memberId_field').value;
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const phone = document.getElementById('memberPhone').value.trim();
    const type = document.getElementById('memberType').value;
    const status = document.getElementById('memberStatus').value;
    const address = document.getElementById('memberAddress').value.trim();
    const password = document.getElementById('memberPassword').value;

    if (!name || !email || !phone) { showToast('Please fill in all required fields', 'error'); return; }

    if (id) {
        const idx = DB.users.findIndex(u => u.id == id);
        DB.users[idx] = { ...DB.users[idx], name, email, phone, membershipType: type, status, address };
        showToast('Member updated!', 'success');
    } else {
        const memberId = 'MEM' + String(DB.nextUserId).padStart(3, '0');
        const today_ = today();
        const expiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
        DB.users.push({ id: DB.nextUserId++, memberId, name, email, phone, address, membershipType: type, registrationDate: today_, membershipExpiry: expiry, status, password: password || 'member123', role: 'MEMBER' });
        showToast(`Member added! ID: ${memberId}`, 'success');
    }
    closeModal('memberModal');
    loadMembers();
}

function deleteMember(id) {
    const m = DB.users.find(x => x.id === id);
    if (!m) return;
    if (!confirm(`Delete member "${m.name}"?`)) return;
    const active = DB.transactions.find(t => t.userId === id && t.status === 'ISSUED');
    if (active) { showToast('Cannot delete — member has active book issues!', 'error'); return; }
    DB.users = DB.users.filter(x => x.id !== id);
    showToast('Member deleted', 'success');
    loadMembers();
}

// ============ ISSUE BOOK ============
function loadIssueSection() {
    document.getElementById('issueDate').value = today();
    document.getElementById('issueDueDate').value = dueDate14();

    const memberSel = document.getElementById('issueMember');
    memberSel.innerHTML = '<option value="">-- Select Member --</option>' +
        DB.users.filter(u => u.role === 'MEMBER' && u.status === 'ACTIVE')
            .map(u => `<option value="${u.id}">${u.name} (${u.memberId})</option>`).join('');

    const bookSel = document.getElementById('issueBook');
    bookSel.innerHTML = '<option value="">-- Select Book --</option>' +
        DB.books.filter(b => b.availableCopies > 0)
            .map(b => `<option value="${b.id}">${b.title} by ${b.author} [${b.availableCopies} available]</option>`).join('');

    // Issued books
    const issued = DB.transactions.filter(t => t.status === 'ISSUED');
    const tbody = document.getElementById('issuedBooksTable');
    tbody.innerHTML = issued.length ? issued.map(t => {
        const days = daysBetween(today(), t.dueDate);
        const daysText = days >= 0 ? `<span style="color:var(--success)">${days}d left</span>` : `<span style="color:var(--danger)">${Math.abs(days)}d overdue</span>`;
        return `<tr class="${days < 0 ? 'overdue-row' : ''}">
            <td>${t.bookTitle}</td>
            <td>${t.userName}</td>
            <td>${formatDate(t.dueDate)}</td>
            <td>${daysText}</td>
        </tr>`;
    }).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8">No books currently issued</td></tr>';
}

function issueBook() {
    const userId = parseInt(document.getElementById('issueMember').value);
    const bookId = parseInt(document.getElementById('issueBook').value);
    const alertEl = document.getElementById('issueAlert');

    if (!userId || !bookId) {
        alertEl.innerHTML = '<div class="alert alert-error">Please select both a member and a book.</div>';
        return;
    }

    // Check if member already has this book
    const alreadyIssued = DB.transactions.find(t => t.userId === userId && t.bookId === bookId && t.status === 'ISSUED');
    if (alreadyIssued) {
        alertEl.innerHTML = '<div class="alert alert-error">This member already has this book issued!</div>';
        return;
    }

    const user = DB.users.find(u => u.id === userId);
    const book = DB.books.find(b => b.id === bookId);

    if (book.availableCopies <= 0) {
        alertEl.innerHTML = '<div class="alert alert-error">No copies available for this book!</div>';
        return;
    }

    const tx = { id: DB.nextTxId++, bookId, userId, bookTitle: book.title, userName: user.name, memberId: user.memberId, issueDate: today(), dueDate: dueDate14(), returnDate: null, status: 'ISSUED', fine: 0 };
    DB.transactions.push(tx);
    book.availableCopies--;

    alertEl.innerHTML = `<div class="alert alert-success">✅ Book "<strong>${book.title}</strong>" issued to <strong>${user.name}</strong>. Due: ${formatDate(dueDate14())}</div>`;
    showToast('Book issued successfully!', 'success');
    loadIssueSection();
}

// ============ RETURN BOOK ============
function loadReturnSection() {
    const sel = document.getElementById('returnTransaction');
    const issued = DB.transactions.filter(t => t.status === 'ISSUED');
    sel.innerHTML = '<option value="">-- Select Issued Book --</option>' +
        issued.map(t => `<option value="${t.id}">${t.bookTitle} — ${t.userName} (Due: ${formatDate(t.dueDate)})</option>`).join('');
    sel.addEventListener('change', updateReturnDetails);
    document.getElementById('returnDetails').style.display = 'none';
}

function updateReturnDetails() {
    const id = parseInt(document.getElementById('returnTransaction').value);
    const t = DB.transactions.find(x => x.id === id);
    const panel = document.getElementById('returnDetails');
    if (!t) { panel.style.display = 'none'; return; }

    const fine = calcFine(t.dueDate, null);
    document.getElementById('rd-book').textContent = t.bookTitle;
    document.getElementById('rd-member').textContent = `${t.userName} (${t.memberId})`;
    document.getElementById('rd-issue').textContent = formatDate(t.issueDate);
    document.getElementById('rd-due').textContent = formatDate(t.dueDate);
    document.getElementById('rd-return').textContent = formatDate(today());
    const fineEl = document.getElementById('rd-fine');
    fineEl.textContent = fine > 0 ? `₹${fine} (OVERDUE)` : '₹0 (No fine)';
    fineEl.style.color = fine > 0 ? 'var(--danger)' : 'var(--success)';
    panel.style.display = 'block';
}

function returnBook() {
    const id = parseInt(document.getElementById('returnTransaction').value);
    const alertEl = document.getElementById('returnAlert');
    if (!id) { alertEl.innerHTML = '<div class="alert alert-error">Please select a transaction.</div>'; return; }

    const t = DB.transactions.find(x => x.id === id);
    if (!t) return;

    const fine = calcFine(t.dueDate, null);
    t.returnDate = today();
    t.status = fine > 0 ? 'OVERDUE' : 'RETURNED';
    t.fine = fine;

    const book = DB.books.find(b => b.id === t.bookId);
    if (book) book.availableCopies++;

    alertEl.innerHTML = `<div class="alert alert-success">✅ "<strong>${t.bookTitle}</strong>" returned by <strong>${t.userName}</strong>. Fine: ₹${fine}</div>`;
    showToast(`Book returned! Fine: ₹${fine}`, fine > 0 ? 'warning' : 'success');
    loadReturnSection();
}

// ============ TRANSACTIONS ============
function loadTransactions() {
    allTx = [...DB.transactions].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    renderTransactions(allTx);
}
let allTx = [];

function renderTransactions(txs) {
    const tbody = document.getElementById('txTable');
    tbody.innerHTML = txs.map((t, i) => {
        const fine = t.fine || calcFine(t.dueDate, t.returnDate);
        const status = t.status;
        return `<tr class="${status === 'OVERDUE' || (status === 'ISSUED' && new Date(t.dueDate) < new Date()) ? 'overdue-row' : ''}">
            <td>${i + 1}</td>
            <td><strong>${t.bookTitle}</strong></td>
            <td>${t.userName}<br><small style="color:var(--text-muted)">${t.memberId}</small></td>
            <td>${formatDate(t.issueDate)}</td>
            <td>${formatDate(t.dueDate)}</td>
            <td>${formatDate(t.returnDate)}</td>
            <td>${statusBadge(status === 'ISSUED' && new Date(t.dueDate) < new Date() ? 'OVERDUE' : status)}</td>
            <td class="${fine > 0 ? 'fine-amount' : ''}">${fine > 0 ? '₹' + fine : '—'}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8">No transactions</td></tr>';
}

function filterTransactions() {
    const q = document.getElementById('txSearch').value.toLowerCase();
    const st = document.getElementById('txStatus').value;
    renderTransactions(allTx.filter(t =>
        (!q || t.bookTitle.toLowerCase().includes(q) || t.userName.toLowerCase().includes(q) || t.memberId.toLowerCase().includes(q)) &&
        (!st || (st === 'OVERDUE' ? (t.status === 'ISSUED' && new Date(t.dueDate) < new Date()) : t.status === st))
    ));
}

// ============ OVERDUE ============
function loadOverdue() {
    const overdueList = DB.transactions.filter(t => t.status === 'ISSUED' && new Date(t.dueDate) < new Date());
    document.getElementById('overdueCount').textContent = overdueList.length + ' overdue';
    const tbody = document.getElementById('overdueTable');
    if (!overdueList.length) {
        tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🎉</div><h3>No overdue books!</h3><p>All books are returned on time</p></div></td></tr>';
        return;
    }
    tbody.innerHTML = overdueList.map((t, i) => {
        const daysOverdue = daysBetween(t.dueDate, today());
        const fine = daysOverdue * 2;
        return `<tr class="overdue-row">
            <td>${i + 1}</td>
            <td><strong>${t.bookTitle}</strong></td>
            <td>${t.userName}</td>
            <td><code style="font-size:11px;background:#fee2e2;padding:2px 6px;border-radius:4px">${t.memberId}</code></td>
            <td>${formatDate(t.dueDate)}</td>
            <td><span style="color:var(--danger);font-weight:700">${daysOverdue} days</span></td>
            <td class="fine-amount">₹${fine}</td>
            <td><button class="btn btn-success btn-sm" onclick="quickReturn(${t.id})">↩ Return</button></td>
        </tr>`;
    }).join('');
}

function quickReturn(txId) {
    document.getElementById('returnTransaction').value = txId;
    showSection('return');
    setTimeout(updateReturnDetails, 100);
}

// ============ FINES ============
function loadFines() {
    const withFine = DB.transactions.filter(t => t.fine > 0 || (t.status === 'ISSUED' && new Date(t.dueDate) < new Date()));
    const totalCollected = DB.transactions.filter(t => t.status !== 'ISSUED').reduce((a, t) => a + t.fine, 0);
    const pendingFine = DB.transactions.filter(t => t.status === 'ISSUED' && new Date(t.dueDate) < new Date()).reduce((a, t) => a + calcFine(t.dueDate, null), 0);

    document.getElementById('totalFines').textContent = '₹' + totalCollected;
    document.getElementById('pendingFines').textContent = '₹' + pendingFine;

    const tbody = document.getElementById('finesTable');
    const fineRecords = DB.transactions.filter(t => t.fine > 0 || (t.status === 'ISSUED' && new Date(t.dueDate) < new Date()));
    if (!fineRecords.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#94a3b8">No fine records</td></tr>';
        return;
    }
    tbody.innerHTML = fineRecords.map((t, i) => {
        const fine = t.fine || calcFine(t.dueDate, null);
        const daysLate = t.returnDate ? daysBetween(t.dueDate, t.returnDate) : daysBetween(t.dueDate, today());
        return `<tr>
            <td>${i + 1}</td>
            <td>${t.bookTitle}</td>
            <td>${t.userName}</td>
            <td>${formatDate(t.dueDate)}</td>
            <td>${formatDate(t.returnDate)}</td>
            <td>${Math.max(0, daysLate)}</td>
            <td class="fine-amount">₹${fine}</td>
            <td>${statusBadge(t.status)}</td>
        </tr>`;
    }).join('');
}

// ============ INIT ============
loadDashboard();
