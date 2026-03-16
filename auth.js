// ===== AUTHENTICATION MODULE =====

class AuthManager {
    constructor() {
        this.database = database;
        this.initAuth();
    }

    initAuth() {
        // Check for existing session
        this.checkSession();
        
        // Check URL parameters for role
        this.checkRoleFromURL();
    }

    checkSession() {
        const currentUser = localStorage.getItem('currentUser');
        const userType = localStorage.getItem('userType');
        
        if (currentUser && userType) {
            // Redirect to appropriate dashboard
            const currentPage = window.location.pathname;
            if (!currentPage.includes('dashboard')) {
                window.location.href = `pages/${userType}-dashboard.html`;
            }
        }
    }

    checkRoleFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');
        
        if (role) {
            // Set the role in the form if we're on login/register page
            const roleSelect = document.getElementById('userRole');
            if (roleSelect) {
                roleSelect.value = role;
            }
        }
    }

    // ===== LOGIN FUNCTIONS =====
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const userId = form.querySelector('#userId').value.trim();
        const password = form.querySelector('#password').value.trim();
        const role = form.querySelector('#userRole').value;
        
        if (!userId || !password || !role) {
            showNotification('Please fill all fields', 'error');
            return;
        }

        showLoading();

        try {
            let user = null;
            let userType = null;

            // Authenticate based on role
            switch(role) {
                case 'student':
                    user = this.database.authenticateStudent(userId, password);
                    userType = 'student';
                    break;
                case 'faculty':
                    user = this.database.authenticateFaculty(userId, password);
                    userType = 'faculty';
                    break;
                case 'librarian':
                    user = this.database.authenticateLibrarian(userId, password);
                    userType = 'librarian';
                    break;
                default:
                    throw new Error('Invalid role selected');
            }

            if (user) {
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('userType', userType);
                
                showNotification('Login successful!', 'success');
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = `pages/${userType}-dashboard.html`;
                }, 1000);
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    // ===== REGISTRATION FUNCTIONS =====
    async handleRegistration(event) {
        event.preventDefault();
        
        const form = event.target;
        const role = form.querySelector('#userRole').value;
        
        showLoading();

        try {
            let userData = null;
            let redirectPage = '';

            switch(role) {
                case 'student':
                    userData = this.getStudentData(form);
                    userData = this.database.registerStudent(userData);
                    redirectPage = 'student-dashboard.html';
                    break;
                    
                case 'faculty':
                    userData = this.getFacultyData(form);
                    userData = this.database.registerFaculty(userData);
                    redirectPage = 'faculty-dashboard.html';
                    break;
                    
                case 'librarian':
                    userData = this.getLibrarianData(form);
                    userData = this.database.registerLibrarian(userData);
                    redirectPage = 'librarian-dashboard.html';
                    break;
                    
                default:
                    throw new Error('Invalid role selected');
            }

            if (userData) {
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(userData));
                localStorage.setItem('userType', role);
                
                // Show success message with user ID
                const successMessage = `Registration successful!<br><br>
                    <strong>Your ${role} ID: ${userData[`${role}_id`]}</strong><br>
                    Please remember this ID for login.`;
                
                showNotification(successMessage, 'success');
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = `pages/${redirectPage}`;
                }, 2000);
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    getStudentData(form) {
        return {
            name: form.querySelector('#fullName').value.trim(),
            password: form.querySelector('#password').value.trim(),
            roll_number: form.querySelector('#rollNumber').value.trim(),
            batch: form.querySelector('#batch').value.trim(),
            semester: form.querySelector('#semester').value.trim(),
            department: form.querySelector('#department').value.trim()
        };
    }

    getFacultyData(form) {
        return {
            name: form.querySelector('#fullName').value.trim(),
            password: form.querySelector('#password').value.trim(),
            department: form.querySelector('#department').value.trim()
        };
    }

    getLibrarianData(form) {
        return {
            name: form.querySelector('#fullName').value.trim(),
            password: form.querySelector('#password').value.trim()
        };
    }

    // ===== LOGOUT FUNCTION =====
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    // ===== SESSION CHECK =====
    checkAuth() {
        const currentUser = localStorage.getItem('currentUser');
        const userType = localStorage.getItem('userType');
        
        if (!currentUser || !userType) {
            window.location.href = '../pages/login.html';
            return false;
        }
        
        return {
            user: JSON.parse(currentUser),
            type: userType
        };
    }

    // ===== GET CURRENT USER =====
    getCurrentUser() {
        const userData = this.checkAuth();
        return userData ? userData.user : null;
    }

    getUserType() {
        const userData = this.checkAuth();
        return userData ? userData.type : null;
    }
}

// Create global auth instance
const authManager = new AuthManager();