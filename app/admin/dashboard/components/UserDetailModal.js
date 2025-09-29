// components/dashboard/UserDetailModal.js - Fixed version
'use client'

import { useState, useEffect } from 'react';
import { X, Hash, User, Mail, Phone, Shield, Users, Calendar, Edit3, Save, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const UserDetailModal = ({ user, onClose, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClientComponentClient();

  // Form state - Initialize properly when user changes
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    contact_number: '',
    department: '',
    academic_year: ''
  });

  // Reset form data whenever user changes or modal opens
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        department: user.department || '',
        academic_year: user.academic_year || ''
      });
      // Reset states when user changes
      setIsEditing(false);
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [user]);

  if (!user) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.contact_number && !/^\d{10,15}$/.test(formData.contact_number)) {
      setError('Contact number must be 10-15 digits');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          updateData: {
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            contact_number: formData.contact_number?.trim() || null,
            department: formData.department?.trim() || null,
            academic_year: formData.academic_year || null
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to update user');
        return;
      }

      setSuccess('User details updated successfully!');
      setIsEditing(false);
      
      // Call the callback to update the parent component
      if (onUserUpdate) {
        onUserUpdate(result.user);
      }

      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error updating user:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      contact_number: user.contact_number || '',
      department: user.department || '',
      academic_year: user.academic_year || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const userFields = [
    { 
      key: 'full_name',
      label: 'Full Name', 
      value: isEditing ? formData.full_name : user.full_name, 
      icon: User,
      editable: true,
      type: 'text'
    },
    { 
      key: 'email',
      label: 'Email Address', 
      value: isEditing ? formData.email : user.email, 
      icon: Mail,
      editable: true,
      type: 'email'
    },
    { 
      key: 'contact_number',
      label: 'Phone Number', 
      value: isEditing ? formData.contact_number : user.contact_number, 
      icon: Phone,
      editable: true,
      type: 'tel'
    },
    { 
      key: 'role',
      label: 'Role', 
      value: user.role, 
      icon: Shield,
      editable: false, // Role is no longer editable
      type: 'text'
    },
    { 
      key: 'department',
      label: 'Department', 
      value: isEditing ? formData.department : (user.department || 'N/A'), 
      icon: Users,
      editable: true,
      type: 'select',
      options: [
        { value: '', label: 'Select Department' },
        { value: 'CS', label: 'Computer Science' },
        { value: 'IT', label: 'Information Technology' },
        { value: 'EXTC', label: 'Electronics & Telecommunications' },
        { value: 'MECH', label: 'Mechanical Engineering' },
        { value: 'CIVIL', label: 'Civil Engineering' },
        { value: 'EE', label: 'Electrical Engineering' }
      ]
    },
    { 
      key: 'academic_year',
      label: 'Year', 
      value: isEditing ? formData.academic_year : (user.academic_year || 'N/A'), 
      icon: Calendar,
      editable: true,
      type: 'select',
      options: [
        { value: '', label: 'Select Year' },
        { value: 'FE', label: 'First Year (FE)' },
        { value: 'SE', label: 'Second Year (SE)' },
        { value: 'TE', label: 'Third Year (TE)' },
        { value: 'BE', label: 'Final Year (BE)' }
      ]
    }
  ];

  const renderField = (field) => {
    if (!isEditing || !field.editable) {
      return (
        <div key={field.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <field.icon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{field.label}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {field.value || 'N/A'}
              {field.key === 'role' && (
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  field.value === 'admin' ? 'bg-red-100 text-red-800' :
                  field.value === 'staff' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {field.value}
                </span>
              )}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div key={field.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <field.icon className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={field.value || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={field.value || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit User' : 'User Details'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Update user information' : 'Complete user information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-150"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {userFields.map(renderField)}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          {!isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Edit3 size={16} />
                Edit User
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;