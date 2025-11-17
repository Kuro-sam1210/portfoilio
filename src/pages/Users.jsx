import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';


export default function Users() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toastShownRef = useRef(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Use dummy data instead of API
      const dummyStudents = [
        {
          id: 'ST20250001',
          name: 'John Doe',
          email: 'john@example.com',
          registrationDate: '2024-01-10',
          course: 'Next.js Full-Stack Development',
          status: 'active',
          paymentStatus: 'current',
          phoneNumber: '08012345678',
          city: 'Lagos',
          state: 'LA'
        },
        {
          id: 'ST20250002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          registrationDate: '2024-02-15',
          course: 'React Development',
          status: 'active',
          paymentStatus: 'pending',
          phoneNumber: '08087654321',
          city: 'Abuja',
          state: 'FC'
        },
        {
          id: 'ST20250003',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          registrationDate: '2024-03-20',
          course: 'Python Development',
          status: 'inactive',
          paymentStatus: 'overdue',
          phoneNumber: '08055555555',
          city: 'Port Harcourt',
          state: 'RS'
        }
      ];

      setStudents(dummyStudents);
      if (!toastShownRef.current) {
        toast.success(`Successfully loaded ${dummyStudents.length} students`);
        toastShownRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      if (!toastShownRef.current) {
        toast.error('Failed to fetch students');
        toastShownRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditStudent = (studentId) => {
    window.location.href = `/user/${studentId}`;
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30';
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch(paymentStatus) {
      case 'current': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30';
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30';
      case 'overdue': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30';
    }
  };

  useEffect(() => {
    fetchStudents();
    
    return () => {
      toastShownRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{background: 'var(--gradient-bg-radial)'}}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-cyan-500 border-l-pink-500 rounded-full animate-spin-reverse mx-auto"></div>
          </div>
          <p className="mt-4 text-xl font-medium text-gradient-primary">Loading students...</p>
          <div className="mt-2 w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto animate-shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900 bg-opacity-95">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary mb-2 animate-logoGlow">
                Student Management
              </h1>
              <p className="text-gray-300 text-lg">Manage and monitor your students with ease</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="px-4 py-2 bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-700">
                <span className="text-gray-300">Total: </span>
                <span className="font-bold text-blue-400">{students.length}</span>
              </div>
              <div className="px-4 py-2 bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-700">
                <span className="text-gray-300">Showing: </span>
                <span className="font-bold text-purple-400">{filteredStudents.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-6 py-4 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer"
                style={{background: 'rgba(255, 255, 255, 0.1)'}}
              >
                <option value="all" className="bg-gray-800 text-white">All Status</option>
                <option value="active" className="bg-gray-800 text-white">Active</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4 text-6xl text-gray-600">📊</div>
            <p className="text-gray-400 text-xl">No students found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="card overflow-hidden" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr 
                      key={student.id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group"
                    >
                      <td className="px-6 py-6">
                        <p className="text-white font-medium">{student.id}</p>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{student.name}</p>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-gray-300 group-hover:text-gray-100 transition-colors">{student.email}</p>
                      </td>
                      <td className="px-6 py-6">
                        <div className="inline-flex px-3 py-1 bg-white/10 rounded-full border border-white/20">
                          <p className="text-gray-200 text-xs">{student.course}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)} hover:scale-105 transition-transform duration-200`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(student.paymentStatus)} hover:scale-105 transition-transform duration-200`}>
                          {student.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-gray-300 text-xs">{student.city}, {student.state}</p>
                      </td>
                      <td className="px-6 py-6">
                        <button 
                          onClick={() => handleEditStudent(student.id)}
                          className="button-primary text-xs px-4 py-2 hover:scale-105 transition-all duration-200"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}