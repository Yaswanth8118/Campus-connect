/*
  # Remove Unused Indexes

  These indexes were identified as unused and can safely be removed.
  They consume storage and slow down INSERT/UPDATE/DELETE operations
  without providing query performance benefits.

  Removed indexes:
  - idx_assignments_subject
  - idx_assignments_status
  - idx_assignments_due_date
  - idx_assignments_department
  - idx_assignments_created_by
  - idx_submissions_graded_by
  - idx_submissions_status
  - idx_submissions_composite
  - idx_submissions_assignment
  - idx_submissions_student
  - idx_grades_student (duplicate removed via prior migration)
  - idx_attendance_student
  - idx_attendance_date
  - idx_attendance_course

  Note: FK indexes are retained as they are essential for join performance.
*/

DROP INDEX IF EXISTS idx_assignments_subject;
DROP INDEX IF EXISTS idx_assignments_status;
DROP INDEX IF EXISTS idx_assignments_due_date;
DROP INDEX IF EXISTS idx_assignments_department;
DROP INDEX IF EXISTS idx_assignments_created_by;
DROP INDEX IF EXISTS idx_submissions_graded_by;
DROP INDEX IF EXISTS idx_submissions_status;
DROP INDEX IF EXISTS idx_submissions_composite;
DROP INDEX IF EXISTS idx_submissions_assignment;
DROP INDEX IF EXISTS idx_submissions_student;
DROP INDEX IF EXISTS idx_grades_student;
DROP INDEX IF EXISTS idx_attendance_student;
DROP INDEX IF EXISTS idx_attendance_date;
DROP INDEX IF EXISTS idx_attendance_course;
