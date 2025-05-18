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
    ChartData,
    ChartOptions
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

interface ComplaintTypeStats {
    id: number;
    name: string;
    total_complaints: number;
    pending_complaints: number;
    resolved_complaints: number;
    average_resolution_time: number;
    campus: string;
}

interface DepartmentPerformance {
    id: number;
    name: string;
    total_assigned: number;
    resolved_on_time: number;
    avg_resolution_time: number;
    satisfaction_rate: number;
    campus: string;
}

interface Props {
    complaintTypeStats: ComplaintTypeStats[];
    departmentPerformance: DepartmentPerformance[];
    overallStats: {
        totalComplaints: number;
        pendingComplaints: number;
        resolvedComplaints: number;
        averageResolutionTime: number;
        satisfactionRate: number;
    };
}

export default function DirectorDashboardCharts({ 
    complaintTypeStats, 
    departmentPerformance, 
    overallStats 
}: Props) {
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
        },
        // Additional colors for department charts
        purple: {
            main: 'rgb(139, 92, 246)',
            light: 'rgba(139, 92, 246, 0.15)',
            medium: 'rgba(139, 92, 246, 0.5)',
        },
        teal: {
            main: 'rgb(20, 184, 166)',
            light: 'rgba(20, 184, 166, 0.15)',
            medium: 'rgba(20, 184, 166, 0.5)',
        },
        pink: {
            main: 'rgb(236, 72, 153)',
            light: 'rgba(236, 72, 153, 0.15)',
            medium: 'rgba(236, 72, 153, 0.5)',
        }
    };

    // Time filter state (for UI only in this example)
    const [timeFilter, setTimeFilter] = useState<string>('30days');
    // Add campus filter state
    const [campusFilter, setCampusFilter] = useState<string>('all');
    
    // Get unique campuses from data
    const campuses = Array.from(new Set([
        ...complaintTypeStats.map(stat => stat.campus),
        ...departmentPerformance.map(dept => dept.campus)
    ]));

    // Filter data by selected campus
    const filteredComplaintStats = campusFilter === 'all' 
        ? complaintTypeStats 
        : complaintTypeStats.filter(stat => stat.campus === campusFilter);
    
    const filteredDepartmentPerformance = campusFilter === 'all'
        ? departmentPerformance
        : departmentPerformance.filter(dept => dept.campus === campusFilter);
    
    // Prepare data for complaint type distribution pie chart
    const complaintTypeDistributionData = {
        labels: filteredComplaintStats.map(type => type.name),
        datasets: [
            {
                label: 'Complaints by Type',
                data: filteredComplaintStats.map(type => type.total_complaints),
                backgroundColor: [
                    colors.primary.medium,
                    colors.warning.medium,
                    colors.success.medium,
                    colors.info.medium,
                    colors.purple.medium,
                    colors.teal.medium,
                    colors.pink.medium,
                    colors.secondary.medium,
                ],
                borderColor: [
                    colors.primary.main,
                    colors.warning.main,
                    colors.success.main,
                    colors.info.main,
                    colors.purple.main,
                    colors.teal.main,
                    colors.pink.main,
                    colors.secondary.main,
                ],
                borderWidth: 1,
                hoverOffset: 4,
            },
        ],
    };

    const complaintTypeOptions = {
        responsive: true,
        maintainAspectRatio: false,
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
                    weight: 600,
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

    // Prepare data for department resolution times bar chart
    const departmentResolutionData: ChartData<'bar' | 'line'> = {
        labels: filteredDepartmentPerformance.map(dept => dept.name),
        datasets: [
            {
                type: 'bar' as const,
                label: 'Avg. Resolution Time (Days)',
                data: filteredDepartmentPerformance.map(dept => dept.avg_resolution_time),
                backgroundColor: colors.info.medium,
                borderColor: colors.info.main,
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
            },
            {
                type: 'line' as const,
                label: 'Target Time (4 Days)',
                data: Array(filteredDepartmentPerformance.length).fill(4),
                borderColor: colors.error.main,
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                order: 1
            }
        ],
    };

    const departmentResolutionOptions = {
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
                    weight: 600,
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
                    },
                    callback: function(value: any) {
                        return value + ' days';
                    }
                }
            }
        }
    };

    // Prepare data for department satisfaction rates bar chart
    const satisfactionData = {
        labels: filteredDepartmentPerformance.map(dept => dept.name),
        datasets: [
            {
                label: 'Satisfaction Rate (%)',
                data: filteredDepartmentPerformance.map(dept => dept.satisfaction_rate),
                backgroundColor: filteredDepartmentPerformance.map(dept => 
                    dept.satisfaction_rate >= 85 ? colors.success.medium :
                    dept.satisfaction_rate >= 70 ? colors.warning.medium :
                    colors.error.medium
                ),
                borderColor: filteredDepartmentPerformance.map(dept => 
                    dept.satisfaction_rate >= 85 ? colors.success.main :
                    dept.satisfaction_rate >= 70 ? colors.warning.main :
                    colors.error.main
                ),
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    };

    const satisfactionOptions = {
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
                    weight: 600,
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
                min: 0,
                max: 100,
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
                    },
                    callback: function(value: any) {
                        return value + '%';
                    }
                }
            }
        }
    };

    // Prepare data for complaint resolution status donut chart
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
                position: 'bottom' as const,
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
                    weight: 600,
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
            {/* Filters Section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Department Analytics</h2>
                <div className="flex space-x-4">
                    {/* Campus Filter */}
                    <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
                        <button
                            key="all"
                            onClick={() => setCampusFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                campusFilter === 'all'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All Campuses
                        </button>
                        {campuses.map((campus) => (
                            <button
                                key={campus}
                                onClick={() => setCampusFilter(campus)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    campusFilter === campus
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {campus}
                            </button>
                        ))}
                    </div>

                    {/* Time Range Selector */}
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
            </div>
            
            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* First Row */}
                <div className="col-span-12 lg:col-span-7 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900">Department Resolution Times</h3>
                        <p className="text-sm text-gray-500 mt-1">Average time to resolve complaints by department</p>
                    </div>
                    <div className="p-5">
                        <div className="h-96">
                            <Bar 
                                data={departmentResolutionData as ChartData<'bar'>} 
                                options={{
                                    ...departmentResolutionOptions,
                                    plugins: {
                                        ...departmentResolutionOptions.plugins,
                                        tooltip: {
                                            ...departmentResolutionOptions.plugins.tooltip
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="col-span-12 lg:col-span-5 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900">Complaint Type Distribution</h3>
                        <p className="text-sm text-gray-500 mt-1">Breakdown of complaints by type</p>
                    </div>
                    <div className="p-5">
                        <div className="h-96 flex items-center justify-center">
                            <Pie 
                                data={complaintTypeDistributionData} 
                                options={complaintTypeOptions} 
                            />
                        </div>
                    </div>
                </div>
                
                {/* Second Row */}
                <div className="col-span-12 lg:col-span-7 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900">Department Satisfaction Rates</h3>
                        <p className="text-sm text-gray-500 mt-1">Customer satisfaction ratings by department</p>
                    </div>
                    <div className="p-5">
                        <div className="h-80">
                            <Bar 
                                data={satisfactionData} 
                                options={satisfactionOptions} 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="col-span-12 lg:col-span-5 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900">Overall Resolution Status</h3>
                        <p className="text-sm text-gray-500 mt-1">Current status of all complaints</p>
                    </div>
                    <div className="p-5">
                        <div className="h-80 flex items-center justify-center">
                            <div className="w-3/4 relative">
                                <Doughnut 
                                    data={statusData} 
                                    options={statusOptions} 
                                />
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-3xl font-bold text-gray-800">
                                        {Math.round((overallStats.resolvedComplaints / overallStats.totalComplaints) * 100)}%
                                    </span>
                                    <span className="text-sm text-gray-500">Resolved</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 