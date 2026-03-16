// ===== MOCK DATABASE =====
// This simulates the database functionality from the Python project

class MockDatabase {
    constructor() {
        this.initDatabase();
    }

    initDatabase() {
        // Initialize localStorage with sample data if not exists
        if (!localStorage.getItem('books')) {
            this.addSampleBooks();
        }
        
        if (!localStorage.getItem('students')) {
            this.addSampleStudents();
        }
        
        if (!localStorage.getItem('faculty')) {
            this.addSampleFaculty();
        }
        
        if (!localStorage.getItem('librarians')) {
            this.addSampleLibrarians();
        }
        
        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('borrows')) {
            localStorage.setItem('borrows', JSON.stringify([]));
        }
    }

    // ===== BOOK MANAGEMENT =====
    addSampleBooks() {
        const sampleBooks = [
            {
                book_id: "1",
                title: "Python Programming",
                author: "John Smith",
                publisher: "Tech Publishers",
                publish_date: "15-05-2020",
                available: "True",
                copies: "5"
            },
            {
                book_id: "2",
                title: "Data Structures",
                author: "Jane Doe",
                publisher: "CS Publications",
                publish_date: "20-08-2019",
                available: "True",
                copies: "3"
            },
            {
                book_id: "3",
                title: "Algorithms",
                author: "Robert Brown",
                publisher: "Academic Press",
                publish_date: "10-01-2021",
                available: "True",
                copies: "4"
            },
            {
                book_id: "4",
                title: "Machine Learning",
                author: "Alice Johnson",
                publisher: "AI Books",
                publish_date: "25-03-2022",
                available: "True",
                copies: "2"
            },
            {
                book_id: "5",
                title: "Database Systems",
                author: "Michael Chen",
                publisher: "DB Press",
                publish_date: "12-11-2020",
                available: "True",
                copies: "3"
            },
            {
                book_id: "6",
                title: "Web Development",
                author: "Sarah Wilson",
                publisher: "Web Publishers",
                publish_date: "30-06-2021",
                available: "True",
                copies: "4"
            },
            {
                book_id: "7",
                title: "Artificial Intelligence",
                author: "David Lee",
                publisher: "AI Publications",
                publish_date: "15-09-2022",
                available: "True",
                copies: "2"
            },
            {
                book_id: "8",
                title: "Computer Networks",
                author: "Emily Davis",
                publisher: "Network Press",
                publish_date: "08-03-2020",
                available: "True",
                copies: "3"
            }
        ];
        localStorage.setItem('books', JSON.stringify(sampleBooks));
    }

    viewBooks() {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        return books;
    }

    getBookById(bookId) {
        const books = this.viewBooks();
        return books.find(book => book.book_id === bookId);
    }

    addBook(bookData) {
        const books = this.viewBooks();
        const lastId = Math.max(...books.map(b => parseInt(b.book_id)));
        bookData.book_id = (lastId + 1).toString();
        books.push(bookData);
        localStorage.setItem('books', JSON.stringify(books));
        return bookData;
    }

    updateBook(bookId, updatedData) {
        const books = this.viewBooks();
        const index = books.findIndex(book => book.book_id === bookId);
        
        if (index !== -1) {
            books[index] = { ...books[index], ...updatedData };
            localStorage.setItem('books', JSON.stringify(books));
            return true;
        }
        return false;
    }

    removeBook(bookId) {
        const books = this.viewBooks();
        const bookToRemove = books.find(book => book.book_id === bookId);
        
        if (bookToRemove) {
            const updatedBooks = books.filter(book => book.book_id !== bookId);
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            return bookToRemove;
        }
        return null;
    }

    // ===== USER MANAGEMENT =====
    addSampleStudents() {
        const sampleStudents = [
            {
                student_id: "S1001",
                name: "John Doe",
                password: "password123",
                roll_number: "2023001",
                batch: "2023",
                semester: "4",
                department: "CSE",
                registration_date: "2023-01-15"
            },
            {
                student_id: "S1002",
                name: "Jane Smith",
                password: "password123",
                roll_number: "2023002",
                batch: "2023",
                semester: "4",
                department: "EEE",
                registration_date: "2023-01-16"
            }
        ];
        localStorage.setItem('students', JSON.stringify(sampleStudents));
    }

    addSampleFaculty() {
        const sampleFaculty = [
            {
                faculty_id: "F101",
                name: "Dr. Robert Brown",
                password: "faculty123",
                department: "CSE",
                registration_date: "2022-08-01"
            },
            {
                faculty_id: "F102",
                name: "Prof. Alice Johnson",
                password: "faculty123",
                department: "EEE",
                registration_date: "2022-08-01"
            }
        ];
        localStorage.setItem('faculty', JSON.stringify(sampleFaculty));
    }

    addSampleLibrarians() {
        const sampleLibrarians = [
            {
                librarian_id: "L10",
                name: "Admin Librarian",
                password: "admin123",
                registration_date: "2022-01-01"
            }
        ];
        localStorage.setItem('librarians', JSON.stringify(sampleLibrarians));
    }

    // ===== AUTHENTICATION =====
    authenticateStudent(studentId, password) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        return students.find(student => 
            student.student_id === studentId && student.password === password
        );
    }

    authenticateFaculty(facultyId, password) {
        const faculty = JSON.parse(localStorage.getItem('faculty') || '[]');
        return faculty.find(fac => 
            fac.faculty_id === facultyId && fac.password === password
        );
    }

    authenticateLibrarian(librarianId, password) {
        const librarians = JSON.parse(localStorage.getItem('librarians') || '[]');
        return librarians.find(lib => 
            lib.librarian_id === librarianId && lib.password === password
        );
    }

    registerStudent(studentData) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        // Generate student ID
        const lastId = students.length > 0 
            ? Math.max(...students.map(s => parseInt(s.student_id.substring(1))))
            : 1000;
        
        studentData.student_id = `S${lastId + 1}`;
        studentData.registration_date = new Date().toISOString().split('T')[0];
        
        students.push(studentData);
        localStorage.setItem('students', JSON.stringify(students));
        
        return studentData;
    }

    registerFaculty(facultyData) {
        const faculty = JSON.parse(localStorage.getItem('faculty') || '[]');
        
        const lastId = faculty.length > 0 
            ? Math.max(...faculty.map(f => parseInt(f.faculty_id.substring(1))))
            : 100;
        
        facultyData.faculty_id = `F${lastId + 1}`;
        facultyData.registration_date = new Date().toISOString().split('T')[0];
        
        faculty.push(facultyData);
        localStorage.setItem('faculty', JSON.stringify(faculty));
        
        return facultyData;
    }

    registerLibrarian(librarianData) {
        const librarians = JSON.parse(localStorage.getItem('librarians') || '[]');
        
        const lastId = librarians.length > 0 
            ? Math.max(...librarians.map(l => parseInt(l.librarian_id.substring(1))))
            : 9;
        
        librarianData.librarian_id = `L${lastId + 1}`;
        librarianData.registration_date = new Date().toISOString().split('T')[0];
        
        librarians.push(librarianData);
        localStorage.setItem('librarians', JSON.stringify(librarians));
        
        return librarianData;
    }

    // ===== BORROWING SYSTEM =====
    borrowBook(userId, bookId, userType) {
        const books = this.viewBooks();
        const bookIndex = books.findIndex(book => book.book_id === bookId);
        
        if (bookIndex === -1) return null;
        
        const book = books[bookIndex];
        
        if (parseInt(book.copies) < 1) return null;
        
        // Update book copies
        book.copies = (parseInt(book.copies) - 1).toString();
        if (book.copies === "0") {
            book.available = "False";
        }
        
        // Save updated books
        localStorage.setItem('books', JSON.stringify(books));
        
        // Create transaction
        const transactionId = this.generateTransactionId();
        const borrowDate = this.getCurrentDate();
        
        const transaction = {
            transaction_id: transactionId,
            user_id: userId,
            book_id: bookId,
            transaction_date: borrowDate,
            type: 'b'
        };
        
        const borrow = {
            transaction_id: transactionId,
            user_id: userId,
            book_id: bookId,
            borrow_date: borrowDate
        };
        
        // Save transaction and borrow
        this.saveTransaction(transaction);
        this.saveBorrow(borrow);
        
        return {
            transactionId,
            borrowDate,
            book
        };
    }

    returnBook(userId, bookId) {
        const books = this.viewBooks();
        const bookIndex = books.findIndex(book => book.book_id === bookId);
        
        if (bookIndex === -1) return null;
        
        const book = books[bookIndex];
        
        // Update book copies
        book.copies = (parseInt(book.copies) + 1).toString();
        if (book.copies !== "0") {
            book.available = "True";
        }
        
        // Save updated books
        localStorage.setItem('books', JSON.stringify(books));
        
        // Create return transaction
        const transactionId = this.generateTransactionId();
        const returnDate = this.getCurrentDate();
        
        const transaction = {
            transaction_id: transactionId,
            user_id: userId,
            book_id: bookId,
            transaction_date: returnDate,
            type: 'r'
        };
        
        // Save transaction
        this.saveTransaction(transaction);
        
        // Remove from borrows
        this.removeBorrow(userId, bookId);
        
        return {
            transactionId,
            book
        };
    }

    getBorrowedBooks(userId) {
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        const userBorrows = borrows.filter(borrow => borrow.user_id === userId);
        
        const books = this.viewBooks();
        const borrowedBooks = [];
        
        userBorrows.forEach(borrow => {
            const book = books.find(b => b.book_id === borrow.book_id);
            if (book) {
                borrowedBooks.push({
                    ...book,
                    borrow_date: borrow.borrow_date
                });
            }
        });
        
        return borrowedBooks;
    }

    calculateFine(borrowDate, userType = 'student') {
        const borrow = new Date(borrowDate.split('-').reverse().join('-'));
        const today = new Date();
        
        const daysHeld = Math.floor((today - borrow) / (1000 * 60 * 60 * 24));
        
        // Students: 14 days free, Faculty: 30 days free
        const freeDays = userType === 'student' ? 14 : 30;
        
        if (daysHeld <= freeDays) return 0;
        
        const weeksOverdue = Math.floor((daysHeld - freeDays) / 7);
        return weeksOverdue * 20; // Rs. 20 per week
    }

    // ===== HELPER METHODS =====
    generateTransactionId() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const lastId = transactions.length > 0 
            ? Math.max(...transactions.map(t => parseInt(t.transaction_id.substring(2))))
            : 0;
        
        return `tr${(lastId + 1).toString().padStart(4, '0')}`;
    }

    getCurrentDate() {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, '0');
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    }

    saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    saveBorrow(borrow) {
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        borrows.push(borrow);
        localStorage.setItem('borrows', JSON.stringify(borrows));
    }

    removeBorrow(userId, bookId) {
        const borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
        const updatedBorrows = borrows.filter(
            borrow => !(borrow.user_id === userId && borrow.book_id === bookId)
        );
        localStorage.setItem('borrows', JSON.stringify(updatedBorrows));
    }

    // ===== GET ALL USERS =====
    getAllStudents() {
        return JSON.parse(localStorage.getItem('students') || '[]');
    }

    getAllFaculty() {
        return JSON.parse(localStorage.getItem('faculty') || '[]');
    }

    getAllLibrarians() {
        return JSON.parse(localStorage.getItem('librarians') || '[]');
    }

    // ===== DEREGISTRATION =====
    deregisterStudent(studentId) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const updatedStudents = students.filter(student => student.student_id !== studentId);
        localStorage.setItem('students', JSON.stringify(updatedStudents));
        return true;
    }

    deregisterFaculty(facultyId) {
        const faculty = JSON.parse(localStorage.getItem('faculty') || '[]');
        const updatedFaculty = faculty.filter(fac => fac.faculty_id !== facultyId);
        localStorage.setItem('faculty', JSON.stringify(updatedFaculty));
        return true;
    }
}

// Create global database instance
const database = new MockDatabase();