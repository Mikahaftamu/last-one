import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { User, Campus, ComplaintType } from '@/types';
import { useState, useEffect } from 'react';

interface PageProps {
    users: User[];
    campuses: Campus[];
    complaintTypes: ComplaintType[];
    auth: {
        user: User;
    };
}

export default function Dashboard({ users, campuses, complaintTypes, auth }: PageProps) {
    const [activeTab, setActiveTab] = useState(() => {
        // Try to restore active tab from localStorage
        return localStorage.getItem('dashboard_active_tab') || 'all';
    });
    const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUserId, setResetUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSection, setActiveSection] = useState(() => {
        // Try to restore active section from localStorage
        const saved = localStorage.getItem('dashboard_active_section');
        console.log("Loaded active section from localStorage:", saved);
        return saved || 'dashboard';
    });
    const [showCoordinatorModal, setShowCoordinatorModal] = useState(false);
    const [selectedComplaintType, setSelectedComplaintType] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [newCoordinator, setNewCoordinator] = useState({
        name: '',
        email: '',
        password: '',
        campus_id: '',
        complaint_type_id: ''
    });

    // Get coordinators by campus
    const getCoordinatorsByCampus = (campusId: number) => {
        return users.filter(user => 
            user.roles?.some(role => 
                role.role === 'coordinator' && 
                // Check both standard and pivot campus_id
                (role.pivot?.campus_id === campusId || role.campus_id === campusId)
            )
        );
    };
    
    // Get coordinator by campus and complaint type
    const getCoordinatorByCampusAndType = (campusId: number, complaintTypeId: number) => {
        return users.find(user => 
            user.roles?.some(role => 
                role.role === 'coordinator' && 
                (role.pivot?.campus_id === campusId || role.campus_id === campusId) &&
                (role.pivot?.complaint_type_id === complaintTypeId || role.complaint_type_id === complaintTypeId)
            )
        );
    };
    
    // Get workers by coordinator (campus and complaint type)
    const getWorkersByCoordinator = (campusId: number, complaintTypeId: number) => {
        return users.filter(user => 
            user.roles?.some(role => 
                role.role === 'worker' && 
                (role.pivot?.campus_id === campusId || role.campus_id === campusId) &&
                (role.pivot?.complaint_type_id === complaintTypeId || role.complaint_type_id === complaintTypeId)
            )
        );
    };

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            console.log("Deleting user:", userId);
            
            // Remember current section and tab
            localStorage.setItem('dashboard_active_section', activeSection);
            localStorage.setItem('dashboard_active_tab', activeTab);
            
            router.delete(route('admin.users.delete', userId), {
                onSuccess: () => {
                    // Force refresh to see the updated list
                    window.location.reload();
                },
                onError: (errors) => {
                    console.error("Error deleting user:", errors);
                    alert('An error occurred while deleting the user. Please try again.');
                }
            });
        }
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const handleResetPassword = (userId: number) => {
        setResetUserId(userId);
        setShowResetModal(true);
    };

    const submitPasswordReset = () => {
        if (!newPassword || !resetUserId) return;
        
        setIsSubmitting(true);
        
        // Remember current section and tab
        localStorage.setItem('dashboard_active_section', activeSection);
        localStorage.setItem('dashboard_active_tab', activeTab);
        
        router.put(route('admin.users.reset-password', resetUserId), {
            password: newPassword
        }, {
            onSuccess: () => {
                setShowResetModal(false);
                setNewPassword('');
                setResetUserId(null);
                setIsSubmitting(false);
                alert('Password reset successfully');
            },
            onError: (errors) => {
                console.error("Error resetting password:", errors);
                setIsSubmitting(false);
                alert('Error resetting password. Please try again.');
            }
        });
    };

    const handleCreateUser = (role: string, complaintTypeId?: number, campusId?: number) => {
        const params: any = { role };
        
        if (complaintTypeId) {
            params.complaint_type_id = complaintTypeId;
        }
        
        if (campusId) {
            params.campus_id = campusId;
        }
        
        router.get(route('admin.users.create'), params);
    };

    const filteredUsers = () => {
        let filtered = users;
        
        // Filter by role
        if (activeTab !== 'all') {
            filtered = filtered.filter(user => 
                user.roles && user.roles.length > 0 && user.roles[0].role === activeTab
            );
        }
        
        // Filter by campus
        if (selectedCampus) {
            filtered = filtered.filter(user => {
                if (!user.roles || user.roles.length === 0) return false;
                
                const role = user.roles[0];
                // Check both regular and pivot campus_id
                const roleCampusId = role.campus_id;
                const pivotCampusId = role.pivot?.campus_id;
                
                console.log("Filtering user:", user.name, "Campus ID:", roleCampusId, "Pivot Campus ID:", pivotCampusId, "Selected Campus:", selectedCampus);
                
                return roleCampusId === selectedCampus || pivotCampusId === selectedCampus;
            });
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(term) || 
                user.email.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    };

    const getCampusName = (campusId: number | null | undefined) => {
        console.log("Getting campus name for ID:", campusId, typeof campusId);
        if (!campusId) return 'N/A';
        const campus = campuses.find(c => c.id === campusId);
        const result = campus ? campus.name : 'Unknown';
        console.log("Found campus:", result);
        return result;
    };

    const getComplaintTypeName = (typeId: number | null | undefined) => {
        if (!typeId) return 'N/A';
        const type = complaintTypes.find(t => t.id === typeId);
        return type ? type.name : 'Unknown';
    };

    // Handle opening the coordinator creation modal
    const openAddCoordinatorModal = (campusId: number) => {
        console.log("Opening modal with campus ID:", campusId);
        setNewCoordinator({
            name: '',
            email: '',
            password: '',
            campus_id: campusId.toString(),
            complaint_type_id: ''
        });
        setShowCoordinatorModal(true);
    };

    // Submit new coordinator
    const submitNewCoordinator = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous errors
        setFormErrors({});
        
        // Validate campus is selected
        if (!newCoordinator.campus_id) {
            setFormErrors({ campus_id: "Please select a campus" });
            return;
        }
        
        // Validate complaint type is selected
        if (!newCoordinator.complaint_type_id) {
            setFormErrors({ complaint_type_id: "Please select a complaint type" });
            return;
        }
        
        setIsSubmitting(true);
        
        // Create data object with campus_id as number
        const submissionData = {
            ...newCoordinator,
            role: 'coordinator',
            campus_id: newCoordinator.campus_id ? parseInt(newCoordinator.campus_id) : null,
            complaint_type_id: newCoordinator.complaint_type_id ? parseInt(newCoordinator.complaint_type_id) : null
        };
        
        console.log("Submitting coordinator with data:", submissionData);
        
        // Remember we want to go back to the User Management section
        localStorage.setItem('dashboard_active_section', 'users');
        
        router.post(route('admin.users.store'), submissionData, {
            onSuccess: () => {
                setShowCoordinatorModal(false);
                setNewCoordinator({
                    name: '',
                    email: '',
                    password: '',
                    campus_id: '',
                    complaint_type_id: ''
                });
                setIsSubmitting(false);
                
                // Force refresh to see the new coordinator
                window.location.reload();
            },
            onError: (errors) => {
                console.error("Submission errors:", errors);
                setFormErrors(errors);
                setIsSubmitting(false);
            }
        });
    };

    // Count users by role
    const usersByRole = {
        coordinator: users.filter(user => user.roles?.[0]?.role === 'coordinator').length,
        worker: users.filter(user => user.roles?.[0]?.role === 'worker').length,
        vp: users.filter(user => user.roles?.[0]?.role === 'vp').length,
        director: users.filter(user => user.roles?.[0]?.role === 'director').length
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            
            {/* Main layout */}
            <div className="min-h-screen bg-gray-50">
                {/* Top navigation */}
                <nav className="bg-white border-b border-gray-200 sticky top-0 left-0 right-0 z-30 w-full shadow-md">
                    <div className="px-6 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-full">
                                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <h1 className="font-bold text-xl text-gray-800">Complaint Management System</h1>
                            </div>
                            <div className="flex items-center space-x-5">
                                <div className="hidden md:flex items-center">
                                    <div className="flex items-center space-x-3 py-2 px-4 bg-gray-100 rounded-lg border border-gray-200">
                                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Welcome,</span>
                                            <span className="block font-semibold text-gray-800">{auth.user.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                
                {/* Page content */}
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Dashboard header and section tabs */}
                        <div className="mb-8 mt-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                                    <p className="text-gray-600 mt-1">Manage users and system configuration</p>
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                                    <p className="text-sm font-medium">Today: {new Date().toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
                                </div>
                            </div>
                            
                            {/* Navigation tabs */}
                            <div className="border-b border-gray-200 mt-6 mb-6">
                                <nav className="-mb-px flex w-full">
                                    <button 
                                        onClick={() => {
                                            setActiveSection('dashboard');
                                            localStorage.setItem('dashboard_active_section', 'dashboard');
                                        }}
                                        className={`flex-1 pb-4 px-4 py-3 flex justify-center items-center transition-colors ${activeSection === 'dashboard' 
                                            ? 'border-b-2 border-blue-500 text-blue-600 font-medium bg-blue-50'
                                            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Dashboard Overview
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setActiveSection('coordinators');
                                            localStorage.setItem('dashboard_active_section', 'coordinators');
                                        }}
                                        className={`flex-1 pb-4 px-4 py-3 flex justify-center items-center transition-colors ${activeSection === 'coordinators' 
                                            ? 'border-b-2 border-blue-500 text-blue-600 font-medium bg-blue-50'
                                            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Campus Coordinators
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setActiveSection('users');
                                            localStorage.setItem('dashboard_active_section', 'users');
                                        }}
                                        className={`flex-1 pb-4 px-4 py-3 flex justify-center items-center transition-colors ${activeSection === 'users' 
                                            ? 'border-b-2 border-blue-500 text-blue-600 font-medium bg-blue-50'
                                            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        User Management
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Dashboard Overview Section */}
                        {activeSection === 'dashboard' && (
                            <>
                                {/* Main dashboard content - two column layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                                    {/* Left column - stats overview */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-white shadow-md rounded-lg p-6 h-full border border-gray-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-lg font-semibold text-gray-800">System Overview</h2>
                                                <div className="flex space-x-2">
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">Active</span>
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">Updated</span>
                                                </div>
                                            </div>
                                            
                                            {/* Stats cards */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                                    <div className="flex items-center">
                                                        <div className="p-3 rounded-full bg-blue-100 mr-4">
                                                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                                                            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                                                    <div className="flex items-center">
                                                        <div className="p-3 rounded-full bg-green-100 mr-4">
                                                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Campuses</p>
                                                            <p className="text-2xl font-bold text-gray-800">{campuses.length}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                                                    <div className="flex items-center">
                                                        <div className="p-3 rounded-full bg-purple-100 mr-4">
                                                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Complaint Types</p>
                                                            <p className="text-2xl font-bold text-gray-800">{complaintTypes.length}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
                                                    <div className="flex items-center">
                                                        <div className="p-3 rounded-full bg-amber-100 mr-4">
                                                            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Active Today</p>
                                                            <p className="text-2xl font-bold text-gray-800">{Math.floor(users.length * 0.7)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column - User distribution */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white shadow-md rounded-lg p-6 h-full border border-gray-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-lg font-semibold text-gray-800">User Distribution</h2>
                                                <div className="p-1 rounded-full bg-gray-50">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="grid gap-4">
                                                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Coordinators</p>
                                                            <p className="text-xl font-semibold text-gray-800">{usersByRole.coordinator}</p>
                                                        </div>
                                                        <div className="p-3 rounded-full bg-blue-100">
                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Workers</p>
                                                            <p className="text-xl font-semibold text-gray-800">{usersByRole.worker}</p>
                                                        </div>
                                                        <div className="p-3 rounded-full bg-green-100">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">VPs</p>
                                                            <p className="text-xl font-semibold text-gray-800">{usersByRole.vp}</p>
                                                        </div>
                                                        <div className="p-3 rounded-full bg-purple-100">
                                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Directors</p>
                                                            <p className="text-xl font-semibold text-gray-800">{usersByRole.director}</p>
                                                        </div>
                                                        <div className="p-3 rounded-full bg-amber-100">
                                                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Campus Coordinators Management Section */}
                        {activeSection === 'coordinators' && (
                            <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Campus Coordinators Management</h2>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">{campuses.length} campuses available</span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Management
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Campus cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {campuses.map(campus => (
                                        <div key={campus.id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-800">{campus.name}</h3>
                                                    </div>
                                                    <button 
                                                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                                        onClick={() => openAddCoordinatorModal(campus.id)}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Add Coordinator
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                {getCoordinatorsByCampus(campus.id).length > 0 ? (
                                                    <div className="space-y-4">
                                                        {getCoordinatorsByCampus(campus.id).map(coordinator => (
                                                            <div key={coordinator.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                                                <div>
                                                                    <div className="font-medium">{coordinator.name}</div>
                                                                    <div className="text-sm text-gray-500">{coordinator.email}</div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {coordinator.roles?.[0]?.pivot?.complaint_type_id && 
                                                                            `Type: ${getComplaintTypeName(coordinator.roles[0].pivot.complaint_type_id)}`
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <a
                                                                        href={route('admin.users.edit', coordinator.id)}
                                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleResetPassword(coordinator.id)}
                                                                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                                                                        title="Reset Password"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(coordinator.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                                                                        title="Delete"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        No coordinators assigned yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* User Management Section */}
                        {activeSection === 'users' && (
                            <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">{users.length} users total</span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Filters and actions */}
                                <div className="mb-6">
                                    {/* Role tabs */}
                                    <div className="border-b border-gray-200 mb-6">
                                        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                                            <li className="mr-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('all'); 
                                                        setSelectedCampus(null);
                                                        localStorage.setItem('dashboard_active_tab', 'all');
                                                    }}
                                                    className={`inline-block p-4 rounded-t-lg ${activeTab === 'all' 
                                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                                >
                                                    All Users
                                                </button>
                                            </li>
                                            <li className="mr-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('coordinator');
                                                        localStorage.setItem('dashboard_active_tab', 'coordinator');
                                                    }}
                                                    className={`inline-block p-4 rounded-t-lg ${activeTab === 'coordinator' 
                                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                                >
                                                    Coordinators
                                                </button>
                                            </li>
                                            <li className="mr-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('worker');
                                                        localStorage.setItem('dashboard_active_tab', 'worker');
                                                    }}
                                                    className={`inline-block p-4 rounded-t-lg ${activeTab === 'worker' 
                                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                                >
                                                    Workers
                                                </button>
                                            </li>
                                            <li className="mr-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('hierarchy'); 
                                                        localStorage.setItem('dashboard_active_tab', 'hierarchy');
                                                    }}
                                                    className={`inline-block p-4 rounded-t-lg ${activeTab === 'hierarchy' 
                                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                                >
                                                    Hierarchy View
                                                </button>
                                            </li>
                                            <li className="mr-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('vp'); 
                                                        setSelectedCampus(null);
                                                        localStorage.setItem('dashboard_active_tab', 'vp');
                                                    }}
                                                    className={`inline-block p-4 rounded-t-lg ${activeTab === 'vp' 
                                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                                >
                                                    VPs
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('director'); 
                                                        setSelectedCampus(null);
                                                        localStorage.setItem('dashboard_active_tab', 'director');
                                                    }}
                                                    className={`inline-block p-4 rounded-t-lg ${activeTab === 'director' 
                                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                                >
                                                    Directors
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 mb-4">
                                        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                                            {/* Search */}
                                            <div className="relative flex-1 max-w-md">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search users..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            
                                            {/* Campus filter (only for coordinators and workers) */}
                                            {(activeTab === 'coordinator' || activeTab === 'worker') && (
                                                <div>
                                                    <select 
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                        value={selectedCampus || ''}
                                                        onChange={(e) => {
                                                            const newCampusId = e.target.value ? Number(e.target.value) : null;
                                                            console.log("Selected campus filter:", newCampusId);
                                                            if (newCampusId) {
                                                                console.log("Campus name:", getCampusName(newCampusId));
                                                            }
                                                            setSelectedCampus(newCampusId);
                                                        }}
                                                    >
                                                        <option value="">All Campuses</option>
                                                        {campuses.map((campus) => (
                                                            <option key={campus.id} value={campus.id}>{campus.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Add user button */}
                                        {activeTab === 'coordinator' ? (
                                            <button
                                                onClick={() => {
                                                    // If no campus selected, prompt the user to select one
                                                    if (!selectedCampus && activeTab === 'coordinator') {
                                                        alert('Please select a campus from the dropdown first before adding a coordinator.');
                                                        return;
                                                    }
                                                    
                                                    setNewCoordinator({
                                                        name: '',
                                                        email: '',
                                                        password: '',
                                                        campus_id: selectedCampus ? selectedCampus.toString() : '',
                                                        complaint_type_id: ''
                                                    });
                                                    setShowCoordinatorModal(true);
                                                }}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300 shadow-md"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add New Coordinator
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleCreateUser(activeTab !== 'all' ? activeTab : '')}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add New {activeTab !== 'all' ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : 'User'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* User table */}
                                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Campus
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers().map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                                                                <span className="text-blue-700 font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-xs text-gray-500">ID: {user.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${user.roles?.[0]?.role === 'coordinator' ? 'bg-blue-100 text-blue-800' : 
                                                            user.roles?.[0]?.role === 'worker' ? 'bg-green-100 text-green-800' : 
                                                            user.roles?.[0]?.role === 'vp' ? 'bg-purple-100 text-purple-800' : 
                                                            user.roles?.[0]?.role === 'director' ? 'bg-amber-100 text-amber-800' : 
                                                            'bg-gray-100 text-gray-800'}`}
                                                        >
                                                            {user.roles?.[0]?.role || 'No Role'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.roles && user.roles[0] && (
                                                            getCampusName(user.roles[0].pivot?.campus_id)
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                            <a
                                                                href={route('admin.users.edit', user.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Edit
                                                            </a>
                                                            <button
                                                                onClick={() => handleResetPassword(user.id)}
                                                                className="text-amber-600 hover:text-amber-900 flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                                </svg>
                                                                Reset
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="text-red-600 hover:text-red-900 flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    
                                    {/* Empty state */}
                                    {filteredUsers().length === 0 && activeTab !== 'hierarchy' && (
                                        <div className="bg-white border border-gray-200 rounded-lg text-center p-8 my-4">
                                            <div className="max-w-md mx-auto">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-base font-medium text-gray-900 mb-1">No users found</h3>
                                                <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                                                <button 
                                                    onClick={() => {setActiveTab('all'); setSelectedCampus(null); setSearchTerm('');}}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Reset filters
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Hierarchy View */}
                                {activeTab === 'hierarchy' && (
                                    <div className="mt-6">
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Campus:</label>
                                            <select 
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 p-2.5"
                                                value={selectedCampus || ''}
                                                onChange={(e) => {
                                                    const newCampusId = e.target.value ? Number(e.target.value) : null;
                                                    setSelectedCampus(newCampusId);
                                                }}
                                            >
                                                <option value="">Select a Campus</option>
                                                {campuses.map((campus) => (
                                                    <option key={campus.id} value={campus.id}>{campus.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {selectedCampus ? (
                                            <div className="space-y-8">
                                                {complaintTypes
                                                    .filter(type => {
                                                        // Check if there's a coordinator for this complaint type at this campus
                                                        const coordinator = getCoordinatorByCampusAndType(selectedCampus, type.id);
                                                        return coordinator !== undefined;
                                                    })
                                                    .map(type => {
                                                        const coordinator = getCoordinatorByCampusAndType(selectedCampus, type.id);
                                                        const workers = getWorkersByCoordinator(selectedCampus, type.id);
                                                        
                                                        // Only show complaint types that should have workers (water, electricity, plumbing)
                                                        // Skip cleaning and other types that don't have workers
                                                        const restrictedTypes = ['Cleaning', 'Other'];
                                                        const shouldHaveWorkers = !restrictedTypes.includes(type.name);
                                                        
                                                        return (
                                                            <div key={type.id} className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
                                                                <div className="bg-blue-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="p-2 bg-blue-100 rounded-full">
                                                                            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                            </svg>
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-lg font-semibold text-gray-800">{type.name} Department</h3>
                                                                            <p className="text-sm text-gray-600">{getCampusName(selectedCampus)} Campus</p>
                                                                        </div>
                                                                    </div>
                                                                    {shouldHaveWorkers && (
                                                                        <button
                                                                            onClick={() => {
                                                                                if (!coordinator) {
                                                                                    alert(`Please create a ${type.name} Coordinator first.`);
                                                                                    return;
                                                                                }
                                                                                handleCreateUser('worker', type.id, selectedCampus);
                                                                            }}
                                                                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                            </svg>
                                                                            Add Worker
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="p-4">
                                                                    {/* Coordinator section */}
                                                                    {coordinator ? (
                                                                        <div className="mb-6">
                                                                            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                                                                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                                </svg>
                                                                                Coordinator:
                                                                            </h4>
                                                                            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                                                                                    <span className="text-blue-700 font-semibold">{coordinator.name.charAt(0).toUpperCase()}</span>
                                                                                </div>
                                                                                <div className="ml-4">
                                                                                    <div className="font-medium">{coordinator.name}</div>
                                                                                    <div className="text-sm text-gray-500">{coordinator.email}</div>
                                                                                </div>
                                                                                <div className="ml-auto flex space-x-2">
                                                                                    <a
                                                                                        href={route('admin.users.edit', coordinator.id)}
                                                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                                                                        title="Edit"
                                                                                    >
                                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                        </svg>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 flex items-center justify-between border border-yellow-200">
                                                                            <div className="flex items-center">
                                                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                                </svg>
                                                                                <p>No {type.name} Coordinator assigned to this campus</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => openAddCoordinatorModal(selectedCampus)}
                                                                                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium border border-yellow-300 hover:bg-yellow-200"
                                                                            >
                                                                                Assign
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Workers section - only for types that should have workers */}
                                                                    {shouldHaveWorkers && (
                                                                        <div>
                                                                            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                                                                                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                </svg>
                                                                                Workers:
                                                                            </h4>
                                                                            
                                                                            {workers.length > 0 ? (
                                                                                <div className="space-y-2">
                                                                                    {workers.map(worker => (
                                                                                        <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                                            <div className="flex items-center">
                                                                                                <div className="flex-shrink-0 h-9 w-9 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                                                                                                    <span className="text-green-700 font-semibold">{worker.name.charAt(0).toUpperCase()}</span>
                                                                                                </div>
                                                                                                <div className="ml-3">
                                                                                                    <div className="font-medium">{worker.name}</div>
                                                                                                    <div className="text-sm text-gray-500">{worker.email}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex space-x-2">
                                                                                                <a
                                                                                                    href={route('admin.users.edit', worker.id)}
                                                                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                                                                                    title="Edit"
                                                                                                >
                                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                                    </svg>
                                                                                                </a>
                                                                                                <button
                                                                                                    onClick={() => handleResetPassword(worker.id)}
                                                                                                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                                                                                                    title="Reset Password"
                                                                                                >
                                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                                                                    </svg>
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleDelete(worker.id)}
                                                                                                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                                                                                                    title="Delete"
                                                                                                >
                                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                                    </svg>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                                                                                    No workers assigned yet
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                                
                                                {complaintTypes
                                                    .filter(type => {
                                                        const coordinator = getCoordinatorByCampusAndType(selectedCampus, type.id);
                                                        return coordinator === undefined;
                                                    })
                                                    .length > 0 && (
                                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
                                                        <h3 className="text-lg font-medium text-gray-800 mb-3">Departments without Coordinators</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {complaintTypes
                                                                .filter(type => {
                                                                    const coordinator = getCoordinatorByCampusAndType(selectedCampus, type.id);
                                                                    return coordinator === undefined;
                                                                })
                                                                .map(type => (
                                                                    <div key={type.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                                                        <div className="flex items-center">
                                                                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                            </svg>
                                                                            <span>{type.name}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                setNewCoordinator({
                                                                                    ...newCoordinator,
                                                                                    campus_id: selectedCampus.toString(),
                                                                                    complaint_type_id: type.id.toString()
                                                                                });
                                                                                setShowCoordinatorModal(true);
                                                                            }}
                                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                                                                        >
                                                                            Assign
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-gray-200 rounded-lg text-center p-8">
                                                <div className="max-w-md mx-auto">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Please Select a Campus</h3>
                                                    <p className="text-gray-500 mb-4">Select a campus to view its coordinator-worker hierarchy.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Reset User Password</h2>
                            <button 
                                onClick={() => setShowResetModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={isSubmitting}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password:</label>
                            <input 
                                type="password" 
                                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowResetModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitPasswordReset}
                                className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                                disabled={isSubmitting || !newPassword}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add Coordinator Modal */}
            {showCoordinatorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Add Campus Coordinator</h2>
                            <button 
                                onClick={() => setShowCoordinatorModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitNewCoordinator}>
                            {newCoordinator.campus_id && (
                                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm text-blue-700">
                                        Adding coordinator for campus: <strong>{getCampusName(parseInt(newCoordinator.campus_id))}</strong>
                                    </p>
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                                <input 
                                    type="text" 
                                    className={`border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
                                    value={newCoordinator.name}
                                    onChange={(e) => setNewCoordinator({...newCoordinator, name: e.target.value})}
                                    required
                                />
                                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                                <input 
                                    type="email" 
                                    className={`border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
                                    value={newCoordinator.email}
                                    onChange={(e) => setNewCoordinator({...newCoordinator, email: e.target.value})}
                                    required
                                />
                                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                                <input 
                                    type="password" 
                                    className={`border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
                                    value={newCoordinator.password}
                                    onChange={(e) => setNewCoordinator({...newCoordinator, password: e.target.value})}
                                    required
                                />
                                {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Campus:</label>
                                <select 
                                    className={`border ${formErrors.campus_id ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
                                    value={newCoordinator.campus_id}
                                    onChange={(e) => setNewCoordinator({...newCoordinator, campus_id: e.target.value})}
                                    disabled={newCoordinator.campus_id !== '' && !!campuses.find(c => c.id.toString() === newCoordinator.campus_id)}
                                    required
                                >
                                    <option value="">Select Campus</option>
                                    {campuses.map(campus => (
                                        <option key={campus.id} value={campus.id.toString()}>
                                            {campus.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.campus_id && <p className="mt-1 text-sm text-red-600">{formErrors.campus_id}</p>}
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type:</label>
                                <select 
                                    className={`border ${formErrors.complaint_type_id ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} 
                                    value={newCoordinator.complaint_type_id}
                                    onChange={(e) => setNewCoordinator({...newCoordinator, complaint_type_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Complaint Type</option>
                                    {complaintTypes.map(type => (
                                        <option key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.complaint_type_id && <p className="mt-1 text-sm text-red-600">{formErrors.complaint_type_id}</p>}
                            </div>
                            {formErrors.role && <p className="mb-4 text-sm text-red-600">{formErrors.role}</p>}
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowCoordinatorModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Add Coordinator'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
} 