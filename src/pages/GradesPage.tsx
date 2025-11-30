import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, TrendingUp, BookOpen, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAcademicStore } from '../store/academicStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableColumn } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

interface Grade {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  max_score: number;
  grade_letter: string;
  semester: string;
  comments?: string;
  graded_by?: string;
  created_at: string;
}

export function GradesPage() {
  const { user } = useAuthStore();
  const { grades, isLoading, fetchGrades } = useAcademicStore();
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    subject: '',
    score: '',
    max_score: '100',
    grade_letter: 'A',
    semester: '',
    comments: '',
  });

  const isFaculty = user?.role === 'faculty' || user?.role === 'coordinator' || user?.role === 'admin';
  const isStudent = user?.role === 'candidate';

  useEffect(() => {
    if (user?.id) {
      fetchGrades(user.id);
    }
  }, [fetchGrades, user]);

  const calculateOverallGPA = () => {
    if (grades.length === 0) return 0;
    const gradePoints: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
    const totalPoints = grades.reduce((acc, grade) => acc + (gradePoints[grade.grade_letter] || 0), 0);
    return (totalPoints / grades.length).toFixed(2);
  };

  const calculateAverageScore = () => {
    if (grades.length === 0) return 0;
    const totalPercentage = grades.reduce((acc, grade) => acc + (grade.score / grade.max_score) * 100, 0);
    return Math.round(totalPercentage / grades.length);
  };

  const getGradeColor = (letter: string) => {
    const colors: Record<string, string> = {
      A: 'success',
      B: 'primary',
      C: 'warning',
      D: 'secondary',
      F: 'danger',
    };
    return colors[letter] || 'secondary';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(editingGrade ? 'Grade updated successfully!' : 'Grade created successfully!');
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      student_id: grade.student_id,
      subject: grade.subject,
      score: grade.score.toString(),
      max_score: grade.max_score.toString(),
      grade_letter: grade.grade_letter,
      semester: grade.semester,
      comments: grade.comments || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (gradeId: string) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      toast.success('Grade deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      subject: '',
      score: '',
      max_score: '100',
      grade_letter: 'A',
      semester: '',
      comments: '',
    });
    setEditingGrade(null);
  };

  const gpa = calculateOverallGPA();
  const avgScore = calculateAverageScore();

  const statsCards = [
    {
      title: 'Overall GPA',
      value: gpa,
      icon: Award,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Average Score',
      value: `${avgScore}%`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Completed Courses',
      value: grades.length,
      icon: BookOpen,
      gradient: 'from-amber-500 to-amber-600',
    },
  ];

  const columns: TableColumn<Grade>[] = [
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'semester',
      label: 'Semester',
      sortable: true,
    },
    {
      key: 'score',
      label: 'Score',
      sortable: true,
      render: (value, row) => (
        <span className="font-medium">
          {value} / {row.max_score}
        </span>
      ),
    },
    {
      key: 'grade_letter',
      label: 'Grade',
      sortable: true,
      render: (value) => (
        <Badge variant={getGradeColor(value) as any}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  if (isFaculty) {
    columns.push({
      key: 'id',
      label: 'Actions',
      width: '150px',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(row)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {isStudent ? 'My Grades' : 'Grade Management'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isStudent ? 'View your academic performance' : 'Manage student grades and performance'}
            </p>
          </div>
          {isFaculty && (
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Grade
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden">
                    <div className="flex items-center justify-between p-6">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <stat.icon size={28} className="text-white" />
                      </div>
                    </div>
                    <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Grade Records
                </h2>
                <Table
                  columns={columns}
                  data={grades}
                  keyExtractor={(row) => row.id}
                  emptyMessage="No grades available"
                />
              </div>
            </Card>
          </>
        )}

        <AnimatePresence>
          {showModal && isFaculty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-secondary-700/50"
              >
                <div className="p-6 border-b border-gray-200 dark:border-secondary-700 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl z-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingGrade ? 'Edit Grade' : 'Add New Grade'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., Mathematics"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Semester *
                      </label>
                      <Input
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        placeholder="e.g., Fall 2025"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Score *
                      </label>
                      <Input
                        type="number"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                        placeholder="e.g., 85"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Score *
                      </label>
                      <Input
                        type="number"
                        value={formData.max_score}
                        onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grade Letter *
                      </label>
                      <select
                        value={formData.grade_letter}
                        onChange={(e) => setFormData({ ...formData, grade_letter: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                      placeholder="Add comments or feedback..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingGrade ? 'Update Grade' : 'Create Grade'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
