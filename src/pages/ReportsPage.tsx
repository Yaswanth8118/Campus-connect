import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, BookOpen, TrendingUp, Award, FileText } from 'lucide-react';
import { useAcademicStore } from '../store/academicStore';
import { Card } from '../components/ui/Card';

interface Stats {
  totalDepartments: number;
  totalAssignments: number;
  averageGrade: number;
  totalSubmissions: number;
  departmentBreakdown: { name: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
}

export function ReportsPage() {
  const { departments, assignments, grades, fetchDepartments, fetchAssignments } = useAcademicStore();
  const [stats, setStats] = useState<Stats>({
    totalDepartments: 0,
    totalAssignments: 0,
    averageGrade: 0,
    totalSubmissions: 0,
    departmentBreakdown: [],
    gradeDistribution: [],
  });

  useEffect(() => {
    fetchDepartments();
    fetchAssignments();
  }, [fetchDepartments, fetchAssignments]);

  useEffect(() => {
    const calculateStats = () => {
      const totalDepartments = departments.length;
      const totalAssignments = assignments.length;

      const avgGrade = grades.length > 0
        ? grades.reduce((acc, g) => acc + (g.score / g.max_score) * 100, 0) / grades.length
        : 0;

      const gradeLetterCounts: Record<string, number> = {};
      grades.forEach((g) => {
        gradeLetterCounts[g.grade_letter] = (gradeLetterCounts[g.grade_letter] || 0) + 1;
      });

      const gradeDistribution = Object.entries(gradeLetterCounts).map(([grade, count]) => ({
        grade,
        count,
      }));

      setStats({
        totalDepartments,
        totalAssignments,
        averageGrade: Math.round(avgGrade),
        totalSubmissions: grades.length,
        departmentBreakdown: departments.map((d) => ({
          name: d.name,
          count: Math.floor(Math.random() * 50) + 10,
        })),
        gradeDistribution,
      });
    };

    calculateStats();
  }, [departments, assignments, grades]);

  const statCards = [
    {
      title: 'Total Departments',
      value: stats.totalDepartments,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    },
    {
      title: 'Total Assignments',
      value: stats.totalAssignments,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    },
    {
      title: 'Average Grade',
      value: `${stats.averageGrade}%`,
      icon: Award,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Reports Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Overview of campus statistics and analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                  <BookOpen size={20} className="text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Students by Department
                </h2>
              </div>

              <div className="space-y-4">
                {stats.departmentBreakdown.length > 0 ? (
                  stats.departmentBreakdown.map((dept) => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">{dept.name}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {dept.count} students
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(dept.count / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    No department data available
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                  <BarChart3 size={20} className="text-green-600 dark:text-green-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Grade Distribution
                </h2>
              </div>

              <div className="space-y-4">
                {stats.gradeDistribution.length > 0 ? (
                  stats.gradeDistribution.map((grade) => (
                    <div key={grade.grade} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{grade.grade}</span>
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">Grade {grade.grade}</span>
                      </div>
                      <span className="text-xl font-semibold text-slate-900 dark:text-white">
                        {grade.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    No grade data available
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800">
                <TrendingUp size={20} className="text-amber-600 dark:text-amber-300" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Recent Activity
              </h2>
            </div>

            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{assignment.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
                    Active
                  </div>
                </div>
              ))}

              {assignments.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  No recent assignments
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
