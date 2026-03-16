// ===== FACULTY SPECIFIC FUNCTIONALITY =====

class FacultyManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.database = dashboard.database;
        this.currentUser = dashboard.currentUser;
        
        this.initFaculty();
    }

    initFaculty() {
        // Load faculty-specific data
        this.loadFacultyStats();
        this.loadFacultyCourses();
        
        // Initialize faculty event listeners
        this.initFacultyEventListeners();
    }

    loadFacultyStats() {
        const userId = this.currentUser.faculty_id;
        const borrowedBooks = this.database.getBorrowedBooks(userId);
        
        // Update stats
        document.getElementById('borrowedCount').textContent = borrowedBooks.length;
        document.getElementById('totalBorrowed').textContent = borrowedBooks.length;
        
        // Calculate total fines
        let totalFine = 0;
        borrowedBooks.forEach(book => {
            totalFine += this.database.calculateFine(book.borrow_date, 'faculty');
        });
        
        document.getElementById('totalFine').textContent = `Rs. ${totalFine}`;
        document.getElementById('currentFine').textContent = `Rs. ${totalFine}`;
        
        // Calculate due soon (faculty: 30 days free)
        const dueSoon = borrowedBooks.filter(book => {
            const borrowDate = new Date(book.borrow_date.split('-').reverse().join('-'));
            const daysHeld = Math.floor((new Date() - borrowDate) / (1000 * 60 * 60 * 24));
            return daysHeld >= 25 && daysHeld < 30; // Due in next 5 days
        }).length;
        
        document.getElementById('dueSoon').textContent = dueSoon;
        document.getElementById('daysLeft').textContent = '30';
    }

    loadFacultyCourses() {
        // In a real system, this would load from a database
        // For demo, using sample data
        const sampleCourses = [
            { code: 'CS101', name: 'Introduction to Programming', semester: '1', students: 45 },
            { code: 'CS201', name: 'Data Structures', semester: '3', students: 38 },
            { code: 'CS301', name: 'Algorithms', semester: '5', students: 32 },
            { code: 'CS401', name: 'Database Systems', semester: '7', students: 28 }
        ];
        
        const container = document.getElementById('coursesContainer');
        if (!container) return;
        
        let html = '<div class="courses-grid">';
        sampleCourses.forEach(course => {
            html += `
                <div class="course-card">
                    <div class="course-header">
                        <h4>${course.code}</h4>
                        <span class="course-semester">Semester ${course.semester}</span>
                    </div>
                    <div class="course-details">
                        <p class="course-name">${course.name}</p>
                        <p class="course-students">
                            <i class="fas fa-users"></i> ${course.students} Students
                        </p>
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-sm btn-secondary" onclick="facultyManager.viewCourseMaterials('${course.code}')">
                            <i class="fas fa-book"></i> Materials
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="facultyManager.manageCourse('${course.code}')">
                            <i class="fas fa-edit"></i> Manage
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    initFacultyEventListeners() {
        // Manage courses button
        const manageCoursesBtn = document.getElementById('manageCoursesBtn');
        if (manageCoursesBtn) {
            manageCoursesBtn.addEventListener('click', () => this.showCoursesModal());
        }
        
        // Research materials
        const researchBtn = document.getElementById('researchMaterialsBtn');
        if (researchBtn) {
            researchBtn.addEventListener('click', () => this.showResearchMaterials());
        }
        
        // Course materials form
        const addMaterialForm = document.getElementById('addMaterialForm');
        if (addMaterialForm) {
            addMaterialForm.addEventListener('submit', (e) => this.handleAddMaterial(e));
        }
    }

    showCoursesModal() {
        this.loadFacultyCourses();
        this.dashboard.showModal('coursesModal');
    }

    viewCourseMaterials(courseCode) {
        // Sample course materials
        const materials = {
            'CS101': [
                { name: 'Introduction to Python Slides', type: 'Presentation', date: '2024-01-15' },
                { name: 'Basic Programming Exercises', type: 'Worksheet', date: '2024-01-20' },
                { name: 'Mid-term Exam Papers', type: 'Exam', date: '2024-02-15' }
            ],
            'CS201': [
                { name: 'Data Structures Lecture Notes', type: 'Notes', date: '2024-01-10' },
                { name: 'Linked List Implementation', type: 'Code', date: '2024-01-25' },
                { name: 'Assignment 1 - Stacks & Queues', type: 'Assignment', date: '2024-02-01' }
            ]
        };
        
        const courseMaterials = materials[courseCode] || [];
        
        let html = '<div class="materials-list">';
        if (courseMaterials.length === 0) {
            html += `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No materials uploaded yet</p>
                </div>
            `;
        } else {
            courseMaterials.forEach(material => {
                html += `
                    <div class="material-item">
                        <div class="material-icon">
                            <i class="fas fa-file-${this.getFileTypeIcon(material.type)}"></i>
                        </div>
                        <div class="material-details">
                            <h5>${material.name}</h5>
                            <p>Type: ${material.type} | Date: ${material.date}</p>
                        </div>
                        <div class="material-actions">
                            <button class="btn btn-sm btn-secondary">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        html += '</div>';
        
        document.getElementById('materialsContent').innerHTML = html;
        this.dashboard.showModal('materialsModal');
    }

    getFileTypeIcon(type) {
        const icons = {
            'Presentation': 'powerpoint',
            'Worksheet': 'word',
            'Exam': 'pdf',
            'Notes': 'alt',
            'Code': 'code',
            'Assignment': 'clipboard'
        };
        return icons[type] || 'file';
    }

    manageCourse(courseCode) {
        document.getElementById('manageCourseCode').value = courseCode;
        this.dashboard.showModal('manageCourseModal');
    }

    handleAddMaterial(e) {
        e.preventDefault();
        
        const materialName = document.getElementById('materialName').value.trim();
        const materialType = document.getElementById('materialType').value;
        const courseCode = document.getElementById('manageCourseCode').value;
        
        if (!materialName) {
            showNotification('Please enter material name', 'error');
            return;
        }
        
        // In a real system, this would upload to server
        // For demo, just show success message
        showNotification(`Material "${materialName}" added to ${courseCode}`, 'success');
        
        // Clear form
        document.getElementById('addMaterialForm').reset();
        this.dashboard.hideModal('manageCourseModal');
    }

    showResearchMaterials() {
        // Sample research materials
        const researchMaterials = [
            {
                title: 'Machine Learning in Education',
                authors: 'Dr. Smith, Dr. Johnson',
                journal: 'Journal of Educational Technology',
                year: '2023',
                link: '#'
            },
            {
                title: 'Data Structures Optimization',
                authors: 'Prof. Brown et al.',
                journal: 'Computer Science Review',
                year: '2022',
                link: '#'
            },
            {
                title: 'Web Development Trends 2024',
                authors: 'Dr. Lee, Dr. Chen',
                journal: 'IEEE Software',
                year: '2024',
                link: '#'
            }
        ];
        
        let html = '<div class="research-list">';
        researchMaterials.forEach(material => {
            html += `
                <div class="research-item">
                    <div class="research-header">
                        <h4>${material.title}</h4>
                        <span class="research-year">${material.year}</span>
                    </div>
                    <div class="research-details">
                        <p><i class="fas fa-user-pen"></i> ${material.authors}</p>
                        <p><i class="fas fa-book"></i> ${material.journal}</p>
                    </div>
                    <div class="research-actions">
                        <button class="btn btn-sm btn-primary">
                            <i class="fas fa-external-link-alt"></i> View Paper
                        </button>
                        <button class="btn btn-sm btn-secondary">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        document.getElementById('researchContent').innerHTML = html;
        this.dashboard.showModal('researchModal');
    }

    // Request book purchase
    requestBookPurchase() {
        const bookTitle = document.getElementById('requestBookTitle').value.trim();
        const bookAuthor = document.getElementById('requestBookAuthor').value.trim();
        const reason = document.getElementById('requestBookReason').value.trim();
        
        if (!bookTitle || !bookAuthor) {
            showNotification('Please fill all required fields', 'error');
            return;
        }
        
        // In a real system, this would send a request to librarians
        showNotification('Book purchase request submitted successfully', 'success');
        
        // Clear form
        document.getElementById('requestBookTitle').value = '';
        document.getElementById('requestBookAuthor').value = '';
        document.getElementById('requestBookReason').value = '';
        
        this.dashboard.hideModal('requestBookModal');
    }

    // View research analytics
    viewResearchAnalytics() {
        // Sample analytics data
        const analyticsData = {
            publications: 12,
            citations: 145,
            hIndex: 8,
            researchGrants: 3
        };
        
        const html = `
            <div class="analytics-grid">
                <div class="analytic-card">
                    <div class="analytic-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="analytic-info">
                        <h3>${analyticsData.publications}</h3>
                        <p>Publications</p>
                    </div>
                </div>
                <div class="analytic-card">
                    <div class="analytic-icon">
                        <i class="fas fa-quote-right"></i>
                    </div>
                    <div class="analytic-info">
                        <h3>${analyticsData.citations}</h3>
                        <p>Citations</p>
                    </div>
                </div>
                <div class="analytic-card">
                    <div class="analytic-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="analytic-info">
                        <h3>${analyticsData.hIndex}</h3>
                        <p>h-Index</p>
                    </div>
                </div>
                <div class="analytic-card">
                    <div class="analytic-icon">
                        <i class="fas fa-award"></i>
                    </div>
                    <div class="analytic-info">
                        <h3>${analyticsData.researchGrants}</h3>
                        <p>Research Grants</p>
                    </div>
                </div>
            </div>
            
            <div class="analytics-chart">
                <h4>Publications Per Year</h4>
                <div class="chart-placeholder">
                    <canvas id="publicationsChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
        
        document.getElementById('analyticsContent').innerHTML = html;
        this.dashboard.showModal('analyticsModal');
        
        // Initialize chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.initializePublicationsChart();
        }
    }

    initializePublicationsChart() {
        const ctx = document.getElementById('publicationsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: 'Publications',
                    data: [2, 3, 4, 2, 1],
                    backgroundColor: 'var(--accent-green)',
                    borderColor: 'var(--accent-green)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'var(--text-light)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-light)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text-light)'
                        }
                    }
                }
            }
        });
    }
}

// Initialize faculty manager when dashboard is ready
if (typeof dashboard !== 'undefined' && dashboard.userType === 'faculty') {
    const facultyManager = new FacultyManager(dashboard);
}