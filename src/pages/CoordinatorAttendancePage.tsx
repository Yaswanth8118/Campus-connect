import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, CheckCircle, XCircle, Clock, Filter, Save, Edit2, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableColumn } from '../components/ui/Table';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  course_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

interface AttendanceSession {
  course: string;
  date: string;
  students: {
    id: string;
    name: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes: string;
  }[];
}

export function CoordinatorAttendancePage() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'mark' | 'history'>('mark');

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil'];
  const courses = {
    'Computer Science': ['Data Structures', 'Algorithms', 'Web Development', 'Database Systems'],
    'Electronics': ['Digital Electronics', 'Microprocessors', 'Communication Systems'],
    'Mechanical': ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing'],
    'Civil': ['Structural Analysis', 'Surveying', 'Construction Management'],
  };

  useEffect(() => {
    if (viewMode === 'history') {
      fetchAttendanceHistory();
    }
  }, [viewMode, selectedDepartment, selectedCourse]);

  const fetchStudents = () => {
    if (!selectedDepartment || !selectedCourse) {
      toast.error('Please select department and course');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const mockStudents: Student[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', department: selectedDepartment },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: selectedDepartment },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: selectedDepartment },
        { id: '4', name: 'Alice Williams', email: 'alice@example.com', department: selectedDepartment },
        { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', department: selectedDepartment },
      ];

      setStudents(mockStudents);
      setAttendanceSession({
        course: selectedCourse,
        date: selectedDate,
        students: mockStudents.map(s => ({
          id: s.id,
          name: s.name,
          status: 'present',
          notes: '',
        })),
      });
      setLoading(false);
    }, 500);
  };

  const fetchAttendanceHistory = () => {
    setLoading(true);
    setTimeout(() => {
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          student_id: '1',
          student_name: 'John Doe',
          course_name: 'Data Structures',
          date: '2025-11-28',
          status: 'present',
          notes: '',
        },
        {
          id: '2',
          student_id: '2',
          student_name: 'Jane Smith',
          course_name: 'Data Structures',
          date: '2025-11-28',
          status: 'absent',
          notes: 'Sick leave',
        },
        {
          id: '3',
          student_id: '3',
          student_name: 'Bob Johnson',
          course_name: 'Data Structures',
          date: '2025-11-28',
          status: 'late',
          notes: 'Traffic',
        },
      ];
      setRecords(mockRecords);
      setLoading(false);
    }, 500);
  };

  const updateAttendance = (studentId: string, status: AttendanceRecord['status']) => {
    if (!attendanceSession) return;

    setAttendanceSession({
      ...attendanceSession,
      students: attendanceSession.students.map(s =>
        s.id === studentId ? { ...s, status } : s
      ),
    });
  };

  const updateNotes = (studentId: string, notes: string) => {
    if (!attendanceSession) return;

    setAttendanceSession({
      ...attendanceSession,
      students: attendanceSession.students.map(s =>
        s.id === studentId ? { ...s, notes } : s
      ),
    });
  };

  const saveAttendance = async () => {
    if (!attendanceSession) return;

    setLoading(true);
    setTimeout(() => {
      toast.success('Attendance saved successfully!');
      setLoading(false);
      setAttendanceSession(null);
      setStudents([]);
    }, 1000);
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
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

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5" />;
      case 'absent':
        return <XCircle className="w-5 h-5" />;
      case 'late':
        return <Clock className="w-5 h-5" />;
      case 'excused':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const calculateStats = () => {
    if (!attendanceSession) return { present: 0, absent: 0, late: 0, excused: 0 };

    const stats = {
      present: attendanceSession.students.filter(s => s.status === 'present').length,
      absent: attendanceSession.students.filter(s => s.status === 'absent').length,
      late: attendanceSession.students.filter(s => s.status === 'late').length,
      excused: attendanceSession.students.filter(s => s.status === 'excused').length,
    };

    return stats;
  };

  const stats = calculateStats();

  const historyColumns: TableColumn<AttendanceRecord>[] = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'student_name',
      label: 'Student',
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'course_name',
      label: 'Course',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusColor(value as any)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value) => value || '-',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Attendance Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Mark and manage student attendance
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={viewMode === 'mark' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('mark')}
              >
                Mark Attendance
              </Button>
              <Button
                variant={viewMode === 'history' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('history')}
              >
                View History
              </Button>
            </div>
          </div>

          {viewMode === 'mark' && (
            <>
              <Card className="mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Select Class
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department *
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => {
                          setSelectedDepartment(e.target.value);
                          setSelectedCourse('');
                        }}
                        className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course *
                      </label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        disabled={!selectedDepartment}
                        className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Course</option>
                        {selectedDepartment &&
                          courses[selectedDepartment as keyof typeof courses]?.map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <Button onClick={fetchStudents} disabled={!selectedDepartment || !selectedCourse}>
                    <Users className="w-4 h-4 mr-2" />
                    Load Students
                  </Button>
                </div>
              </Card>

              {attendanceSession && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="relative overflow-hidden">
                      <div className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Present</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.present}</p>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-green-500 to-green-600" />
                    </Card>
                    <Card className="relative overflow-hidden">
                      <div className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Absent</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.absent}</p>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />
                    </Card>
                    <Card className="relative overflow-hidden">
                      <div className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Late</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.late}</p>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                    </Card>
                    <Card className="relative overflow-hidden">
                      <div className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Excused</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.excused}</p>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                    </Card>
                  </div>

                  <Card>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Student List
                        </h2>
                        <Button onClick={saveAttendance} isLoading={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Attendance
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {attendanceSession.students.map((student, index) => (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gray-50 dark:bg-secondary-800/50 rounded-xl p-4 border border-gray-200 dark:border-secondary-700"
                          >
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {student.name}
                                </h3>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                                  <Button
                                    key={status}
                                    size="sm"
                                    variant={student.status === status ? 'primary' : 'secondary'}
                                    onClick={() => updateAttendance(student.id, status)}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Button>
                                ))}
                              </div>

                              <input
                                type="text"
                                placeholder="Notes..."
                                value={student.notes}
                                onChange={(e) => updateNotes(student.id, e.target.value)}
                                className="flex-1 md:max-w-xs px-3 py-2 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </>
          )}

          {viewMode === 'history' && (
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Attendance History
                  </h2>
                  <Button variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Filter by Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Filter by Course
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                    >
                      <option value="">All Courses</option>
                      {selectedDepartment &&
                        courses[selectedDepartment as keyof typeof courses]?.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <Table
                  columns={historyColumns}
                  data={records}
                  keyExtractor={(row) => row.id}
                  emptyMessage="No attendance records found"
                />
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
