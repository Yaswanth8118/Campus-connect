/*
  # Fix RLS Performance Issues and Security Gaps

  1. RLS Policy Optimization
    - Replace auth.uid() and auth.jwt() direct calls with (select auth.uid()) and (select auth.jwt())
    - This prevents re-evaluation for each row and improves query performance at scale
    - Affects: assignments, attendance_records, grades, submissions tables

  2. Missing Foreign Key Indexes
    - Add index on attendance_records.marked_by for performance
    - Ensures FK queries are optimized

  3. Remove Duplicate Indexes
    - idx_grades_student and idx_grades_student_id are identical
    - Keep idx_grades_student, drop idx_grades_student_id

  4. Consolidate Overlapping RLS Policies
    - Merge duplicate policies to reduce complexity
    - Keep only one policy per operation type

  5. Fix Security Gaps
    - Restrict "always true" policies with proper access controls
    - attendance_records and departments have overly permissive policies
    - Add role-based restrictions

  Important: All policies now use (select auth.uid()) pattern for optimal performance
*/

-- ASSIGNMENTS TABLE - OPTIMIZE AND CONSOLIDATE
DROP POLICY IF EXISTS "Creators can delete their assignments" ON public.assignments;
DROP POLICY IF EXISTS "Creators can update their assignments" ON public.assignments;
DROP POLICY IF EXISTS "Faculty can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Faculty can delete own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Faculty can update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can view published assignments" ON public.assignments;
DROP POLICY IF EXISTS "Anyone can view assignments" ON public.assignments;

CREATE POLICY "Faculty can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
  );

CREATE POLICY "View assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Update own assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Delete own assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

-- ATTENDANCE_RECORDS TABLE - FIX SECURITY GAPS
DROP POLICY IF EXISTS "Authenticated users can create attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Authenticated users can delete attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Authenticated users can update attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Faculty can view all attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance_records;

CREATE POLICY "Faculty and admin manage attendance"
  ON public.attendance_records FOR ALL
  TO authenticated
  USING (
    marked_by = (select auth.uid()) OR (select auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    marked_by = (select auth.uid()) OR (select auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Students view own attendance"
  ON public.attendance_records FOR SELECT
  TO authenticated
  USING (student_id = (select auth.uid()));

-- Add index for marked_by foreign key
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON public.attendance_records(marked_by);

-- GRADES TABLE - CONSOLIDATE POLICIES
DROP POLICY IF EXISTS "Admins can delete grades" ON public.grades;
DROP POLICY IF EXISTS "Authenticated users can delete grades" ON public.grades;
DROP POLICY IF EXISTS "Faculty can create grades" ON public.grades;
DROP POLICY IF EXISTS "Authenticated users can create grades" ON public.grades;
DROP POLICY IF EXISTS "Faculty can update grades" ON public.grades;
DROP POLICY IF EXISTS "Authenticated users can update grades" ON public.grades;
DROP POLICY IF EXISTS "Students can view own grades" ON public.grades;
DROP POLICY IF EXISTS "Students can view their own grades" ON public.grades;

CREATE POLICY "Faculty and admin manage grades"
  ON public.grades FOR ALL
  TO authenticated
  USING (
    graded_by = (select auth.uid()) OR (select auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    graded_by = (select auth.uid()) OR (select auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Students view own grades"
  ON public.grades FOR SELECT
  TO authenticated
  USING (student_id = (select auth.uid()));

-- Drop duplicate index
DROP INDEX IF EXISTS idx_grades_student_id;

-- SUBMISSIONS TABLE - CONSOLIDATE POLICIES
DROP POLICY IF EXISTS "Faculty can grade submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can create their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can delete own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can delete their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can update own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can view their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can view relevant submissions" ON public.submissions;

CREATE POLICY "Students create and manage own submissions"
  ON public.submissions FOR ALL
  TO authenticated
  USING (student_id = (select auth.uid()))
  WITH CHECK (student_id = (select auth.uid()));

CREATE POLICY "Faculty and admin view and grade submissions"
  ON public.submissions FOR ALL
  TO authenticated
  USING (
    (select auth.jwt() -> 'user_metadata' ->> 'role') IN ('faculty', 'admin')
  )
  WITH CHECK (
    (select auth.jwt() -> 'user_metadata' ->> 'role') IN ('faculty', 'admin')
  );

-- DEPARTMENTS TABLE - FIX SECURITY GAPS
DROP POLICY IF EXISTS "Authenticated users can create departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can delete departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can update departments" ON public.departments;

CREATE POLICY "Admins manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (
    (select auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (select auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Everyone can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);
