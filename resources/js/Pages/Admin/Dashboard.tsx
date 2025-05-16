import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { User, Campus, ComplaintType } from '@/types';
import { useState } from 'react';

interface PageProps {
    users: User[];
    campuses: Campus[];
    complaintTypes: ComplaintType[];
    auth: {
        user: User;
    };
}

export default function Dashboard({ users, campuses, complaintTypes, auth }: PageProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUserId, setResetUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.users.destroy', userId));
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
        
        router.put(route('admin.users.reset-password', resetUserId), {
            password: newPassword
        }, {
            onSuccess: () => {
                setShowResetModal(false);
                setNewPassword('');
                setResetUserId(null);
            }
        });
    };

    const handleCreateUser = (role: string) => {
        router.get(route('admin.users.create'), { role });
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
            filtered = filtered.filter(user => 
                user.roles && user.roles.length > 0 && user.roles[0].campus_id === selectedCampus
            );
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
        if (!campusId) return 'N/A';
        const campus = campuses.find(c => c.id === campusId);
        return campus ? campus.name : 'Unknown';
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
                <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 w-full shadow-sm">
                    <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <h1 className="font-bold text-xl text-gray-800">Complaint Management System</h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="hidden md:flex items-center">
                                    <div className="flex items-center space-x-2 py-2 px-4 bg-gray-100 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
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
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
                <div className="pt-16 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Dashboard header */}
                        <div className="mb-6 mt-6">
                            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage users and system configuration</p>
                        </div>
                        
                        {/* Main dashboard content - two column layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Left column - stats overview */}
                            <div className="lg:col-span-2">
                                <div className="bg-white shadow-md rounded-lg p-6 h-full">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">System Overview</h2>
                                    
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
                                <div className="bg-white shadow-md rounded-lg p-6 h-full">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">User Distribution</h2>
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
                        
                        {/* User management section */}
                        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">User Management</h2>
                            
                            {/* Filters and actions */}
                            <div className="mb-6">
                                {/* Role tabs */}
                                <div className="border-b border-gray-200 mb-6">
                                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                                        <li className="mr-2">
                                            <button
                                                onClick={() => {setActiveTab('all'); setSelectedCampus(null);}}
                                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'all' 
                                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                                    : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                            >
                                                All Users
                                            </button>
                                        </li>
                                        <li className="mr-2">
                                            <button
                                                onClick={() => setActiveTab('coordinator')}
                                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'coordinator' 
                                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                                    : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                            >
                                                Coordinators
                                            </button>
                                        </li>
                                        <li className="mr-2">
                                            <button
                                                onClick={() => setActiveTab('worker')}
                                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'worker' 
                                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                                    : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                            >
                                                Workers
                                            </button>
                                        </li>
                                        <li className="mr-2">
                                            <button
                                                onClick={() => {setActiveTab('vp'); setSelectedCampus(null);}}
                                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'vp' 
                                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                                    : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'}`}
                                            >
                                                VPs
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => {setActiveTab('director'); setSelectedCampus(null);}}
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
                                        <div className="relative">
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
                                                    onChange={(e) => setSelectedCampus(e.target.value ? Number(e.target.value) : null)}
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
                                    <button
                                        onClick={() => handleCreateUser(activeTab !== 'all' ? activeTab : '')}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New {activeTab !== 'all' ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : 'User'}
                                    </button>
                                </div>
                            </div>

                            {/* User table */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Campus
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers().map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <span className="text-gray-500 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
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
                                                    {getCampusName(user.roles?.[0]?.campus_id)}
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
                                {filteredUsers().length === 0 && (
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
                        </div>
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
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowResetModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitPasswordReset}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 