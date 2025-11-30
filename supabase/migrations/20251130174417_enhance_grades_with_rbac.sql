/*
  # Enhance Grades System with Role-Based Access Control

  ## Overview
  This migration enhances the grades table with proper RBAC and additional fields
  for a comprehensive grading system.

  ## Changes Made

  1. **Table Updates - grades**
     - Add `graded_by` field to track who assigned the grade (faculty/coordinator)
     - Add `comments` field for feedback
     - Add `assignment_id` field to link grades to specific assignments
     - Add updated_at timestamp

  2. **Security - Row Level Security Policies**
     - **Students**: Can only view their own grades (SELECT)
     - **Faculty/Coordinators**: Can view all grades and create/update grade entries
     - **Admins**: Full access to all operations

  3. **Indexes**
     - Add index on student_id for faster lookups
     - Add index on graded_by for reporting
     - Add composite index on (student_id, subject, semester) for common queries
*/

-- Add new columns to grades table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'graded_by'
  ) THEN
    ALTER TABLE grades ADD COLUMN graded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'comments'
  ) THEN
    ALTER TABLE grades ADD COLUMN comments text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'assignment_id'
  ) THEN
    ALTER TABLE grades ADD COLUMN assignment_id uuid REFERENCES assignments(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grades' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE grades ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Students can view own grades" ON grades;
DROP POLICY IF EXISTS "Authenticated users can view all grades" ON grades;

-- Students can only view their own grades
CREATE POLICY "Students can view own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coordinator', 'faculty')
    )
  );

-- Only faculty, coordinators, and admins can create grades
CREATE POLICY "Faculty can create grades"
  ON grades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coordinator', 'faculty')
    )
  );

-- Only faculty, coordinators, and admins can update grades
CREATE POLICY "Faculty can update grades"
  ON grades FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coordinator', 'faculty')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coordinator', 'faculty')
    )
  );

-- Only admins can delete grades
CREATE POLICY "Admins can delete grades"
  ON grades FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_graded_by ON grades(graded_by);
CREATE INDEX IF NOT EXISTS idx_grades_composite ON grades(student_id, subject, semester);
CREATE INDEX IF NOT EXISTS idx_grades_assignment ON grades(assignment_id);
