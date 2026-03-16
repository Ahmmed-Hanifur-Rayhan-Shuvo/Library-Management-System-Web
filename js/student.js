// ===== STUDENT SPECIFIC FUNCTIONALITY =====

class StudentManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.database = dashboard.database;
        this.currentUser = dashboard.currentUser;
        
        this.initStudent();
    }

    initStudent() {
        // Load student-specific data
        this.loadStudentStats();
        this.loadRecentActivity();
        
        // Initialize student event listeners
        this.initStudentEventListeners();
    }

    loadStudentStats() {
        const userId = this.currentUser.student_id;
        const borrowedBooks = this.database.getBorrowedBooks(userId);
        
        // Update quick stats
        document.getElementById('borrowedCount').textContent = borrowedBooks.length;
        document.getElementById('totalBorrowed').textContent = borrowedBooks.length;
        
        // Calculate due soon
        const dueSoon = borrowedBooks.filter(book => {
            const borrowDate = new Date(book.borrow_date.split('-').reverse().join('-'));
            const daysHeld = Math.floor((new Date() - borrowDate) / (1000 * 60 * 60 * 24));
            return daysHeld >= 10 && daysHeld < 14; // Due in next 4 days
        }).length;
        
        document.getElementById('dueSoon').textContent = dueSoon;
        
        // Calculate total fines
        let totalFine = 0;
        borrowedBooks.forEach(book => {
            totalFine += this.database.calculateFine(book.borrow_date, 'student');
        });
        
        document.getElementById('totalFine').textContent = `Rs. ${totalFine}`;
        document.getElementById('currentFine').textContent = `Rs. ${totalFine}`;
        
        // Calculate books returned (from transactions)
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const returnCount = transactions.filter(t => 
            t.user_id === userId && t.type === 'r'
        ).length;
        
        document.getElementById('totalReturns').textContent = returnCount;
    }

    loadRecentActivity() {
        const userId = this.currentUser.student_id;
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const userTransactions = transactions
            .filter(t => t.user_id === userId)
            .sort((a, b) => new Date(b.transaction_date.split('-').reverse().join('-')) - 
                          new Date(a.transaction_date.split('-').reverse().join('-')))
            .slice(0, 5); // Last 5 transactions
        
        const container = document.getElementById('recentActivity');
        
        if (userTransactions.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        userTransactions.forEach(transaction => {
            const book = this.database.getBookById(transaction.book_id);
            if (book) {
                const action = transaction.type === 'b' ? 'borrowed' : 'returned';
                const icon = transaction.type === 'b' ? 'fa-book-open' : 'fa-arrow-rotate-left';
                const color = transaction.type === 'b' ? 'var(--accent-green)' : 'var(--accent-blue)';
                
                html += `
                    <div class="activity-item">
                        <i class="fas ${icon}" style="color: ${color};"></i>
                        <div class="activity-details">
                            <p><strong>${action.charAt(0).toUpperCase() + action.slice(1)}</strong> "${book.title}"</p>
                            <small>${transaction.transaction_date}</small>
                        </div>
                    </div>
                `;
            }
        });
        
        container.innerHTML = html;
    }

    initStudentEventListeners() {
        // Borrow book form
        const borrowForm = document.getElementById('borrowBookForm');
        if (borrowForm) {
            borrowForm.addEventListener('submit', (e) => this.handleBorrowForm(e));
        }
        
        // Return book form
        const returnForm = document.getElementById('returnBookForm');
        if (returnForm) {
            returnForm.addEventListener('submit', (e) => this.handleReturnForm(e));
        }
        
        // Edit profile
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        }
        
        // Update profile
        const updateProfileBtn = document.getElementById('updateProfileBtn');
        if (updateProfileBtn) {
            updateProfileBtn.addEventListener('click', () => this.updateProfile());
        }
    }

    handleBorrowForm(e) {
        e.preventDefault();
        const bookId = document.getElementById('borrowBookId').value.trim();
        
        if (!bookId) {
            showNotification('Please enter a Book ID', 'error');
            return;
        }
        
        this.dashboard.borrowBook(bookId);
        document.getElementById('borrowBookId').value = '';
    }

    handleReturnForm(e) {
        e.preventDefault();
        const bookId = document.getElementById('returnBookId').value.trim();
        
        if (!bookId) {
            showNotification('Please enter a Book ID', 'error');
            return;
        }
        
        this.dashboard.returnBook(bookId);
        document.getElementById('returnBookId').value = '';
    }

    showEditProfileModal() {
        // Populate form with current user data
        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editRollNumber').value = this.currentUser.roll_number;
        document.getElementById('editBatch').value = this.currentUser.batch;
        document.getElementById('editSemester').value = this.currentUser.semester;
        document.getElementById('editDepartment').value = this.currentUser.department;
        
        this.dashboard.showModal('editProfileModal');
    }

    updateProfile() {
        const updatedData = {
            name: document.getElementById('editName').value.trim(),
            roll_number: document.getElementById('editRollNumber').value.trim(),
            batch: document.getElementById('editBatch').value.trim(),
            semester: document.getElementById('editSemester').value.trim(),
            department: document.getElementById('editDepartment').value.trim()
        };
        
        // Validate
        if (!updatedData.name || !updatedData.roll_number) {
            showNotification('Name and Roll Number are required', 'error');
            return;
        }
        
        // Update in database
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const studentIndex = students.findIndex(s => s.student_id === this.currentUser.student_id);
        
        if (studentIndex !== -1) {
            students[studentIndex] = {
                ...students[studentIndex],
                ...updatedData
            };
            
            localStorage.setItem('students', JSON.stringify(students));
            
            // Update current user in localStorage
            const updatedUser = students[studentIndex];
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Refresh dashboard
            this.dashboard.currentUser = updatedUser;
            this.dashboard.updateUserInfo();
            this.loadStudentStats();
            
            showNotification('Profile updated successfully', 'success');
            this.dashboard.hideModal('editProfileModal');
        }
    }

    // Book search functionality
    searchBooks(searchTerm) {
        const books = this.database.viewBooks();
        const container = document.getElementById('availableBooksContainer');
        
        if (!searchTerm) {
            this.dashboard.loadAvailableBooks();
            return;
        }
        
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.book_id.toLowerCase().includes(searchTerm.toLowerCase())
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
        
        let html = '<div class="books-grid">';
        filteredBooks.forEach(book => {
            if (book.available === "True") {
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
            }
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // Export borrowed books to CSV
    exportBorrowedBooks() {
        const userId = this.currentUser.student_id;
        const borrowedBooks = this.database.getBorrowedBooks(userId);
        
        if (borrowedBooks.length === 0) {
            showNotification('No books to export', 'info');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Book ID,Title,Author,Borrow Date,Fine\n";
        
        borrowedBooks.forEach(book => {
            const fine = this.database.calculateFine(book.borrow_date, 'student');
            csvContent += `${book.book_id},"${book.title}","${book.author}",${book.borrow_date},${fine}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `borrowed_books_${this.currentUser.student_id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Borrowed books exported successfully', 'success');
    }

    // Request book extension
    requestExtension(bookId) {
        const borrowedBooks = this.database.getBorrowedBooks(this.currentUser.student_id);
        const book = borrowedBooks.find(b => b.book_id === bookId);
        
        if (!book) {
            showNotification('Book not found in your borrowed list', 'error');
            return;
        }
        
        // Check if already extended
        if (book.extended) {
            showNotification('This book has already been extended once', 'warning');
            return;
        }
        
        // Calculate current fine
        const currentFine = this.database.calculateFine(book.borrow_date, 'student');
        
        if (currentFine > 0) {
            showNotification('Please clear your fines before requesting extension', 'error');
            return;
        }
        
        // Mark as extended (in a real system, this would update the borrow date)
        showNotification('Extension request submitted. You get 7 additional days.', 'success');
        
        // Update the book to show as extended
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        const borrowIndex = borrows.findIndex(b => 
            b.user_id === this.currentUser.student_id && b.book_id === bookId
        );
        
        if (borrowIndex !== -1) {
            borrows[borrowIndex].extended = true;
            localStorage.setItem('borrows', JSON.stringify(borrows));
        }
    }

    // View book details
    viewBookDetails(bookId) {
        const book = this.database.getBookById(bookId);
        
        if (!book) {
            showNotification('Book not found', 'error');
            return;
        }
        
        const modalContent = `
            <div class="book-details-modal">
                <div class="book-detail-header">
                    <h3>${book.title}</h3>
                    <span class="book-id">ID: ${book.book_id}</span>
                </div>
                <div class="book-detail-content">
                    <div class="detail-row">
                        <span class="detail-label">Author:</span>
                        <span class="detail-value">${book.author}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Publisher:</span>
                        <span class="detail-value">${book.publisher}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Publish Date:</span>
                        <span class="detail-value">${book.publish_date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Available Copies:</span>
                        <span class="detail-value ${book.available === 'True' ? 'available' : 'unavailable'}">
                            ${book.copies} (${book.available === 'True' ? 'Available' : 'Not Available'})
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status ${book.available === 'True' ? 'available' : 'unavailable'}">
                            ${book.available === 'True' ? 'Available for Borrowing' : 'Currently Unavailable'}
                        </span>
                    </div>
                </div>
                <div class="book-detail-actions">
                    ${book.available === 'True' ? `
                        <button class="btn btn-primary" onclick="dashboard.borrowBook('${book.book_id}')">
                            <i class="fas fa-book-open"></i> Borrow This Book
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="dashboard.hideModal('bookDetailsModal')">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('bookDetailsContent').innerHTML = modalContent;
        this.dashboard.showModal('bookDetailsModal');
    }
}

// Initialize student manager when dashboard is ready
if (typeof dashboard !== 'undefined') {
    const studentManager = new StudentManager(dashboard);
    
    // Add search functionality
    const searchInput = document.getElementById('bookSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            studentManager.searchBooks(e.target.value);
        });
    }
}