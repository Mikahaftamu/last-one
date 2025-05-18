<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Campus;
use App\Models\ComplaintType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ComplaintController extends Controller
{
    public function create()
    {
        return Inertia::render('Complaints/Create', [
            'campuses' => Campus::all(),
            'complaintTypes' => ComplaintType::all(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('Received complaint submission:', $request->all());

            $validated = $request->validate([
                'campus_id' => 'required|exists:campuses,id',
                'complaint_type_id' => 'required|exists:complaint_types,id',
                'location' => 'required|string|max:255',
                'description' => 'required|string',
                'image' => 'nullable|image|max:2048'
            ]);

            \Log::info('Validated data:', $validated);

            // Create the complaint with all required fields
            $complaint = new Complaint();
            $complaint->campus_id = $validated['campus_id'];
            $complaint->complaint_type_id = $validated['complaint_type_id'];
            $complaint->location = $validated['location'];
            $complaint->description = $validated['description'];
            $complaint->status = 'pending';
            
            // Handle image upload if present
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('complaints', 'public');
                $complaint->image_path = $path;
                \Log::info('Image uploaded:', ['path' => $path]);
            }

            // Save the complaint
            $saved = $complaint->save();
            \Log::info('Save operation result:', ['saved' => $saved]);

            if (!$saved) {
                throw new \Exception('Failed to save complaint to database');
            }

            \Log::info('Complaint created successfully:', [
                'complaint_id' => $complaint->complaint_id,
                'campus_id' => $complaint->campus_id,
                'type_id' => $complaint->complaint_type_id,
                'location' => $complaint->location,
                'description' => $complaint->description
            ]);

            return redirect()->route('complaints.show', $complaint->complaint_id)
                ->with('message', 'Complaint submitted successfully. Your complaint ID is: ' . $complaint->complaint_id);

        } catch (\Exception $e) {
            \Log::error('Error creating complaint: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create complaint: ' . $e->getMessage()]);
        }
    }

    public function show($complaintId)
    {
        $complaint = Complaint::with(['campus', 'complaintType', 'coordinator', 'worker'])
            ->where('complaint_id', $complaintId)
            ->firstOrFail();

        return Inertia::render('Complaints/Show', [
            'complaint' => $complaint
        ]);
    }

    public function track()
    {
        return Inertia::render('Complaints/Track');
    }

    public function trackComplaint(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|string'
        ]);

        $complaint = Complaint::with(['campus', 'complaintType', 'coordinator', 'worker'])
            ->where('complaint_id', $request->complaint_id)
            ->firstOrFail();

        return Inertia::render('Complaints/Show', [
            'complaint' => $complaint
        ]);
    }

    public function coordinatorDashboard()
    {
        try {
            // Ensure the user is authenticated and is a coordinator
            if (!Auth::check() || !Auth::user()->isCoordinator()) {
                return redirect()->route('login')
                    ->withErrors(['error' => 'You must be logged in as a coordinator to access this page.']);
            }

            $user = Auth::user();
            
            // Get the campus and complaint type for this coordinator
            $coordinatorRole = $user->roles()
                ->where('roles.role', 'coordinator')
                ->first();
            
            if (!$coordinatorRole) {
                return redirect()->route('login')
                    ->withErrors(['error' => 'Coordinator role information not found.']);
            }
            
            $campusId = $coordinatorRole->pivot->campus_id;
            $complaintTypeId = $coordinatorRole->pivot->complaint_type_id;
            
            // Get complaints assigned to this coordinator's campus and complaint type
            $complaints = Complaint::with(['campus', 'complaintType', 'worker'])
                ->where('campus_id', $campusId)
                ->where('complaint_type_id', $complaintTypeId)
                ->latest()
                ->get();
            
            // Get workers under this coordinator
            $workers = User::whereHas('roles', function($query) use ($campusId, $complaintTypeId) {
                $query->where('roles.role', 'worker')
                    ->where('user_roles.campus_id', $campusId)
                    ->where('user_roles.complaint_type_id', $complaintTypeId);
            })->get();
            
            // Calculate statistics
            $stats = [
                'totalAssigned' => $complaints->count(),
                'pending' => $complaints->where('status', 'pending')->count(),
                'inProgress' => $complaints->where('status', 'in_progress')->count(),
                'completed' => $complaints->where('status', 'completed')->count(),
            ];
            
            // Get campus and complaint type info
            $campus = Campus::find($campusId);
            $complaintType = ComplaintType::find($complaintTypeId);
            
            // Return the coordinator dashboard view with data
            return Inertia::render('Coordinator/Dashboard', [
                'coordinator' => $user,
                'complaints' => $complaints,
                'workers' => $workers,
                'stats' => $stats,
                'campus' => $campus,
                'complaintType' => $complaintType
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error accessing coordinator dashboard: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('login')
                ->withErrors(['error' => 'An error occurred while accessing the dashboard. Please try again.']);
        }
    }

    public function assignWorker(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'complaint_id' => 'required|exists:complaints,id',
                'worker_id' => 'required|exists:users,id'
            ]);
            
            // Check if user is a coordinator
            if (!Auth::check() || !Auth::user()->isCoordinator()) {
                return back()->withErrors(['error' => 'You are not authorized to assign workers.']);
            }
            
            $user = Auth::user();
            
            // Get the campus and complaint type for this coordinator
            $coordinatorRole = $user->roles()
                ->where('roles.role', 'coordinator')
                ->first();
                
            if (!$coordinatorRole) {
                return back()->withErrors(['error' => 'Coordinator role information not found.']);
            }
            
            $campusId = $coordinatorRole->pivot->campus_id;
            $complaintTypeId = $coordinatorRole->pivot->complaint_type_id;
            
            // Get the complaint
            $complaint = Complaint::findOrFail($validated['complaint_id']);
            
            // Verify the complaint belongs to this coordinator's campus and complaint type
            if ($complaint->campus_id != $campusId || $complaint->complaint_type_id != $complaintTypeId) {
                return back()->withErrors(['error' => 'You are not authorized to manage this complaint.']);
            }
            
            // Verify the worker belongs to this coordinator
            $worker = User::findOrFail($validated['worker_id']);
            $isValidWorker = $worker->roles()
                ->where('roles.role', 'worker')
                ->where('user_roles.campus_id', $campusId)
                ->where('user_roles.complaint_type_id', $complaintTypeId)
                ->exists();
                
            if (!$isValidWorker) {
                return back()->withErrors(['error' => 'The selected worker is not assigned to your department.']);
            }
            
            // Assign the worker
            $complaint->assigned_worker_id = $validated['worker_id'];
            
            // Update status to in_progress if it was pending
            if ($complaint->status === 'pending') {
                $complaint->status = 'in_progress';
            }
            
            $complaint->save();
            
            return back()->with('message', 'Worker assigned successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error assigning worker: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Failed to assign worker: ' . $e->getMessage()]);
        }
    }
    
    public function updateComplaintStatus(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'complaint_id' => 'required|exists:complaints,id',
                'status' => 'required|in:pending,in_progress,completed,cancelled'
            ]);
            
            // Check if user is a coordinator
            if (!Auth::check() || !Auth::user()->isCoordinator()) {
                return back()->withErrors(['error' => 'You are not authorized to update complaint status.']);
            }
            
            $user = Auth::user();
            
            // Get the campus and complaint type for this coordinator
            $coordinatorRole = $user->roles()
                ->where('roles.role', 'coordinator')
                ->first();
                
            if (!$coordinatorRole) {
                return back()->withErrors(['error' => 'Coordinator role information not found.']);
            }
            
            $campusId = $coordinatorRole->pivot->campus_id;
            $complaintTypeId = $coordinatorRole->pivot->complaint_type_id;
            
            // Get the complaint
            $complaint = Complaint::findOrFail($validated['complaint_id']);
            
            // Verify the complaint belongs to this coordinator's campus and complaint type
            if ($complaint->campus_id != $campusId || $complaint->complaint_type_id != $complaintTypeId) {
                return back()->withErrors(['error' => 'You are not authorized to manage this complaint.']);
            }
            
            // Update the status
            $complaint->status = $validated['status'];
            
            // If completed, set the resolved_at timestamp
            if ($validated['status'] === 'completed' && !$complaint->resolved_at) {
                $complaint->resolved_at = now();
            }
            
            $complaint->save();
            
            return back()->with('message', 'Complaint status updated successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error updating complaint status: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Failed to update complaint status: ' . $e->getMessage()]);
        }
    }
    
    public function workerDashboard()
    {
        try {
            // Ensure the user is authenticated and is a worker
            if (!Auth::check() || !Auth::user()->isWorker()) {
                return redirect()->route('login')
                    ->withErrors(['error' => 'You must be logged in as a worker to access this page.']);
            }

            $user = Auth::user();
            
            // Get complaints assigned to this worker with relationships
            $complaints = Complaint::with(['campus', 'complaintType', 'coordinator', 'progressUpdates.user'])
                ->where('assigned_worker_id', $user->id)
                ->latest()
                ->get();
            
            // Calculate statistics
            $stats = [
                'totalAssigned' => $complaints->count(),
                'pending' => $complaints->where('status', 'pending')->count(),
                'inProgress' => $complaints->where('status', 'in_progress')->count(),
                'completed' => $complaints->where('status', 'completed')->count(),
            ];
            
            // Calculate performance metrics
            $completedComplaints = $complaints->where('status', 'completed');
            
            $performance = [
                'completed' => $completedComplaints->count(),
                'completionRate' => $complaints->count() > 0 
                    ? round(($completedComplaints->count() / $complaints->count()) * 100) 
                    : 0,
                'avgResolutionTime' => 0, // Default value
            ];
            
            // Calculate average resolution time if there are completed complaints
            if ($completedComplaints->count() > 0) {
                $totalResolutionHours = 0;
                foreach ($completedComplaints as $complaint) {
                    if ($complaint->resolved_at && $complaint->created_at) {
                        $created = new \DateTime($complaint->created_at);
                        $resolved = new \DateTime($complaint->resolved_at);
                        $interval = $created->diff($resolved);
                        $hours = $interval->days * 24 + $interval->h;
                        $totalResolutionHours += $hours;
                    }
                }
                $performance['avgResolutionTime'] = $completedComplaints->count() > 0
                    ? round($totalResolutionHours / $completedComplaints->count())
                    : 0;
            }
            
            // Get all progress updates for this worker
            $progressUpdates = \App\Models\ProgressUpdate::with(['complaint', 'user'])
                ->whereIn('complaint_id', $complaints->pluck('id'))
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Return the worker dashboard view with data
            return Inertia::render('Worker/Dashboard', [
                'worker' => $user,
                'complaints' => $complaints,
                'stats' => $stats,
                'performance' => $performance,
                'progressUpdates' => $progressUpdates
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error accessing worker dashboard: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('login')
                ->withErrors(['error' => 'An error occurred while accessing the dashboard. Please try again.']);
        }
    }
    
    public function workerUpdateStatus(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'complaint_id' => 'required|exists:complaints,id',
                'status' => 'required|in:in_progress,completed',
                'resolution_notes' => 'required_if:status,completed|nullable|string',
            ]);
            
            // Check if user is a worker
            if (!Auth::check() || !Auth::user()->isWorker()) {
                return back()->withErrors(['error' => 'You are not authorized to update complaint status.']);
            }
            
            $user = Auth::user();
            
            // Get the complaint
            $complaint = Complaint::findOrFail($validated['complaint_id']);
            
            // Verify the complaint is assigned to this worker
            if ($complaint->assigned_worker_id != $user->id) {
                return back()->withErrors(['error' => 'You are not authorized to update this complaint.']);
            }
            
            // Update the status
            $complaint->status = $validated['status'];
            
            // If completed, set the resolved_at timestamp and resolution notes
            if ($validated['status'] === 'completed') {
                $complaint->resolved_at = now();
                $complaint->resolution_notes = $validated['resolution_notes'];
                
                // Handle resolution image if present (skipped for now)
            }
            
            $complaint->save();
            
            return back()->with('message', 'Complaint status updated successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error updating worker complaint status: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Failed to update complaint status: ' . $e->getMessage()]);
        }
    }
    
    public function workerAddProgressUpdate(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'complaint_id' => 'required|exists:complaints,id',
                'progress_notes' => 'required|string',
            ]);
            
            // Check if user is a worker
            if (!Auth::check() || !Auth::user()->isWorker()) {
                return back()->withErrors(['error' => 'You are not authorized to add progress updates.']);
            }
            
            $user = Auth::user();
            
            // Get the complaint
            $complaint = Complaint::findOrFail($validated['complaint_id']);
            
            // Verify the complaint is assigned to this worker
            if ($complaint->assigned_worker_id != $user->id) {
                return back()->withErrors(['error' => 'You are not authorized to update this complaint.']);
            }
            
            // Create progress update
            $progressUpdate = new \App\Models\ProgressUpdate();
            $progressUpdate->complaint_id = $complaint->id;
            $progressUpdate->user_id = $user->id;
            $progressUpdate->notes = $validated['progress_notes'];
            $progressUpdate->save();
            
            return back()->with('message', 'Progress update added successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error adding progress update: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Failed to add progress update: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the VP dashboard with overall statistics and campus-wise data
     */
    public function vpDashboard()
    {
        try {
            // Ensure the user is authenticated and is a VP
            if (!Auth::check() || !Auth::user()->hasRole('vp')) {
                return redirect()->route('login')
                    ->withErrors(['error' => 'You must be logged in as a VP to access this page.']);
            }

            // Get statistics for all campuses
            $campusStats = Campus::withCount(['complaints as total_complaints' => function($query) {
                    $query->whereNotNull('id');
                }])
                ->withCount(['complaints as pending_complaints' => function($query) {
                    $query->where('status', 'pending');
                }])
                ->withCount(['complaints as resolved_complaints' => function($query) {
                    $query->where('status', 'completed');
                }])
                ->get();

            // Calculate overall statistics
            $totalComplaints = Complaint::count();
            $pendingComplaints = Complaint::where('status', 'pending')->count();
            $resolvedComplaints = Complaint::where('status', 'completed')->count();
            
            // Calculate average resolution time in days
            $avgResolutionTime = 0;
            $resolvedComplaints = Complaint::whereNotNull('resolved_at')->get();
            
            if ($resolvedComplaints->count() > 0) {
                $totalResolutionTime = 0;
                foreach ($resolvedComplaints as $complaint) {
                    $created = new \DateTime($complaint->created_at);
                    $resolved = new \DateTime($complaint->resolved_at);
                    $totalResolutionTime += $created->diff($resolved)->days;
                }
                $avgResolutionTime = round($totalResolutionTime / $resolvedComplaints->count(), 1);
            }

            // Get recent complaints
            $recentComplaints = Complaint::with(['campus', 'complaintType'])
                ->latest()
                ->take(10)
                ->get();
                
            // Prepare campus details data
            $campusDetails = [];
            foreach ($campusStats as $campus) {
                // Get complaint type stats for this campus
                $complaintTypeStats = [];
                $complaintTypes = ComplaintType::all();
                
                foreach ($complaintTypes as $type) {
                    $count = Complaint::where('campus_id', $campus->id)
                        ->where('complaint_type_id', $type->id)
                        ->count();
                        
                    $pending = Complaint::where('campus_id', $campus->id)
                        ->where('complaint_type_id', $type->id)
                        ->where('status', 'pending')
                        ->count();
                        
                    $inProgress = Complaint::where('campus_id', $campus->id)
                        ->where('complaint_type_id', $type->id)
                        ->where('status', 'in_progress')
                        ->count();
                        
                    $completed = Complaint::where('campus_id', $campus->id)
                        ->where('complaint_type_id', $type->id)
                        ->where('status', 'completed')
                        ->count();
                    
                    if ($count > 0) {
                        $complaintTypeStats[] = [
                            'id' => $type->id,
                            'name' => $type->name,
                            'count' => $count,
                            'pending' => $pending,
                            'in_progress' => $inProgress,
                            'completed' => $completed
                        ];
                    }
                }
                
                // Get coordinator and worker counts
                $coordinatorCount = User::whereHas('roles', function($query) use ($campus) {
                    $query->where('roles.role', 'coordinator')
                        ->where('user_roles.campus_id', $campus->id);
                })->count();
                
                $workerCount = User::whereHas('roles', function($query) use ($campus) {
                    $query->where('roles.role', 'worker')
                        ->where('user_roles.campus_id', $campus->id);
                })->count();
                
                // Calculate average resolution time for this campus
                $campusAvgResolutionTime = 0;
                $campusResolvedComplaints = Complaint::where('campus_id', $campus->id)
                    ->whereNotNull('resolved_at')
                    ->get();
                
                if ($campusResolvedComplaints->count() > 0) {
                    $totalResolutionTime = 0;
                    foreach ($campusResolvedComplaints as $complaint) {
                        $created = new \DateTime($complaint->created_at);
                        $resolved = new \DateTime($complaint->resolved_at);
                        $totalResolutionTime += $created->diff($resolved)->days;
                    }
                    $campusAvgResolutionTime = round($totalResolutionTime / $campusResolvedComplaints->count(), 1);
                }
                
                $campusDetails[$campus->id] = [
                    'id' => $campus->id,
                    'name' => $campus->name,
                    'complaintTypeStats' => $complaintTypeStats,
                    'coordinatorCount' => $coordinatorCount,
                    'workerCount' => $workerCount,
                    'avgResolutionTime' => $campusAvgResolutionTime
                ];
            }

            return Inertia::render('VP/Dashboard', [
                'campusStats' => $campusStats,
                'overallStats' => [
                    'totalComplaints' => $totalComplaints,
                    'pendingComplaints' => $pendingComplaints,
                    'resolvedComplaints' => $resolvedComplaints,
                    'averageResolutionTime' => $avgResolutionTime
                ],
                'recentComplaints' => $recentComplaints,
                'campusDetails' => $campusDetails
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error accessing VP dashboard: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('login')
                ->withErrors(['error' => 'An error occurred while accessing the dashboard. Please try again.']);
        }
    }
    
    /**
     * Display the Director dashboard with complaint type statistics and department performance
     */
    public function directorDashboard()
    {
        try {
            // Ensure the user is authenticated and is a Director
            if (!Auth::check() || !Auth::user()->hasRole('director')) {
                return redirect()->route('login')
                    ->withErrors(['error' => 'You must be logged in as a Director to access this page.']);
            }

            // Get statistics for all complaint types
            $complaintTypeStats = ComplaintType::select('id', 'name')
                ->withCount(['complaints as total_complaints' => function($query) {
                    $query->whereNotNull('id');
                }])
                ->withCount(['complaints as pending_complaints' => function($query) {
                    $query->where('status', 'pending');
                }])
                ->withCount(['complaints as resolved_complaints' => function($query) {
                    $query->where('status', 'completed');
                }])
                ->get();
                
            // Add average resolution time to each complaint type
            foreach ($complaintTypeStats as $type) {
                $typeResolvedComplaints = Complaint::where('complaint_type_id', $type->id)
                    ->whereNotNull('resolved_at')
                    ->get();
                
                $avgResolutionTime = 0;
                if ($typeResolvedComplaints->count() > 0) {
                    $totalResolutionTime = 0;
                    foreach ($typeResolvedComplaints as $complaint) {
                        $created = new \DateTime($complaint->created_at);
                        $resolved = new \DateTime($complaint->resolved_at);
                        $totalResolutionTime += $created->diff($resolved)->days;
                    }
                    $avgResolutionTime = round($totalResolutionTime / $typeResolvedComplaints->count(), 1);
                }
                
                $type->average_resolution_time = $avgResolutionTime;
            }

            // Get all campuses with complaint statistics
            $campusStats = Campus::select('id', 'name')
                ->withCount(['complaints as total_complaints' => function($query) {
                    $query->whereNotNull('id');
                }])
                ->withCount(['complaints as pending_complaints' => function($query) {
                    $query->where('status', 'pending');
                }])
                ->withCount(['complaints as resolved_complaints' => function($query) {
                    $query->where(function($q) {
                        $q->where('status', 'completed')
                          ->orWhere('status', 'resolved');
                    });
                }])
                ->get();

            // Get overall statistics
            $totalComplaints = Complaint::count();
            $pendingComplaints = Complaint::where('status', 'pending')->count();
            
            // Get resolved complaints with related data for display
            $resolvedComplaints = Complaint::with(['campus', 'complaintType'])
                ->where(function($query) {
                    $query->where('status', 'completed')
                          ->orWhere('status', 'resolved');
                })
                ->orderBy('resolved_at', 'desc')
                ->take(10)
                ->get();
                
            // Calculate average resolution time for all resolved complaints
            $avgResolutionTime = 0;
            if ($resolvedComplaints->count() > 0) {
                $totalResolutionTime = 0;
                foreach ($resolvedComplaints as $complaint) {
                    if ($complaint->resolved_at) {
                        $created = new \DateTime($complaint->created_at);
                        $resolved = new \DateTime($complaint->resolved_at);
                        $totalResolutionTime += $created->diff($resolved)->days;
                    }
                }
                $avgResolutionTime = $totalResolutionTime / $resolvedComplaints->count();
            }
            
            // Calculate overall satisfaction rate
            $satisfactionRate = 90; // Default placeholder - implement actual calculation if you have a user feedback system
            
            // Get recent complaints for display
            $recentComplaints = Complaint::with(['campus', 'complaintType'])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();
            
            // Get department performance data
            $departmentPerformance = [];
            
            foreach (ComplaintType::all() as $type) {
                $assignedComplaints = Complaint::where('complaint_type_id', $type->id)
                    ->where(function($query) {
                        $query->whereNotNull('assigned_coordinator_id')
                              ->orWhereNotNull('assigned_worker_id');
                    })
                    ->get();
                
                $totalAssigned = $assignedComplaints->count();
                
                // Skip if no complaints were assigned to this department
                if ($totalAssigned == 0) {
                    continue;
                }
                
                // Count complaints resolved within the target time (e.g., 7 days)
                $resolvedOnTime = 0;
                $totalResolutionTime = 0;
                
                foreach ($assignedComplaints as $complaint) {
                    if ($complaint->resolved_at) {
                        $created = new \DateTime($complaint->created_at);
                        $resolved = new \DateTime($complaint->resolved_at);
                        $resolutionDays = $created->diff($resolved)->days;
                        
                        // Consider a complaint resolved on time if it was done within 7 days
                        if ($resolutionDays <= 7) {
                            $resolvedOnTime++;
                        }
                        
                        $totalResolutionTime += $resolutionDays;
                    }
                }
                
                // Calculate average resolution time
                $avgResolutionTime = ($totalAssigned > 0 && $resolvedOnTime > 0) 
                    ? $totalResolutionTime / $resolvedOnTime 
                    : 0;
                
                // Placeholder for satisfaction rate - implement actual calculation if you have a feedback system
                $deptSatisfactionRate = rand(75, 98);
                
                // Only add departments with assigned complaints
                if ($totalAssigned > 0) {
                    $departmentPerformance[] = [
                        'id' => $type->id,
                        'name' => $type->name,
                        'total_assigned' => $totalAssigned,
                        'resolved_on_time' => $resolvedOnTime,
                        'avg_resolution_time' => $avgResolutionTime,
                        'satisfaction_rate' => $deptSatisfactionRate
                    ];
                }
            }

            // Get all campuses and complaint types for data context
            $campuses = Campus::all();
            $complaintTypes = ComplaintType::all();

            return Inertia::render('Director/Dashboard', [
                'complaintTypeStats' => $complaintTypeStats,
                'overallStats' => [
                    'totalComplaints' => $totalComplaints,
                    'pendingComplaints' => $pendingComplaints,
                    'resolvedComplaints' => $resolvedComplaints,
                    'averageResolutionTime' => $avgResolutionTime,
                    'satisfactionRate' => $satisfactionRate
                ],
                'recentComplaints' => $recentComplaints,
                'departmentPerformance' => $departmentPerformance,
                'campusStats' => $campusStats,
                'campuses' => $campuses,
                'complaintTypes' => $complaintTypes
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error accessing Director dashboard: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('login')
                ->withErrors(['error' => 'An error occurred while accessing the dashboard. Please try again.']);
        }
    }
} 