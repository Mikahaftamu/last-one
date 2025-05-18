import React from 'react';

interface ComplaintTypeStats {
    id: number;
    name: string;
    count: number;
    pending: number;
    in_progress: number;
    completed: number;
}

interface Props {
    campusName: string;
    complaintTypeStats: ComplaintTypeStats[];
    coordinatorCount: number;
    workerCount: number;
    avgResolutionTime: number;
}

export default function CampusDetailStats({ 
    campusName,
    complaintTypeStats,
    coordinatorCount,
    workerCount,
    avgResolutionTime
}: Props) {
    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {campusName} - Detailed Statistics
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Breakdown of complaints by type and personnel for this campus.
                </p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Coordinators</dt>
                                    <dd className="text-lg font-medium text-gray-900">{coordinatorCount}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Workers</dt>
                                    <dd className="text-lg font-medium text-gray-900">{workerCount}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
                                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Resolution Time</dt>
                                    <dd className="text-lg font-medium text-gray-900">{avgResolutionTime} days</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Complaint Type Breakdown */}
            <div className="px-4 pb-5">
                <h4 className="text-base font-medium text-gray-700 mb-3">Complaints by Type</h4>
                
                {complaintTypeStats.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {complaintTypeStats.map((type) => (
                                    <tr key={type.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {type.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {type.count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {type.pending}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {type.in_progress}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {type.completed}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-500 h-2 rounded-full" 
                                                    style={{ 
                                                        width: `${type.count > 0 ? (type.completed / type.count) * 100 : 0}%` 
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-xs mt-1 block">
                                                {type.count > 0 ? Math.round((type.completed / type.count) * 100) : 0}% completed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No complaint types available for this campus.</p>
                )}
            </div>
        </div>
    );
} 