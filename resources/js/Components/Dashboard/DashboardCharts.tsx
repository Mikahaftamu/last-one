import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

interface CampusStats {
    id: number;
    name: string;
    total_complaints: number;
    pending_complaints: number;
    resolved_complaints: number;
}

interface Props {
    campusStats: CampusStats[];
    overallStats: {
        totalComplaints: number;
        pendingComplaints: number;
        resolvedComplaints: number;
        averageResolutionTime: number;
    };
}

export default function DashboardCharts({ campusStats, overallStats }: Props) {
    // Define professional color palette
    const colors = {
        primary: {
            main: 'rgb(59, 130, 246)',
            light: 'rgba(59, 130, 246, 0.15)',
            medium: 'rgba(59, 130, 246, 0.5)',
            dark: 'rgb(37, 99, 235)',
        },
        secondary: {
            main: 'rgb(107, 114, 128)',
            light: 'rgba(107, 114, 128, 0.15)',
            medium: 'rgba(107, 114, 128, 0.5)',
            dark: 'rgb(75, 85, 99)',
        },
        success: {
            main: 'rgb(16, 185, 129)',
            light: 'rgba(16, 185, 129, 0.15)',
            medium: 'rgba(16, 185, 129, 0.5)',
            dark: 'rgb(5, 150, 105)',
        },
        warning: {
            main: 'rgb(245, 158, 11)',
            light: 'rgba(245, 158, 11, 0.15)',
            medium: 'rgba(245, 158, 11, 0.5)',
            dark: 'rgb(217, 119, 6)',
        },
        info: {
            main: 'rgb(79, 70, 229)',
            light: 'rgba(79, 70, 229, 0.15)',
            medium: 'rgba(79, 70, 229, 0.5)',
            dark: 'rgb(67, 56, 202)',
        },
        error: {
            main: 'rgb(239, 68, 68)',
            light: 'rgba(239, 68, 68, 0.15)',
            medium: 'rgba(239, 68, 68, 0.5)',
            dark: 'rgb(220, 38, 38)',
        }
    };

    // Time filter state (for UI only in this example)
    const [timeFilter, setTimeFilter] = useState<string>('30days');
    
    // Prepare data for campus complaints bar chart
    const campusComplaintsData = {
        labels: campusStats.map(campus => campus.name),
        datasets: [
            {
                label: 'Total Complaints',
                data: campusStats.map(campus => campus.total_complaints),
                backgroundColor: colors.primary.medium,
                borderColor: colors.primary.main,
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
            },
            {
                label: 'Pending Complaints',
                data: campusStats.map(campus => campus.pending_complaints),
                backgroundColor: colors.warning.medium,
                borderColor: colors.warning.main,
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
            },
            {
                label: 'Resolved Complaints',
                data: campusStats.map(campus => campus.resolved_complaints),
                backgroundColor: colors.success.medium,
                borderColor: colors.success.main,
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    };

    const campusComplaintsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 13,
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: {
                    size: 13,
                    family: 'Inter, system-ui, sans-serif',
                    weight: '600',
                },
                bodyFont: {
                    size: 12,
                    family: 'Inter, system-ui, sans-serif',
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                usePointStyle: true,
                boxWidth: 8,
                boxPadding: 4,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(243, 244, 246, 1)',
                    drawBorder: false,
                },
                border: {
                    dash: [4, 4],
                },
                ticks: {
                    color: colors.secondary.main,
                    padding: 10,
                    font: {
                        size: 12,
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            }
        }
    };

    // Prepare data for complaints status donut chart
    const statusData = {
        labels: ['Pending', 'Resolved'],
        datasets: [
            {
                data: [overallStats.pendingComplaints, overallStats.resolvedComplaints],
                backgroundColor: [
                    colors.warning.medium,
                    colors.success.medium,
                ],
                borderColor: [
                    colors.warning.main,
                    colors.success.main,
                ],
                borderWidth: 1,
                hoverOffset: 4,
                spacing: 1,
                borderRadius: 4,
            },
        ],
    };

    const statusOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right' as const,
                align: 'center' as const,
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 13,
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: {
                    size: 13,
                    family: 'Inter, system-ui, sans-serif',
                    weight: '600',
                },
                bodyFont: {
                    size: 12,
                    family: 'Inter, system-ui, sans-serif',
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                usePointStyle: true,
                boxWidth: 8,
                boxPadding: 4,
            }
        },
    };

    // Mock data for resolution timeline (would be replaced with actual data)
    const mockMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const mockResolutionTimes = [4.2, 3.8, 3.5, 4.0, 3.6, 3.2];

    const timelineData = {
        labels: mockMonths,
        datasets: [
            {
                label: 'Avg. Resolution Time (Days)',
                data: mockResolutionTimes,
                borderColor: colors.info.main,
                backgroundColor: colors.info.light,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: colors.info.main,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors.info.main,
                pointHoverBorderWidth: 2,
                pointHoverBorderColor: '#fff',
                fill: true,
            },
        ],
    };

    const timelineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 13,
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: {
                    size: 13,
                    family: 'Inter, system-ui, sans-serif',
                    weight: '600',
                },
                bodyFont: {
                    size: 12,
                    family: 'Inter, system-ui, sans-serif',
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                usePointStyle: true,
                boxWidth: 8,
                boxPadding: 4,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: colors.secondary.main,
                    font: {
                        size: 12,
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(243, 244, 246, 1)',
                    drawBorder: false,
                },
                border: {
                    dash: [4, 4],
                },
                title: {
                    display: false,
                },
                ticks: {
                    color: colors.secondary.main,
                    padding: 10,
                    font: {
                        size: 12,
                        family: 'Inter, system-ui, sans-serif',
                    },
                    callback: function(value: any) {
                        return value + ' days';
                    }
                }
            }
        }
    };

    // Calc data for complaint type distribution
    const complaintTypes = ['Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Other'];
    const complaintTypeData = {
        labels: complaintTypes,
        datasets: [
            {
                label: 'Complaints by Type',
                data: [25, 18, 15, 22, 10], // Dummy data - replace with actual distribution
                backgroundColor: [
                    colors.primary.medium,
                    colors.warning.medium,
                    colors.success.medium,
                    colors.info.medium,
                    colors.secondary.medium,
                ],
                borderColor: [
                    colors.primary.main,
                    colors.warning.main,
                    colors.success.main,
                    colors.info.main,
                    colors.secondary.main,
                ],
                borderWidth: 1,
                hoverOffset: 4,
                spacing: 1,
                borderRadius: 4,
            },
        ],
    };

    const complaintTypeOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right' as const,
                align: 'center' as const,
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 12,
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: {
                    size: 13,
                    family: 'Inter, system-ui, sans-serif',
                    weight: '600',
                },
                bodyFont: {
                    size: 12,
                    family: 'Inter, system-ui, sans-serif',
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                usePointStyle: true,
                boxWidth: 8,
                boxPadding: 4,
            }
        },
    };

    return (
        <div className="mt-10 space-y-8">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Dashboard Analytics</h2>
                <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
                    {['7days', '30days', '90days', 'year'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                timeFilter === period
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {period === '7days' ? '7 Days' : 
                             period === '30days' ? '30 Days' : 
                             period === '90days' ? '90 Days' : 'Year'}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-900">Complaint Analytics</h3>
                            <p className="text-sm text-gray-500 mt-1">Overview of campus complaints and resolution metrics</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-12 gap-0">
                    {/* Top row - 2 charts side by side */}
                    <div className="col-span-12 xl:col-span-8 p-6 xl:border-r border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-700">Complaints by Campus</h4>
                            <div className="flex items-center text-xs text-gray-500">
                                <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-1"></span>
                                <span className="mr-3">Resolved</span>
                                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
                                <span className="mr-3">Pending</span>
                                <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-1"></span>
                                <span>Total</span>
                            </div>
                        </div>
                        <div className="h-96">
                            <Bar data={campusComplaintsData} options={campusComplaintsOptions} />
                        </div>
                    </div>
                    
                    <div className="col-span-12 xl:col-span-4 p-6 border-t xl:border-t-0 border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-700">Resolution Status</h4>
                            <div className="flex items-center text-xs text-gray-500">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-success-500 mr-1"></div>
                                    <span className="text-sm">{Math.round((overallStats.resolvedComplaints / overallStats.totalComplaints) * 100)}% Resolved</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-96 flex items-center justify-center">
                            <Doughnut data={statusData} options={statusOptions} />
                        </div>
                    </div>
                    
                    {/* Bottom row - 2 charts side by side */}
                    <div className="col-span-12 xl:col-span-8 p-6 border-t border-gray-100 xl:border-r">
                        <h4 className="font-medium text-gray-700 mb-4">Resolution Time Trend</h4>
                        <div className="h-80">
                            <Line data={timelineData} options={timelineOptions} />
                        </div>
                    </div>
                    
                    <div className="col-span-12 xl:col-span-4 p-6 border-t border-gray-100">
                        <h4 className="font-medium text-gray-700 mb-4">Complaint Type Distribution</h4>
                        <div className="h-80 flex items-center justify-center">
                            <Doughnut data={complaintTypeData} options={complaintTypeOptions} />
                        </div>
                    </div>
                </div>
                
                {/* Key Metrics Section */}
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Key Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Complaints</p>
                                        <p className="text-2xl font-semibold text-gray-900">{overallStats.totalComplaints}</p>
                                    </div>
                                    <div className="rounded-full p-3 bg-blue-50">
                                        <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center text-xs">
                                    <span className="text-green-500 flex items-center">
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                        8.2%
                                    </span>
                                    <span className="text-gray-500 ml-2">vs previous period</span>
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Resolution Rate</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {Math.round((overallStats.resolvedComplaints / overallStats.totalComplaints) * 100)}%
                                        </p>
                                    </div>
                                    <div className="rounded-full p-3 bg-indigo-50">
                                        <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center text-xs">
                                    <span className="text-green-500 flex items-center">
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                        5.3%
                                    </span>
                                    <span className="text-gray-500 ml-2">vs previous period</span>
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Avg. Resolution Time</p>
                                        <p className="text-2xl font-semibold text-gray-900">{overallStats.averageResolutionTime}<span className="text-sm font-normal text-gray-500 ml-1">days</span></p>
                                    </div>
                                    <div className="rounded-full p-3 bg-green-50">
                                        <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center text-xs">
                                    <span className="text-green-500 flex items-center">
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                        12.4%
                                    </span>
                                    <span className="text-gray-500 ml-2">vs previous period</span>
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Pending Complaints</p>
                                        <p className="text-2xl font-semibold text-gray-900">{overallStats.pendingComplaints}</p>
                                    </div>
                                    <div className="rounded-full p-3 bg-yellow-50">
                                        <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center text-xs">
                                    <span className="text-red-500 flex items-center">
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                        3.2%
                                    </span>
                                    <span className="text-gray-500 ml-2">vs previous period</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Export Section */}
            <div className="flex items-center justify-end space-x-4 mt-6 text-sm">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Report
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate PDF
                </button>
            </div>
        </div>
    );
} 