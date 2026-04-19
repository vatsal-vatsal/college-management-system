// Initialize Supabase client
const SUPABASE_URL = 'https://kzmsvbiotmruimngbcfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bXN2YmlvdG1ydWltbmdiY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDE0MDgsImV4cCI6MjA5MjE3NzQwOH0.tUXETKDixQRIHGgByWTu6QKLyveEDgHJIwibARksH0U';

// Initialize the Supabase client
let supabaseClient;

// Wait for Supabase to load
function initializeSupabase() {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        loadStudents();
    } else {
        setTimeout(initializeSupabase, 100);
    }
}

// Global variables
let students = [];
let editingStudentId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    
    // Form submission
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function() {
        if (this.value.trim() === '') {
            displayStudents(students);
        }
    });
});

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const studentData = {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        student_id: formData.get('studentId'),
        course: formData.get('course'),
        semester: parseInt(formData.get('semester')),
        gpa: parseFloat(formData.get('gpa')),
        created_at: new Date().toISOString()
    };

    try {
        if (editingStudentId) {
            // Update existing student
            const { data, error } = await supabaseClient
                .from('students')
                .update(studentData)
                .eq('id', editingStudentId);
            
            if (error) throw error;
            
            showNotification('Student updated successfully!', 'success');
            editingStudentId = null;
            document.querySelector('.btn-primary').textContent = 'Register Student';
        } else {
            // Add new student
            const { data, error } = await supabaseClient
                .from('students')
                .insert([studentData]);
            
            if (error) throw error;
            
            showNotification('Student registered successfully!', 'success');
        }
        
        clearForm();
        await loadStudents();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Load all students
async function loadStudents() {
    showLoading(true);
    
    try {
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        students = data || [];
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Error loading students: ' + error.message, 'error');
        displayEmptyState();
    } finally {
        showLoading(false);
    }
}

// Display students in the grid
function displayStudents(studentsToDisplay) {
    const container = document.getElementById('studentsList');
    
    if (studentsToDisplay.length === 0) {
        displayEmptyState();
        return;
    }
    
    container.innerHTML = studentsToDisplay.map(student => `
        <div class="student-card">
            <div class="student-header">
                <div class="student-name">${student.first_name} ${student.last_name}</div>
                <div class="student-id">${student.student_id}</div>
            </div>
            <div class="student-info">
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${student.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${student.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Course:</span>
                    <span class="info-value">${student.course}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Semester:</span>
                    <span class="info-value">${student.semester}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">GPA:</span>
                    <span class="info-value">${student.gpa}</span>
                </div>
            </div>
            <div class="student-actions">
                <button class="btn-edit" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteStudent('${student.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Display empty state
function displayEmptyState() {
    const container = document.getElementById('studentsList');
    container.innerHTML = `
        <div class="empty-state">
            <h3>No students found</h3>
            <p>Start by registering your first student using the form above.</p>
        </div>
    `;
}

// Edit student
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Fill form with student data
    document.getElementById('firstName').value = student.first_name;
    document.getElementById('lastName').value = student.last_name;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('studentId').value = student.student_id;
    document.getElementById('course').value = student.course;
    document.getElementById('semester').value = student.semester;
    document.getElementById('gpa').value = student.gpa;
    
    // Update button text and set editing mode
    document.querySelector('.btn-primary').textContent = 'Update Student';
    editingStudentId = studentId;
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Student loaded for editing', 'info');
}

// Delete student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('students')
            .delete()
            .eq('id', studentId);
        
        if (error) throw error;
        
        showNotification('Student deleted successfully!', 'success');
        await loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Error deleting student: ' + error.message, 'error');
    }
}

// Search students
function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayStudents(students);
        return;
    }
    
    const filteredStudents = students.filter(student => 
        student.first_name.toLowerCase().includes(searchTerm) ||
        student.last_name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.student_id.toLowerCase().includes(searchTerm) ||
        student.course.toLowerCase().includes(searchTerm)
    );
    
    displayStudents(filteredStudents);
}

// Clear form
function clearForm() {
    document.getElementById('studentForm').reset();
    editingStudentId = null;
    document.querySelector('.btn-primary').textContent = 'Register Student';
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const studentsList = document.getElementById('studentsList');
    
    if (show) {
        spinner.style.display = 'block';
        studentsList.style.display = 'none';
    } else {
        spinner.style.display = 'none';
        studentsList.style.display = 'grid';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Utility function to create students table if it doesn't exist
async function createStudentsTable() {
    try {
        // This would typically be done in Supabase dashboard
        // But here's the SQL for reference:
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS students (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                student_id TEXT UNIQUE NOT NULL,
                course TEXT NOT NULL,
                semester INTEGER NOT NULL,
                gpa DECIMAL(3,1) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
            CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
            CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
        `;
        
        console.log('Table creation SQL:', createTableSQL);
        showNotification('Please create the students table in Supabase dashboard using the provided SQL', 'info');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Check if Supabase is properly configured
function checkSupabaseConfig() {
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        showNotification('Please configure your Supabase anonymous key in script.js', 'error');
        return false;
    }
    return true;
}

// Initialize with configuration check
if (!checkSupabaseConfig()) {
    showNotification('Supabase not configured. Please update the SUPABASE_ANON_KEY in script.js', 'error');
}
