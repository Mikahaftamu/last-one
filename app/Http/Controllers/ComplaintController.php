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
} 