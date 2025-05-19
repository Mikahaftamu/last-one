import React from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface User {
    id: number;
    name: string;
    role: string;
}

interface Props {
    complaint: {
        id: number;
        complaint_id: string;
        complaint_type: {
            name: string;
        };
    };
    users: User[];
    currentUserRole: string;
}

export default function ComplaintAssignment({ complaint, users, currentUserRole }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        assigned_to: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('complaints.assign', complaint.id));
    };

    // Filter users based on complaint type and current user role
    const getAssignableUsers = () => {
        // For coordinators, show workers of their type
        if (currentUserRole === 'coordinator') {
            return users.filter(user => user.role === 'worker');
        }

        // For admin/VP/Director, show appropriate coordinators
        if (['admin', 'vp', 'director'].includes(currentUserRole)) {
            switch (complaint.complaint_type.name) {
                case 'Cleaning':
                    return users.filter(user => user.role === 'cleaning_coordinator');
                case 'Other':
                    return users.filter(user => user.role === 'general_coordinator');
                case 'Plumbing':
                case 'Water':
                case 'Electricity':
                    return users.filter(user => user.role === 'coordinator');
                default:
                    return [];
            }
        }

        // For workers, no assignments possible
        return [];
    };

    const assignableUsers = getAssignableUsers();

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Assign Complaint</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Complaint ID: {complaint.complaint_id}</p>
                    <p>Type: {complaint.complaint_type.name}</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-5">
                    {assignableUsers.length > 0 ? (
                        <div>
                            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                                Assign to
                            </label>
                            <select
                                id="assigned_to"
                                value={data.assigned_to}
                                onChange={e => setData('assigned_to', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a user</option>
                                {assignableUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                            {errors.assigned_to && (
                                <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            {currentUserRole === 'worker' ? (
                                <p>You cannot assign complaints.</p>
                            ) : (
                                <p>No assignable users available for this complaint type.</p>
                            )}
                        </div>
                    )}
                    <div className="mt-5">
                        <button
                            type="submit"
                            disabled={processing || assignableUsers.length === 0}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Assigning...' : 'Assign Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 