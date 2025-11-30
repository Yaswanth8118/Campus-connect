import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, BookOpen, Target } from 'lucide-react';
import { useAcademicStore } from '../store/academicStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function GradesPage() {
  const { user } = useAuthStore();
  const { grades, isLoading, fetchGrades } = useAcademicStore();

  useEffect(() => {
    if (user?.id) {
      fetchGrades(user.id);
    }
  }, [fetchGrades, user]);

  const calculateOverallGPA = () => {
    if (grades.length === 0) return 0;

    const gradePoints: Record<string, number> = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    };

    const totalPoints = grades.reduce(
      (acc, grade) => acc + (gradePoints[grade.grade_letter] || 0),
      0
    );

    return (totalPoints / grades.length).toFixed(2);
  };

  const calculateAverageScore = () => {
    if (grades.length === 0) return 0;

    const totalPercentage = grades.reduce(
      (acc, grade) => acc + (grade.score / grade.max_score) * 100,
      0
    );

    return Math.round(totalPercentage / grades.length);
  };

  const getGradeColor = (letter: string) => {
    const colors: Record<string, string> = {
      A: 'from-green-500 to-green-600',
      B: 'from-blue-500 to-blue-600',
      C: 'from-amber-500 to-amber-600',
      D: 'from-orange-500 to-orange-600',
      F: 'from-red-500 to-red-600',
    };
    return colors[letter] || 'from-slate-500 to-slate-600';
  };

  const getGradeBgColor = (letter: string) => {
    const colors: Record<string, string> = {
      A: 'bg-green-50 dark:bg-green-900/10',
      B: 'bg-blue-50 dark:bg-blue-900/10',
      C: 'bg-amber-50 dark:bg-amber-900/10',
      D: 'bg-orange-50 dark:bg-orange-900/10',
      F: 'bg-red-50 dark:bg-red-900/10',
    };
    return colors[letter] || 'bg-slate-50 dark:bg-slate-900/10';
  };

  const gpa = calculateOverallGPA();
  const avgScore = calculateAverageScore();

  const statsCards = [
    {
      title: 'Overall GPA',
      value: gpa,
      icon: Award,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    },
    {
      title: 'Average Score',
      value: `${avgScore}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    },
    {
      title: 'Completed Courses',
      value: grades.length,
      icon: BookOpen,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            My Grades
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            View your academic performance and grades
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`bg-gradient-to-br ${stat.bgColor} border-0`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                        <stat.icon size={24} className="text-white" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              {grades.length > 0 ? (
                grades.map((grade, index) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradeColor(
                              grade.grade_letter
                            )} flex items-center justify-center`}
                          >
                            <span className="text-2xl font-bold text-white">
                              {grade.grade_letter}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                              {grade.subject}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <span>
                                Score: {grade.score} / {grade.max_score}
                              </span>
                              {grade.semester && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span>{grade.semester}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {Math.round((grade.score / grade.max_score) * 100)}%
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Percentage
                            </div>
                          </div>

                          <div
                            className={`px-4 py-2 rounded-lg ${getGradeBgColor(
                              grade.grade_letter
                            )}`}
                          >
                            <Badge
                              className={`bg-gradient-to-r ${getGradeColor(
                                grade.grade_letter
                              )} text-white border-0`}
                            >
                              Grade {grade.grade_letter}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${getGradeColor(
                              grade.grade_letter
                            )} h-2 rounded-full transition-all duration-500`}
                            style={{
                              width: `${(grade.score / grade.max_score) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Target size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No grades yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Your grades will appear here once they are posted
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
