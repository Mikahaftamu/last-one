import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { User, Campus, ComplaintType } from '@/types';

interface PageProps {
    user: User;
    campuses: Campus[];
    complaintTypes: ComplaintType[];
}

export default function Edit({ user, campuses, complaintTypes }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        role: user.roles?.[0]?.role || '',
        campus_id: user.roles?.[0]?.campus_id?.toString() || '',
        complaint_type_id: user.roles?.[0]?.complaint_type_id?.toString() || '',
    });

    const [showCampusField, setShowCampusField] = useState(false);
    const [showComplaintTypeField, setShowComplaintTypeField] = useState(false);

    useEffect(() => {
        // Determine which fields to show based on the selected role
        setShowCampusField(['coordinator', 'worker'].includes(data.role));
        setShowComplaintTypeField(data.role === 'coordinator');
        
        // Reset related fields when role changes
        if (!showCampusField) {
            setData('campus_id', '');
        }
        if (!showComplaintTypeField) {
            setData('complaint_type_id', '');
        }
    }, [data.role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Pre-process campus_id and complaint_type_id to ensure they are sent correctly
        if (data.campus_id) {
            console.log(`Campus ID before submission: ${data.campus_id} (${typeof data.campus_id})`);
        }
        
        // For VP and director roles, ensure we don't send campus_id
        if (data.role === 'vp' || data.role === 'director') {
            setData('campus_id', '');
            setData('complaint_type_id', '');
        }
        
        console.log("Submitting update with data:", {
            name: data.name,
            email: data.email,
            role: data.role,
            campus_id: data.campus_id ? parseInt(data.campus_id) : null,
            complaint_type_id: data.complaint_type_id ? parseInt(data.complaint_type_id) : null
        });
        
        // Force a refresh after update to ensure everything is displayed correctly
        put(route('admin.users.update', user.id), {
            onSuccess: () => {
                // Remember to go back to the user management section
                localStorage.setItem('dashboard_active_section', 'users');
                // Force reload to see the updated user
                window.location.href = route('admin.dashboard');
            }
        });
    };

    return (
        <>
            <Head title="Edit User" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-semibold">Edit User: {user.name}</h1>
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

                                    {/* Complaint Type (only for coordinator) */}
                                    {showComplaintTypeField && (
                                        <div>
                                            <label htmlFor="complaint_type_id" className="block text-sm font-medium text-gray-700">
                                                Complaint Type
                                            </label>
                                            <select
                                                id="complaint_type_id"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={data.complaint_type_id}
                                                onChange={(e) => setData('complaint_type_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Select a complaint type</option>
                                                {complaintTypes.map((type) => (
                                                    <option key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.complaint_type_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.complaint_type_id}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-black rounded-md hover:bg-indigo-700 transition-colors"
                                        disabled={processing}
                                    >
                                        {processing ? 'Updating...' : 'Update User'}
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