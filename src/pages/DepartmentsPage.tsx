import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useAcademicStore } from '../store/academicStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Department } from '../types';
import toast from 'react-hot-toast';

export function DepartmentsPage() {
  const { departments, isLoading, fetchDepartments, createDepartment, updateDepartment, deleteDepartment } = useAcademicStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    head_of_department: '',
    description: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formData);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(formData);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      setEditingDepartment(null);
      setFormData({ name: '', head_of_department: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to save department');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      head_of_department: department.head_of_department,
      description: department.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData({ name: '', head_of_department: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Departments
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage campus departments and their coordinators
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={20} />
            Add Department
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                        <Users size={24} className="text-slate-700 dark:text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {department.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(department)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {department.head_of_department && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Head:</span> {department.head_of_department}
                      </p>
                    )}
                    {department.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {department.description}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {departments.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Users size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No departments yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Get started by creating your first department
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus size={20} />
              Add Department
            </Button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Department Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Head of Department
                </label>
                <Input
                  type="text"
                  value={formData.head_of_department}
                  onChange={(e) => setFormData({ ...formData, head_of_department: e.target.value })}
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the department"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={handleCloseModal} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingDepartment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
