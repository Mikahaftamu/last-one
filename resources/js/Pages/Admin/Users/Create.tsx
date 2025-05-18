import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Campus, ComplaintType, User } from '@/types';

interface PageProps {
    campuses: Campus[];
    complaintTypes: ComplaintType[];
    defaultRole: string;
    complaint_type_id?: string;
    campus_id?: string;
    users?: User[];
}

export default function Create({ campuses, complaintTypes, defaultRole, complaint_type_id, campus_id, users }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: defaultRole || '',
        campus_id: campus_id || '',
        complaint_type_id: complaint_type_id || '',
    });

    const [showCampusField, setShowCampusField] = useState(false);
    const [showComplaintTypeField, setShowComplaintTypeField] = useState(false);
    const [availableCoordinators, setAvailableCoordinators] = useState<User[]>([]);

    useEffect(() => {
        // Determine which fields to show based on the selected role
        setShowCampusField(['coordinator', 'worker'].includes(data.role));
        setShowComplaintTypeField(['coordinator', 'worker'].includes(data.role));
        
        // Reset related fields when role changes
        if (!showCampusField) {
            setData('campus_id', '');
        }
        if (!showComplaintTypeField) {
            setData('complaint_type_id', '');
        }
    }, [data.role]);

    // Update available coordinators when campus or complaint type changes
    useEffect(() => {
        if (data.role === 'worker' && data.campus_id && data.complaint_type_id && users) {
            const coordinators = users.filter(user => 
                user.roles?.some(role => 
                    role.role === 'coordinator' && 
                    (role.pivot?.campus_id === parseInt(data.campus_id) || role.campus_id === parseInt(data.campus_id)) &&
                    (role.pivot?.complaint_type_id === parseInt(data.complaint_type_id) || role.complaint_type_id === parseInt(data.complaint_type_id))
                )
            );
            setAvailableCoordinators(coordinators);
        } else {
            setAvailableCoordinators([]);
        }
    }, [data.campus_id, data.complaint_type_id, data.role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ensure campus_id and complaint_type_id are properly handled
        const submissionData = {
            ...data,
            // Convert to actual numbers for the backend
            campus_id: data.campus_id ? parseInt(data.campus_id) : null,
            complaint_type_id: data.complaint_type_id ? parseInt(data.complaint_type_id) : null
        };
        
        console.log("Submitting new user data:", submissionData);
        
        post(route('admin.users.store'), {
            onSuccess: () => {
                reset('password', 'password_confirmation');
                // Remember to go back to the user management section
                localStorage.setItem('dashboard_active_section', 'users');
                // Redirect back to the dashboard
                window.location.href = route('admin.dashboard');
            }
        });
    };

    return (
        <>
            <Head title="Create User" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-semibold">Create New User</h1>
                                <a 
                                    href={route('admin.dashboard')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Back to Dashboard
                                </a>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password_confirmation"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Role Selection */}
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            required
                                        >
                                            <option value="">Select a role</option>
                                            <option value="coordinator">Coordinator</option>
                                            <option value="worker">Worker</option>
                                            <option value="vp">VP</option>
                                            <option value="director">Director</option>
                                        </select>
                                        {errors.role && (
                                            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                        )}
                                    </div>

                                    {/* Campus Selection (only for coordinator and worker) */}
                                    {showCampusField && (
                                        <div>
                                            <label htmlFor="campus_id" className="block text-sm font-medium text-gray-700">
                                                Campus
                                            </label>
                                            <select
                                                id="campus_id"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={data.campus_id}
                                                onChange={(e) => setData('campus_id', e.target.value)}
                                                required
                                                disabled={!!campus_id} // Disable if pre-selected
                                            >
                                                <option value="">Select a campus</option>
                                                {campuses.map((campus) => (
                                                    <option key={campus.id} value={campus.id.toString()}>
                                                        {campus.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.campus_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.campus_id}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Complaint Type (for both coordinator and worker) */}
                                    {showComplaintTypeField && (
                                        <div>
                                            <label htmlFor="complaint_type_id" className="block text-sm font-medium text-gray-700">
                                                Department/Type
                                            </label>
                                            <select
                                                id="complaint_type_id"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={data.complaint_type_id}
                                                onChange={(e) => setData('complaint_type_id', e.target.value)}
                                                required
                                                disabled={!!complaint_type_id} // Disable if pre-selected
                                            >
                                                <option value="">Select a department</option>
                                                {complaintTypes
                                                    .filter(type => {
                                                        // If role is worker, only show types that can have workers
                                                        if (data.role === 'worker') {
                                                            // Exclude "Cleaning" and "Other" from worker options
                                                            return !['Cleaning', 'Other'].includes(type.name);
                                                        }
                                                        return true; // Show all types for coordinators and other roles
                                                    })
                                                    .map((type) => (
                                                        <option key={type.id} value={type.id.toString()}>
                                                            {type.name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                            {errors.complaint_type_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.complaint_type_id}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Coordinator information for workers */}
                                    {data.role === 'worker' && data.campus_id && data.complaint_type_id && (
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Assigned Coordinator
                                            </label>
                                            
                                            {availableCoordinators.length > 0 ? (
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-700 font-semibold">{availableCoordinators[0].name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <p className="text-sm font-medium text-gray-900">{availableCoordinators[0].name}</p>
                                                            <p className="text-sm text-gray-500">{availableCoordinators[0].email}</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                Coordinator
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800">
                                                    <div className="flex items-center">
                                                        <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <p>No coordinator available for this campus and department. Please create a coordinator first.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-black rounded-md hover:bg-indigo-700 transition-colors"
                                        disabled={processing || (data.role === 'worker' && availableCoordinators.length === 0)}
                                    >
                                        {processing ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 