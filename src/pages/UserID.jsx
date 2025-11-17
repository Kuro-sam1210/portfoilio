import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function UserID() {
  const { studentId } = useParams();
  const toastShownRef = useRef(false);

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchStudentData = async () => {
    if (!studentId) {
      toast.error('No student ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use dummy data instead of API
      const dummyData = {
        name: studentId === 'ST20250001' ? 'John Doe' : studentId === 'ST20250002' ? 'Jane Smith' : 'Bob Wilson',
        registrationDate: '2024-01-10',
        courseStartDate: '2024-02-01',
        expectedCompletion: '2024-12-01',
        modulesCompleted: 5,
        averageGrade: 85,
        assignmentsCompleted: 12,
        attendance: 95,
        payments: 75,
        currentModule: 1,
        modules: [
          { id: 1, title: 'Module 1: Fundamentals' },
          { id: 2, title: 'Module 2: Intermediate Concepts' },
          { id: 3, title: 'Module 3: Advanced Topics' },
          { id: 4, title: 'Module 4: Final Project' }
        ]
      };

      setStudentData(dummyData);
      if (!toastShownRef.current) {
        toast.success('Student data loaded successfully');
        toastShownRef.current = true;
      }
    } catch (err) {
      toast.error('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      toast.success('Changes saved successfully!');
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setStudentData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchStudentData();
    return () => {
      toastShownRef.current = false;
    };
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-cyan-500 border-l-pink-500 rounded-full animate-spin-reverse mx-auto"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gradient-primary">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <p className="text-gray-400 text-xl">No student data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/80 backdrop-blur-md border border-gray-700">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              {getInitials(studentData.name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient-primary">{studentData.name}</h2>
              <p className="text-gray-300 text-sm">
                Student ID: <span className="font-semibold text-blue-400">#{studentId}</span>
              </p>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Enrollment Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gradient-primary">Enrollment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Registration Date', key: 'registrationDate' },
                { label: 'Course Start Date', key: 'courseStartDate' },
                { label: 'Expected Completion', key: 'expectedCompletion' }
              ].map((field) => (
                <div key={field.key} className="p-4 rounded-xl bg-gray-800/80 backdrop-blur-md border border-gray-700">
                  <label className="block text-gray-300 mb-1 text-sm">{field.label}</label>
                  <input
                    type="text"
                    value={studentData[field.key]}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg bg-gray-700/50 text-gray-200 border border-gray-600 cursor-not-allowed"
                  />

                </div>
              ))}
            </div>
          </div>

          {/* Academic Performance */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gradient-primary">Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Modules Completed', key: 'modulesCompleted', unit: 'modules' },
                { label: 'Average Grade', key: 'averageGrade', unit: '%' },
                { label: 'Assignments Completed', key: 'assignmentsCompleted', unit: '' }
              ].map((field) => (
                <div key={field.key} className="p-4 rounded-xl bg-gray-800/80 backdrop-blur-md border border-gray-700">
                  <label className="block text-gray-300 mb-1 text-sm">{field.label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={studentData[field.key]}
                      onChange={(e) => handleChange(field.key, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-white/20"
                    />
                    {field.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{field.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance & Payments */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gradient-primary">Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Attendance Rate', key: 'attendance', unit: '%' },
                { label: 'Payment Status', key: 'payments', unit: '%' }
              ].map((field) => (
                <div key={field.key} className="p-4 rounded-xl bg-gray-800/80 backdrop-blur-md border border-gray-700">
                  <label className="block text-gray-300 mb-1 text-sm">{field.label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={studentData[field.key]}
                      onChange={(e) => handleChange(field.key, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-white/20"
                    />
                    {field.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{field.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Module */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gradient-primary">Current Module</h3>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
              <select
                value={studentData.currentModule}
                onChange={(e) => handleChange('currentModule', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-transparent text-white border border-white/20"
              >
                {studentData.modules?.map((module) => (
                  <option key={module.id} value={module.id} className="bg-gray-800 text-white">
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </main>

        {/* Sticky Save Button */}
        <footer className="mt-6 sticky bottom-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:scale-105 transition-all ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </footer>
      </div>
    </div>
  );
}
