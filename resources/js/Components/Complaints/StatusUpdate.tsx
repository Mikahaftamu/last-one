import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props {
    complaint: {
        id: number;
        complaint_id: string;
        status: string;
    };
    currentUserRole: string;
    canUpdateStatus: boolean;
}

export default function StatusUpdate({ complaint, currentUserRole, canUpdateStatus }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        status: complaint.status,
        resolution_notes: '',
        resolution_image: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('resolution_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('complaints.update-status', complaint.id));
    };

    const getNextStatus = (currentStatus: string): string[] => {
        switch (currentStatus) {
            case 'pending':
                return ['assigned'];
            case 'assigned':
                return ['in_progress'];
            case 'in_progress':
                return ['completed'];
            case 'completed':
                return ['verified'];
            default:
                return [];
        }
    };

    const nextStatuses = getNextStatus(complaint.status);

    if (!canUpdateStatus) {
        return null;
    }

    return (
        <div className="bg-white shadow sm:rounded-lg mt-4">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Update Status</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Current Status: {complaint.status.replace('_', ' ').toUpperCase()}</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {nextStatuses.length > 0 && (
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                New Status
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a status</option>
                                {nextStatuses.map(status => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>
                    )}

                    {(data.status === 'completed' || data.status === 'verified') && (
                        <>
                            <div>
                                <label htmlFor="resolution_notes" className="block text-sm font-medium text-gray-700">
                                    Resolution Notes
                                </label>
                                <textarea
                                    id="resolution_notes"
                                    value={data.resolution_notes}
                                    onChange={e => setData('resolution_notes', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {errors.resolution_notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.resolution_notes}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="resolution_image" className="block text-sm font-medium text-gray-700">
                                    Resolution Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    id="resolution_image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full"
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-32 w-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                                {errors.resolution_image && (
                                    <p className="mt-1 text-sm text-red-600">{errors.resolution_image}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 