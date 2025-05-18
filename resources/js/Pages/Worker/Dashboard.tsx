import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { router, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/Layouts/DashboardLayout';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Campus {
  id: number;
  name: string;
}

interface ComplaintType {
  id: number;
  name: string;
}

interface Complaint {
  id: number;
  complaint_id: string;
  title: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  campus: Campus;
  complaintType: ComplaintType;
  coordinator: User;
  image_path: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  resolution_image: string | null;
}

interface ProgressUpdate {
  id: number;
  complaint_id: number;
  notes: string;
  created_at: string;
  user: User;
}

interface PageProps {
  auth: any;
  worker: User;
  complaints: Complaint[];
  stats: {
    totalAssigned: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  performance: {
    completed: number;
    avgResolutionTime: number;
    completionRate: number;
  };
  progressUpdates: ProgressUpdate[];
}

export default function Dashboard({
  auth,
  worker,
  complaints,
  stats,
  performance,
  progressUpdates
}: PageProps) {
  // Debug logs for worker dashboard data
  console.log("Worker Dashboard Data:", { complaints, stats, progressUpdates });
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [isAddingProgress, setIsAddingProgress] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'progress'>('overview');
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>(complaints);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update filtered complaints when filters change
  useEffect(() => {
    console.log("useEffect running with complaints:", complaints);
    
    // Ensure we're working with an array
    if (!Array.isArray(complaints)) {
      console.error("Complaints is not an array:", complaints);
      setFilteredComplaints([]);
      return;
    }
    
    let result = [...complaints];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(complaint => complaint.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(complaint => 
        complaint.complaint_id.toLowerCase().includes(query) ||
        complaint.location.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query)
      );
    }
    
    console.log("Filtered complaints:", result);
    setFilteredComplaints(result);
  }, [complaints, statusFilter, searchQuery]);

  // Function to open the status update modal
  const openUpdateStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setIsUpdatingStatus(true);
  };

  // Function to open the progress update modal
  const openAddProgressModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setProgressNotes('');
    setIsAddingProgress(true);
  };

  // Function to update complaint status
  const updateComplaintStatus = () => {
    if (!selectedComplaint || !updateStatus) return;
    
    const formData = new FormData();
    formData.append('complaint_id', selectedComplaint.id.toString());
    formData.append('status', updateStatus);
    
    // Add empty resolution notes if status is completed to satisfy backend validation
    if (updateStatus === 'completed') {
      formData.append('resolution_notes', 'Task completed');
    }
    
    router.post(route('worker.complaints.update-status'), formData, {
      onSuccess: () => {
        setIsUpdatingStatus(false);
        setSelectedComplaint(null);
        setUpdateStatus('');
      },
      onError: (errors) => {
        console.error('Error updating status:', errors);
        alert('Failed to update status. Please try again.');
      }
    });
  };

  // Function to add progress update
  const addProgressUpdate = () => {
    if (!selectedComplaint || !progressNotes) return;
    
    router.post(route('worker.complaints.update-progress'), {
      complaint_id: selectedComplaint.id,
      progress_notes: progressNotes
    }, {
      onSuccess: () => {
        setIsAddingProgress(false);
        setSelectedComplaint(null);
        setProgressNotes('');
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="Worker Dashboard" />

      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Worker Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your assigned tasks
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`${
                activeTab === 'complaints'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`${
                activeTab === 'progress'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Progress Updates
            </button>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="mb-6 overflow-hidden bg-white shadow-sm rounded-lg">
            <div className="p-6 text-gray-900">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Assigned Tasks */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                        <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                          <dd>
                            <div className="text-lg font-semibold text-gray-900">{stats.totalAssigned}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-500">
                        {stats.inProgress + stats.pending} active, {stats.completed} completed
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Tasks */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
                        <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                          <dd>
                            <div className="text-lg font-semibold text-gray-900">{stats.pending}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-500">
                        {stats.totalAssigned > 0 
                          ? `${Math.round((stats.pending / stats.totalAssigned) * 100)}% of total tasks` 
                          : 'No tasks assigned'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* In Progress Tasks */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                        <svg className="h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                          <dd>
                            <div className="text-lg font-semibold text-gray-900">{stats.inProgress}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-500">
                        {stats.totalAssigned > 0 
                          ? `${Math.round((stats.inProgress / stats.totalAssigned) * 100)}% of total tasks` 
                          : 'No tasks assigned'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                        <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                          <dd>
                            <div className="text-lg font-semibold text-gray-900">{stats.completed}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-500">
                        {stats.totalAssigned > 0 
                          ? `Completion rate: ${performance.completionRate}%` 
                          : 'No tasks assigned'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="mt-8">
                <h3 className="text-base font-medium text-gray-900 mb-3">Your Performance</h3>
                
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {/* Completed Tasks */}
                    <div className="p-5">
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Tasks</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{performance.completed}</dd>
                      <dd className="mt-2 text-sm text-gray-500">
                        {performance.completionRate}% completion rate
                      </dd>
                    </div>
                    
                    {/* Average Resolution Time */}
                    <div className="p-5">
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg. Resolution Time</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{performance.avgResolutionTime}h</dd>
                      <dd className="mt-2 text-sm text-gray-500">
                        {performance.avgResolutionTime > 0 
                          ? `Avg. time to resolve a complaint` 
                          : 'No complaints resolved yet'}
                      </dd>
                    </div>
                    
                    {/* Current Active Tasks */}
                    <div className="p-5">
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Tasks</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.pending + stats.inProgress}</dd>
                      <dd className="mt-2 text-sm text-gray-500">
                        {stats.pending + stats.inProgress > 0 
                          ? `${stats.inProgress} in progress, ${stats.pending} pending` 
                          : 'No active tasks'}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium text-gray-900">Recent Tasks</h3>
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all
                  </button>
                </div>
                
                {complaints && complaints.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {complaints.slice(0, 3).map((complaint) => (
                          <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {complaint.complaint_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {complaint.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                complaint.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {complaint.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <Link
                                  href={route('complaints.show', complaint.complaint_id)}
                                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                  View
                                </Link>
                                
                                <button
                                  onClick={() => openUpdateStatusModal(complaint)}
                                  className="text-green-600 hover:text-green-900 font-medium"
                                >
                                  Update
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You have no tasks assigned yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="mb-6 overflow-hidden bg-white shadow-sm rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 md:mb-0">
                  All Assigned Tasks
                </h2>
                
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 items-stretch md:items-center">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Search by ID or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <select
                    className="block w-full md:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              {filteredComplaints && filteredComplaints.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {complaint.complaint_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {complaint.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {complaint.complaintType?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              complaint.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {complaint.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link
                                href={route('complaints.show', complaint.complaint_id)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                              >
                                View
                              </Link>
                              
                              <button
                                onClick={() => openUpdateStatusModal(complaint)}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                Update
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'You have no tasks assigned yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Updates Tab */}
        {activeTab === 'progress' && (
          <div className="mb-6 overflow-hidden bg-white shadow-sm rounded-lg">
            <div className="p-6 text-gray-900">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Progress Updates</h2>
              
              {progressUpdates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {progressUpdates.map((update) => (
                        <tr key={update.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {update.complaint_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {update.notes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(update.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openUpdateStatusModal(complaints.find(c => c.id === update.complaint_id) as Complaint)}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No progress updates found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You have no progress updates yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {isUpdatingStatus && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Update Task Status
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Complaint ID: {selectedComplaint.complaint_id}
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <div className={`mt-1 px-3 py-2 rounded-md bg-gray-50 text-sm ${
                  selectedComplaint.status === 'pending' ? 'text-yellow-800' :
                  selectedComplaint.status === 'in_progress' ? 'text-blue-800' :
                  selectedComplaint.status === 'completed' ? 'text-green-800' :
                  'text-red-800'
                }`}>
                  {selectedComplaint.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Set to "In Progress" while working on the task, or "Completed" when finished.
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="mr-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setIsUpdatingStatus(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={updateComplaintStatus}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {isAddingProgress && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Add Progress Update
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Complaint ID: {selectedComplaint.complaint_id}
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress Notes
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  rows={4}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Describe the current progress or steps taken..."
                  required
                />
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="mr-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setIsAddingProgress(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={addProgressUpdate}
                >
                  Add Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 