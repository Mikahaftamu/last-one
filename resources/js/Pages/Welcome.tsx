import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { User } from '@/types';

interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        message?: string;
        status?: string;
        errors?: Record<string, string[]>;
    };
}

interface WelcomeProps extends PageProps {
    // Add any additional props here if needed
}

declare function route(name: string, params?: any): string;

export default function Welcome({ auth, flash }: WelcomeProps) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-dots-darker bg-center bg-gray-100 dark:bg-dots-lighter dark:bg-gray-900 selection:bg-red-500 selection:text-white">
                <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-right">
                    {auth.user ? (
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                        >
                            Log out
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                        >
                            Log in
                        </Link>
                    )}
                </div>

                {flash.message && (
                    <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center">
                        {flash.message}
                    </div>
                )}

                {flash.status && (
                    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-4 text-center">
                        {flash.status}
                    </div>
                )}

                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    <div className="flex justify-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Welcome to Complaint Management System
                        </h1>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="scale-100 p-6 bg-white dark:bg-gray-800/50 dark:bg-gradient-to-bl from-gray-700/50 via-transparent dark:ring-1 dark:ring-inset dark:ring-white/5 rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500">
                                <div className="flex flex-col items-center">
                                    <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                                        Submit a Complaint
                                    </h2>
                                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        Have an issue that needs attention? Submit your complaint here and we'll help you resolve it.
                                    </p>
                                    <Link
                                        href={route('complaints.create')}
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Submit Complaint
                                    </Link>
                                </div>
                            </div>

                            <div className="scale-100 p-6 bg-white dark:bg-gray-800/50 dark:bg-gradient-to-bl from-gray-700/50 via-transparent dark:ring-1 dark:ring-inset dark:ring-white/5 rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500">
                                <div className="flex flex-col items-center">
                                    <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                                        Track Your Complaint
                                    </h2>
                                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        Already submitted a complaint? Track its status and updates here.
                                    </p>
                                    <Link
                                        href={route('complaints.track')}
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Track Complaint
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 