import { Link, Head } from '@inertiajs/react';
import { User } from '@/types';
import React, { useState } from 'react';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinkStyles = 'px-4 py-2 text-gray-700 hover:text-[#1B4D3E] transition-colors duration-300 font-medium';
    const buttonStyles = 'px-6 py-2 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl';

    return (
        <>
            <Head title="Mekelle University - Complaint Management System" />

            <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
                {/* Navigation Bar */}
                <nav className="bg-white shadow-lg border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 sm:h-20 md:h-24">
                            {/* Logo and Title Section */}
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <img 
                                        src="mu.jpg" 
                                        alt="Mekelle University Logo" 
                                        className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain rounded-full border-2 border-[#1B4D3E]/10"
                                    />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#1B4D3E] leading-tight">Mekelle University</h1>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-tight">Complaint Management System</p>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                                <Link href="/" className="text-base lg:text-lg text-gray-700 hover:text-[#1B4D3E] transition-colors duration-300 font-medium flex items-center gap-1.5">
                                    <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                    </svg>
                                    Home
                                </Link>
                                <Link href={route('complaints.create')} className="text-base lg:text-lg text-gray-700 hover:text-[#1B4D3E] transition-colors duration-300 font-medium flex items-center gap-1.5">
                                    <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                    </svg>
                                    Submit Complaint
                                </Link>
                                <Link href={route('complaints.track')} className="text-base lg:text-lg text-gray-700 hover:text-[#1B4D3E] transition-colors duration-300 font-medium flex items-center gap-1.5">
                                    <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                    </svg>
                                    Track Complaint
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="text-base lg:text-lg text-gray-700 hover:text-[#1B4D3E] transition-colors duration-300 font-medium flex items-center gap-1.5"
                                >
                                    <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                                    </svg>
                                    Login
                                </Link>
                            </div>

                            {/* Mobile menu button */}
                            <div className="md:hidden">
                                <button 
                                    type="button" 
                                    className="text-gray-700 hover:text-[#1B4D3E] focus:outline-none p-2"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-label="Toggle menu"
                                >
                                    {isMobileMenuOpen ? (
                                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Navigation Menu */}
                        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="py-3 border-t border-gray-200 bg-white shadow-lg">
                                <div className="flex flex-col space-y-2">
                                    <Link 
                                        href="/" 
                                        className="text-lg text-black hover:text-[#1B4D3E] hover:bg-gray-50 transition-colors duration-300 font-bold flex items-center gap-3 px-5 py-4"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                        </svg>
                                        Home
                                    </Link>
                                    <Link 
                                        href={route('complaints.create')} 
                                        className="text-lg text-black hover:text-[#1B4D3E] hover:bg-gray-50 transition-colors duration-300 font-bold flex items-center gap-3 px-5 py-4"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        Submit Complaint
                                    </Link>
                                    <Link 
                                        href={route('complaints.track')} 
                                        className="text-lg text-black hover:text-[#1B4D3E] hover:bg-gray-50 transition-colors duration-300 font-bold flex items-center gap-3 px-5 py-4"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                        </svg>
                                        Track Complaint
                                    </Link>
                                    <Link 
                                        href={route('login')} 
                                        className="text-lg text-black hover:text-[#1B4D3E] hover:bg-gray-50 transition-colors duration-300 font-bold flex items-center gap-3 px-5 py-4"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                                        </svg>
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Flash messages */}
                {(flash.message || flash.status) && (
                    <div className="fixed top-0 left-0 right-0 z-50 p-4 text-center shadow-lg text-white bg-opacity-90 animate-slideDown">
                        {flash.message && (
                            <div className="bg-green-600">{flash.message}</div>
                        )}
                        {flash.status && (
                            <div className="bg-[#1B4D3E]">{flash.status}</div>
                        )}
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-grow">
                    <div className="relative min-h-[calc(100vh-16rem)]">
                        {/* Background elements */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1B4D3E]/10 via-gray-100 to-gray-200"></div>
                            
                            {/* Decorative elements */}
                            <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-[#1B4D3E]/5 mix-blend-multiply animate-float-slow"></div>
                            <div className="absolute bottom-10 right-[10%] w-96 h-96 rounded-full bg-[#2D6A4F]/5 mix-blend-multiply animate-float-medium"></div>
                            <div className="absolute top-[40%] right-[20%] w-48 h-48 rounded-full bg-[#40916C]/5 mix-blend-multiply animate-float-fast"></div>
                            
                            {/* Grid pattern */}
                            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                        </div>

                        {/* Main content section */}
                        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                            <div className="text-center">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B4D3E] mb-6 sm:mb-8 animate-fadeInUp">
                                    Welcome to Mekelle University
                                </h1>
                                <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 sm:mb-12 animate-fadeInUp delay-100">
                                    Empowering Excellence Through Effective Communication
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto animate-fadeInUp delay-200">
                                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="text-[#1B4D3E] text-3xl sm:text-4xl mb-4">📝</div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Submit Complaints</h3>
                                        <p className="text-sm sm:text-base text-gray-600">Share your concerns and feedback with us</p>
                                    </div>
                                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="text-[#1B4D3E] text-3xl sm:text-4xl mb-4">📊</div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
                                        <p className="text-sm sm:text-base text-gray-600">Monitor the status of your submissions</p>
                                    </div>
                                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="text-[#1B4D3E] text-3xl sm:text-4xl mb-4">🤝</div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Get Support</h3>
                                        <p className="text-sm sm:text-base text-gray-600">Receive assistance from our dedicated team</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Animation styles */}
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
