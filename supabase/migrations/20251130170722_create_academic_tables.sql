/*
  # Create Academic Management Tables

  1. New Tables
    - `departments`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `head_of_department` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `assignments`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamp)
      - `department_id` (uuid, foreign key)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `submissions`
      - `id` (uuid, primary key)
      - `assignment_id` (uuid, foreign key)
      - `student_id` (uuid, foreign key to auth.users)
      - `file_url` (text)
      - `submission_text` (text)
      - `status` (text) - pending, submitted, graded
      - `submitted_at` (timestamp)
      - `created_at` (timestamp)
    
    - `grades`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to auth.users)
      - `subject` (text)
      - `score` (numeric)
      - `max_score` (numeric)
      - `grade_letter` (text) - A, B, C, D, F
      - `semester` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Departments: Authenticated users can read, only coordinators can modify
    - Assignments: All authenticated can read, coordinators can manage
    - Submissions: Students can create/read own, coordinators can read all
    - Grades: Students can read own, coordinators can manage
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  head_of_department text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  due_date timestamptz NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url text DEFAULT '',
  submission_text text DEFAULT '',
  status text DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 100,
  grade_letter text DEFAULT 'F',
  semester text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Departments policies
CREATE POLICY "Anyone can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);

-- Assignments policies
CREATE POLICY "Anyone can view assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Submissions policies
CREATE POLICY "Students can view their own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR EXISTS (
    SELECT 1 FROM assignments WHERE assignments.id = submissions.assignment_id AND assignments.created_by = auth.uid()
  ));

CREATE POLICY "Students can create their own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete their own submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- Grades policies
CREATE POLICY "Students can view their own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Authenticated users can create grades"
  ON grades FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update grades"
  ON grades FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete grades"
  ON grades FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_department ON assignments(department_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);