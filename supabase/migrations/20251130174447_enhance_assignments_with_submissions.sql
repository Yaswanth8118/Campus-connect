/*
  # Enhance Assignments and Submissions System with RBAC

  ## Overview
  This migration enhances the assignments and submissions tables with proper RBAC
  and additional fields for comprehensive assignment management.

  ## Changes Made

  1. **Table Updates - assignments**
     - Add `max_score` field for grading
     - Add `subject` field for better organization
     - Add `status` field (draft, published, closed)
     - Add `attachments` jsonb field for file references

  2. **Table Updates - submissions**
     - Add `score` field for grading
     - Add `grade_letter` field
     - Add `graded_by` field
     - Add `graded_at` timestamp
     - Add `feedback` text field

  3. **Security - Row Level Security Policies**
     - **Students**: Can view assignments and submit their work
     - **Faculty/Coordinators**: Full CRUD on assignments and can grade submissions
     - **Admins**: Full access to all operations

  4. **Indexes**
     - Add indexes for performance optimization
*/

-- Add new columns to assignments table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assignments' AND column_name = 'max_score'
  ) THEN
    ALTER TABLE assignments ADD COLUMN max_score numeric DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assignments' AND column_name = 'subject'
  ) THEN
    ALTER TABLE assignments ADD COLUMN subject text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assignments' AND column_name = 'status'
  ) THEN
    ALTER TABLE assignments ADD COLUMN status text DEFAULT 'published';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assignments' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE assignments ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add new columns to submissions table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'score'
  ) THEN
    ALTER TABLE submissions ADD COLUMN score numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'grade_letter'
  ) THEN
    ALTER TABLE submissions ADD COLUMN grade_letter text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'graded_by'
  ) THEN
    ALTER TABLE submissions ADD COLUMN graded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'graded_at'
  ) THEN
    ALTER TABLE submissions ADD COLUMN graded_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'feedback'
  ) THEN
    ALTER TABLE submissions ADD COLUMN feedback text DEFAULT '';
  END IF;
END $$;

-- Drop existing policies for assignments
DROP POLICY IF EXISTS "Students can view assignments" ON assignments;
DROP POLICY IF EXISTS "Authenticated users can create assignments" ON assignments;

-- Students and faculty can view published assignments
CREATE POLICY "Users can view published assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coordinator', 'faculty')
    )
  );

-- Only faculty, coordinators, and admins can create assignments
CREATE POLICY "Faculty can create assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coordinator', 'faculty')
    )
  );

-- Only faculty, coordinators, and admins can update assignments
CREATE POLICY "Faculty can update assignments"
  ON assignments FOR UPDATE
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

-- Only admins and creators can delete assignments
CREATE POLICY "Faculty can delete own assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drop existing policies for submissions
DROP POLICY IF EXISTS "Students can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Authenticated users can create submissions" ON submissions;

-- Students can view their own submissions, faculty can view all
CREATE POLICY "Users can view relevant submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coordinator', 'faculty')
    )
  );

-- Students can create their own submissions
CREATE POLICY "Students can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Students can update their own ungraded submissions
CREATE POLICY "Students can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (
    student_id = auth.uid() AND status = 'pending'
  );

-- Faculty can update any submission for grading
CREATE POLICY "Faculty can grade submissions"
  ON submissions FOR UPDATE
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

-- Students can delete their ungraded submissions
CREATE POLICY "Students can delete own submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (
    student_id = auth.uid() AND status = 'pending'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_submissions_graded_by ON submissions(graded_by);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_composite ON submissions(assignment_id, student_id);
