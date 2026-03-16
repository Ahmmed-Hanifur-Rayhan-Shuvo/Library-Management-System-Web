// ===== DASHBOARD MODULE =====

class DashboardManager {
    constructor() {
        this.database = database;
        this.authManager = authManager;
        this.currentUser = null;
        this.userType = null;
        
        this.initDashboard();
    }

    initDashboard() {
        // Check authentication
        const authData = this.authManager.checkAuth();
        if (!authData) return;
        
        this.currentUser = authData.user;
        this.userType = authData.type;
        
        // Load dashboard based on user type
        this.loadDashboard();
        
        // Initialize dashboard components
        this.initComponents();
    }

    loadDashboard() {
        // Update user info in dashboard
        this.updateUserInfo();
        
        // Load appropriate data
        switch(this.userType) {
            case 'student':
                this.loadStudentDashboard();
                break;
            case 'faculty':
                this.loadFacultyDashboard();
                break;
            case 'librarian':
                this.loadLibrarianDashboard();
                break;
        }
    }

    updateUserInfo() {
        // Update welcome message
        const welcomeElement = document.getElementById('welcomeMessage');
        if (welcomeElement) {
            const nameField = this.userType === 'student' ? 'name' : 
                            this.userType === 'faculty' ? 'name' : 'name';
            welcomeElement.textContent = `Welcome, ${this.currentUser[nameField]}!`;
        }
        
        // Update user info details
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            let infoHtml = '';
            
            switch(this.userType) {
                case 'student':
                    infoHtml = `
                        Student ID: ${this.currentUser.student_id} | 
                        Roll: ${this.currentUser.roll_number} | 
                        Batch: ${this.currentUser.batch} | 
                        Semester: ${this.currentUser.semester} | 
                        Department: ${this.currentUser.department}
                    `;
                    break;
                case 'faculty':
                    infoHtml = `
                        Faculty ID: ${this.currentUser.faculty_id} | 
                        Department: ${this.currentUser.department}
                    `;
                    break;
                case 'librarian':
                    infoHtml = `
                        Librarian ID: ${this.currentUser.librarian_id} | 
                        Library Administrator
                    `;
                    break;
            }
            
            userInfoElement.innerHTML = infoHtml;
        }
    }

    initComponents() {
        // Initialize logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.authManager.logout());
        }
        
        // Initialize modal functionality
        this.initModals();
        
        // Initialize data tables
        this.initDataTables();
    }

    // ===== STUDENT DASHBOARD =====
    loadStudentDashboard() {
        // Load borrowed books
        this.loadBorrowedBooks();
        
        // Load available books
        this.loadAvailableBooks();
        
        // Initialize student-specific event listeners
        this.initStudentEvents();
    }

    initStudentEvents() {
        // Borrow book button
        const borrowBtn = document.getElementById('borrowBookBtn');
        if (borrowBtn) {
            borrowBtn.addEventListener('click', () => this.showBorrowModal());
        }
        
        // Return book button
        const returnBtn = document.getElementById('returnBookBtn');
        if (returnBtn) {
            returnBtn.addEventListener('click', () => this.showReturnModal());
        }
        
        // Check fines button
        const finesBtn = document.getElementById('checkFinesBtn');
        if (finesBtn) {
            finesBtn.addEventListener('click', () => this.showFinesModal());
        }
        
        // View books button
        const viewBooksBtn = document.getElementById('viewBooksBtn');
        if (viewBooksBtn) {
            viewBooksBtn.addEventListener('click', () => this.showAllBooksModal());
        }
        
        // Deregister button
        const deregisterBtn = document.getElementById('deregisterBtn');
        if (deregisterBtn) {
            deregisterBtn.addEventListener('click', () => this.deregisterStudent());
        }
    }

    // ===== FACULTY DASHBOARD =====
    loadFacultyDashboard() {
        // Load faculty-specific data
        this.loadBorrowedBooks();
        this.loadAvailableBooks();
        
        // Initialize faculty-specific events
        this.initFacultyEvents();
    }

    initFacultyEvents() {
        // Similar to student events but with faculty-specific functionality
        const borrowBtn = document.getElementById('borrowBookBtn');
        if (borrowBtn) {
            borrowBtn.addEventListener('click', () => this.showBorrowModal());
        }
        
        // Add manage courses button for faculty
        const coursesBtn = document.getElementById('manageCoursesBtn');
        if (coursesBtn) {
            coursesBtn.addEventListener('click', () => this.manageCourses());
        }
    }

    // ===== LIBRARIAN DASHBOARD =====
    loadLibrarianDashboard() {
        // Load all books for management
        this.loadAllBooksForManagement();
        
        // Load all users
        this.loadAllUsers();
        
        // Load statistics
        this.loadStatistics();
        
        // Initialize librarian events
        this.initLibrarianEvents();
    }

    initLibrarianEvents() {
        // Add book button
        const addBookBtn = document.getElementById('addBookBtn');
        if (addBookBtn) {
            addBookBtn.addEventListener('click', () => this.showAddBookModal());
        }
        
        // View users buttons
        const viewStudentsBtn = document.getElementById('viewStudentsBtn');
        if (viewStudentsBtn) {
            viewStudentsBtn.addEventListener('click', () => this.showUsersModal('students'));
        }
        
        const viewFacultyBtn = document.getElementById('viewFacultyBtn');
        if (viewFacultyBtn) {
            viewFacultyBtn.addEventListener('click', () => this.showUsersModal('faculty'));
        }
        
        const viewAllUsersBtn = document.getElementById('viewAllUsersBtn');
        if (viewAllUsersBtn) {
            viewAllUsersBtn.addEventListener('click', () => this.showUsersModal('all'));
        }
    }

    // ===== DATA LOADING FUNCTIONS =====
    loadBorrowedBooks() {
        const userId = this.currentUser[`${this.userType}_id`];
        const borrowedBooks = this.database.getBorrowedBooks(userId);
        
        const container = document.getElementById('borrowedBooksContainer');
        if (container) {
            if (borrowedBooks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <p>No books borrowed yet</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="books-grid">';
            borrowedBooks.forEach(book => {
                const fine = this.database.calculateFine(book.borrow_date, this.userType);
                html += `
                    <div class="book-card">
                        <div class="book-header">
                            <h4>${book.title}</h4>
                            <span class="book-id">ID: ${book.book_id}</span>
                        </div>
                        <div class="book-details">
                            <p><i class="fas fa-user-pen"></i> ${book.author}</p>
                            <p><i class="fas fa-calendar"></i> Borrowed: ${book.borrow_date}</p>
                            <p><i class="fas fa-money-bill-wave"></i> Fine: Rs. ${fine}</p>
                        </div>
                        <div class="book-actions">
                            <button class="btn btn-sm btn-return" onclick="dashboard.returnBook('${book.book_id}')">
                                <i class="fas fa-arrow-rotate-left"></i> Return
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    }

    loadAvailableBooks() {
        const books = this.database.viewBooks();
        const availableBooks = books.filter(book => book.available === "True");
        
        const container = document.getElementById('availableBooksContainer');
        if (container) {
            if (availableBooks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <p>No books available at the moment</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="books-grid">';
            availableBooks.forEach(book => {
                html += `
                    <div class="book-card">
                        <div class="book-header">
                            <h4>${book.title}</h4>
                            <span class="book-id">ID: ${book.book_id}</span>
                        </div>
                        <div class="book-details">
                            <p><i class="fas fa-user-pen"></i> ${book.author}</p>
                            <p><i class="fas fa-building"></i> ${book.publisher}</p>
                            <p><i class="fas fa-copy"></i> Copies: ${book.copies}</p>
                        </div>
                        <div class="book-actions">
                            <button class="btn btn-sm btn-borrow" onclick="dashboard.borrowBook('${book.book_id}')">
                                <i class="fas fa-book-open"></i> Borrow
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    }

    loadAllBooksForManagement() {
        const books = this.database.viewBooks();
        const container = document.getElementById('allBooksContainer');
        
        if (container) {
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
            
            books.forEach(book => {
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
    }

    loadAllUsers() {
        const students = this.database.getAllStudents();
        const faculty = this.database.getAllFaculty();
        const librarians = this.database.getAllLibrarians();
        
        // Update statistics
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalFaculty').textContent = faculty.length;
        document.getElementById('totalLibrarians').textContent = librarians.length;
        document.getElementById('totalUsers').textContent = students.length + faculty.length + librarians.length;
    }

    loadStatistics() {
        const books = this.database.viewBooks();
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        
        // Calculate statistics
        const totalBooks = books.length;
        const availableBooks = books.filter(b => b.available === "True").length;
        const totalTransactions = transactions.length;
        const activeBorrows = borrows.length;
        
        // Update UI
        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('availableBooks').textContent = availableBooks;
        document.getElementById('totalTransactions').textContent = totalTransactions;
        document.getElementById('activeBorrows').textContent = activeBorrows;
    }

    // ===== BOOK OPERATIONS =====
    borrowBook(bookId) {
        const userId = this.currentUser[`${this.userType}_id`];
        const result = this.database.borrowBook(userId, bookId, this.userType);
        
        if (result) {
            showNotification(`Book borrowed successfully! Transaction ID: ${result.transactionId}`, 'success');
            this.loadBorrowedBooks();
            this.loadAvailableBooks();
        } else {
            showNotification('Book is not available or invalid Book ID', 'error');
        }
    }

    returnBook(bookId) {
        const userId = this.currentUser[`${this.userType}_id`];
        const result = this.database.returnBook(userId, bookId);
        
        if (result) {
            showNotification(`Book returned successfully! Transaction ID: ${result.transactionId}`, 'success');
            this.loadBorrowedBooks();
            this.loadAvailableBooks();
        } else {
            showNotification('Book return failed', 'error');
        }
    }

    // ===== MODAL FUNCTIONS =====
    initModals() {
        // Close modals when clicking outside
        document.addEventListener('click', (event) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Close modals with escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showBorrowModal() {
        this.showModal('borrowModal');
    }

    showReturnModal() {
        this.showModal('returnModal');
    }

    showFinesModal() {
        const userId = this.currentUser[`${this.userType}_id`];
        const borrowedBooks = this.database.getBorrowedBooks(userId);
        
        if (borrowedBooks.length === 0) {
            showNotification('No books borrowed yet', 'info');
            return;
        }
        
        let finesHtml = '<div class="fines-list">';
        let totalFine = 0;
        
        borrowedBooks.forEach(book => {
            const fine = this.database.calculateFine(book.borrow_date, this.userType);
            totalFine += fine;
            
            finesHtml += `
                <div class="fine-item">
                    <h4>${book.title}</h4>
                    <p>Author: ${book.author}</p>
                    <p>Borrowed: ${book.borrow_date}</p>
                    <p class="fine-amount">Fine: Rs. ${fine}</p>
                </div>
            `;
        });
        
        finesHtml += `
            <div class="total-fine">
                <h3>Total Fine: Rs. ${totalFine}</h3>
            </div>
        `;
        
        document.getElementById('finesContent').innerHTML = finesHtml;
        this.showModal('finesModal');
    }

    showAllBooksModal() {
        this.showModal('allBooksModal');
    }

    showAddBookModal() {
        this.showModal('addBookModal');
    }

    showUsersModal(userType) {
        let users = [];
        let title = '';
        
        switch(userType) {
            case 'students':
                users = this.database.getAllStudents();
                title = 'All Students';
                break;
            case 'faculty':
                users = this.database.getAllFaculty();
                title = 'All Faculty';
                break;
            case 'all':
                users = [
                    ...this.database.getAllStudents().map(u => ({...u, type: 'Student'})),
                    ...this.database.getAllFaculty().map(u => ({...u, type: 'Faculty'}))
                ];
                title = 'All Users';
                break;
        }
        
        let usersHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        ${userType === 'all' ? '<th>Type</th>' : ''}
                        <th>ID</th>
                        <th>Name</th>
                        <th>${userType === 'students' ? 'Roll Number' : 'Department'}</th>
                        <th>Registration Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        users.forEach(user => {
            usersHtml += `
                <tr>
                    ${userType === 'all' ? `<td>${user.type}</td>` : ''}
                    <td>${user[`${userType === 'students' ? 'student' : 'faculty'}_id`] || user.librarian_id}</td>
                    <td>${user.name}</td>
                    <td>${userType === 'students' ? user.roll_number : user.department || 'N/A'}</td>
                    <td>${user.registration_date}</td>
                </tr>
            `;
        });
        
        usersHtml += `
                </tbody>
            </table>
        `;
        
        document.getElementById('usersModalTitle').textContent = title;
        document.getElementById('usersContent').innerHTML = usersHtml;
        this.showModal('usersModal');
    }

    // ===== OTHER FUNCTIONS =====
    deregisterStudent() {
        const hasBorrowedBooks = this.database.getBorrowedBooks(this.currentUser.student_id).length > 0;
        
        if (hasBorrowedBooks) {
            showNotification('Please return all borrowed books before de-registering', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to de-register your account? This action cannot be undone!')) {
            this.database.deregisterStudent(this.currentUser.student_id);
            showNotification('Account de-registered successfully', 'success');
            setTimeout(() => {
                this.authManager.logout();
            }, 1000);
        }
    }

    manageCourses() {
        showNotification('Course Management feature is under development', 'info');
    }

    addNewBook(formData) {
        const bookData = {
            title: formData.title,
            author: formData.author,
            publisher: formData.publisher || 'Unknown',
            publish_date: formData.publish_date || 'Unknown',
            available: "True",
            copies: formData.copies || "1"
        };
        
        const newBook = this.database.addBook(bookData);
        showNotification(`Book added successfully! Book ID: ${newBook.book_id}`, 'success');
        this.hideModal('addBookModal');
        this.loadAllBooksForManagement();
    }

    editBook(bookId) {
        const book = this.database.getBookById(bookId);
        if (book) {
            // Populate edit form
            document.getElementById('editBookId').value = book.book_id;
            document.getElementById('editTitle').value = book.title;
            document.getElementById('editAuthor').value = book.author;
            document.getElementById('editPublisher').value = book.publisher;
            document.getElementById('editPublishDate').value = book.publish_date;
            document.getElementById('editCopies').value = book.copies;
            
            this.showModal('editBookModal');
        }
    }

    updateBook() {
        const bookId = document.getElementById('editBookId').value;
        const updatedData = {
            title: document.getElementById('editTitle').value,
            author: document.getElementById('editAuthor').value,
            publisher: document.getElementById('editPublisher').value,
            publish_date: document.getElementById('editPublishDate').value,
            copies: document.getElementById('editCopies').value
        };
        
        if (this.database.updateBook(bookId, updatedData)) {
            showNotification('Book updated successfully', 'success');
            this.hideModal('editBookModal');
            this.loadAllBooksForManagement();
        } else {
            showNotification('Failed to update book', 'error');
        }
    }

    deleteBook(bookId) {
        if (confirm('Are you sure you want to delete this book?')) {
            const deletedBook = this.database.removeBook(bookId);
            if (deletedBook) {
                showNotification(`Book "${deletedBook.title}" deleted successfully`, 'success');
                this.loadAllBooksForManagement();
            }
        }
    }

    initDataTables() {
        // Initialize any data tables if needed
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(table => {
            // Add basic table functionality
            // Could integrate with a library like DataTables here
        });
    }
}

// Create global dashboard instance
let dashboard;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardManager();
});