import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';

interface AttendanceRecord {
  id: string;
  student_id: string;
  course_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
  created_at: string;
}

interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalClasses: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  });
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [user]);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const mockRecords: AttendanceRecord[] = [
        { id: '1', student_id: user?.id || '', course_name: 'Data Structures', date: '2025-11-28', status: 'present', notes: '', created_at: '2025-11-28' },
        { id: '2', student_id: user?.id || '', course_name: 'Algorithms', date: '2025-11-28', status: 'present', notes: '', created_at: '2025-11-28' },
        { id: '3', student_id: user?.id || '', course_name: 'Data Structures', date: '2025-11-27', status: 'late', notes: 'Arrived 10 mins late', created_at: '2025-11-27' },
        { id: '4', student_id: user?.id || '', course_name: 'Web Development', date: '2025-11-27', status: 'present', notes: '', created_at: '2025-11-27' },
        { id: '5', student_id: user?.id || '', course_name: 'Algorithms', date: '2025-11-26', status: 'absent', notes: '', created_at: '2025-11-26' },
        { id: '6', student_id: user?.id || '', course_name: 'Database Systems', date: '2025-11-26', status: 'present', notes: '', created_at: '2025-11-26' },
        { id: '7', student_id: user?.id || '', course_name: 'Web Development', date: '2025-11-25', status: 'excused', notes: 'Medical leave', created_at: '2025-11-25' },
        { id: '8', student_id: user?.id || '', course_name: 'Data Structures', date: '2025-11-25', status: 'present', notes: '', created_at: '2025-11-25' },
      ];

      setRecords(mockRecords);
      calculateStats(mockRecords);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: AttendanceRecord[]) => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;

    const attendancePercentage = total > 0
      ? Math.round(((present + late + excused) / total) * 100)
      : 0;

    setStats({
      totalClasses: total,
      present,
      absent,
      late,
      excused,
      attendancePercentage,
    });
  };

  const getUniqueValues = (key: keyof AttendanceRecord) => {
    return Array.from(new Set(records.map(r => r[key] as string)));
  };

  const filteredRecords = records.filter(record => {
    const courseMatch = selectedCourse === 'all' || record.course_name === selectedCourse;
    const monthMatch = selectedMonth === 'all' || record.date.startsWith(selectedMonth);
    return courseMatch && monthMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-warning-500" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-info-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'danger';
      case 'late':
        return 'warning';
      case 'excused':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-accent-50/50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                My Attendance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your class attendance and performance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm mb-1">Total Classes</p>
                  <p className="text-3xl font-bold">{stats.totalClasses}</p>
                </div>
                <Calendar className="w-12 h-12 text-primary-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-success-100 text-sm mb-1">Present</p>
                  <p className="text-3xl font-bold">{stats.present}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-success-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-danger-500 to-danger-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-danger-100 text-sm mb-1">Absent</p>
                  <p className="text-3xl font-bold">{stats.absent}</p>
                </div>
                <XCircle className="w-12 h-12 text-danger-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warning-100 text-sm mb-1">Late</p>
                  <p className="text-3xl font-bold">{stats.late}</p>
                </div>
                <Clock className="w-12 h-12 text-warning-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-accent-500 to-accent-600 text-black">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-100 text-sm mb-1">Percentage</p>
                  <p className="text-3xl font-bold">{stats.attendancePercentage}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-accent-200" />
              </div>
            </Card>
          </div>

          <Card className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-6 h-6" />
                Filter Records
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Courses</option>
                  {getUniqueValues('course_name').map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Months</option>
                  <option value="2025-11">November 2025</option>
                  <option value="2025-10">October 2025</option>
                  <option value="2025-09">September 2025</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Attendance Records
            </h2>

            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-secondary-700">
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Course</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 dark:border-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {record.course_name}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <Badge variant={getStatusBadgeVariant(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {record.notes || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendancePage;
