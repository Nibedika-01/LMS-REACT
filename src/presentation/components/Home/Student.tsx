import React, { useEffect, useState } from 'react';
import { UserPlus, ArrowLeft, RotateCcw, Phone, Edit, Trash2, X, Search } from 'lucide-react';
import apiClient from '../../../infrastructure/api/apiClient';

interface Student {
  id: string;
  name: string;
  address: string;
  contactNo: string;
  faculty: string;
  semester: string;
  initials?: string;
  booksIssued?: Array<{
    bookId: number;
    bookTitle: string;
    issueDate: string;
  }>;
}

interface EditStudentFormData {
  name: string;
  contactNo: string;
  address: string;
  faculty: string;
  semester: string;
}

const StudentManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<EditStudentFormData>({
    name: '',
    contactNo: '',
    address: '',
    faculty: '',
    semester: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    address: '',
    semester: '',
    faculty: ''
  });

  const fetchStudentsWithBooks = async () => {
    try {
      const [studentsResponse, issuesResponse] = await Promise.all([
        apiClient.get('/Students'),
        apiClient.get('/Issues')
      ]);

      const data = studentsResponse.data.map((s: any) => {
        const studentIssues = issuesResponse.data.filter(
          (issue: any) => issue.studentId === s.id && !issue.returnDate
        );
        const booksIssued = studentIssues.map((issue: any) => ({
          bookId: issue.bookId,
          bookTitle: issue.bookTitle || 'Unknown Book',
          issueDate: issue.issueDate
        }));

        return {
          id: s.id.toString(),
          name: s.name,
          address: s.address,
          contactNo: s.contactNo,
          faculty: s.faculty,
          semester: s.semester,
          initials: s.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
          booksIssued: booksIssued
        };
      });

      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students. Please try again.');
    } 
  };

  useEffect(() => {
    fetchStudentsWithBooks();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(q) ||
      student.faculty.toLowerCase().includes(q) ||
      student.contactNo.toLowerCase().includes(q)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStudent = async () => {
    try {
      const response = await apiClient.post('/Students', formData);
      console.log('Student added successfully:', response.data);
      alert('Student added successfully!');
      handleResetForm();
      setView('list');
      await fetchStudentsWithBooks();
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please try again.');
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name,
      contactNo: student.contactNo,
      address: student.address,
      faculty: student.faculty,
      semester: student.semester
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    const updateData = {
      name: editFormData.name,
      contactNo: editFormData.contactNo,
      address: editFormData.address,
      faculty: editFormData.faculty,
      semester: editFormData.semester
    };
    try {
      const response = await apiClient.put(`/Students/${editingStudent.id}`, updateData);
      if (response.status === 200) {
        await fetchStudentsWithBooks();
        setShowEditModal(false);
        setEditingStudent(null);
        setEditFormData({
          name: '',
          contactNo: '',
          address: '',
          faculty: '',
          semester: ''
        });
        alert('Student updated successfully!');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await apiClient.delete(`/Students/${studentId}`);
      alert('Student deleted successfully');
      setStudents(students.filter(student => student.id !== studentId));
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      contactNo: '',
      address: '',
      semester: '',
      faculty: ''
    });
  };

  if (view === 'add') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Student/Member</h1>
            <p className="text-gray-500 mt-1">Register a new library student/member</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <UserPlus className="w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900">Member Information</h2>
              </div>
              <p className="text-gray-500">Enter the details of the new library member</p>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    placeholder="+977-9812345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Semester */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select semester</option>
                    <option value="1st Semester">1st semester</option>
                    <option value="2nd Semester">2nd semester</option>
                    <option value="3rd Semester">3rd semester</option>
                    <option value="4th Semester">4th semester</option>
                    <option value="5th Semester">5th semester</option>
                    <option value="6th Semester">6th semester</option>
                    <option value="7th Semester">7th semester</option>
                    <option value="8th Semester">8th semester</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddStudent}
                disabled={!formData.name || !formData.contactNo || !formData.faculty || !formData.semester}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                Add Member
              </button>
              <button
                onClick={handleResetForm}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 mt-1">Manage library members and their information</p>
        </div>
        <button
          onClick={() => setView('add')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Students Table */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Students</h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, faculty, contact"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Library Members
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Faculty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Book Issued</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery
                        ? `No books match "${searchQuery}"`
                        : 'No books in the library yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700">
                            {student.initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">ID: {student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {student.contactNo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{student.faculty}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{student.semester.split(' ')[0]}</div>
                      </td>
                      <td className="px-6 py-4">
                        {student.booksIssued && student.booksIssued.length > 0 ? (
                          <div className="space-y-1">
                            {student.booksIssued.map((book, index) => (
                              <div key={index} className="text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {book.bookTitle}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No books issued</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded"
                            onClick={() => handleEditClick(student)}
                          >
                            <Edit className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Edit className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Edit Student</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.contactNo}
                  onChange={(e) => setEditFormData({ ...editFormData, contactNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Faculty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.faculty}
                  onChange={(e) => setEditFormData({ ...editFormData, faculty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.semester}
                  onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select semester</option>
                  <option value="1st Semester">1st semester</option>
                  <option value="2nd Semester">2nd semester</option>
                  <option value="3rd Semester">3rd semester</option>
                  <option value="4th Semester">4th semester</option>
                  <option value="5th Semester">5th semester</option>
                  <option value="6th Semester">6th semester</option>
                  <option value="7th Semester">7th semester</option>
                  <option value="8th Semester">8th semester</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateStudent}
                  disabled={!editFormData.name.trim() || !editFormData.contactNo || !editFormData.faculty || !editFormData.semester}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update Student
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;