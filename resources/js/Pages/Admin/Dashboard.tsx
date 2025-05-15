import { Head } from '@inertiajs/react';
import { User, Campus, ComplaintType } from '@/types';

interface PageProps {
    users: User[];
    campuses: Campus[];
    complaintTypes: ComplaintType[];
    auth: {
        user: User;
    };
}

export default function Dashboard({ users, campuses, complaintTypes, auth }: PageProps) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold mb-2">Total Users</h2>
                                    <p className="text-3xl font-bold">{users.length}</p>
                                </div>
                                <div className="bg-green-100 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold mb-2">Total Campuses</h2>
                                    <p className="text-3xl font-bold">{campuses.length}</p>
                                </div>
                                <div className="bg-purple-100 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold mb-2">Complaint Types</h2>
                                    <p className="text-3xl font-bold">{complaintTypes.length}</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                                        {user.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                                        {user.roles?.[0]?.role || 'No Role'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                                        <a
                                                            href={route('admin.users.edit', user.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Edit
                                                        </a>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this user?')) {
                                                                    // Handle delete
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 