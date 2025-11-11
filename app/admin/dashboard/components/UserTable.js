// components/dashboard/UserTable.js - Cleaned version without poll functionality
'use client'

import { useState } from 'react';
import { Eye, Users, User, Mail, Phone, Calendar } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { SkeletonTable } from '@/components/Skeleton';

const UserTable = ({ users, onViewUser, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: "bg-red-100 text-red-800",
      user: "bg-blue-100 text-blue-800",
      staff: "bg-green-100 text-green-800"
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleStyles[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white">User Management</h2>
        </div>
        <SkeletonTable rows={10} columns={6} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or create a new user.</p>
      </div>
    );
  }

  // Sort users: admins first, then by creation date
  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  const handlePageChange = (page, newItemsPerPage) => {
    if (newItemsPerPage && newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">User Management</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        
        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <User className={`w-5 h-5 ${
                          user.role === 'admin' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Phone size={12} />
                      {user.contact_number || 'Not provided'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="text-gray-900 font-medium">
                        ₹{user.total_bill || 0}
                      </span>
                      <span className="text-gray-500 ml-1 text-xs">total</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => onViewUser(user)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Visible only on mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              {/* User Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  user.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <User className={`w-6 h-6 ${
                    user.role === 'admin' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {user.full_name || 'N/A'}
                    </h4>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <Mail size={10} />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="space-y-2 mb-3">
                {user.contact_number && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Phone size={12} />
                      Contact
                    </span>
                    <span className="text-gray-900 font-medium">{user.contact_number}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    Joined
                  </span>
                  <span className="text-gray-900 font-medium">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Total Bill</span>
                  <span className="text-gray-900 font-semibold">₹{user.total_bill || 0}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onViewUser(user)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200"
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          ))}
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          itemsName="users"
        />
        
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <span>
              {users.filter(u => u.role === 'admin').length} admin{users.filter(u => u.role === 'admin').length !== 1 ? 's' : ''} • {' '}
              {users.filter(u => u.role === 'user').length} regular user{users.filter(u => u.role === 'user').length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;