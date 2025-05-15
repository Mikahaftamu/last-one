import React from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import MainLayout from '@/Layouts/MainLayout';

export default function Track() {
    const { data, setData, post, processing, errors } = useForm({
        complaint_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('complaints.track.post'));
    };

    return (
        <MainLayout>
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-semibold mb-6">Track Your Complaint</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Complaint ID</label>
                        <input
                            type="text"
                            value={data.complaint_id}
                            onChange={e => setData('complaint_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter your complaint ID"
                        />
                        {errors.complaint_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.complaint_id}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {processing ? 'Searching...' : 'Track Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
} 