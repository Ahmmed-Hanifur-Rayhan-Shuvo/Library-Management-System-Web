// ===== LIBRARIAN SPECIFIC FUNCTIONALITY =====

class LibrarianManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.database = dashboard.database;
        this.currentUser = dashboard.currentUser;
        
        this.initLibrarian();
    }

    initLibrarian() {
        // Load librarian-specific data
        this.loadLibrarianStats();
        this.loadSystemReports();
        
        // Initialize librarian event listeners
        this.initLibrarianEventListeners();
        
        // Initialize data tables
        this.initDataTables();
    }

    loadLibrarianStats() {
        // Get all data for statistics
        const books = this.database.viewBooks();
        const students = this.database.getAllStudents();
        const faculty = this.database.getAllFaculty();
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        
        // Calculate statistics
        const totalBooks = books.length;
        const availableBooks = books.filter(b => b.available === "True").length;
        const totalUsers = students.length + faculty.length;
        const activeBorrows = borrows.length;
        const today = new Date().toISOString().split('T')[0];
        const todayTransactions = transactions.filter(t => 
            t.transaction_date === this.formatDateForDisplay(today)
        ).length;
        
        // Update UI
        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('availableBooks').textContent = availableBooks;
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeBorrows').textContent = activeBorrows;
        document.getElementById('todayTransactions').textContent = todayTransactions;
    }

    loadSystemReports() {
        // Load recent transactions
        this.loadRecentTransactions();
        
        // Load popular books
        this.loadPopularBooks();
        
        // Load overdue books
        this.loadOverdueBooks();
    }

    loadRecentTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.transaction_date.split('-').reverse().join('-')) - 
                          new Date(a.transaction_date.split('-').reverse().join('-')))
            .slice(0, 10);
        
        const container = document.getElementById('recentTransactions');
        if (!container) return;
        
        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <p>No transactions yet</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="transactions-list">';
        recentTransactions.forEach(transaction => {
            const userType = transaction.user_id.startsWith('S') ? 'Student' : 
                           transaction.user_id.startsWith('F') ? 'Faculty' : 'User';
            const action = transaction.type === 'b' ? 'Borrowed' : 'Returned';
            const actionClass = transaction.type === 'b' ? 'borrow' : 'return';
            
            html += `
                <div class="transaction-item">
                    <div class="transaction-icon ${actionClass}">
                        <i class="fas fa-${transaction.type === 'b' ? 'book-open' : 'arrow-rotate-left'}"></i>
                    </div>
                    <div class="transaction-details">
                        <p><strong>${userType} ${transaction.user_id}</strong> ${action} Book ${transaction.book_id}</p>
                        <small>${transaction.transaction_date}</small>
                    </div>
                    <span class="transaction-id">${transaction.transaction_id}</span>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    loadPopularBooks() {
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        const bookCounts = {};
        
        // Count borrows per book
        borrows.forEach(borrow => {
            bookCounts[borrow.book_id] = (bookCounts[borrow.book_id] || 0) + 1;
        });
        
        // Get top 5 books
        const popularBooks = Object.entries(bookCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([bookId, count]) => {
                const book = this.database.getBookById(bookId);
                return { ...book, borrowCount: count };
            });
        
        const container = document.getElementById('popularBooks');
        if (!container) return;
        
        if (popularBooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>No borrowing data yet</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="popular-books-list">';
        popularBooks.forEach((book, index) => {
            const percentage = (book.borrowCount / Math.max(...popularBooks.map(b => b.borrowCount))) * 100;
            
            html += `
                <div class="popular-book-item">
                    <div class="book-rank">${index + 1}</div>
                    <div class="book-info">
                        <h5>${book.title}</h5>
                        <p>${book.author} | ID: ${book.book_id}</p>
                    </div>
                    <div class="borrow-stats">
                        <div class="borrow-count">${book.borrowCount} borrows</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    loadOverdueBooks() {
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        const overdueBooks = [];
        
        borrows.forEach(borrow => {
            const userType = borrow.user_id.startsWith('S') ? 'student' : 'faculty';
            const fine = this.database.calculateFine(borrow.borrow_date, userType);
            
            if (fine > 0) {
                const book = this.database.getBookById(borrow.book_id);
                if (book) {
                    overdueBooks.push({
                        ...borrow,
                        ...book,
                        fine: fine,
                        userType: userType
                    });
                }
            }
        });
        
        const container = document.getElementById('overdueBooks');
        if (!container) return;
        
        if (overdueBooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No overdue books</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="overdue-books-list">';
        overdueBooks.forEach(book => {
            html += `
                <div class="overdue-book-item">
                    <div class="overdue-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="overdue-details">
                        <h5>${book.title}</h5>
                        <p>Borrowed by: ${book.user_id} (${book.userType})</p>
                        <p>Borrowed: ${book.borrow_date} | Fine: Rs. ${book.fine}</p>
                    </div>
                    <div class="overdue-actions">
                        <button class="btn btn-sm btn-warning" onclick="librarianManager.sendReminder('${book.user_id}', '${book.book_id}')">
                            <i class="fas fa-bell"></i> Remind
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    initLibrarianEventListeners() {
        // Add book form
        const addBookForm = document.getElementById('addBookForm');
        if (addBookForm) {
            addBookForm.addEventListener('submit', (e) => this.handleAddBook(e));
        }
        
        // Update book form
        const updateBookForm = document.getElementById('updateBookForm');
        if (updateBookForm) {
            updateBookForm.addEventListener('submit', (e) => this.handleUpdateBook(e));
        }
        
        // Search books
        const searchBooksInput = document.getElementById('searchBooks');
        if (searchBooksInput) {
            searchBooksInput.addEventListener('input', (e) => this.searchBooks(e.target.value));
        }
        
        // Generate reports
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
        
        // Export data buttons
        const exportBooksBtn = document.getElementById('exportBooksBtn');
        if (exportBooksBtn) {
            exportBooksBtn.addEventListener('click', () => this.exportBooksData());
        }
        
        const exportUsersBtn = document.getElementById('exportUsersBtn');
        if (exportUsersBtn) {
            exportUsersBtn.addEventListener('click', () => this.exportUsersData());
        }
    }

    handleAddBook(e) {
        e.preventDefault();
        
        const bookData = {
            title: document.getElementById('bookTitle').value.trim(),
            author: document.getElementById('bookAuthor').value.trim(),
            publisher: document.getElementById('bookPublisher').value.trim(),
            publish_date: document.getElementById('bookPublishDate').value.trim(),
            copies: document.getElementById('bookCopies').value.trim() || "1"
        };
        
        if (!bookData.title || !bookData.author) {
            showNotification('Title and Author are required', 'error');
            return;
        }
        
        const newBook = this.database.addBook(bookData);
        
        showNotification(`Book added successfully! Book ID: ${newBook.book_id}`, 'success');
        
        // Clear form
        document.getElementById('addBookForm').reset();
        this.dashboard.hideModal('addBookModal');
        
        // Refresh data
        this.dashboard.loadAllBooksForManagement();
        this.loadLibrarianStats();
    }

    handleUpdateBook(e) {
        e.preventDefault();
        
        const bookId = document.getElementById('editBookId').value;
        const updatedData = {
            title: document.getElementById('editTitle').value.trim(),
            author: document.getElementById('editAuthor').value.trim(),
            publisher: document.getElementById('editPublisher').value.trim(),
            publish_date: document.getElementById('editPublishDate').value.trim(),
            copies: document.getElementById('editCopies').value.trim()
        };
        
        if (!updatedData.title || !updatedData.author) {
            showNotification('Title and Author are required', 'error');
            return;
        }
        
        if (this.database.updateBook(bookId, updatedData)) {
            showNotification('Book updated successfully', 'success');
            this.dashboard.hideModal('editBookModal');
            this.dashboard.loadAllBooksForManagement();
        } else {
            showNotification('Failed to update book', 'error');
        }
    }

    searchBooks(searchTerm) {
        const books = this.database.viewBooks();
        const container = document.getElementById('allBooksContainer');
        
        if (!searchTerm) {
            this.dashboard.loadAllBooksForManagement();
            return;
        }
        
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.book_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.publisher.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filteredBooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No books found matching "${searchTerm}"</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Publisher</th>
                        <th>Copies</th>
                        <th>Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        filteredBooks.forEach(book => {
            html += `
                <tr>
                    <td>${book.book_id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.publisher}</td>
                    <td>${book.copies}</td>
                    <td><span class="status ${book.available === 'True' ? 'available' : 'unavailable'}">
                        ${book.available === 'True' ? 'Yes' : 'No'}
                    </span></td>
                    <td>
                        <button class="btn btn-sm btn-edit" onclick="dashboard.editBook('${book.book_id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="dashboard.deleteBook('${book.book_id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }

    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        if (!startDate || !endDate) {
            showNotification('Please select date range', 'error');
            return;
        }
        
        // Generate report based on type
        let reportData = {};
        let reportTitle = '';
        
        switch(reportType) {
            case 'borrowing':
                reportData = this.generateBorrowingReport(startDate, endDate);
                reportTitle = 'Borrowing Report';
                break;
            case 'fines':
                reportData = this.generateFinesReport(startDate, endDate);
                reportTitle = 'Fines Report';
                break;
            case 'inventory':
                reportData = this.generateInventoryReport();
                reportTitle = 'Inventory Report';
                break;
            case 'users':
                reportData = this.generateUsersReport();
                reportTitle = 'Users Report';
                break;
        }
        
        // Display report
        this.displayReport(reportData, reportTitle, startDate, endDate);
    }

    generateBorrowingReport(startDate, endDate) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const filteredTransactions = transactions.filter(t => {
            const transDate = new Date(t.transaction_date.split('-').reverse().join('-'));
            const start = new Date(startDate);
            const end = new Date(endDate);
            return transDate >= start && transDate <= end;
        });
        
        const borrows = filteredTransactions.filter(t => t.type === 'b');
        const returns = filteredTransactions.filter(t => t.type === 'r');
        
        return {
            totalTransactions: filteredTransactions.length,
            totalBorrows: borrows.length,
            totalReturns: returns.length,
            transactions: filteredTransactions.slice(0, 50) // Limit for display
        };
    }

    generateFinesReport(startDate, endDate) {
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        let totalFines = 0;
        const fineDetails = [];
        
        borrows.forEach(borrow => {
            const userType = borrow.user_id.startsWith('S') ? 'student' : 'faculty';
            const fine = this.database.calculateFine(borrow.borrow_date, userType);
            
            if (fine > 0) {
                totalFines += fine;
                const book = this.database.getBookById(borrow.book_id);
                fineDetails.push({
                    user_id: borrow.user_id,
                    user_type: userType,
                    book_id: borrow.book_id,
                    book_title: book ? book.title : 'Unknown',
                    borrow_date: borrow.borrow_date,
                    fine: fine
                });
            }
        });
        
        return {
            totalFines: totalFines,
            totalOverdue: fineDetails.length,
            fineDetails: fineDetails.slice(0, 50)
        };
    }

    generateInventoryReport() {
        const books = this.database.viewBooks();
        const totalBooks = books.length;
        const availableBooks = books.filter(b => b.available === "True").length;
        const borrowedBooks = totalBooks - availableBooks;
        
        // Group by publisher
        const publishers = {};
        books.forEach(book => {
            publishers[book.publisher] = (publishers[book.publisher] || 0) + 1;
        });
        
        return {
            totalBooks: totalBooks,
            availableBooks: availableBooks,
            borrowedBooks: borrowedBooks,
            publishers: publishers,
            books: books.slice(0, 50)
        };
    }

    generateUsersReport() {
        const students = this.database.getAllStudents();
        const faculty = this.database.getAllFaculty();
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        
        // Calculate active users
        const activeUsers = [...new Set(borrows.map(b => b.user_id))].length;
        
        return {
            totalStudents: students.length,
            totalFaculty: faculty.length,
            totalUsers: students.length + faculty.length,
            activeUsers: activeUsers,
            students: students.slice(0, 50),
            faculty: faculty.slice(0, 50)
        };
    }

    displayReport(reportData, title, startDate, endDate) {
        let reportHtml = `
            <div class="report-header">
                <h3>${title}</h3>
                <p>Period: ${startDate} to ${endDate}</p>
                <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
        `;
        
        // Add summary based on report type
        if (title.includes('Borrowing')) {
            reportHtml += `
                <div class="report-summary">
                    <div class="summary-item">
                        <h4>${reportData.totalTransactions}</h4>
                        <p>Total Transactions</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.totalBorrows}</h4>
                        <p>Books Borrowed</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.totalReturns}</h4>
                        <p>Books Returned</p>
                    </div>
                </div>
            `;
        } else if (title.includes('Fines')) {
            reportHtml += `
                <div class="report-summary">
                    <div class="summary-item">
                        <h4>Rs. ${reportData.totalFines}</h4>
                        <p>Total Fines</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.totalOverdue}</h4>
                        <p>Overdue Books</p>
                    </div>
                </div>
            `;
        } else if (title.includes('Inventory')) {
            reportHtml += `
                <div class="report-summary">
                    <div class="summary-item">
                        <h4>${reportData.totalBooks}</h4>
                        <p>Total Books</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.availableBooks}</h4>
                        <p>Available Books</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.borrowedBooks}</h4>
                        <p>Borrowed Books</p>
                    </div>
                </div>
            `;
        } else if (title.includes('Users')) {
            reportHtml += `
                <div class="report-summary">
                    <div class="summary-item">
                        <h4>${reportData.totalUsers}</h4>
                        <p>Total Users</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.totalStudents}</h4>
                        <p>Students</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.totalFaculty}</h4>
                        <p>Faculty</p>
                    </div>
                    <div class="summary-item">
                        <h4>${reportData.activeUsers}</h4>
                        <p>Active Users</p>
                    </div>
                </div>
            `;
        }
        
        // Add detailed data table
        if (reportData.transactions || reportData.fineDetails || reportData.books || reportData.students) {
            reportHtml += '<div class="report-details"><h4>Detailed Data</h4>';
            
            // Add appropriate table based on report type
            if (title.includes('Borrowing') && reportData.transactions) {
                reportHtml += this.generateTransactionTable(reportData.transactions);
            } else if (title.includes('Fines') && reportData.fineDetails) {
                reportHtml += this.generateFinesTable(reportData.fineDetails);
            } else if (title.includes('Inventory') && reportData.books) {
                reportHtml += this.generateBooksTable(reportData.books);
            } else if (title.includes('Users') && reportData.students) {
                reportHtml += this.generateUsersTable([...reportData.students, ...reportData.faculty]);
            }
            
            reportHtml += '</div>';
        }
        
        document.getElementById('reportContent').innerHTML = reportHtml;
        this.dashboard.showModal('reportModal');
    }

    generateTransactionTable(transactions) {
        let html = '<table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Book</th><th>Date</th><th>Type</th></tr></thead><tbody>';
        
        transactions.forEach(trans => {
            html += `
                <tr>
                    <td>${trans.transaction_id}</td>
                    <td>${trans.user_id}</td>
                    <td>${trans.book_id}</td>
                    <td>${trans.transaction_date}</td>
                    <td><span class="transaction-type ${trans.type}">${trans.type === 'b' ? 'Borrow' : 'Return'}</span></td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }

    generateFinesTable(fineDetails) {
        let html = '<table class="data-table"><thead><tr><th>User</th><th>User Type</th><th>Book</th><th>Borrow Date</th><th>Fine</th></tr></thead><tbody>';
        
        fineDetails.forEach(fine => {
            html += `
                <tr>
                    <td>${fine.user_id}</td>
                    <td>${fine.user_type}</td>
                    <td>${fine.book_title} (${fine.book_id})</td>
                    <td>${fine.borrow_date}</td>
                    <td>Rs. ${fine.fine}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }

    generateBooksTable(books) {
        let html = '<table class="data-table"><thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Publisher</th><th>Copies</th><th>Available</th></tr></thead><tbody>';
        
        books.forEach(book => {
            html += `
                <tr>
                    <td>${book.book_id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.publisher}</td>
                    <td>${book.copies}</td>
                    <td><span class="status ${book.available === 'True' ? 'available' : 'unavailable'}">${book.available === 'True' ? 'Yes' : 'No'}</span></td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }

    generateUsersTable(users) {
        let html = '<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Department</th><th>Registration Date</th></tr></thead><tbody>';
        
        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.student_id || user.faculty_id || user.librarian_id}</td>
                    <td>${user.name}</td>
                    <td>${user.student_id ? 'Student' : user.faculty_id ? 'Faculty' : 'Librarian'}</td>
                    <td>${user.department || 'N/A'}</td>
                    <td>${user.registration_date}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }

    exportBooksData() {
        const books = this.database.viewBooks();
        this.exportToCSV(books, 'books_export.csv');
    }

    exportUsersData() {
        const students = this.database.getAllStudents();
        const faculty = this.database.getAllFaculty();
        const users = [
            ...students.map(s => ({ ...s, type: 'Student' })),
            ...faculty.map(f => ({ ...f, type: 'Faculty' }))
        ];
        this.exportToCSV(users, 'users_export.csv');
    }

    exportToCSV(data, filename) {
        if (data.length === 0) {
            showNotification('No data to export', 'info');
            return;
        }
        
        // Convert to CSV
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showNotification(`Data exported to ${filename}`, 'success');
    }

    sendReminder(userId, bookId) {
        // In a real system, this would send an email or notification
        showNotification(`Reminder sent to ${userId} for book ${bookId}`, 'success');
    }

    formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    initDataTables() {
        // Initialize any advanced table functionality here
        // Could integrate with DataTables.js or similar library
    }
}

// Initialize librarian manager when dashboard is ready
if (typeof dashboard !== 'undefined' && dashboard.userType === 'librarian') {
    const librarianManager = new LibrarianManager(dashboard);
}