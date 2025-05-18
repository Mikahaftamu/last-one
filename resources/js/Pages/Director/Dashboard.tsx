import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import DirectorDashboard from '@/Components/Dashboard/DirectorDashboard';
import DashboardCharts from '@/Components/Dashboard/DashboardCharts';

// Interfaces for local use to avoid conflicts
interface ComplaintTypeStats {
    id: number;
    name: string;
    total_complaints: number;
    pending_complaints: number;
    resolved_complaints: number;
    average_resolution_time: number;
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
    complaint_type?: {
        id: number;
        name: string;
    };
    campus?: {
        id: number;
        name: string;
    };
}

interface DepartmentPerformance {
    id: number;
    name: string;
    total_assigned: number;
    resolved_on_time: number;
    avg_resolution_time: number;
    satisfaction_rate: number;
}

interface CampusStats {
    id: number;
    name: string;
    total_complaints: number;
    pending_complaints: number;
    resolved_complaints: number;
}

interface PageProps {
    auth: any;
    complaintTypeStats: ComplaintTypeStats[];
    overallStats: {
        totalComplaints: number;
        pendingComplaints: number;
        resolvedComplaints: number | Complaint[];
        averageResolutionTime: number;
        satisfactionRate: number;
    };
    recentComplaints?: Complaint[];
    departmentPerformance?: DepartmentPerformance[];
    campusStats?: CampusStats[];
    campuses?: {id: number, name: string}[];
    complaintTypes?: {id: number, name: string}[];
}

export default function Dashboard({ 
    auth, 
    complaintTypeStats,
    overallStats,
    recentComplaints = [],
    departmentPerformance = [],
    campusStats = [],
    campuses = [],
    complaintTypes = []
}: PageProps) {
    const [expandedCampus, setExpandedCampus] = useState<number | null>(null);
    
    // Process resolvedComplaints if it's an array of objects
    const processedOverallStats = {
        ...overallStats,
        resolvedComplaints: Array.isArray(overallStats.resolvedComplaints) 
            ? overallStats.resolvedComplaints.length 
            : overallStats.resolvedComplaints
    };
    
    // Create derived campus stats from the provided campusStats or fallback to default calculation
    const derivedCampusStats = campusStats.length > 0 
        ? campusStats 
        : recentComplaints.reduce((acc: CampusStats[], complaint) => {
            if (complaint.campus) {
                const existingStat = acc.find(stat => stat.id === complaint.campus_id);
                if (existingStat) {
                    existingStat.total_complaints++;
                    if (complaint.status === 'pending') {
                        existingStat.pending_complaints++;
                    } else if (complaint.status === 'completed' || complaint.status === 'resolved') {
                        existingStat.resolved_complaints++;
                    }
                } else {
                    acc.push({
                        id: complaint.campus_id,
                        name: complaint.campus?.name || 'Unknown Campus',
                        total_complaints: 1,
                        pending_complaints: complaint.status === 'pending' ? 1 : 0,
                        resolved_complaints: (complaint.status === 'completed' || complaint.status === 'resolved') ? 1 : 0
                    });
                }
            }
            return acc;
        }, []);
    
    // Get both recent and resolved complaints
    const allComplaints = [
        ...recentComplaints,
        ...(Array.isArray(overallStats.resolvedComplaints) ? overallStats.resolvedComplaints : [])
    ];
    
    // Remove duplicate complaints (by ID)
    const uniqueComplaints = allComplaints.filter((complaint, index, self) => 
        index === self.findIndex(c => c.id === complaint.id)
    );
    
    // Get complaints by campus
    const getComplaintsByCampus = (campusId: number): Complaint[] => {
        return uniqueComplaints.filter(complaint => complaint.campus_id === campusId);
    };
    
    // Toggle expanded campus
    const toggleCampusExpansion = (campusId: number) => {
        if (expandedCampus === campusId) {
            setExpandedCampus(null);
        } else {
            setExpandedCampus(campusId);
        }
    };
    
    // Debug function to check what's happening
    const logCampusComplaints = (campusId: number) => {
        console.log(`Campus ID: ${campusId}`);
        console.log(`Total complaints: ${uniqueComplaints.length}`);
        console.log(`Filtered complaints: ${getComplaintsByCampus(campusId).length}`);
        console.log('Complaint campus IDs:', uniqueComplaints.map(c => c.campus_id));
    };
    
    return (
        <DashboardLayout>
            <Head title="Director Dashboard" />
            
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Director Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Overview of all complaint statistics and department performance
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
                    {/* Summary Statistics */}
                    <DirectorDashboard 
                        complaintTypeStats={complaintTypeStats} 
                        overallStats={processedOverallStats} 
                    />
                    
                    {/* Visualizations Section */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Complaints Overview</h3>
                        <DashboardCharts 
                            campusStats={derivedCampusStats}
                            overallStats={processedOverallStats}
                        />
                    </div>
                    
                    {/* Campus-wise Complaint Distribution */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Campus-wise Complaint Distribution</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Complaints</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {derivedCampusStats.map((campus) => (
                                        <React.Fragment key={campus.id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {campus.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {campus.total_complaints}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {campus.pending_complaints}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {campus.resolved_complaints}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {campus.total_complaints > 0
                                                        ? `${Math.round((campus.resolved_complaints / campus.total_complaints) * 100)}%`
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            toggleCampusExpansion(campus.id);
                                                            logCampusComplaints(campus.id);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                    >
                                                        {expandedCampus === campus.id ? (
                                                            <>
                                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                                Hide Complaints
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                                View Complaints
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedCampus === campus.id && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-4">
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <h4 className="text-md font-medium text-gray-900 mb-3">Complaints at {campus.name} Campus</h4>
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-100">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {getComplaintsByCampus(campus.id).length > 0 ? (
                                                                            getComplaintsByCampus(campus.id).map(complaint => (
                                                                                <tr key={complaint.id} className="hover:bg-gray-50">
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                        {complaint.complaint_id}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                                        {complaint.complaint_type?.name || 'N/A'}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                                        {complaint.location}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                                            complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                            complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                                            complaint.status === 'completed' || complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                                            'bg-red-100 text-red-800'
                                                                                        }`}>
                                                                                            {complaint.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                                        {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                                        <Link
                                                                                            href={`/complaints/${complaint.complaint_id}`}
                                                                                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                                                        >
                                                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                            </svg>
                                                                                            View Details
                                                                                        </Link>
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                                                                                    No complaints found for this campus
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                    {complaint.complaint_type?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.location || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        complaint.status === 'completed' || complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {complaint.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link 
                                                        href={`/complaints/${complaint.complaint_id}`}
                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {/* Recently Resolved Complaints Section */}
                    {Array.isArray(overallStats.resolvedComplaints) && overallStats.resolvedComplaints.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Resolved Complaints</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved At</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(overallStats.resolvedComplaints as Complaint[]).map((complaint) => (
                                            <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {complaint.complaint_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.campus?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.complaint_type?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.location || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {complaint.status?.replace('_', ' ').toUpperCase() || 'RESOLVED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link 
                                                        href={`/complaints/${complaint.complaint_id}`}
                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                    </Link>
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