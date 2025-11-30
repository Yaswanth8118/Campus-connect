import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useAcademicStore } from '../store/academicStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';

export function AttendancePage() {
  const { user } = useAuthStore();
  const { attendanceRecords, isLoading, fetchAttendance } = useAcademicStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user?.id) {
      fetchAttendance(user.id);
    }
  }, [fetchAttendance, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'absent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'late':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'excused':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const calculateStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((r) => r.status === 'present').length;
    const absent = attendanceRecords.filter((r) => r.status === 'absent').length;
    const late = attendanceRecords.filter((r) => r.status === 'late').length;
    const excused = attendanceRecords.filter((r) => r.status === 'excused').length;

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, percentage };
  };

  const stats = calculateStats();

  const groupedByCourse = attendanceRecords.reduce((acc, record) => {
    if (!acc[record.course_name]) {
      acc[record.course_name] = [];
    }
    acc[record.course_name].push(record);
    return acc;
  }, {} as Record<string, typeof attendanceRecords>);

  const statCards = [
    {
      title: 'Attendance Rate',
      value: `${stats.percentage}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    },
    {
      title: 'Total Classes',
      value: stats.total,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    },
    {
      title: 'Present',
      value: stats.present,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    },
    {
      title: 'Absent',
      value: stats.absent,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            My Attendance
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Track your attendance across all courses
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        ) : (
          <>
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

            {Object.keys(groupedByCourse).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedByCourse).map(([courseName, records], index) => {
                  const courseStats = {
                    total: records.length,
                    present: records.filter((r) => r.status === 'present').length,
                    absent: records.filter((r) => r.status === 'absent').length,
                    late: records.filter((r) => r.status === 'late').length,
                  };

                  const attendanceRate = courseStats.total > 0
                    ? Math.round((courseStats.present / courseStats.total) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={courseName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                              <BarChart3 size={24} className="text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {courseName}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {courseStats.total} classes • {attendanceRate}% attendance
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-600 dark:text-slate-400">Attendance Progress</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{attendanceRate}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${attendanceRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {records.slice(0, 9).map((record) => (
                            <div
                              key={record.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(record.status)}
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {new Date(record.date).toLocaleDateString()}
                                  </p>
                                  <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getStatusColor(record.status)}`}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {records.length > 9 && (
                          <div className="mt-4 text-center">
                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                              View all {records.length} records
                            </button>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No attendance records yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your attendance records will appear here once they are marked
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
