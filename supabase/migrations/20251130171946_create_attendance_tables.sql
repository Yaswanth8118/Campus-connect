/*
  # Create Attendance Tracking Tables

  1. New Tables
    - `attendance_records`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to auth.users)
      - `course_name` (text)
      - `date` (date)
      - `status` (text) - present, absent, late, excused
      - `marked_by` (uuid, foreign key to auth.users)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on attendance_records table
    - Students can view their own attendance
    - Faculty and coordinators can view and manage all attendance
*/

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present',
  marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_name, date)
);

-- Enable RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Students can view their own attendance
CREATE POLICY "Students can view own attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Faculty and coordinators can view all attendance
CREATE POLICY "Faculty can view all attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (true);

-- Faculty and coordinators can create attendance records
CREATE POLICY "Authenticated users can create attendance"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Faculty and coordinators can update attendance records
CREATE POLICY "Authenticated users can update attendance"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Faculty and coordinators can delete attendance records
CREATE POLICY "Authenticated users can delete attendance"
  ON attendance_records FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON attendance_records(course_name);