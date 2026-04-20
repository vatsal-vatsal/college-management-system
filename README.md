# College Management System

A modern web application for managing student records built with plain HTML, CSS, and JavaScript, integrated with Supabase for data storage.

## Features

- ✅ Student registration and management
- ✅ Real-time data storage with Supabase
- ✅ Search and filter functionality
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Responsive design for all devices
- ✅ Modern UI with smooth animations

## Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to your project settings → API
3. Copy your **Project URL** and **anon public** key

### 2. Create the Database Table

In your Supabase project, go to the SQL Editor and run this query:

```sql



-- Departments Table
CREATE TABLE departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    head_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty Table
CREATE TABLE faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department_id UUID REFERENCES departments(id),
    specialization TEXT,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    department_id UUID REFERENCES departments(id),
    faculty_id UUID REFERENCES faculty(id),
    semester INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students Table (simplified, no foreign keys for now)
CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    course TEXT NOT NULL,
    semester INTEGER NOT NULL,
    gpa DECIMAL(3,1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_faculty_department ON faculty(department_id);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_faculty ON courses(faculty_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_id ON students(student_id);




```

### 3. Configure the Application

Open `script.js` and replace the placeholder:

```javascript
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual key
```

### 4. Run the Application

Simply open `index.html` in your web browser. No build process required!

## Deployment on Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your Supabase URL and anon key as environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## File Structure

```
supabase-vercel-demo-app/
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── script.js           # JavaScript logic with Supabase integration
└── README.md           # This file
```

## Usage

1. **Register Students**: Fill out the registration form and click "Register Student"
2. **View Records**: All registered students appear in the grid below
3. **Search**: Use the search bar to find students by name, email, ID, or course
4. **Edit**: Click the "Edit" button on any student card to modify their information
5. **Delete**: Click the "Delete" button to remove a student record

## Database Schema

The `students` table includes:
- `id`: Unique identifier (UUID)
- `first_name`, `last_name`: Student's name
- `email`: Unique email address
- `phone`: Contact number
- `student_id`: Unique student identifier
- `course`: Academic course
- `semester`: Current semester (1-8)
- `gpa`: Grade point average (0.0-4.0)
- `created_at`, `updated_at`: Timestamps

## Security Notes

- The Supabase anon key is exposed client-side (this is safe for public operations)
- For production, consider implementing Row Level Security (RLS) in Supabase
- Add input validation and sanitization for enhanced security

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid and Flexbox
- **Vanilla JavaScript**: No frameworks required
- **Supabase**: Backend-as-a-Service for database and authentication
- **Vercel**: Platform for deployment

## Troubleshooting

### "Supabase not configured" Error
- Make sure you've replaced `YOUR_SUPABASE_ANON_KEY` in `script.js` with your actual Supabase anon key

### "Table doesn't exist" Error
- Run the SQL query provided in step 2 of this README in your Supabase SQL Editor

### CORS Issues
- Ensure your Vercel deployment URL is added to your Supabase project's CORS settings

## License

MIT License - feel free to use this project for learning or commercial purposes.
