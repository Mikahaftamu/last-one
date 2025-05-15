import React from 'react';
import MainLayout from '@/Layouts/MainLayout';

export default function Home() {
    return (
        <MainLayout>
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <h1 className="text-2xl font-semibold mb-4">Welcome to My App</h1>
                    <p>This is a Laravel + React + TypeScript application using Inertia.js.</p>
                </div>
            </div>
        </MainLayout>
    );
} 