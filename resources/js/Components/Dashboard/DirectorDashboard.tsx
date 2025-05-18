import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface ComplaintTypeStats {
    id: number;
    name: string;
    total_complaints: number;
    pending_complaints: number;
    resolved_complaints: number;
    average_resolution_time: number;
}

interface Props {
    complaintTypeStats?: ComplaintTypeStats[];
    overallStats?: {
        totalComplaints: number;
        pendingComplaints: number;
        resolvedComplaints: number;
        averageResolutionTime: number;
        satisfactionRate: number;
    };
}

export default function DirectorDashboard({ complaintTypeStats = [], overallStats = {
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    averageResolutionTime: 0,
    satisfactionRate: 0,
} }: Props) {
    // Calculate the percentage of resolved complaints
    const resolutionRate = overallStats.totalComplaints > 0 
        ? Math.round((overallStats.resolvedComplaints / overallStats.totalComplaints) * 100) 
        : 0;
    
    // Helper function to determine status color
    const getStatusColor = (value: number, thresholds: [number, number]) => {
        if (value >= thresholds[1]) return 'bg-green-500';
        if (value >= thresholds[0]) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    
    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {/* Total Complaints */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Complaints</p>
                                <p className="text-2xl font-semibold text-gray-900">{overallStats.totalComplaints}</p>
                            </div>
                            <div className="rounded-full p-3 bg-blue-50">
                                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <span className="text-gray-500">All time</span>
                        </div>
                    </div>
                </div>

                {/* Pending Complaints */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Pending Complaints</p>
                                <p className="text-2xl font-semibold text-gray-900">{overallStats.pendingComplaints}</p>
                            </div>
                            <div className="rounded-full p-3 bg-yellow-50">
                                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <span className={`${
                                overallStats.pendingComplaints > overallStats.totalComplaints * 0.3 
                                    ? 'text-red-500' 
                                    : 'text-green-500'
                            } flex items-center`}>
                                {overallStats.pendingComplaints > 0 && (
                                    <span>{Math.round((overallStats.pendingComplaints / overallStats.totalComplaints) * 100)}% of total</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Resolved Complaints */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Resolved Complaints</p>
                                <p className="text-2xl font-semibold text-gray-900">{overallStats.resolvedComplaints}</p>
                            </div>
                            <div className="rounded-full p-3 bg-green-50">
                                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <span className="text-green-500 flex items-center">
                                <span>{resolutionRate}% completion rate</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Avg. Resolution Time */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Avg. Resolution Time</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {overallStats.averageResolutionTime}
                                    <span className="text-sm font-normal text-gray-500 ml-1">days</span>
                                </p>
                            </div>
                            <div className="rounded-full p-3 bg-indigo-50">
                                <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            <span className={`${
                                overallStats.averageResolutionTime <= 4 ? 'text-green-500' : 'text-yellow-500'
                            } flex items-center`}>
                                <span>Target: 4 days</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Satisfaction Rate */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Satisfaction Rate</p>
                                <p className="text-2xl font-semibold text-gray-900">{overallStats.satisfactionRate}%</p>
                            </div>
                            <div className="rounded-full p-3 bg-purple-50">
                                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${getStatusColor(overallStats.satisfactionRate, [70, 85])}`}
                                        style={{ width: `${overallStats.satisfactionRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaint Type Table with Progress Indicators */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Complaint Type Distribution</h3>
                        <span className="text-sm text-gray-500">{complaintTypeStats.length} complaint types</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {complaintTypeStats.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {complaintTypeStats.map((type) => {
                                    const typeResolutionRate = type.total_complaints > 0
                                        ? Math.round((type.resolved_complaints / type.total_complaints) * 100)
                                        : 0;
                                    
                                    return (
                                        <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></div>
                                                    <span className="text-sm font-medium text-gray-900">{type.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {type.total_complaints}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {type.pending_complaints}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {type.resolved_complaints}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-900 mr-2">{typeResolutionRate}%</span>
                                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${getStatusColor(typeResolutionRate, [60, 80])}`}
                                                            style={{ width: `${typeResolutionRate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-sm ${
                                                        type.average_resolution_time <= 3 
                                                            ? 'text-green-600' 
                                                            : type.average_resolution_time <= 5 
                                                                ? 'text-yellow-600' 
                                                                : 'text-red-600'
                                                    } mr-2`}>
                                                        {type.average_resolution_time} days
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-500">No complaint type statistics available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 