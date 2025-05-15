import React from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import MainLayout from '@/Layouts/MainLayout';

interface Props {
    campuses: Array<{
        id: number;
        name: string;
    }>;
    complaintTypes: Array<{
        id: number;
        name: string;
    }>;
}

export default function Create({ campuses, complaintTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        campus_id: '',
        complaint_type_id: '',
        location: '',
        description: '',
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('campus_id', data.campus_id);
        formData.append('complaint_type_id', data.complaint_type_id);
        formData.append('location', data.location);
        formData.append('description', data.description);
        if (data.image) {
            formData.append('image', data.image);
        }

        // Post the form data
        post(route('complaints.store'), {
            forceFormData: true,
            onSuccess: () => {
                // Clear form after successful submission
                setData({
                    campus_id: '',
                    complaint_type_id: '',
                    location: '',
                    description: '',
                    image: null,
                });
            },
        });
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">Submit a Complaint</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Campus</label>
                        <select
                            value={data.campus_id}
                            onChange={e => setData('campus_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Select Campus</option>
                            {campuses.map(campus => (
                                <option key={campus.id} value={campus.id}>
                                    {campus.name}
                                </option>
                            ))}
                        </select>
                        {errors.campus_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.campus_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Complaint Type</label>
                        <select
                            value={data.complaint_type_id}
                            onChange={e => setData('complaint_type_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Select Type</option>
                            {complaintTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {errors.complaint_type_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.complaint_type_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            value={data.location}
                            onChange={e => setData('location', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Building, Dorm, Classroom, etc."
                        />
                        {errors.location && (
                            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image (Optional)</label>
                        <input
                            type="file"
                            onChange={e => setData('image', e.target.files?.[0] || null)}
                            className="mt-1 block w-full"
                            accept="image/*"
                        />
                        {errors.image && (
                            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {processing ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
} 