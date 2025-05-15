import React from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import AdminDashboard from '@/Components/Dashboard/AdminDashboard';
import CoordinatorDashboard from '@/Components/Dashboard/CoordinatorDashboard';
import WorkerDashboard from '@/Components/Dashboard/WorkerDashboard';
import VPDashboard from '@/Components/Dashboard/VPDashboard';
import DirectorDashboard from '@/Components/Dashboard/DirectorDashboard';

interface User {
    name: string;
    email: string;
    roles: Array<{
        role: string;
    }>;
}

interface PageProps {
    auth: {
        user: User;
    };
}

export default function Dashboard() {
    const { auth } = usePage().props as PageProps;
    const user = auth.user;
    const role = user.roles[0].role;

    const renderDashboard = () => {
        switch (role) {
            case 'admin':
                return <AdminDashboard />;
            case 'coordinator':
                return <CoordinatorDashboard />;
            case 'worker':
                return <WorkerDashboard />;
            case 'vp':
                return <VPDashboard />;
            case 'director':
                return <DirectorDashboard />;
            default:
                return <div>Unknown role</div>;
        }
    };

    return (
        <DashboardLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name}</h2>
                            {renderDashboard()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
} 