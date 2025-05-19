import { Link, Head } from '@inertiajs/react';
import { User } from '@/types';
import React from 'react';

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

interface WelcomeProps extends PageProps {}

declare function route(name: string, params?: any): string;

export default function Welcome({ auth, flash }: WelcomeProps) {
    const cardBaseStyles =
        'scale-100 p-8 bg-white border border-gray-200 rounded-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] motion-safe:transform motion-safe:hover:scale-[1.02] backdrop-blur-sm';
    const linkButtonStyles =
        'mt-6 px-6 py-3 rounded-lg text-black font-bold text-lg transition-all duration-300 shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 relative overflow-hidden';

    return (
        <>
            <Head title="Welcome" />

            <main className="relative min-h-screen bg-gray-100 selection:bg-indigo-500 selection:text-white sm:flex sm:items-center sm:justify-center">
                {/* Background gradient with animated elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-gray-100 to-gray-200"></div>
                    
                    {/* Animated floating orbs */}
                    <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-purple-100 mix-blend-multiply animate-float-slow"></div>
                    <div className="absolute bottom-10 right-[10%] w-96 h-96 rounded-full bg-indigo-100 mix-blend-multiply animate-float-medium"></div>
                    <div className="absolute top-[40%] right-[20%] w-48 h-48 rounded-full bg-pink-100 mix-blend-multiply animate-float-fast"></div>
                    
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                </div>

                

                {/* Flash messages */}
                {(flash.message || flash.status) && (
                    <div className="fixed top-0 left-0 right-0 z-50 p-4 text-center shadow-lg text-white bg-opacity-90 animate-slideDown">
                {flash.message && (
                            <div className="bg-green-600">{flash.message}</div>
                )}
                {flash.status && (
                            <div className="bg-indigo-600">{flash.status}</div>
                        )}
                    </div>
                )}

                {/* Main content */}
                <section className="relative z-10 max-w-7xl w-full p-6 lg:p-8 animate-fadeIn">
                    <header className="flex justify-between items-center mb-16">
                        <h1 className="text-5xl font-bold text-center text-black">
                            Complaint Management System
                        </h1>
                        <Link
                            href={route('login')}
                            className="px-6 py-3 bg-indigo-600 text-black rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                            Login
                        </Link>
                    </header>

                    <div className="grid grid-cols-1 gap-6 mt-16 md:grid-cols-2 lg:gap-10">
                        {/* Submit a Complaint */}
                        <div className={`${cardBaseStyles} hover:shadow-indigo-500/30 shadow-indigo-500/10 animate-fadeInUp`}>
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-indigo-100 shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/30 animate-pulse-slow">
                                    <svg
                                        className="w-8 h-8 text-indigo-600"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                    </div>
                                <h2 className="mt-2 text-2xl font-bold text-black relative">
                                        Submit a Complaint
                                    <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300 transform -translate-x-1/2"></span>
                                    </h2>
                                <p className="mt-4 text-gray-600">
                                    Have an issue that needs attention? Submit your complaint and we'll handle the rest.
                                    </p>
                                    <Link
                                        href={route('complaints.create')}
                                    className={`${linkButtonStyles} bg-indigo-100 hover:bg-indigo-200 shadow-indigo-300/30 hover:shadow-indigo-300/50 group border border-indigo-300`}
                                    >
                                    <span className="relative z-10 text-indigo-800">Submit Complaint</span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                                    </Link>
                                </div>
                            </div>

                        {/* Track Complaint */}
                        <div className={`${cardBaseStyles} hover:shadow-purple-500/30 shadow-purple-500/10 animate-fadeInUp delay-100`}>
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-purple-100 shadow-lg shadow-purple-600/20 animate-pulse-slow">
                                    <svg
                                        className="w-8 h-8 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        />
                                    </svg>
                                </div>
                                <h2 className="mt-2 text-2xl font-bold text-black relative">
                                        Track Your Complaint
                                    <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300 transform -translate-x-1/2"></span>
                                    </h2>
                                <p className="mt-4 text-gray-600">
                                    Already submitted a complaint? Track its progress and updates here.
                                    </p>
                                    <Link
                                        href={route('complaints.track')}
                                    className={`${linkButtonStyles} bg-purple-100 hover:bg-purple-200 shadow-purple-300/30 hover:shadow-purple-300/50 group border border-purple-300`}
                                    >
                                    <span className="relative z-10 text-purple-800">Track Complaint</span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-200 to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                                    </Link>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-16 text-center text-gray-600 animate-fadeInUp delay-200">
                        <p className="relative inline-block">
                            <span className="absolute -left-6 top-1/2 h-0.5 w-4 bg-gray-400 transform -translate-y-1/2"></span>
                            Helping resolve issues effectively and efficiently
                            <span className="absolute -right-6 top-1/2 h-0.5 w-4 bg-gray-400 transform -translate-y-1/2"></span>
                        </p>
                    </footer>
                </section>
            </main>
            
            {/* Add animation styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-15px) translateX(-15px); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-25px) translateX(5px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(0); }
                }
                
                .animate-float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                }
                .animate-float-medium {
                    animation: float-medium 6s ease-in-out infinite;
                }
                .animate-float-fast {
                    animation: float-fast 4s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 8s ease infinite;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                .delay-100 {
                    animation-delay: 0.1s;
                }
                .delay-200 {
                    animation-delay: 0.2s;
                }
                .animate-slideDown {
                    animation: slideDown 0.5s ease-out forwards;
                }
                .bg-grid-pattern {
                    background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                `
            }} />
        </>
    );
} 
