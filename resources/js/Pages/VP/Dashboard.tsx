import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import VPDashboard from '@/Components/Dashboard/VPDashboard';
import CampusDetailStats from '@/Components/Dashboard/CampusDetailStats';

interface CampusStats {
    id: number;
    name: string;
    total_complaints: number;
    pending_complaints: number;
    resolved_complaints: number;
}

interface ComplaintTypeStats {
    id: number;
    name: string;
    count: number;
    pending: number;
    in_progress: number;
    completed: number;
}

interface CampusDetail {
    id: number;
    name: string;
    complaintTypeStats: ComplaintTypeStats[];
    coordinatorCount: number;
    workerCount: number;
    avgResolutionTime: number;
}

interface Complaint {
    id: number;
    complaint_id: string;
    campus_id: number;
    complaint_type_id: number;
    location: string;
    description: string;
    image_path: string | null;
    status: string;
    assigned_coordinator_id: number | null;
    assigned_worker_id: number | null;
    created_at: string;
    updated_at: string;
    resolution_notes: string | null;
    resolution_image: string | null;
    resolved_at: string | null;
    verified_at: string | null;
    campus?: {
        name: string;
    };
    complaintType?: {
        name: string;
    };
}

interface PageProps {
    auth: any;
    campusStats: CampusStats[];
    overallStats: {
        totalComplaints: number;
        pendingComplaints: number;
        resolvedComplaints: number | Complaint[];
        averageResolutionTime: number;
    };
    recentComplaints?: any[];
    campusDetails?: Record<number, CampusDetail>;
}

export default function Dashboard({ 
    auth, 
    campusStats,
    overallStats,
    recentComplaints = [],
    campusDetails = {}
}: PageProps) {
    const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
    
    const viewCampusDetails = (campusId: number) => {
        setSelectedCampus(campusId === selectedCampus ? null : campusId);
    };
    
    // Find the selected campus detail
    const selectedCampusDetail = selectedCampus ? campusDetails[selectedCampus] : null;
    
    // Process resolvedComplaints if it's an array of objects
    const processedOverallStats = {
        ...overallStats,
        resolvedComplaints: Array.isArray(overallStats.resolvedComplaints) 
            ? overallStats.resolvedComplaints.length 
            : overallStats.resolvedComplaints
    };
    
    return (
        <DashboardLayout>
            <Head title="VP Dashboard" />
            
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            VP Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Overview of all complaint statistics across campuses
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
            
            {/* Main Content */}
            <div className="mb-6 overflow-hidden bg-white shadow-sm rounded-lg">
                <div className="p-6 text-gray-900">
                    <VPDashboard 
                        campusStats={campusStats} 
                        overallStats={processedOverallStats} 
                    />
                    
                    {/* Campus Details Section */}
                    <div className="mt-8">
                        <div className="flex flex-wrap gap-4">
                            {campusStats.map(campus => (
                                <button
                                    key={campus.id}
                                    onClick={() => viewCampusDetails(campus.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedCampus === campus.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                >
                                    {campus.name}
                                </button>
                            ))}
                        </div>
                        
                        {selectedCampusDetail && (
                            <div className="mt-4">
                                <CampusDetailStats
                                    campusName={selectedCampusDetail.name}
                                    complaintTypeStats={selectedCampusDetail.complaintTypeStats}
                                    coordinatorCount={selectedCampusDetail.coordinatorCount}
                                    workerCount={selectedCampusDetail.workerCount}
                                    avgResolutionTime={selectedCampusDetail.avgResolutionTime}
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Recent Complaints Section */}
                    {recentComplaints && recentComplaints.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Complaints</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentComplaints.map((complaint) => (
                                            <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {complaint.complaint_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.campus?.name || 'N/A'}
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {/* Resolved Complaints Section */}
                    {Array.isArray(overallStats.resolvedComplaints) && overallStats.resolvedComplaints.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Resolved Complaints</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(overallStats.resolvedComplaints as Complaint[]).map((complaint) => (
                                            <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {complaint.complaint_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.location || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {complaint.description || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {complaint.status?.replace('_', ' ').toUpperCase() || 'COMPLETED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : 'N/A'}
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
        </DashboardLayout>
    );
} 