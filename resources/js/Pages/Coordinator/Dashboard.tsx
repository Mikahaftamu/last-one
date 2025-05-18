import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { router, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/Layouts/DashboardLayout';
import CoordinatorDashboard, { Complaint } from '@/Components/Dashboard/CoordinatorDashboard';

interface Worker {
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

interface PageProps {
  auth: any;
  coordinator: any;
  complaints: Complaint[];
  workers: Worker[];
  stats: {
    totalAssigned: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  campus: Campus;
  complaintType: ComplaintType;
}

export default function Dashboard({
  auth,
  coordinator,
  complaints,
  workers,
  stats,
  campus,
  complaintType
}: PageProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [isAssigningWorker, setIsAssigningWorker] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'workers'>('overview');
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>(complaints);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update filtered complaints when filters change
  useEffect(() => {
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
    
    setFilteredComplaints(result);
  }, [complaints, statusFilter, searchQuery]);

  // Function to open the worker assignment modal
  const openAssignWorkerModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setSelectedWorker('');
    setIsAssigningWorker(true);
  };

  // Function to open the status update modal
  const openUpdateStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setIsUpdatingStatus(true);
  };

  // Function to assign a worker to a complaint
  const assignWorker = () => {
    if (!selectedComplaint || !selectedWorker) return;
    
    router.post(route('coordinator.complaints.assign-worker'), {
      complaint_id: selectedComplaint.id,
      worker_id: selectedWorker
    }, {
      onSuccess: () => {
        setIsAssigningWorker(false);
        setSelectedComplaint(null);
        setSelectedWorker('');
      }
    });
  };

  // Function to update complaint status
  const updateComplaintStatus = () => {
    if (!selectedComplaint || !updateStatus) return;
    
    router.post(route('coordinator.complaints.update-status'), {
      complaint_id: selectedComplaint.id,
      status: updateStatus
    }, {
      onSuccess: () => {
        setIsUpdatingStatus(false);
        setSelectedComplaint(null);
        setUpdateStatus('');
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="Coordinator Dashboard" />

      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Coordinator Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage complaints for {campus?.name} - {complaintType?.name}
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
              Complaints
            </button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`${
                activeTab === 'workers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Workers
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
              
              <CoordinatorDashboard 
                assignedComplaints={complaints} 
                stats={stats} 
                onAssignWorker={openAssignWorkerModal}
                onUpdateStatus={openUpdateStatusModal}
              />
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="mb-6 overflow-hidden bg-white shadow-sm rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 md:mb-0">All Complaints</h2>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search complaints..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              {filteredComplaints.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              complaint.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {complaint.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {complaint.worker ? complaint.worker.name : 
                              <span className="text-orange-500">Not assigned</span>
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link
                                href={route('complaints.show', complaint.complaint_id)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                              >
                                View
                              </Link>
                              
                              {!complaint.worker && (
                                <button
                                  onClick={() => openAssignWorkerModal(complaint)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  Assign
                                </button>
                              )}
                              
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
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No complaints match your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <div className="mb-6 overflow-hidden bg-white shadow-sm rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">My Workers</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {workers.length} Total Workers
                </span>
              </div>
              
              {workers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Complaints</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workers.map((worker) => {
                        const workerComplaints = complaints.filter(c => c.worker?.id === worker.id);
                        const completedComplaints = workerComplaints.filter(c => c.status === 'completed').length;
                        const completionRate = workerComplaints.length > 0 
                          ? Math.round((completedComplaints / workerComplaints.length) * 100) 
                          : 0;
                          
                        return (
                          <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">{worker.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{workerComplaints.length} Complaints</div>
                              <div className="text-sm text-gray-500">
                                {completedComplaints} completed, {workerComplaints.length - completedComplaints} pending
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div className={`h-2.5 rounded-full ${
                                    completionRate > 80 ? 'bg-green-500' : 
                                    completionRate > 50 ? 'bg-yellow-500' : 
                                    completionRate > 0 ? 'bg-orange-500' : 'bg-gray-500'
                                  }`} style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-600">{completionRate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No workers assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No workers have been assigned to you yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Worker assignment modal */}
        {isAssigningWorker && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="bg-gray-100 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Assign Worker</h3>
                  <button 
                    onClick={() => setIsAssigningWorker(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Complaint Details</h4>
                  <p className="text-sm text-gray-500 mb-1">ID: <span className="font-medium text-gray-900">{selectedComplaint.complaint_id}</span></p>
                  <p className="text-sm text-gray-500 mb-1">Location: <span className="font-medium text-gray-900">{selectedComplaint.location}</span></p>
                  <p className="text-sm text-gray-500">Status: 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedComplaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedComplaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Worker
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                  >
                    <option value="">Select a worker</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>{worker.name}</option>
                    ))}
                  </select>
                  {!selectedWorker && (
                    <p className="mt-1 text-sm text-gray-500">Please select a worker to assign this complaint to.</p>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="mr-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setIsAssigningWorker(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={assignWorker}
                    disabled={!selectedWorker}
                  >
                    Assign Worker
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status update modal */}
        {isUpdatingStatus && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="bg-gray-100 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Update Status</h3>
                  <button 
                    onClick={() => setIsUpdatingStatus(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Complaint Details</h4>
                  <p className="text-sm text-gray-500 mb-1">ID: <span className="font-medium text-gray-900">{selectedComplaint.complaint_id}</span></p>
                  <p className="text-sm text-gray-500 mb-1">Location: <span className="font-medium text-gray-900">{selectedComplaint.location}</span></p>
                  <p className="text-sm text-gray-500">Current Status: 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedComplaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedComplaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      selectedComplaint.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
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
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {updateStatus === 'completed' && (
                    <p className="mt-1 text-sm text-gray-500">Marking as completed will automatically set the resolution timestamp.</p>
                  )}
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
      </div>
    </DashboardLayout>
  );
} 