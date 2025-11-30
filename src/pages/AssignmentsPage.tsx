import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Clock, Upload, X, CheckCircle } from 'lucide-react';
import { useAcademicStore } from '../store/academicStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Assignment } from '../types';
import toast from 'react-hot-toast';

export function AssignmentsPage() {
  const { user } = useAuthStore();
  const { assignments, submissions, isLoading, fetchAssignments, fetchSubmissions, createSubmission } = useAcademicStore();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
    if (user?.id) {
      fetchSubmissions(user.id);
    }
  }, [fetchAssignments, fetchSubmissions, user]);

  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find((s) => s.assignment_id === assignmentId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !user?.id) return;

    setIsSubmitting(true);
    try {
      await createSubmission({
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        file_url: fileUrl,
        submission_text: submissionText,
        status: 'submitted',
      });

      toast.success('Assignment submitted successfully');
      setSelectedAssignment(null);
      setFileUrl('');
      setSubmissionText('');
      fetchSubmissions(user.id);
    } catch (error) {
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    if (daysLeft <= 2) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Assignments
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            View and submit your pending assignments
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => {
              const submission = getSubmissionStatus(assignment.id);
              const daysLeft = getDaysUntilDue(assignment.due_date);
              const isOverdue = daysLeft < 0;

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                          <FileText size={24} className="text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {assignment.title}
                          </h3>
                        </div>
                      </div>
                      {submission ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircle size={14} className="mr-1" />
                          Submitted
                        </Badge>
                      ) : (
                        <Badge className={getStatusColor(daysLeft)}>
                          {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                        </Badge>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {assignment.description || 'No description provided'}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{new Date(assignment.due_date).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {!submission && (
                      <Button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="w-full"
                        disabled={isOverdue}
                      >
                        {isOverdue ? 'Assignment Overdue' : 'Submit Assignment'}
                      </Button>
                    )}

                    {submission && (
                      <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
                        <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-2">
                          Submitted on {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                        {submission.submission_text && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {submission.submission_text}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {assignments.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <FileText size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No assignments yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Check back later for new assignments
            </p>
          </div>
        )}
      </div>

      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Submit Assignment
              </h2>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {selectedAssignment.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {selectedAssignment.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{new Date(selectedAssignment.due_date).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  File URL (Optional)
                </label>
                <div className="relative">
                  <Upload size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://example.com/your-file.pdf"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload your file to a cloud service and paste the link here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Submission Text
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your submission text, notes, or explanation here..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
