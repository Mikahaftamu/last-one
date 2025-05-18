import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export interface Complaint {
    id: number;
    complaint_id: string;
    status: string;
    location: string;
    description: string;
    created_at: string;
    campus: {
        id: number;
        name: string;
    };
    complaint_type: {
        id: number;
        name: string;
    };
    worker?: {
        id: number;
        name: string;
    };
}

interface Props {
    assignedComplaints?: Complaint[];
    stats?: {
        totalAssigned: number;
        pending: number;
        inProgress: number;
        completed: number;
    };
    onAssignWorker?: (complaint: Complaint) => void;
    onUpdateStatus?: (complaint: Complaint) => void;
}

export default function CoordinatorDashboard({ 
    assignedComplaints = [], 
    stats = {
        totalAssigned: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
    },
    onAssignWorker,
    onUpdateStatus
}: Props) {
    // Calculate percentages for the dashboard stats
    const totalComplaints = stats.totalAssigned > 0 ? stats.totalAssigned : 1; // Avoid division by zero
    const pendingPercentage = Math.round((stats.pending / totalComplaints) * 100);
    const inProgressPercentage = Math.round((stats.inProgress / totalComplaints) * 100);
    const completedPercentage = Math.round((stats.completed / totalComplaints) * 100);
    
    return (
        <div>
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Assigned</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">{stats.totalAssigned}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm text-gray-500">
                            All complaints in your department
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
                                        <div className="ml-2">
                                            <span className="text-xs font-medium text-yellow-800 bg-yellow-100 px-1.5 py-0.5 rounded-full">
                                                {pendingPercentage}%
                                            </span>
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pendingPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">{stats.inProgress}</div>
                                        <div className="ml-2">
                                            <span className="text-xs font-medium text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                                {inProgressPercentage}%
                                            </span>
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${inProgressPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">{stats.completed}</div>
                                        <div className="ml-2">
                                            <span className="text-xs font-medium text-green-800 bg-green-100 px-1.5 py-0.5 rounded-full">
                                                {completedPercentage}%
                                            </span>
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${completedPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Complaints Section */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Complaints</h3>
                    {assignedComplaints.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {assignedComplaints.length} Total
                        </span>
                    )}
                </div>
                
                <div className="border-t border-gray-200">
                    {assignedComplaints.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assignedComplaints.slice(0, 5).map((complaint) => (
                                        <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{complaint.complaint_id}</div>
                                                <div className="text-sm text-gray-500">{complaint.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{complaint.complaint_type.name}</div>
                                                <div className="text-sm text-gray-500">{complaint.campus.name}</div>
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
                                                {complaint.worker ? (
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 flex-shrink-0 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-medium">{complaint.worker.name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div className="ml-2">{complaint.worker.name}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-orange-500 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        Not assigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(complaint.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <Link
                                                        href={route('complaints.show', complaint.complaint_id)}
                                                        className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>
                                                    
                                                    {!complaint.worker && onAssignWorker && (
                                                        <button
                                                            onClick={() => onAssignWorker(complaint)}
                                                            className="flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                            </svg>
                                                            Assign
                                                        </button>
                                                    )}
                                                    
                                                    {onUpdateStatus && (
                                                        <button
                                                            onClick={() => onUpdateStatus(complaint)}
                                                            className="flex items-center text-green-600 hover:text-green-900 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Update
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {assignedComplaints.length > 5 && (
                                <div className="px-6 py-3 bg-gray-50 text-center">
                                    <div className="text-sm">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-900">
                                            Showing 5 of {assignedComplaints.length} complaints
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints assigned yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                There are no complaints in your department.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 